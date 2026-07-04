// Paymob (Accept) server-side helper.
//
// Implements the classic 3-step "Accept" flow:
//   1. Auth request  -> { token }
//   2. Order register -> { id: paymobOrderId }
//   3. Payment key   -> { token: paymentKey }
// Then we build the iframe URL from `iframeId + paymentKey`.
//
// HMAC-SHA512 verification for webhooks is exported as verifyPaymobHmac().
//
// All calls use fetch. No SDK. All env-var reads are lazy so builds
// without env vars still succeed (helpers throw at call time only).

export const PAYMOB_BASE_URL =
  process.env.PAYMOB_BASE_URL ?? "https://accept.paymob.com/api"
export const PAYMOB_CURRENCY = process.env.PAYMOB_CURRENCY ?? "AED"
export const PAYMOB_USD_TO_AED = Number(process.env.PAYMOB_USD_TO_AED ?? "3.67")

export type PaymobBillingData = {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  street: string
  building: string
  floor: string
  apartment: string
  city: string
  state: string
  country: string
  postal_code: string
  shipping_method: string
}

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

/** Step 1: get an auth token good for ~1 hour. */
export async function paymobAuth(): Promise<string> {
  const apiKey = requireEnv("PAYMOB_API_KEY")
  const res = await fetch(`${PAYMOB_BASE_URL}/auth/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey }),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Paymob auth failed: ${res.status} ${t}`)
  }
  const data = (await res.json()) as { token?: string }
  if (!data.token) throw new Error("Paymob auth: missing token")
  return data.token
}

/** Step 2: register an Order (amount in the minor unit of PAYMOB_CURRENCY). */
export async function paymobRegisterOrder(input: {
  authToken: string
  merchantOrderId: string
  amountCents: number
  currency?: string
  items?: Array<{
    name: string
    amount_cents: number
    description?: string
    quantity: number
  }>
}): Promise<{ paymobOrderId: number }> {
  const res = await fetch(`${PAYMOB_BASE_URL}/ecommerce/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: input.authToken,
      delivery_needed: false,
      amount_cents: input.amountCents,
      currency: input.currency ?? PAYMOB_CURRENCY,
      merchant_order_id: input.merchantOrderId,
      items: input.items ?? [],
    }),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Paymob order register failed: ${res.status} ${t}`)
  }
  const data = (await res.json()) as { id?: number }
  if (!data.id) throw new Error("Paymob order register: missing id")
  return { paymobOrderId: data.id }
}

/** Step 3: request a payment key scoped to a specific integration. */
export async function paymobPaymentKey(input: {
  authToken: string
  paymobOrderId: number
  amountCents: number
  billingData: PaymobBillingData
  integrationId: number
  expiration?: number
  currency?: string
  lockOrderWhenPaid?: boolean
}): Promise<{ paymentKey: string }> {
  const res = await fetch(`${PAYMOB_BASE_URL}/acceptance/payment_keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_token: input.authToken,
      amount_cents: input.amountCents,
      expiration: input.expiration ?? 3600,
      order_id: input.paymobOrderId,
      billing_data: input.billingData,
      currency: input.currency ?? PAYMOB_CURRENCY,
      integration_id: input.integrationId,
      lock_order_when_paid: input.lockOrderWhenPaid ?? true,
    }),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Paymob payment key failed: ${res.status} ${t}`)
  }
  const data = (await res.json()) as { token?: string }
  if (!data.token) throw new Error("Paymob payment key: missing token")
  return { paymentKey: data.token }
}

/** Build the iframe URL Paymob shows to the customer. */
export function paymobIframeUrl(paymentKey: string, iframeId: string | number): string {
  return `${PAYMOB_BASE_URL}/acceptance/iframes/${iframeId}?payment_token=${encodeURIComponent(
    paymentKey
  )}`
}

/**
 * Verify Paymob HMAC-SHA512 for a Transaction Processed callback.
 * `payload` is the transaction object from the callback body / query params.
 * Paymob concatenates fields alphabetically (see Accept documentation).
 */
export type PaymobHmacPayload = {
  amount_cents: string | number
  created_at: string
  currency: string
  error_occured: boolean | string
  has_parent_transaction: boolean | string
  id: string | number
  integration_id: string | number
  is_3d_secure: boolean | string
  is_auth: boolean | string
  is_capture: boolean | string
  is_refunded: boolean | string
  is_standalone_payment: boolean | string
  is_voided: boolean | string
  order: { id: string | number } | string | number
  owner: string | number
  pending: boolean | string
  source_data: {
    pan?: string
    sub_type?: string
    type?: string
  }
  success: boolean | string
  hmac: string
}

export async function verifyPaymobHmac(payload: PaymobHmacPayload): Promise<boolean> {
  const secret = requireEnv("PAYMOB_HMAC_SECRET")

  const orderId =
    typeof payload.order === "object" && payload.order !== null
      ? payload.order.id
      : payload.order

  // Paymob v1 HMAC concatenation order:
  // amount_cents | created_at | currency | error_occured | has_parent_transaction
  // | id | integration_id | is_3d_secure | is_auth | is_capture | is_refunded
  // | is_standalone_payment | is_voided | order.id | owner | pending
  // | source_data.pan | source_data.sub_type | source_data.type | success
  const parts = [
    payload.amount_cents,
    payload.created_at,
    payload.currency,
    payload.error_occured,
    payload.has_parent_transaction,
    payload.id,
    payload.integration_id,
    payload.is_3d_secure,
    payload.is_auth,
    payload.is_capture,
    payload.is_refunded,
    payload.is_standalone_payment,
    payload.is_voided,
    orderId,
    payload.owner,
    payload.pending,
    payload.source_data?.pan ?? "",
    payload.source_data?.sub_type ?? "",
    payload.source_data?.type ?? "",
    payload.success,
  ].map((v) => (v === undefined || v === null ? "" : String(v)))

  const message = parts.join("")

  // Web Crypto HMAC-SHA512. Available in Node 18+ and Edge.
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message))
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

  // Constant-time compare.
  const a = hex
  const b = String(payload.hmac).toLowerCase()
  if (a.length !== b.length) return false
  let ok = 0
  for (let i = 0; i < a.length; i++) ok |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return ok === 0
}

/** Convert a USD amount to the Paymob currency's minor unit (cents/fils). */
export function usdToPaymobMinorUnit(usd: number): number {
  const converted = usd * PAYMOB_USD_TO_AED
  return Math.round(converted * 100)
}
