import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// OAuth + magic-link + recovery callback.
// Called by Supabase after any auth redirect. We exchange the `code`
// for a full session (writes the cookie so subsequent requests are
// authenticated) and then redirect the user to the appropriate page.
//
//   Recovery flow  -> /reset-password  (user picks a new password)
//   OAuth / others -> `next` param, defaults to /dashboard
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const type = url.searchParams.get('type') || ''
  const next = url.searchParams.get('next') || '/dashboard'

  // Same-site relative-path guard on the `next` param.
  const safeNext = /^\/(?!\/)[A-Za-z0-9\-._~!$&'()*+,;=:@/%]*$/.test(next) ? next : '/dashboard'

  if (!code) {
    // Nothing to exchange — surface the error back to sign-in.
    const errorDesc = url.searchParams.get('error_description') || 'Missing code'
    return NextResponse.redirect(new URL(`/sign-in?error=${encodeURIComponent(errorDesc)}`, url))
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        },
      },
    },
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, url),
    )
  }

  // Recovery: force the user through the "set new password" screen.
  if (type === 'recovery') {
    return NextResponse.redirect(new URL('/reset-password', url))
  }

  return NextResponse.redirect(new URL(safeNext, url))
}
