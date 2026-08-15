import { createBrowserClient } from '@supabase/ssr'

const PLACEHOLDER_URL = 'https://placeholder.supabase.co'
const PLACEHOLDER_KEY = 'sb_publishable_placeholder'

export function createClient() {
  // Preview/dev environments may not have Supabase configured. Fall back to
  // placeholder credentials so public pages render instead of crashing —
  // any actual auth/data call will fail gracefully.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    // Say so loudly. Silently returning a client pointed at a hostname that
    // does not exist makes a missing env var look like a backend outage:
    // sign-in fails, the dashboard is empty, orders never save, and nothing
    // in the logs explains why. This runs in the browser, so it also shows up
    // in the console of whoever is testing the deployment.
    console.error(
      '[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ' +
        'are not set. Using placeholder credentials — every auth and data call ' +
        'will fail. Set both in the environment (see .env.example).',
    )
    return createBrowserClient(PLACEHOLDER_URL, PLACEHOLDER_KEY)
  }

  return createBrowserClient(url, key)
}
