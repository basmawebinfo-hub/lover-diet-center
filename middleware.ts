import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // Scoped to the routes that actually need it.
  //
  // This used to be a catch-all negative matcher, so every public marketing
  // request paid for supabase.auth.getUser() plus up to two profile SELECTs
  // before any HTML was produced. It also forced every page in the app to be
  // rendered on demand — `next build` reported zero static pages — which threw
  // away CDN caching on the pages that need it most.
  //
  // Three groups run through the middleware now:
  //   - auth/session gating: /dashboard, /admin, /onboarding, /sign-in,
  //     /sign-up, /reset-password, /auth/*
  //   - the bare root, which redirects to /en or /ar
  //   - locale pinning under /en and /ar, so the cookie follows the URL
  //
  // The locale pages themselves render from the path alone, so they stay
  // statically prerenderable — the middleware only writes a cookie on them.
  matcher: [
    '/',
    '/dashboard/:path*',
    '/admin/:path*',
    '/onboarding/:path*',
    '/sign-in/:path*',
    '/sign-up/:path*',
    '/reset-password/:path*',
    '/auth/:path*',
    '/blocked',
    '/en/:path*',
    '/en',
    '/ar/:path*',
    '/ar',

    // Pre-locale marketing URLs. Still indexed and shared, so they are
    // redirected to the visitor's language rather than 404'd.
    '/about/:path*',
    '/about',
    '/contact/:path*',
    '/contact',
    '/shop/:path*',
    '/shop',
    '/nutrition-consultations',
    '/healthy-meals',
    '/healthy-snacks',
    '/body-sculpting',
    '/training-courses',
  ],
}
