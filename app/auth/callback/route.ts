import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// OAuth-only callback (Google, and future providers).
//
// The client kicks OAuth off via supabase.auth.signInWithOAuth() which stores
// a PKCE code_verifier cookie in the browser. The user then bounces through
// the provider (Google) and returns HERE with a ?code=<code>. We exchange it
// via supabase.auth.exchangeCodeForSession(code), which verifies the code
// using the PKCE verifier cookie that the browser sent along with this request.
//
// Email flows (recovery, magic link, email confirmation) go through
// /auth/confirm which uses verifyOtp — a stateless flow that does NOT
// require a PKCE verifier and therefore works across browsers.
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const rawNext = url.searchParams.get('next') || '/dashboard'

  const safeNext = /^\/(?!\/)[A-Za-z0-9\-._~!$&'()*+,;=:@/%]*$/.test(rawNext) ? rawNext : '/dashboard'

  // Provider-side error propagation.
  const providerError = url.searchParams.get('error_description') || url.searchParams.get('error')
  if (providerError) {
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(providerError)}`, url),
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent('Missing OAuth code.')}`, url),
    )
  }

  // Prepare the response FIRST so session cookies land on the browser.
  const response = NextResponse.redirect(new URL(safeNext, url))

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
    // Most common case here: user clicked an OAuth callback from a different
    // browser than the one that started the flow. That's not fixable — surface
    // it with a friendly message.
    const msg = /pkce/i.test(error.message)
      ? 'Please start the sign-in from the same browser where you clicked "Continue with Google".'
      : error.message
    return NextResponse.redirect(new URL(`/sign-in?error=${encodeURIComponent(msg)}`, url))
  }

  return response
}
