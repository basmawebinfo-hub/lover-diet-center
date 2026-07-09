// Guest order creation API route.
//
// Guests can place COD orders without an account. This route:
//   1. Validates the customer contact payload.
//   2. Re-prices every item server-side from the products table
//      (client-sent prices are NEVER trusted).
//   3. Inserts the order + order_items with the service-role key
//      (guest rows have user_id = null, which RLS hides from clients).
//
// If the caller IS authenticated, we attach their user_id so the order
// shows up in their dashboard — same endpoint, no duplicated logic.
// Payment: COD today. The created orderId is Paymob-compatible for later.

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"
import { createClient as createServiceClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const SHIPPING_USD = 15

type GuestOrderBody = {
  items: { productId: string; quantity: number }[]
  customer: {
    name: string
    phone: string
    email?: string
    city: string
    address: string
    notes?: string
  }
}

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    return bad("Ordering is not configured on the server", 503)
  }

  let body: GuestOrderBody
  try {
    body = (await req.json()) as GuestOrderBody
  } catch {
    return bad("Invalid JSON body")
  }

  // ---- validate items ----
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return bad("Cart is empty")
  }
  if (body.items.length > 50) return bad("Too many items")
  for (const it of body.items) {
    if (!it?.productId || typeof it.productId !== "string") return bad("Invalid product")
    if (!Number.isInteger(it.quantity) || it.quantity < 1 || it.quantity > 99) {
      return bad("Invalid quantity")
    }
  }

  // ---- validate customer ----
  const c = body.customer
  if (!c || typeof c !== "object") return bad("Missing customer details")
  const name = (c.name ?? "").trim()
  const phone = (c.phone ?? "").trim()
  const email = (c.email ?? "").trim()
  const city = (c.city ?? "").trim()
  const address = (c.address ?? "").trim()
  const notes = (c.notes ?? "").trim()
  if (name.length < 2 || name.length > 120) return bad("Invalid name")
  if (phone.length < 6 || phone.length > 25 || !/^[+\d\s\-()]+$/.test(phone)) {
    return bad("Invalid phone number")
  }
  if (email && (email.length > 200 || !/^\S+@\S+\.\S+$/.test(email))) {
    return bad("Invalid email")
  }
  if (city.length < 2 || city.length > 80) return bad("Invalid city")
  if (address.length < 5 || address.length > 400) return bad("Invalid address")
  if (notes.length > 500) return bad("Notes too long")

  // ---- optional auth: attach user_id when a session exists ----
  let userId: string | null = null
  try {
    const cookieStore = await cookies()
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    if (anonKey) {
      const authClient = createServerClient(url, anonKey, {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() { /* read-only */ },
        },
      })
      const { data } = await authClient.auth.getUser()
      userId = data.user?.id ?? null
    }
  } catch {
    userId = null // guest path
  }

  const db = createServiceClient(url, serviceKey, {
    auth: { persistSession: false },
  })

  // ---- re-price server-side ----
  const ids = [...new Set(body.items.map((i) => i.productId))]
  const { data: products, error: prodErr } = await db
    .from("products")
    .select("id, price, in_stock")
    .in("id", ids)
  if (prodErr || !products) return bad("Could not verify products", 500)

  const priceMap = new Map(products.map((p) => [p.id as string, p]))
  for (const it of body.items) {
    const p = priceMap.get(it.productId)
    if (!p) return bad("A product in your cart no longer exists", 409)
    if (p.in_stock === false) return bad("A product in your cart is out of stock", 409)
  }

  const subtotal = body.items.reduce((s, it) => {
    const p = priceMap.get(it.productId)!
    return s + Number(p.price) * it.quantity
  }, 0)
  const total = subtotal + SHIPPING_USD

  // ---- create order ----
  const isGuest = userId === null
  const { data: order, error: orderErr } = await db
    .from("orders")
    .insert({
      user_id: userId,
      total,
      status: "pending",
      is_guest: isGuest,
      guest_name: isGuest ? name : null,
      guest_phone: isGuest ? phone : null,
      guest_email: isGuest ? (email || null) : null,
      guest_city: isGuest ? city : null,
      guest_address: isGuest ? address : null,
      guest_notes: isGuest ? (notes || null) : null,
    })
    .select("id")
    .single()
  if (orderErr || !order) {
    console.error("[guest-order] insert failed:", orderErr?.message)
    return bad("Could not place order", 500)
  }

  const orderId = order.id as string
  const { error: itemsErr } = await db.from("order_items").insert(
    body.items.map((it) => ({
      order_id: orderId,
      product_id: it.productId,
      quantity: it.quantity,
      price_at_purchase: Number(priceMap.get(it.productId)!.price),
    })),
  )
  if (itemsErr) {
    // Roll back the header row so we don't strand an empty order.
    await db.from("orders").delete().eq("id", orderId)
    console.error("[guest-order] items insert failed:", itemsErr.message)
    return bad("Could not place order", 500)
  }

  return NextResponse.json({
    orderId,
    subtotal,
    shipping: SHIPPING_USD,
    total,
    isGuest,
  })
}
