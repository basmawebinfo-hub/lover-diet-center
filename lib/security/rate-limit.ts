// ============================================================================
// Reusable rate limiter — Phase 4 · PR #37 (extended in PR #39 with `mode`)
//
// Backed by Upstash Redis + @upstash/ratelimit's sliding-window algorithm.
// Designed to be reused across every request-throttled surface in the app:
//   - Auth flows (sign-in, sign-up, forgot-password, OTP verify, admin auth)
//   - Contact forms (when we add them)
//   - AI APIs (Phase 5)
//   - Payment webhooks (Phase 5)
//   - Any admin API endpoint that shouldn't be spammable
//
// The helper is fail-open: if UPSTASH_REDIS_REST_URL / _TOKEN aren't set
// (preview builds without KV, local dev without a Redis instance),
// `checkRateLimit` returns `{ limited: false, mode: "fail_open" }` so the
// app still functions.
//
// Production must have both env vars set. The `mode` field on every
// response tells you which path was taken — "enforcing" means Redis is
// reachable and the limit was really consulted; "fail_open" / "error_open"
// mean the request was allowed without a real check.
//
// Sliding window semantics: unlike a fixed window, a burst at the tail of one
// window followed by another burst at the head of the next is correctly
// treated as a single burst crossing the boundary. This is the right shape
// for "5 requests per minute" — it prevents the classic double-burst attack.
// ============================================================================

import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"

// Preset windows used across the app. Keep the identifiers stable — they're
// used as the Redis key prefix, so renaming resets the counter.
export type RateLimitPreset =
  | "sign_in"           // 5 / min / IP
  | "sign_up"           // 5 / min / IP
  | "forgot_password"   // 3 / hour / email
  | "email_resend"      // 5 / hour / email
  | "otp_verify"        // 10 / 15 min / IP
  | "admin_auth"        // 3 / min / IP (stricter than user sign-in)

const PRESETS: Record<
  RateLimitPreset,
  { tokens: number; window: `${number} ${"s" | "m" | "h" | "d"}` }
> = {
  sign_in:         { tokens: 5,  window: "1 m"  },
  sign_up:         { tokens: 5,  window: "1 m"  },
  forgot_password: { tokens: 3,  window: "1 h"  },
  email_resend:    { tokens: 5,  window: "1 h"  },
  otp_verify:      { tokens: 10, window: "15 m" },
  admin_auth:      { tokens: 3,  window: "1 m"  },
}

// Lazy singletons keyed by preset so we don't rebuild the Ratelimit instance
// on every request. Node keeps them warm across invocations on Vercel.
const _limiters: Partial<Record<RateLimitPreset, Ratelimit>> = {}

