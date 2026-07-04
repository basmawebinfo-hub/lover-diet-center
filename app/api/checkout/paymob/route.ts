// Paymob checkout API route.
// Creates a Paymob payment session for an existing pending order.
//
// Auth: user session required. RLS + explicit user_id equality guards
// the order.
//
// Response: { iframeUrl, paymobOrderId, orderId }

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import {
  paymobAuth,
  paymobRegisterOrder,
  paymobPaymentKey,
  paymobIframeUrl,
  usdToPaymobMinorUnit,
  PAYMOB_CURRENCY,
  type PaymobBillingData,
} from "@/lib/payments/paymob"
import {
  fetchOrderForUser,
  saveOrderShippingAddress,
  markOrderPaymentInitiated,
  type ShippingAddress,
} from "@/lib/supabase/db"

export const runtime = "nodejs"

async function getServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // no-op — this route only needs to read auth
        },
      },
    }
  )
}

type CheckoutBody = {
  orderId: string
  shipping: ShippingAddress
}

function isValidAddr(a: ShippingAddress): boolean {
  return Boolean(
    a &&
      a.name &&
      a.email &&
      a.phone &&
      a.line1 &&
      a.city &&
      a.country &&
      a.name.length >= 2 &&
      /@/.test(a.email) &&
      a.phone.length >= 6
  )
}

function toBillingData(a: ShippingAddress): PaymobBillingData {
  const [firstName, ...rest] = a.name.trim().split(/\s+/)
  const lastName = rest.join(" ") || firstName
  return {
    first_name: firstName,
    last_name: lastName,
    email: a.email,
    phone_number: a.phone,
    street: a.line1,
    building: a.line2 || "NA",
    floor: "NA",
    apartment: "NA",
    city: a.city,
    state: a.region || "NA",
    country: a.country,
    postal_code: a.postalCode || "NA",
    shipping_method: "PKG",
  }
}

export async function POST(req: Request) {
  const supabase = await getServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: CheckoutBody
  try {
    body = (await req.json()) as CheckoutBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.orderId || typeof body.orderId !== "string") {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
  }
  if (!isValidAddr(body.shipping)) {
    return NextResponse.json(
      { error: "Invalid shipping address" },
      { status: 400 }
    )
  }

  const order = await fetchOrderForUser(user.id, body.orderId)
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }
  if (order.status !== "pending") {
    return NextResponse.json(
      { error: `Order is ${order.status}, not payable` },
      { status: 409 }
    )
  }
  if (order.paymentStatus === "paid") {
    return NextResponse.json({ error: "Order already paid" }, { status: 409 })
  }

  const saved = await saveOrderShippingAddress(user.id, body.orderId, body.shipping)
  if (!saved) {
    return NextResponse.json(
      { error: "Failed to save shipping address" },
      { status: 500 }
    )
  }

  const amountMinor = usdToPaymobMinorUnit(order.total)
  const integrationIdEnv = process.env.PAYMOB_INTEGRATION_ID_CARD
  const iframeIdEnv = process.env.PAYMOB_IFRAME_ID
  if (!integrationIdEnv || !iframeIdEnv) {
    return NextResponse.json(
      { error: "Payments not configured on the server" },
      { status: 503 }
    )
  }

  try {
    const authToken = await paymobAuth()
    const { paymobOrderId } = await paymobRegisterOrder({
      authToken,
      merchantOrderId: order.id,
      amountCents: amountMinor,
    })
    const { paymentKey } = await paymobPaymentKey({
      authToken,
      paymobOrderId,
      amountCents: amountMinor,
      billingData: toBillingData(body.shipping),
      integrationId: Number(integrationIdEnv),
    })
    const iframeUrl = paymobIframeUrl(paymentKey, iframeIdEnv)

    await markOrderPaymentInitiated(
      user.id,
      order.id,
      "paymob",
      String(paymobOrderId)
    )

    return NextResponse.json({
      iframeUrl,
      paymobOrderId,
      orderId: order.id,
      currency: PAYMOB_CURRENCY,
      amountMinor,
    })
  } catch (e) {
    const msg = (e as Error).message ?? "Paymob error"
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
