// Complete sign-out helper. Used by BOTH the client dashboard and the admin
// panel so logout behaves identically everywhere.
//
// A partial logout was the source of the "I signed out but I'm back in after
// refresh" bug: the admin shell only removed a localStorage flag and never
// killed the Supabase session cookie, while the dashboard shell killed the
// cookie but left the persisted user in localStorage. Either leftover lets
// the app resurrect the session on the next navigation/refresh.
//
// This helper does ALL of it, in order:
//   1. Revoke the Supabase session (clears the sb-* auth cookies).
//   2. Strip the signed-in user from the persisted app state
//      (keeps guest-safe data like cart items and locale).
//   3. Remove legacy/auxiliary auth flags.
//   4. Hard-navigate to /sign-in so every in-memory React state is dropped.

import { createClient } from "@/lib/supabase/client"

const STATE_KEY = "loversdc:state:v1"

export async function signOutCompletely(): Promise<void> {
  // 1) Kill the Supabase session (server-side revoke + clear auth cookies).
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
  } catch {
    // Even if the network call fails, continue clearing local traces —
    // the hard redirect + cleared storage still prevents silent re-login.
  }

  if (typeof window !== "undefined") {
    // 2) Null the user inside persisted app state but keep cart/locale
    //    so a guest can continue shopping after logging out.
    try {
      const raw = window.localStorage.getItem(STATE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, unknown>
        parsed.user = null
        parsed.weightLogs = []
        parsed.waterLogs = []
        parsed.orders = []
        parsed.sessions = []
        parsed.doctorPlan = null
        parsed.notifications = []
        window.localStorage.setItem(STATE_KEY, JSON.stringify(parsed))
      }
    } catch {
      // Corrupt state — remove it entirely rather than risk resurrection.
      window.localStorage.removeItem(STATE_KEY)
    }

    // 3) Legacy / auxiliary flags.
    window.localStorage.removeItem("ldc_admin")
    window.localStorage.removeItem("loverDietUser")
    window.localStorage.removeItem("pendingCart")

    // 4) Hard navigation — drops all React in-memory state (store context,
    //    SWR caches, etc.) so nothing can re-hydrate the old session.
    window.location.href = "/sign-in"
  }
}
