// Minimal Resend REST API client.
// Zero external dependencies — uses native fetch, works on the Node runtime
// and on the Edge runtime alike.
//
// We keep this thin because Supabase Auth handles the actual authentication
// email flow via SMTP (configured in the Supabase Dashboard). This module
// exists for two reasons:
//   1. A diagnostic /api/auth/send-test-email endpoint that proves Resend
//      credentials + domain verification are live.
//   2. Future application-level emails (order confirmations, plan updates)
//      which the marketing / dashboard side can call directly.
//
// Docs: https://resend.com/docs/api-reference/emails/send-email

export type ResendSendResult =
  | { ok: true; id: string }
  | { ok: false; status: number; error: string; details?: unknown }

export type ResendSendOptions = {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string          // defaults to RESEND_FROM_EMAIL / RESEND_FROM_NAME
  replyTo?: string
  tags?: { name: string; value: string }[]
}

export function resendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL)
}

export function resendFromHeader(): string {
  const email = process.env.RESEND_FROM_EMAIL || 'support@loversdc.com'
  const name = process.env.RESEND_FROM_NAME || 'Lover Diet Center'
  // RFC 5322 "Display Name <email>" — Resend accepts this format.
  return `${name} <${email}>`
}

export async function resendSend(opts: ResendSendOptions): Promise<ResendSendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      error: 'RESEND_API_KEY is not configured on the server.',
    }
  }

  const body = {
    from: opts.from || resendFromHeader(),
    to: Array.isArray(opts.to) ? opts.to : [opts.to],
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    reply_to: opts.replyTo,
    tags: opts.tags,
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const payload = await res.json().catch(() => ({}))
    if (!res.ok) {
      // Resend errors look like { name: "validation_error", message: "...", statusCode: 422 }
      const errMsg =
        (payload && typeof payload === 'object' && 'message' in payload && typeof payload.message === 'string')
          ? payload.message
          : `Resend responded ${res.status}`
      return { ok: false, status: res.status, error: errMsg, details: payload }
    }

    // Success payload: { id: "01234..." }
    const id = (payload && typeof payload === 'object' && 'id' in payload && typeof payload.id === 'string')
      ? payload.id
      : ''
    return { ok: true, id }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return { ok: false, status: 0, error: `Network error calling Resend: ${msg}` }
  }
}
