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

/**
 * Send an order payment receipt email via Resend REST.
 * Fire-and-forget from webhook handlers — logs errors but never throws.
 */
export async function sendPaymentReceiptEmail(input: {
  to: string
  orderShortId: string
  totalUsd: number
  paidAmount: number
  paidCurrency: string
  transactionId: string
  paidAt: string
  shippingName?: string
  itemLines?: Array<{ name: string; qty: number; price: number }>
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const from =
    process.env.RESEND_FROM_EMAIL && process.env.RESEND_FROM_NAME
      ? `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`
      : "Lover Diet Center <support@loversdc.com>"
  if (!apiKey) return { ok: false, error: "Missing RESEND_API_KEY" }

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n)

  const itemRows = (input.itemLines ?? [])
    .map(
      (i) =>
        `<tr><td style=\"padding:6px 8px;\">${i.name}</td><td style=\"padding:6px 8px;text-align:center;\">${i.qty}</td><td style=\"padding:6px 8px;text-align:right;\">$${fmt(i.price * i.qty)}</td></tr>`
    )
    .join("")

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
<h1 style="margin:0 0 8px;color:#059669;font-size:22px;">Payment received</h1>
<p style="margin:0 0 24px;color:#64748b;">Thank you${input.shippingName ? ", " + input.shippingName : ""}. Your order has been paid.</p>
<div style="background:#f1f5f9;border-radius:8px;padding:16px;margin-bottom:24px;">
<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#64748b;">Order</span><span style="font-family:monospace;">${input.orderShortId}</span></div>
<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#64748b;">Paid</span><span><b>${input.paidCurrency} ${fmt(input.paidAmount)}</b></span></div>
<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#64748b;">Total (USD)</span><span>$${fmt(input.totalUsd)}</span></div>
<div style="display:flex;justify-content:space-between;"><span style="color:#64748b;">Transaction</span><span style="font-family:monospace;font-size:12px;">${input.transactionId}</span></div>
</div>
${itemRows ? `<table style="width:100%;border-collapse:collapse;margin-bottom:24px;"><thead><tr style="border-bottom:1px solid #e2e8f0;color:#64748b;font-size:12px;text-transform:uppercase;"><th style="padding:6px 8px;text-align:left;">Item</th><th style="padding:6px 8px;">Qty</th><th style="padding:6px 8px;text-align:right;">Total</th></tr></thead><tbody>${itemRows}</tbody></table>` : ""}
<p style="margin:0;color:#64748b;font-size:13px;">Questions? Reply to this email or contact us on WhatsApp.</p>
</div>
</body></html>`

  const text = `Payment received

Thank you${input.shippingName ? ", " + input.shippingName : ""}. Your order has been paid.

Order: ${input.orderShortId}
Paid: ${input.paidCurrency} ${fmt(input.paidAmount)}
Total (USD): $${fmt(input.totalUsd)}
Transaction: ${input.transactionId}

Lover Diet Center`

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: `Payment received — order ${input.orderShortId}`,
        html,
        text,
      }),
    })
    if (!res.ok) {
      const t = await res.text()
      return { ok: false, error: `Resend ${res.status}: ${t.slice(0, 200)}` }
    }
    return { ok: true }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
