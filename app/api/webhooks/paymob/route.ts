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
import { verifyPaymobHmac, usdToPaymobMinorUnit } from "@/lib/payments/paymob"
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
  //
  // NOTE: the column is `raw`, not `payload` (see the payment_events DDL in
  // 2026_07_04_payments_and_addresses.sql). Writing to a non-existent column
  // makes PostgREST reject the whole insert with PGRST204, which silently
  // disabled idempotency entirely — every Paymob retry re-ran the paid path
  // and re-sent the receipt email.
  const { error: insertErr } = await supabase.from("payment_events").insert({
    provider: "paymob",
    event_id: String(txn.id),
    order_id: merchantOrderId,
    event_type: body.type ?? "TRANSACTION",
    raw: txn,
  })
  if (insertErr) {
    if (insertErr.code === "23505") {
      // duplicate — already processed
      return NextResponse.json({ ok: true, duplicate: true }, { status: 200 })
    }
    console.error("[paymob-webhook] event insert failed", insertErr)
    // continue anyway — better a duplicate row update than a dropped payment.
    // The receipt email is still protected: it only fires when the RPC
    // reports that it actually transitioned the order (applied = true).
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
    //
    // `applied` is true only when the UPDATE actually transitioned the order
    // from pending -> paid. On a Paymob retry the UPDATE matches zero rows,
    // so we must NOT send a second receipt for the same payment.
    // Amount reconciliation.
    //
    // Deliberately a loud log, not a rejection. The transaction is already
    // HMAC-verified and the payment key was issued with lock_order_when_paid,
    // so the amount cannot be tampered with by a customer — a mismatch here
    // means OUR configuration drifted (wrong integration id, wrong currency,
    // or PAYMOB_USD_TO_AED out of date). Refusing the payment on an FX
    // rounding difference would reject good orders to guard against a threat
    // the signature already covers, so we record it and let a human decide.
    try {
      const rec0 = data as unknown as { total?: number } | null
      if (typeof rec0?.total === "number") {
        const expectedMinor = usdToPaymobMinorUnit(rec0.total)
        const drift = Math.abs(expectedMinor - txn.amount_cents)
        // 2% covers FX rounding; anything beyond that is a real discrepancy.
        if (drift > Math.max(100, expectedMinor * 0.02)) {
          console.error(
            `[paymob-webhook] AMOUNT MISMATCH order=${merchantOrderId} txn=${txn.id} ` +
              `expected=${expectedMinor} received=${txn.amount_cents} ${txn.currency} ` +
              `orderTotalUsd=${rec0.total}`,
          )
        }
      }
    } catch (e) {
      console.error("[paymob-webhook] amount check failed", (e as Error).message)
    }

    try {
      const rec = (data as unknown) as {
        applied: boolean
        email: string | null
        short_id: string
        total: number
        shipping_name: string | null
      } | null
      if (rec?.applied && rec.email) {
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