/** Return true when both Upstash env vars are visible to the current runtime. */
export function hasRedisConfig(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

/** Length-only diagnostic — never returns the actual values. */
export function redisConfigShape(): { hasUrl: boolean; hasToken: boolean; urlLen: number; tokenLen: number } {
  return {
    hasUrl: !!process.env.UPSTASH_REDIS_REST_URL,
    hasToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    urlLen: (process.env.UPSTASH_REDIS_REST_URL ?? "").length,
    tokenLen: (process.env.UPSTASH_REDIS_REST_TOKEN ?? "").length,
  }
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

/** Live end-to-end probe: SET, GET, DEL a throwaway key. Returns a sanitized
 *  result the diagnostic endpoint can echo back safely.
 *
 *  Enhanced in PR #41 to report step-by-step outcomes and a raw-REST
 *  parallel probe so we can distinguish SDK behavior from wire-level
 *  auth/database issues without leaking secrets. */
export async function probeRedis(): Promise<{
  ok: boolean
  error?: string
  roundtripMs?: number
  hostHint?: string
  setResult?: string | null
  getResult?: string | null
  delResult?: string | null
  rawPing?: { status: number; bodySample: string } | null
  rawSet?: { status: number; bodySample: string } | null
}> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  // Host hint — first 30 chars of hostname (never token/query). Lets the
  // caller verify which database we're talking to without leaking auth.
  let hostHint: string | undefined
  try {
    if (url) hostHint = new URL(url).hostname.slice(0, 40)
  } catch { /* invalid URL - hostHint stays undefined */ }

  // Raw REST probe #1: /ping — simplest sanity check. Bypasses the SDK.
  // Upstash REST API returns { "result": "PONG" } on success, 401 on auth failure.
  let rawPing: { status: number; bodySample: string } | null = null
  if (url && token) {
    try {
      const pingUrl = `${url.replace(/\/$/, "")}/ping`
      const res = await fetch(pingUrl, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
        cache: "no-store",
      })
      const text = await res.text()
      // Sanitize any token-looking substring out of the body just in case.
      const clean = text.replace(/[A-Za-z0-9+/=_-]{40,}/g, "[REDACTED]").slice(0, 200)
      rawPing = { status: res.status, bodySample: clean }
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err)
      const clean = raw.replace(/[A-Za-z0-9+/=_-]{40,}/g, "[REDACTED]").slice(0, 200)
      rawPing = { status: 0, bodySample: `fetch_error: ${clean}` }
    }
  }

  // Raw REST probe #2: SET a diagnostic key via /set/<key>/<value>.
  // Confirms write permission on the specific database the token belongs to.
  let rawSet: { status: number; bodySample: string } | null = null
  if (url && token) {
    try {
      const setUrl = `${url.replace(/\/$/, "")}/set/ldc%3Arl%3A_diag_raw/1/EX/10`
      const res = await fetch(setUrl, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        cache: "no-store",
      })
      const text = await res.text()
      const clean = text.replace(/[A-Za-z0-9+/=_-]{40,}/g, "[REDACTED]").slice(0, 200)
      rawSet = { status: res.status, bodySample: clean }
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err)
      const clean = raw.replace(/[A-Za-z0-9+/=_-]{40,}/g, "[REDACTED]").slice(0, 200)
      rawSet = { status: 0, bodySample: `fetch_error: ${clean}` }
    }
  }

  // Now the SDK path (unchanged behavior).
  let redis: Redis | null = null
  try {
    redis = getRedis()
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err)
    const clean = raw.replace(/[A-Za-z0-9+/=_-]{40,}/g, "[REDACTED]").slice(0, 200)
    return { ok: false, error: `client_construct_failed: ${clean}`, hostHint, rawPing, rawSet }
  }
  if (!redis) return { ok: false, error: "env_missing", hostHint, rawPing, rawSet }

  const key = `ldc:rl:_probe:${Date.now()}`
  const started = Date.now()
  let setResult: string | null = null
  let getResult: string | null = null
  let delResult: string | null = null

  try {
    // Wrap each step so we can report EXACTLY where the flow diverged.
    try {
      const r = await redis.set(key, "1", { ex: 10 })
      setResult = r === null || r === undefined ? String(r) : String(r)
    } catch (e) {
      setResult = `THROW: ${(e instanceof Error ? e.message : String(e)).slice(0, 100)}`
    }
    let rawGet: unknown = undefined
    try {
      rawGet = await redis.get<string>(key)
      getResult = rawGet === null || rawGet === undefined ? String(rawGet) : JSON.stringify(rawGet).slice(0, 40)
    } catch (e) {
      getResult = `THROW: ${(e instanceof Error ? e.message : String(e)).slice(0, 100)}`
    }
    try {
      const r = await redis.del(key)
      delResult = String(r)
    } catch (e) {
      delResult = `THROW: ${(e instanceof Error ? e.message : String(e)).slice(0, 100)}`
    }

    // Coerce to string before comparing — the @upstash/redis SDK auto-parses
    // numeric-looking strings into JS numbers, so we set the string "1" but
    // read back the number 1. String(value) === "1" handles both cleanly.
    if (String(rawGet) !== "1") {
      // Historical shape: probeRedis returned "value_mismatch" for anything
      // other than exact match. Preserve that for the diagnostic endpoint
      // but expand with per-step detail.
      return {
        ok: false,
        error: "value_mismatch",
        roundtripMs: Date.now() - started,
        hostHint,
        setResult,
        getResult,
        delResult,
        rawPing,
        rawSet,
      }
    }
    return {
      ok: true,
      roundtripMs: Date.now() - started,
      hostHint,
      setResult,
      getResult,
      delResult,
      rawPing,
      rawSet,
    }
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err)
    const clean = raw.replace(/[A-Za-z0-9+/=_-]{40,}/g, "[REDACTED]").slice(0, 200)
    return {
      ok: false,
      error: clean,
      roundtripMs: Date.now() - started,
      hostHint,
      setResult,
      getResult,
      delResult,
      rawPing,
      rawSet,
    }
  }
}

