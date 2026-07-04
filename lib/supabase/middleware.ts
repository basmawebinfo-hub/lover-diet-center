import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  ONBOARDING_SELECT_MIN,
  ONBOARDING_SELECT_FULL,
  isOnboardedByColumn,
  isOnboardingComplete,
} from '@/lib/onboarding'

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
const IDLE_MAX_MS = 60 * 60 * 1000              // 60 minutes
const ABSOLUTE_MAX_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// Cookie names
export const RECOVERY_COOKIE = 'ldc_recovery_session'
const LAST_ACTIVITY_COOKIE = 'ldc_last_activity'
const SESSION_START_COOKIE = 'ldc_session_start'
const LOCALE_COOKIE = 'ldc_locale'

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

  // Locale routing (Phase 5 · Arabic SSR).
  //
  // Route contract:
  //   /en   -> Arabic-first mirror. Force ldc_locale=ar for this request +
  //            persist the cookie so subsequent hits stay in Arabic without
  //            a per-request URL prefix. The user can still toggle back via
  //            the header language switcher (which rewrites the cookie).
  //   /     -> Cookie-driven. Leave whatever the user has.
  //
  // We set the cookie on BOTH the incoming request (so RootLayout's
  // getLocaleServer() sees it on this hit) AND the outgoing response
  // (so the browser stores it for future requests).
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const current = request.cookies.get(LOCALE_COOKIE)?.value
    if (current !== 'ar') {
      request.cookies.set(LOCALE_COOKIE, 'ar')
      response.cookies.set(LOCALE_COOKIE, 'ar', {
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 365 * 24 * 60 * 60,
      })
    }
  }

  const inRecovery = request.cookies.get(RECOVERY_COOKIE)?.value === '1'

  // Recovery-session sandbox
  if (inRecovery && user) {
    if (!matches(pathname, RECOVERY_SANDBOX)) {
      return NextResponse.redirect(new URL('/reset-password', request.url))
    }
    return response
  }

  // Session lifetime enforcement
  if (user) {
    const lastActRaw = request.cookies.get(LAST_ACTIVITY_COOKIE)?.value
    const sessStartRaw = request.cookies.get(SESSION_START_COOKIE)?.value
    const lastAct = lastActRaw ? Number(lastActRaw) : NaN
    const sessStart = sessStartRaw ? Number(sessStartRaw) : NaN

    const idleExpired = Number.isFinite(lastAct) && (now - lastAct) > IDLE_MAX_MS
    const absoluteExpired = Number.isFinite(sessStart) && (now - sessStart) > ABSOLUTE_MAX_MS

    if (idleExpired || absoluteExpired) {
      await supabase.auth.signOut()
      const url = new URL('/sign-in', request.url)
      url.searchParams.set('signedout', '1')
      const bounce = NextResponse.redirect(url)
      bounce.cookies.delete(LAST_ACTIVITY_COOKIE)
      bounce.cookies.delete(SESSION_START_COOKIE)
      bounce.cookies.delete(RECOVERY_COOKIE)
      return bounce
    }

    response.cookies.set(LAST_ACTIVITY_COOKIE, String(now), cookieBase(IDLE_MAX_MS / 1000))
    if (!Number.isFinite(sessStart)) {
      response.cookies.set(SESSION_START_COOKIE, String(now), cookieBase(ABSOLUTE_MAX_MS / 1000))
    }
  }

  const authRequired = matches(pathname, AUTH_REQUIRED)
  const adminOnly = matches(pathname, ADMIN_ONLY)
  const guestOnly = matches(pathname, GUEST_ONLY)

  // Unauth hit on a protected route
  if (authRequired && !user) {
    const url = new URL('/sign-in', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // ------------------------------------------------------------------------
  // Signed in — profile-aware routing
  //
  // Strategy: fetch the SLIM projection first (role, blocked,
  // onboarding_completed). That's the only data we need for the fast path.
  // Only when the column is falsy AND we still need to gate the dashboard
  // do we run a second SELECT for the legacy field-presence fallback —
  // this handles pre-migration profiles where the column is false but
  // the row actually has all fields populated.
  // ------------------------------------------------------------------------
  if (user && (authRequired || guestOnly)) {
    const { data: slim } = await supabase
      .from('profiles')
      .select(ONBOARDING_SELECT_MIN)
      .eq('id', user.id)
      .single()

    const profile = slim as { role?: string; blocked?: boolean; onboarding_completed?: boolean } | null

    const isAdmin = profile?.role === 'admin'
    const blocked = profile?.blocked === true
    let onboarded = isOnboardedByColumn(profile)

    // Legacy fallback: only pay for a second SELECT if the column is false
    // AND we're about to make an onboarding decision.
    const needsLegacyCheck =
      !onboarded &&
      !isAdmin &&
      (matches(pathname, ['/dashboard']) || guestOnly)

    if (needsLegacyCheck) {
      const { data: full } = await supabase
        .from('profiles')
        .select(ONBOARDING_SELECT_FULL)
        .eq('id', user.id)
        .single()
      if (isOnboardingComplete(full as never)) {
        onboarded = true
      }
    }

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
