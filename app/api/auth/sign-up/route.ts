// POST /api/auth/sign-up
//
// Server-side registration. Same reasoning as the sign-in route: the limiter
// and the account creation run in one request, so skipping the pre-check is
// not an option for a caller.
//
// Responses:
//   200 { ok: true }                          -> account created, session set
//   400 { error }                             -> validation failure
//   409 { error }                             -> Supabase rejected the signup
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

type Body = {
  email?: string
  password?: string
  name?: string
  phone?: string
  country?: string
  emailRedirectTo?: string
}

export async function POST(request: NextRequest) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 })
  }

  const email = (body.email ?? "").trim().toLowerCase()
  const password = body.password ?? ""
  const name = (body.name ?? "").trim()
  const phone = (body.phone ?? "").trim()
  const country = (body.country ?? "").trim()

  // Server-side revalidation. The form checks these too, but a form is a
  // convenience for honest users, not a boundary.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 })
  }
  if (password.length < 8 || password.length > 200) {
    return NextResponse.json({ error: "weak_password" }, { status: 400 })
  }
  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: "invalid_name" }, { status: 400 })
  }
  if (phone.replace(/[^0-9]/g, "").length < 6 || phone.length > 25) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 })
  }

  const ip = getClientIp(request.headers)
  const gate = await checkRateLimit("sign_up", ip)
  if (gate.limited) {
    const shaped = rateLimitJsonResponse(gate)
    return NextResponse.json(shaped.body, {
      status: shaped.status,
      headers: shaped.headers,
    })
  }

  // Only accept a same-site relative path for the confirmation redirect —
  // an attacker-supplied absolute URL would turn confirmation emails into an
  // open redirect pointing wherever they like.
  const rawRedirect = body.emailRedirectTo ?? "/dashboard"
  const safePath = /^\/(?!\/)[A-Za-z0-9\-._~!$&'()*+,;=:@/%]*$/.test(rawRedirect)
    ? rawRedirect
    : "/dashboard"
  const origin = new URL(request.url).origin
  const emailRedirectTo = `${origin}${safePath}`

  const carrier = new NextResponse(null)
  const supabase = await createRouteClient(carrier)

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone, country },
      emailRedirectTo,
    },
  })
  if (signUpError) {
    return NextResponse.json({ error: signUpError.message }, { status: 409 })
  }

  // Mirror the details into the profile row while the session is fresh.
  // No-op when email confirmation is ON (no session yet) — onboarding
  // collects the same fields again in that case.
  const { data: auth } = await supabase.auth.getUser()
  if (auth.user) {
    await supabase
      .from("profiles")
      .update({ phone, name_en: name, country })
      .eq("id", auth.user.id)
  }

  const response = NextResponse.json({ ok: true })
  carrier.cookies.getAll().forEach((c) => response.cookies.set(c))
  return response
}
