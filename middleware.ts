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
  // Two groups run through the middleware now:
  //   - auth/session gating: /dashboard, /admin, /onboarding, /sign-in,
  //     /sign-up, /reset-password, /auth/*
  //   - locale pinning for the two language mirrors: /en, /ar
  //
  // Anything not listed here is public, cookie-driven, and cacheable.
  matcher: [
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
  ],
}
