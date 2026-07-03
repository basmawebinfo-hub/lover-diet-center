import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isOnboardingComplete } from '@/lib/onboarding'

// ----------------------------------------------------------------------------
// Route classification
// ----------------------------------------------------------------------------

// Requires an authenticated session.
const AUTH_REQUIRED = ['/dashboard', '/admin', '/onboarding']

// Additionally requires role='admin'.
const ADMIN_ONLY = ['/admin']

// Sign-in / sign-up pages — authenticated users get bounced away.
const GUEST_ONLY = ['/sign-in', '/sign-up']

// Recovery-session sandbox: user in a recovery session is ONLY permitted to
// visit these paths. Anything else redirects to /reset-password so they set
// a new password before doing anything else.
const RECOVERY_SANDBOX = ['/reset-password', '/auth/confirm', '/auth/callback']

// ----------------------------------------------------------------------------
// Recovery-session cookie
// ----------------------------------------------------------------------------
// /auth/confirm sets this when type=recovery. /reset-password clears it after
// the password is successfully updated.
export const RECOVERY_COOKIE = 'ldc_recovery_session'

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

  // IMPORTANT: getUser() revalidates the token on every request.
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const inRecovery = request.cookies.get(RECOVERY_COOKIE)?.value === '1'

  // ------------------------------------------------------------------------
  // Recovery-session sandbox
  // ------------------------------------------------------------------------
  // A user who arrived via a password-recovery link has an authenticated
  // Supabase session, but that session is provisional — they haven't proven
  // they know a password yet. Confine them to /reset-password until they
  // either finish setting a new password OR sign out.
  if (inRecovery && user) {
    if (!matches(pathname, RECOVERY_SANDBOX)) {
      return NextResponse.redirect(new URL('/reset-password', request.url))
    }
    return response
  }

  const authRequired = matches(pathname, AUTH_REQUIRED)
  const adminOnly = matches(pathname, ADMIN_ONLY)
  const guestOnly = matches(pathname, GUEST_ONLY)

  // ------------------------------------------------------------------------
  // Not signed in trying to hit a protected route
  // ------------------------------------------------------------------------
  if (authRequired && !user) {
    const url = new URL('/sign-in', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // ------------------------------------------------------------------------
  // Signed in — look up profile for role + onboarding checks
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

    // Blocked accounts: park them on /blocked and nowhere else.
    if (blocked && pathname !== '/blocked') {
      return NextResponse.redirect(new URL('/blocked', request.url))
    }

    // Admins get a pass on onboarding — they created the admin account
    // via the admin creation flow, not the public sign-up.
    // /admin still requires role='admin'.
    if (adminOnly && !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // /dashboard requires onboarding for non-admins.
    if (matches(pathname, ['/dashboard']) && !isAdmin && !onboarded) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // Already onboarded: sign-in / sign-up bounce you home.
    if (guestOnly) {
      // Admins go to /admin; onboarded users go to /dashboard;
      // partially-onboarded non-admins go to /onboarding.
      const target = isAdmin ? '/admin' : (onboarded ? '/dashboard' : '/onboarding')
      return NextResponse.redirect(new URL(target, request.url))
    }

    // /onboarding when the user is already onboarded — bounce to their real home.
    if (matches(pathname, ['/onboarding']) && (isAdmin || onboarded)) {
      return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/dashboard', request.url))
    }
  }

  return response
}
