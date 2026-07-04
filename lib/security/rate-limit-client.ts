// ============================================================================
// Client-side helper to pre-check a rate-limit preset before firing an
// expensive/sensitive action (auth, contact submit, etc). Intentionally
// separate from lib/security/rate-limit.ts so the browser bundle doesn't
// pull in @upstash/redis.
//
// Usage inside a form handler:
//
//   const gate = await checkRateLimitClient("sign_in", email)
//   if (!gate.ok) {
//     setError(gate.message)   // "Too many requests. Please wait..."
//     return
//   }
//   // proceed with supabase.auth.signInWithPassword(...)
// ============================================================================

import type { RateLimitPreset } from "@/lib/security/rate-limit"

export type ClientGate =
  | { ok: true }
  | { ok: false; message: string; retryAfterSec: number }

export async function checkRateLimitClient(
  preset: RateLimitPreset,
  identifier?: string,
): Promise<ClientGate> {
  try {
    const res = await fetch("/api/rate-limit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preset, identifier }),
      cache: "no-store",
    })
    if (res.status === 429) {
      let body: { message?: string; retryAfterSec?: number } = {}
      try { body = await res.json() } catch { /* ignore */ }
      return {
        ok: false,
        message: body.message || "Too many requests. Please wait a moment and try again.",
        retryAfterSec: body.retryAfterSec ?? 60,
      }
    }
    return { ok: true }
  } catch {
    // Network failure on the pre-check should not block the real action —
    // let the underlying Supabase call go through and fail its own way.
    return { ok: true }
  }
}
