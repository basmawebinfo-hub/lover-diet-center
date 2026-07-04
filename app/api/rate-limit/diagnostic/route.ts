import { NextResponse } from "next/server"
import { hasRedisConfig, redisConfigShape, probeRedis } from "@/lib/security/rate-limit"

// ============================================================================
// GET /api/rate-limit/diagnostic
//
// Public diagnostic endpoint (PR #39) for verifying that rate limiting is
// actively enforcing on production. Never exposes secrets — the response
// only contains:
//   - Booleans indicating whether the two Upstash env vars are visible
//   - The LENGTH of each env var (never the value itself)
//   - The outcome of a live SET+GET+DEL probe against Redis
//   - A sanitized error message if the probe fails
//
// Intended for:
//   - Post-deploy verification after setting UPSTASH_* env vars
//   - Diagnosing "why isn't rate limiting kicking in?" issues
//
// SAFE TO CALL FROM ANYWHERE — no secrets leaked. This is why it's a GET
// with no auth required.
// ============================================================================

export async function GET() {
  const shape = redisConfigShape()
  const hasConfig = hasRedisConfig()

  if (!hasConfig) {
    return NextResponse.json({
      status: "fail_open",
      reason: "env_missing",
      env: shape,
      probe: null,
    })
  }

  const probe = await probeRedis()
  return NextResponse.json({
    status: probe.ok ? "enforcing" : "error_open",
    reason: probe.ok ? null : probe.error ?? "unknown",
    env: shape,
    probe,
  })
}
