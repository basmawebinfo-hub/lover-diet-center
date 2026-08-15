import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { NextResponse } from 'next/server'

/**
 * Supabase client for Route Handlers that need to ESTABLISH or MUTATE a
 * session (sign-in, sign-up, sign-out) rather than just read one.
 *
 * The auth cookies Supabase issues have to land on the outgoing response, so
 * the caller builds its NextResponse first and hands it in. We write each
 * cookie to both the request-scoped store (so later reads inside this same
 * handler see the new session) and the response (so the browser gets it).
 *
 * For read-only routes keep using a local createServerClient with a no-op
 * setAll — there is no reason to thread a response through those.
 */
export async function createRouteClient(response: NextResponse) {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try { cookieStore.set(name, value, options) } catch { /* RSC-scope guard */ }
            response.cookies.set(name, value, options)
          })
        },
      },
    },
  )
}
