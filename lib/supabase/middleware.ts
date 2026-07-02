import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Protected routes require an active session.
// /admin additionally requires role='admin' on the profile row.
const PROTECTED_ROUTES = ['/dashboard', '/admin', '/onboarding']
const ADMIN_ROUTES = ['/admin']
const AUTH_ROUTES = ['/sign-in', '/sign-up']

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

  // IMPORTANT: getUser() revalidates the token on every request
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))

  if (isProtected && !user) {
    const url = new URL('/sign-in', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Second-tier check: /admin requires role='admin'. We look at the profile row.
  // profiles.id === auth.users.id (1:1). RLS lets the user read their own row.
  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, blocked')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin' || profile.blocked === true) {
      // Not an admin (or blocked). Bounce to dashboard, which is auth-gated but role-neutral.
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r))
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}
