import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { isOnboardingComplete } from '@/lib/onboarding'

// OAuth callback (Google, and future providers).
//
// After exchangeCodeForSession succeeds, we look at the user's profile to
// decide where to send them:
//   - blocked                   -> /blocked
//   - role='admin'              -> /admin
//   - onboarding incomplete     -> /onboarding   (Bug #1: first-time Google users)
//   - onboarding complete       -> next (default /dashboard)
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const rawNext = url.searchParams.get('next') || '/dashboard'
  const safeNext = /^\/(?!\/)[A-Za-z0-9\-._~!$&'()*+,;=:@/%]*$/.test(rawNext) ? rawNext : '/dashboard'

  const providerError = url.searchParams.get('error_description') || url.searchParams.get('error')
  if (providerError) {
    return NextResponse.redirect(new URL(`/sign-in?error=${encodeURIComponent(providerError)}`, url))
  }
  if (!code) {
    return NextResponse.redirect(new URL(`/sign-in?error=${encodeURIComponent('Missing OAuth code.')}`, url))
  }

  // We don't know the final destination yet — we'll compute it after
  // exchange + profile lookup. Prepare a mutable holder.
  let response = NextResponse.redirect(new URL(safeNext, url))

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try { cookieStore.set(name, value, options) } catch { /* ignore */ }
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    const msg = /pkce/i.test(error.message)
      ? 'Please start the sign-in from the same browser where you clicked "Continue with Google".'
      : error.message
    return NextResponse.redirect(new URL(`/sign-in?error=${encodeURIComponent(msg)}`, url))
  }

  // Look up the fresh user + profile to route correctly.
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Shouldn't happen after a successful exchange, but be defensive.
    return NextResponse.redirect(new URL('/sign-in?error=Sign-in%20failed', url))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name_en, phone, age, gender, height_cm, current_weight, goal, activity_level, role, blocked')
    .eq('id', user.id)
    .single()

  let target = safeNext
  if (profile?.blocked === true) {
    target = '/blocked'
  } else if (profile?.role === 'admin') {
    target = '/admin'
  } else if (!isOnboardingComplete(profile)) {
    // Bug #1 fix: first-time Google login always goes through onboarding.
    target = '/onboarding'
  } else {
    target = safeNext || '/dashboard'
  }

  // Rebuild the response with the correct target and preserve session cookies
  // that were written above. NextResponse.redirect() creates a new response,
  // so we copy any cookies we set onto it.
  const finalResponse = NextResponse.redirect(new URL(target, url))
  response.cookies.getAll().forEach((c) => {
    finalResponse.cookies.set(c.name, c.value, c)
  })
  return finalResponse
}
