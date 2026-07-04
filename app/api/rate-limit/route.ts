import { NextResponse, type NextRequest } from "next/server"
import {
  checkRateLimit,
  getClientIp,
  rateLimitJsonResponse,
  type RateLimitPreset,
} from "@/lib/security/rate-limit"

// ============================================================================
// POST /api/rate-limit
//
// Called by the auth pages BEFORE dispatching the actual Supabase call.
// The client sends { preset, identifier? }. When identifier is omitted we
// fall back to the client IP. When the submitted email matches the known
// admin address, we auto-upgrade sign_in -> admin_auth so admins get the
// stricter limit without a separate client-side path.
//
// Response codes:
//   200 { limited: false }                              -> proceed
//   429 { limited: true, retryAfterSec, message }       -> block + toast
//   400                                                 -> malformed body
//
// Never throws — network/redis errors inside the helper fail-open.
// ============================================================================

const ALLOWED_PRESETS: RateLimitPreset[] = [
  "sign_in",
  "sign_up",
  "forgot_password",
  "email_resend",
  "otp_verify",
  "admin_auth",
]

// Presets that key on an email/user identifier rather than the client IP.
const EMAIL_KEYED: Set<RateLimitPreset> = new Set(["forgot_password", "email_resend"])

type CheckBody = { preset?: string; identifier?: string }

export async function POST(request: NextRequest) {
  let body: CheckBody = {}
  try {
    body = (await request.json()) as CheckBody
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 })
  }

  const preset = body.preset as RateLimitPreset | undefined
  if (!preset || !ALLOWED_PRESETS.includes(preset)) {
    return NextResponse.json({ error: "invalid_preset" }, { status: 400 })
  }

  const ip = getClientIp(request.headers)
  const email = (body.identifier ?? "").trim().toLowerCase()

  // Admin-email upgrade path: enforce the stricter admin_auth budget when a
  // sign-in attempt is aimed at the known admin address. Regular users stay
  // on the sign_in budget.
  let effectivePreset: RateLimitPreset = preset
  if (preset === "sign_in" && email && email === "admin@loversdc.com") {
    effectivePreset = "admin_auth"
  }

  const identifier = EMAIL_KEYED.has(effectivePreset) ? (email || ip) : ip

  const result = await checkRateLimit(effectivePreset, identifier)

  if (result.limited) {
    // Admin-side hits get logged to the Vercel server console so the owner
    // can see abuse attempts. We deliberately do NOT write admin_audit_log
    // rows here — the RLS policy requires admin_id = auth.uid() and by
    // definition the caller isn't authenticated at this point. A future
    // service-role server route could persist these; deferred.
    if (effectivePreset === "admin_auth") {
      console.warn(
        `[rate-limit] admin_auth blocked | ip=${ip} email=${email || "?"} retryAfter=${result.retryAfterSec}s`,
      )
    }
    const shaped = rateLimitJsonResponse(result)
    return NextResponse.json(shaped.body, { status: shaped.status, headers: shaped.headers })
  }

  return NextResponse.json({ limited: false }, { status: 200 })
}