function getLimiter(preset: RateLimitPreset): Ratelimit | null {
  if (_limiters[preset]) return _limiters[preset] as Ratelimit
  let redis: Redis | null
  try {
    redis = getRedis()
  } catch {
    // Malformed URL/token — treat as env-missing for the limiter path.
    return null
  }
  if (!redis) return null
  const cfg = PRESETS[preset]
  const rl = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(cfg.tokens, cfg.window),
    prefix: `ldc:rl:${preset}`,
    // Analytics = false — no @upstash telemetry writes. Keeps latency low
    // and doesn't touch the free-tier command budget.
    analytics: false,
  })
  _limiters[preset] = rl
  return rl
}

export type RateLimitMode = "enforcing" | "fail_open" | "error_open"

export type RateLimitResult = {
  limited: boolean
  /** Seconds until the caller can retry. 0 when not limited. */
  retryAfterSec: number
  /** Requests remaining in the current window. */
  remaining: number
  /** Human-friendly message safe to show the end user. */
  message: string
  /** Observability: which code path answered.
   *   "enforcing"  = Redis reachable, real limit consulted.
   *   "fail_open"  = env vars missing, allowed by default.
   *   "error_open" = Redis ping threw at runtime, allowed by default. */
  mode: RateLimitMode
}

/**
 * Check whether the given (preset, identifier) tuple has exceeded its rate
 * limit. Never throws — network failures fail-open so a broken Redis link
 * doesn't accidentally lock users out of the site.
 *
 * @param preset     One of the app's named rate-limit presets.
 * @param identifier Stable string that identifies the actor (IP, email, uid).
 */
export async function checkRateLimit(
  preset: RateLimitPreset,
  identifier: string,
): Promise<RateLimitResult> {
  const id = (identifier || "").trim().toLowerCase() || "anonymous"
  try {
    const rl = getLimiter(preset)
    if (!rl) {
      return { limited: false, retryAfterSec: 0, remaining: Infinity, message: "", mode: "fail_open" }
    }
    const { success, reset, remaining } = await rl.limit(id)
    if (success) {
      return { limited: false, retryAfterSec: 0, remaining, message: "", mode: "enforcing" }
    }
    const now = Date.now()
    const waitMs = Math.max(0, reset - now)
    const retryAfterSec = Math.ceil(waitMs / 1000)
    return {
      limited: true,
      retryAfterSec,
      remaining: 0,
      message: "Too many requests. Please wait a moment and try again.",
      mode: "enforcing",
    }
  } catch (err) {
    // Fail-open on any Redis/network error. Log to server console so the
    // owner sees these in Vercel logs if it starts happening.
    console.warn("[rate-limit] check failed, allowing request", err)
    return { limited: false, retryAfterSec: 0, remaining: Infinity, message: "", mode: "error_open" }
  }
}

/**
 * Extract a stable client IP from a Next request's headers. Vercel injects
 * x-forwarded-for; the first entry is the real client. Falls back to a
 * stable-but-anonymous bucket when no header is present (e.g. localhost).
 */
export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for") ?? ""
  const first = xff.split(",")[0]?.trim()
  if (first) return first
  const real = headers.get("x-real-ip")?.trim()
  if (real) return real
  return "unknown"
}

/**
 * Standard 429 JSON body used across all rate-limited routes. Client code
 * checks for { limited: true } to render the friendly toast.
 */
export function rateLimitJsonResponse(res: RateLimitResult): {
  body: { limited: true; retryAfterSec: number; message: string; mode: RateLimitMode }
  status: 429
  headers: HeadersInit
} {
  return {
    body: { limited: true, retryAfterSec: res.retryAfterSec, message: res.message, mode: res.mode },
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(res.retryAfterSec),
    },
  }
}
