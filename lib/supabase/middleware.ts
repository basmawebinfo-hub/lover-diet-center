import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isOnboardingComplete } from '@/lib/onboarding'

// ----------------------------------------------------------------------------
// Route classification
// ----------------------------------------------------------------------------

const AUTH_REQUIRED = ['/dashboard', '/admin', '/onboarding']
const ADMIN_ONLY = ['/admin']
const GUEST_ONLY = ['/sign-in', '/sign-up']
const RECOVERY_SANDBOX = ['/reset-password', '/auth/confirm', '/auth/callback']

// ----------------------------------------------------------------------------
// Session policy
// ----------------------------------------------------------------------------
// Idle timeout: sign the user out after 60 minutes without any request.
// Absolute lifetime: 7 days from first authenticated request.
const IDLE_MAX_MS = 60 * 60 * 1000       // 60 minutes
const ABSOLUTE_MAX_MS = 7 * 24 * 60 * 60 * 1000  // 7 days

// Cookie names
export const RECOVERY_COOKIE = 'ldc_recovery_session'
const LAST_ACTIVITY_COOKIE = 'ldc_last_activity'
const SESSION_START_COOKIE = 'ldc_session_start'

// Runtime environment: production uses secure cookies.
const cookieBase = (maxAgeSec: number) => ({
  httpOnly: false,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: maxAgeSec,
})

function matches(path: string, prefixes: readonly string[]): boolean {
  return prefixes.some((r) => path === r || path.startsWith(r + '/'))
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
  const now = Date.now()

  const inRecovery = request.cookies.get(RECOVERY_COOKIE)?.value === '1'

  // ------------------------------------------------------------------------
  // Recovery-session sandbox
  // ------------------------------------------------------------------------
  if (inRecovery && user) {
    if (!matches(pathname, RECOVERY_SANDBOX)) {
      return NextResponse.redirect(new URL('/reset-password', request.url))
    }
    return response
  }

  // ------------------------------------------------------------------------
  // Session lifetime enforcement (BUG #3)
  // Only enforced when the user IS authenticated. We check both idle and
  // absolute lifetimes; whichever expires first wins.
  // ------------------------------------------------------------------------
  if (user) {
    const lastActRaw = request.cookies.get(LAST_ACTIVITY_COOKIE)?.value
    const sessStartRaw = request.cookies.get(SESSION_START_COOKIE)?.value
    const lastAct = lastActRaw ? Number(lastActRaw) : NaN
    const sessStart = sessStartRaw ? Number(sessStartRaw) : NaN

    const idleExpired = Number.isFinite(lastAct) && (now - lastAct) > IDLE_MAX_MS
    const absoluteExpired = Number.isFinite(sessStart) && (now - sessStart) > ABSOLUTE_MAX_MS

    if (idleExpired || absoluteExpired) {
      // Sign the user out server-side and clear tracking cookies.
      await supabase.auth.signOut()
      const url = new URL('/sign-in', request.url)
      url.searchParams.set('signedout', '1')
      const bounce = NextResponse.redirect(url)
      bounce.cookies.delete(LAST_ACTIVITY_COOKIE)
      bounce.cookies.delete(SESSION_START_COOKIE)
      bounce.cookies.delete(RECOVERY_COOKIE)
      return bounce
    }

    // Refresh activity marker on every authenticated hit.
    response.cookies.set(LAST_ACTIVITY_COOKIE, String(now), cookieBase(IDLE_MAX_MS / 1000))
    // Set the absolute-start marker exactly once per session.
    if (!Number.isFinite(sessStart)) {
      response.cookies.set(SESSION_START_COOKIE, String(now), cookieBase(ABSOLUTE_MAX_MS / 1000))
    }
  }

  const authRequired = matches(pathname, AUTH_REQUIRED)
  const adminOnly = matches(pathname, ADMIN_ONLY)
  const guestOnly = matches(pathname, GUEST_ONLY)

  // ------------------------------------------------------------------------
  // Unauthenticated hit on a protected route
  // ------------------------------------------------------------------------
  if (authRequired && !user) {
    const url = new URL('/sign-in', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // ------------------------------------------------------------------------
  // Signed in — profile-aware routing
  // ------------------------------------------------------------------------
  if (user && (authRequired || guestOnly)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name_en, phone, age, gender, height_cm, current_weight, goal, activity_level, role, blocked')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'
    const blocked = profile?.blocked === true
    const onboarded = isOnboardingComplete(profile)

    if (blocked && pathname !== '/blocked') {
      return NextResponse.redirect(new URL('/blocked', request.url))
    }

    if (adminOnly && !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (matches(pathname, ['/dashboard']) && !isAdmin && !onboarded) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    if (guestOnly) {
      const target = isAdmin ? '/admin' : (onboarded ? '/dashboard' : '/onboarding')
      return NextResponse.redirect(new URL(target, request.url))
    }

    if (matches(pathname, ['/onboarding']) && (isAdmin || onboarded)) {
      return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/dashboard', request.url))
    }
  }

  return response
}
