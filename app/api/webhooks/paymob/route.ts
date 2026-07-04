// Paymob webhook — HMAC-verified.
//
// Always returns 200 to Paymob (even on our own errors) to avoid the
// callback being retried indefinitely. Real errors are logged to the
// server console for observability.
//
// Idempotency: payment_events UNIQUE(provider, event_id) with the
// Paymob transaction id as event_id.
//
// Row updates flow through SECURITY DEFINER RPCs so anon key can still
// apply them (we don't have service_role in this project).

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { verifyPaymobHmac } from "@/lib/payments/paymob"
import { sendPaymentReceiptEmail } from "@/lib/resend"

export const runtime = "nodejs"

function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false } }
  )
}

type PaymobTxnBody = {
  type?: string
  obj?: {
    id: number
    pending: boolean
    amount_cents: number
    success: boolean
    is_auth: boolean
    is_capture: boolean
    is_standalone_payment: boolean
    is_voided: boolean
    is_refunded: boolean
    is_3d_secure: boolean
    integration_id: number
    profile_id?: number
    has_parent_transaction: boolean
    order: {
      id: number
      merchant_order_id?: string
      amount_cents: number
      currency: string
    }
    created_at: string
    currency: string
    error_occured: boolean
    owner: number
    source_data: {
      pan?: string
      type?: string
      sub_type?: string
    }
    hmac?: string
  }
  hmac?: string
}

export async function POST(req: Request) {
  let body: PaymobTxnBody
  try {
    body = (await req.json()) as PaymobTxnBody
  } catch (e) {
    console.warn("[paymob-webhook] invalid JSON", (e as Error).message)
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  const txn = body.obj
  if (!txn) {
    console.warn("[paymob-webhook] missing obj")
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  const hmac =
    (body.hmac as string | undefined) ??
    new URL(req.url).searchParams.get("hmac") ??
    ""
  if (!hmac) {
    console.warn("[paymob-webhook] missing hmac")
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  const hmacPayload = {
    amount_cents: txn.amount_cents,
    created_at: txn.created_at,
    currency: txn.currency,
    error_occured: txn.error_occured,
    has_parent_transaction: txn.has_parent_transaction,
    id: txn.id,
    integration_id: txn.integration_id,
    is_3d_secure: txn.is_3d_secure,
    is_auth: txn.is_auth,
    is_capture: txn.is_capture,
    is_refunded: txn.is_refunded,
    is_standalone_payment: txn.is_standalone_payment,
    is_voided: txn.is_voided,
    order: txn.order,
    owner: txn.owner,
    pending: txn.pending,
    source_data: txn.source_data ?? {},
    success: txn.success,
    hmac,
  }
  const valid = await verifyPaymobHmac(hmacPayload)
  if (!valid) {
    console.warn("[paymob-webhook] hmac verification failed", txn.id)
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  const merchantOrderId = txn.order.merchant_order_id
  if (!merchantOrderId) {
    console.warn("[paymob-webhook] missing merchant_order_id", txn.id)
    return NextResponse.json({ ok: false }, { status: 200 })
  }

  const supabase = getAnonClient()

  // Insert into payment_events for idempotency. A duplicate is fine —
  // we log it and short-circuit.
  const { error: insertErr } = await supabase.from("payment_events").insert({
    provider: "paymob",
    event_id: String(txn.id),
    order_id: merchantOrderId,
    payload: txn,
  })
  if (insertErr) {
    if (insertErr.code === "23505") {
      // duplicate — already processed
      return NextResponse.json({ ok: true, duplicate: true }, { status: 200 })
    }
    console.error("[paymob-webhook] event insert failed", insertErr)
    // continue anyway — better a duplicate row update than a dropped payment
  }

  const paidAmount = txn.amount_cents / 100

  if (txn.success && !txn.pending && !txn.error_occured) {
    // Paid path
    const { data, error } = await supabase.rpc("paymob_apply_paid", {
      p_order_id: merchantOrderId,
      p_paymob_transaction_id: String(txn.id),
      p_paid_amount: paidAmount,
      p_paid_currency: txn.currency,
    })
    if (error) {
      console.error("[paymob-webhook] paymob_apply_paid failed", error)
      return NextResponse.json({ ok: false }, { status: 200 })
    }

    // Fire receipt email (fire-and-forget).
    try {
      const rec = (data as unknown) as {
        email: string | null
        short_id: string
        total: number
        shipping_name: string | null
      } | null
      if (rec?.email) {
        await sendPaymentReceiptEmail({
          to: rec.email,
          orderShortId: rec.short_id,
          totalUsd: rec.total,
          paidAmount,
          paidCurrency: txn.currency,
          transactionId: String(txn.id),
          paidAt: new Date().toISOString(),
          shippingName: rec.shipping_name ?? undefined,
        })
      }
    } catch (e) {
      console.error("[paymob-webhook] receipt email failed", (e as Error).message)
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  }

  // Failed / voided path
  if (!txn.pending) {
    const { error } = await supabase.rpc("paymob_apply_failed", {
      p_order_id: merchantOrderId,
      p_paymob_transaction_id: String(txn.id),
    })
    if (error) {
      console.error("[paymob-webhook] paymob_apply_failed failed", error)
      return NextResponse.json({ ok: false }, { status: 200 })
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
