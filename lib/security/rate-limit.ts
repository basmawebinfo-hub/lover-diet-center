// ============================================================================
// Reusable rate limiter — Phase 4 · PR #37
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
// `checkRateLimit` returns `{ limited: false }` so the app still functions.
// Production must have the env vars set for the limits to actually apply.
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

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

function getLimiter(preset: RateLimitPreset): Ratelimit | null {
  if (_limiters[preset]) return _limiters[preset] as Ratelimit
  const redis = getRedis()
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

export type RateLimitResult = {
  limited: boolean
  /** Seconds until the caller can retry. 0 when not limited. */
  retryAfterSec: number
  /** Requests remaining in the current window. */
  remaining: number
  /** Human-friendly message safe to show the end user. */
  message: string
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
      // Fail-open when Redis isn't configured. Every environment where the
      // limit MUST apply should have the env vars set at deploy time.
      return { limited: false, retryAfterSec: 0, remaining: Infinity, message: "" }
    }
    const { success, reset, remaining } = await rl.limit(id)
    if (success) {
      return { limited: false, retryAfterSec: 0, remaining, message: "" }
    }
    const now = Date.now()
    const waitMs = Math.max(0, reset - now)
    const retryAfterSec = Math.ceil(waitMs / 1000)
    return {
      limited: true,
      retryAfterSec,
      remaining: 0,
      message: "Too many requests. Please wait a moment and try again.",
    }
  } catch (err) {
    // Fail-open on any Redis/network error. Log to server console so the
    // owner sees these in Vercel logs if it starts happening.
    console.warn("[rate-limit] check failed, allowing request", err)
    return { limited: false, retryAfterSec: 0, remaining: Infinity, message: "" }
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
  body: { limited: true; retryAfterSec: number; message: string }
  status: 429
  headers: HeadersInit
} {
  return {
    body: { limited: true, retryAfterSec: res.retryAfterSec, message: res.message },
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(res.retryAfterSec),
    },
  }
}
