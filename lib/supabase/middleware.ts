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

/**
 * Marketing routes as they existed before the /en + /ar prefix.
 *
 * These URLs are indexed and shared, so they are redirected rather than
 * dropped. Keep in sync with LOCALIZED_ROOTS in lib/locale-href.ts.
 */
const LEGACY_MARKETING_ROOTS = [
  '/about',
  '/contact',
  '/shop',
  '/nutrition-consultations',
  '/healthy-meals',
  '/healthy-snacks',
  '/body-sculpting',
  '/training-courses',
] as const

function isLegacyMarketingPath(path: string): boolean {
  return LEGACY_MARKETING_ROOTS.some((r) => path === r || path.startsWith(r + '/'))
}

/**
 * First language we publish that the browser asked for, else English.
 *
 * Deliberately simple: we only ship two languages, so a full RFC 4647 q-value
 * negotiation would be more code than the decision is worth. Any tag starting
 * with `ar` (ar, ar-AE, ar-EG…) counts as Arabic.
 */
function preferredLocale(acceptLanguage: string | null): 'en' | 'ar' {
  if (!acceptLanguage) return 'en'
  for (const part of acceptLanguage.split(',')) {
    const tag = part.trim().split(';')[0].toLowerCase()
    if (tag.startsWith('ar')) return 'ar'
    if (tag.startsWith('en')) return 'en'
  }
  return 'en'
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const { pathname: earlyPath } = request.nextUrl

  // ---------------------------------------------------------------------
  // Locale routing (runs BEFORE any Supabase work so it still functions in
  // preview environments without Supabase credentials).
  //
  // Route contract:
  //   /            -> redirect to /en or /ar. The bare root serves no content.
  //   /en, /ar ... -> the real pages. Language comes from the path, and the
  //                   cookie is updated to match so the next bare-root visit
  //                   lands in the same language.
  //
  // Content is only ever served from a locale-prefixed URL, so every page has
  // exactly one language per URL — which is what makes the hreflang cluster
  // valid and lets Next prerender the pages as static HTML.
  // ---------------------------------------------------------------------
  const localeFromPath: 'en' | 'ar' | null =
    earlyPath === '/en' || earlyPath.startsWith('/en/') ? 'en'
    : earlyPath === '/ar' || earlyPath.startsWith('/ar/') ? 'ar'
    : null

  if (localeFromPath) {
    const current = request.cookies.get(LOCALE_COOKIE)?.value
    if (current !== localeFromPath) {
      request.cookies.set(LOCALE_COOKIE, localeFromPath)
      response.cookies.set(LOCALE_COOKIE, localeFromPath, {
        httpOnly: false,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 365 * 24 * 60 * 60,
      })
    }
  } else if (earlyPath === '/' || isLegacyMarketingPath(earlyPath)) {
    // Root and pre-locale URLs both land here.
    //
    // The legacy paths (/about, /shop, /healthy-meals…) were the live, indexed
    // URLs before the locale prefix existed. They are in Google's index, in
    // shared links and in printed material, so they must keep working — a 404
    // here would drop every existing inbound link on the floor.
    //
    // Saved choice wins; otherwise fall back to the browser's Accept-Language,
    // then English.
    //
    // 307 rather than 308: the destination depends on who is asking, so it
    // must not be cached as a permanent rule by a browser or a proxy. A 308
    // would pin the first visitor's language onto that client forever — and
    // onto any shared CDN entry. Google consolidates these fine via the
    // sitemap and the hreflang cluster.
    const saved = request.cookies.get(LOCALE_COOKIE)?.value
    const target =
      saved === 'ar' || saved === 'en' ? saved : preferredLocale(request.headers.get('accept-language'))

    const url = request.nextUrl.clone()
    url.pathname = earlyPath === '/' ? `/${target}` : `/${target}${earlyPath}`
    return NextResponse.redirect(url, 307)
  }

  // Preview/dev environments may not have Supabase configured. In that case
  // skip all auth/session logic instead of crashing every request. Public
  // pages render normally; protected routes simply won't gate (dev only).
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return response
  }

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
