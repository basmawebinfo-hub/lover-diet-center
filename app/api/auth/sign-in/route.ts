// POST /api/auth/sign-in
//
// Server-side sign-in. The rate limit and the credential check happen in the
// SAME request, which is the whole point of this route.
//
// Previously the browser called POST /api/rate-limit, then — if that came back
// clean — called supabase.auth.signInWithPassword() directly from client code.
// Nothing forced the two calls to happen together, so any attacker could skip
// the first one and brute-force the second at full speed. The limiter was
// advisory UI, not a control.
//
// Responses:
//   200 { ok: true, dest }                    -> signed in, session cookies set
//   400 { error }                             -> malformed body / validation
//   401 { error }                             -> bad credentials
//   429 { limited: true, retryAfterSec, ... } -> rate limited

import { NextResponse, type NextRequest } from "next/server"
import { createRouteClient } from "@/lib/supabase/route"
import {
  checkRateLimit,
  getClientIp,
  rateLimitJsonResponse,
} from "@/lib/security/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const ADMIN_EMAIL = "admin@loversdc.com"

type Body = { email?: string; password?: string }

export async function POST(request: NextRequest) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 })
  }

  const email = (body.email ?? "").trim().toLowerCase()
  const password = body.password ?? ""

  if (!email || !password) {
    return NextResponse.json({ error: "missing_credentials" }, { status: 400 })
  }

  // Admins get the stricter admin_auth budget (3/min) instead of sign_in
  // (5/min). Keyed on IP either way — an email-keyed limit would let an
  // attacker lock a victim out of their own account.
  const preset = email === ADMIN_EMAIL ? "admin_auth" : "sign_in"
  const ip = getClientIp(request.headers)
  const gate = await checkRateLimit(preset, ip)

  if (gate.limited) {
    if (preset === "admin_auth") {
      console.warn(
        `[sign-in] admin_auth blocked | ip=${ip} retryAfter=${gate.retryAfterSec}s`,
      )
    }
    const shaped = rateLimitJsonResponse(gate)
    return NextResponse.json(shaped.body, {
      status: shaped.status,
      headers: shaped.headers,
    })
  }

  // Supabase needs a response object to write session cookies onto, but we
  // don't know the final body (dest) until after the profile lookup. Use a
  // throwaway carrier here and copy its cookies onto the real response below.
  const carrier = new NextResponse(null)
  const supabase = await createRouteClient(carrier)

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (signInError) {
    // Deliberately generic — never reveal whether the address exists.
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 })
  }

  // Admins land on /admin; everyone else on the caller-supplied redirect,
  // which the client validates as a same-site path before using it.
  let dest = "/dashboard"
  const { data: auth } = await supabase.auth.getUser()
  if (auth.user) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", auth.user.id)
      .single()
    if ((prof as { role?: string } | null)?.role === "admin") dest = "/admin"
  }

  const response = NextResponse.json({ ok: true, dest })
  carrier.cookies.getAll().forEach((c) => response.cookies.set(c))
  return response
}
