import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Preview/dev environments may not have Supabase configured. Fall back to
  // placeholder credentials so public pages render instead of crashing —
  // any actual auth/data call will fail gracefully. Production always has
  // the real env vars, so this branch never runs there.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_placeholder'
  return createBrowserClient(url, key)
}
