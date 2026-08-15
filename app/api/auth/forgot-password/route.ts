// POST /api/auth/forgot-password
//
// Server-side password-reset request. Enforces the limit in the same request
// that triggers the email, so the budget cannot be skipped by calling
// Supabase directly from the browser.
//
// This one matters more than the others: the pre-check was the only thing
// standing between an attacker and an unbounded "send a reset email to this
// address" primitive — free inbox-spam aimed at any user, from our domain.
//
// Always answers 200 on a valid address whether or not an account exists.
// Reporting "no such user" would turn this into an account-enumeration oracle.
//
// Responses:
//   200 { ok: true }                          -> email sent (or silently not)
//   400 { error }                             -> malformed address
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

type Body = { email?: string; isResend?: boolean }

export async function POST(request: NextRequest) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 })
  }

  const email = (body.email ?? "").trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 })
  }

  // Two budgets, both keyed on the target address: forgot_password (3/hr) for
  // a first send, email_resend (5/hr) for the resend button. Keying on the
  // email is correct here — the resource being protected is that inbox.
  const preset = body.isResend ? "email_resend" : "forgot_password"
  const gate = await checkRateLimit(preset, email)
  if (gate.limited) {
    const shaped = rateLimitJsonResponse(gate)
    return NextResponse.json(shaped.body, {
      status: shaped.status,
      headers: shaped.headers,
    })
  }

  // Second, IP-keyed budget so one attacker cannot walk a list of addresses
  // and spend every victim's per-email budget from a single machine.
  const ip = getClientIp(request.headers)
  const ipGate = await checkRateLimit("email_resend", `ip:${ip}`)
  if (ipGate.limited) {
    const shaped = rateLimitJsonResponse(ipGate)
    return NextResponse.json(shaped.body, {
      status: shaped.status,
      headers: shaped.headers,
    })
  }

  const origin = new URL(request.url).origin
  const carrier = new NextResponse(null)
  const supabase = await createRouteClient(carrier)

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/reset-password`,
  })
  if (error) {
    // Log for us; stay generic for the caller so this cannot be used to
    // probe which addresses are registered.
    console.error("[forgot-password] resetPasswordForEmail failed", error.message)
  }

  const response = NextResponse.json({ ok: true })
  carrier.cookies.getAll().forEach((c) => response.cookies.set(c))
  return response
}
