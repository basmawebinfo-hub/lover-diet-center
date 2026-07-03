import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { EmailOtpType } from '@supabase/supabase-js'

// Email-link callback used by ALL Supabase email OTP flows:
//   - Password recovery
//   - Magic link (passwordless sign-in)
//   - Email confirmation on sign-up
//
// This handler is the officially-recommended pattern from
// https://supabase.com/docs/guides/auth/server-side/nextjs
//
// The email link produced by Supabase (when the template uses
// {{ .TokenHash }}) points HERE with:
//   ?token_hash=<hash>&type=recovery&next=/reset-password
//
// verifyOtp() is STATELESS - it does NOT need a PKCE verifier, so it
// works across browsers, incognito windows, and phone -> laptop switches.
// It creates a real session cookie server-side which the browser then
// carries into /reset-password.
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const token_hash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as EmailOtpType | null
  const rawNext = url.searchParams.get('next') || '/dashboard'

  // Same-site relative-path guard on the next param.
  const safeNext = /^\/(?!\/)[A-Za-z0-9\-._~!$&'()*+,;=:@/%]*$/.test(rawNext) ? rawNext : '/dashboard'

  if (!token_hash || !type) {
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent('Invalid or expired confirmation link.')}`, url),
    )
  }

  // Prepare the response FIRST so cookie writes made during verifyOtp()
  // actually land in the browser. Passing this response to createServerClient
  // (via setAll) is the Next.js App Router pattern.
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
          // Write session cookies onto BOTH the outgoing response (browser)
          // and the request-scoped store (so this handler's next call sees them).
          cookiesToSet.forEach(({ name, value, options }) => {
            try { cookieStore.set(name, value, options) } catch { /* readonly in some contexts */ }
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  const { error } = await supabase.auth.verifyOtp({ token_hash, type })
  if (error) {
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, url),
    )
  }

  // Session cookie has been written to `response`. Redirect the user.
  return response
}
