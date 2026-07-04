import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { EmailOtpType } from '@supabase/supabase-js'
import { RECOVERY_COOKIE } from '@/lib/supabase/middleware'
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit'

// Email OTP callback (recovery / magic link / signup confirm / email change).
//
// verifyOtp() is stateless — no PKCE verifier required, so it works even
// across browsers / phones. The template must use {{ .TokenHash }} and
// point at this route with ?token_hash=<h>&type=<t>&next=<path>.
//
// Security note: when type='recovery' we IGNORE the next param and force
// the user to /reset-password. Otherwise a tampered link like
// ?next=/admin could send a recovering user straight into the admin
// panel with a temporary session. The middleware also enforces this by
// checking the RECOVERY_COOKIE marker.
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const token_hash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as EmailOtpType | null
  const rawNext = url.searchParams.get('next') || '/dashboard'
  const safeNext = /^\/(?!\/)[A-Za-z0-9\-._~!$&'()*+,;=:@/%]*$/.test(rawNext) ? rawNext : '/dashboard'

  if (!token_hash || !type) {
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent('Invalid or expired confirmation link.')}`, url),
    )
  }

  // Rate-limit pre-check (Phase 4 · M-01) — otp_verify: 10 / 15 min per IP.
  // Fails-open on Redis errors so a broken KV link never locks users out
  // of a legitimate recovery flow.
  const ip = getClientIp(request.headers)
  const gate = await checkRateLimit('otp_verify', ip)
  if (gate.limited) {
    return NextResponse.redirect(
      new URL(
        `/sign-in?error=${encodeURIComponent(
          `Too many verification attempts. Please wait ${gate.retryAfterSec}s and try again.`,
        )}`,
        url,
      ),
    )
  }

  // For recovery flows, ALWAYS land on /reset-password — regardless of what
  // "next" says. Attackers could otherwise craft a link with next=/admin.
  const finalNext = type === 'recovery' ? '/reset-password' : safeNext

  const response = NextResponse.redirect(new URL(finalNext, url))

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

  const { error } = await supabase.auth.verifyOtp({ token_hash, type })
  if (error) {
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, url),
    )
  }

  // Mark this as a recovery session so middleware sandboxes it.
  // The cookie is short-lived (10 minutes is plenty for the reset flow),
  // sameSite=lax, httpOnly=false (we don't rely on it for security — the
  // Supabase session itself is httpOnly. This cookie is purely a UX
  // marker read by middleware.)
  if (type === 'recovery') {
    response.cookies.set(RECOVERY_COOKIE, '1', {
      httpOnly: false,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 10 * 60, // 10 minutes
    })
  }

  return response
}
