import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { hasRedisConfig, redisConfigShape, probeRedis } from "@/lib/security/rate-limit"

// ============================================================================
// GET /api/rate-limit/diagnostic
//
// Admin-only diagnostic endpoint (PR #42) for verifying rate limiting on
// production. Never exposes secrets — the response only contains:
//   - Booleans indicating whether the two Upstash env vars are visible
//   - The LENGTH of each env var (never the value itself)
//   - The outcome of a live SET+GET+DEL probe against Redis
//   - A sanitized error message if the probe fails
//
// Guard: authenticated Supabase session with profiles.role='admin'.
// Anonymous or non-admin callers get a 404 (not 401/403) so the endpoint's
// existence is not disclosed to random probes.
// ============================================================================

async function isAdminRequest(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() { /* read-only in a route handler */ },
        },
      },
    )
    const { data: userRes } = await supabase.auth.getUser()
    if (!userRes.user) return false
    const { data: prof } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userRes.user.id)
      .single()
    return (prof as { role?: string } | null)?.role === "admin"
  } catch {
    return false
  }
}

export async function GET() {
  const admin = await isAdminRequest()
  if (!admin) {
    return new NextResponse("Not Found", { status: 404 })
  }

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
