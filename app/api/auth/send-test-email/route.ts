import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { resendSend, resendConfigured, resendFromHeader } from '@/lib/resend'

// Admin-only diagnostic endpoint. Sends a plain test email via the Resend REST
// API directly. Purpose: prove that Resend credentials are live and the domain
// is verified, independently of Supabase's SMTP configuration.
//
// POST /api/auth/send-test-email
// Body: { "to": "someone@example.com" }
//
// Returns:
//   200 { ok: true, id: "…" }             — Resend accepted the message
//   4xx { ok: false, error: "…" }         — Resend rejected, exact error included
//   401 { error: "Not authenticated" }
//   403 { error: "Admins only" }
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // AuthN
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try { cookieStore.set(name, value, options) } catch { /* ignore */ }
          })
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // AuthZ — must be admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, blocked')
    .eq('id', user.id)
    .single()
  if (!profile || profile.role !== 'admin' || profile.blocked === true) {
    return NextResponse.json({ error: 'Admins only' }, { status: 403 })
  }

  if (!resendConfigured()) {
    return NextResponse.json({
      ok: false,
      error: 'Resend is not configured. RESEND_API_KEY and RESEND_FROM_EMAIL must be set as environment variables.',
    }, { status: 500 })
  }

  // Parse body
  let to: string
  try {
    const body = await request.json()
    to = String(body?.to || '').trim().toLowerCase()
    if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) {
      return NextResponse.json({ error: "Missing or invalid 'to' address" }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: "Body must be JSON with 'to' field" }, { status: 400 })
  }

  const html = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color:#4d7c0f;">Resend Test Email</h2>
      <p>This is a test message from <strong>Lover Diet Center</strong> confirming that Resend integration is live.</p>
      <p style="color:#666;font-size:12px;">
        Sent from: ${resendFromHeader()}<br>
        Requested by: ${user.email}<br>
        Time: ${new Date().toISOString()}
      </p>
    </div>
  `

  const result = await resendSend({
    to,
    subject: 'Resend Test — Lover Diet Center',
    html,
    text: 'Resend integration is live. If you can read this, delivery works.',
    tags: [{ name: 'kind', value: 'diagnostic' }],
  })

  if (!result.ok) {
    // Log to server console for Vercel logs; return the exact error to caller.
    console.error('[send-test-email] Resend failure', result)
    return NextResponse.json({
      ok: false,
      status: result.status,
      error: result.error,
      details: result.details,
    }, { status: result.status >= 400 ? result.status : 500 })
  }

  return NextResponse.json({ ok: true, id: result.id })
}
