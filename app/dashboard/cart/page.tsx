"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Minus, Plus, CreditCard, Check, ShoppingBag } from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { useApp } from "@/lib/store"
import { cn } from "@/lib/utils"

export default function CartPage() {
  const router = useRouter()
  const { state, updateCartQty, removeFromCart, clearCart } = useApp()
  const user = state.user
  const [checkedOut, setCheckedOut] = useState(false)

  useEffect(() => {
    if (!user) router.replace("/onboarding")
  }, [user, router])

  if (!user) return null

  const cartItems = state.cart
    .map((c) => {
      const product = state.products.find((p) => p.id === c.productId)
      return product ? { ...c, product } : null
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)

  const subtotal = cartItems.reduce(
    (s, item) => s + item.product.price * item.quantity,
    0
  )
  const shipping = subtotal > 0 ? 15 : 0
  const total = subtotal + shipping

  function checkout() {
    setCheckedOut(true)
    setTimeout(() => {
      clearCart()
      setCheckedOut(false)
    }, 2000)
  }

  if (checkedOut) {
    return (
      <DashboardShell>
        <MobileNav />
        <div className="mx-auto max-w-md py-20 text-center">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-teal-100">
            <Check className="size-10 text-teal-700" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900">Order placed</h1>
          <p className="mt-2 text-neutral-500">
            We'll deliver to your door within 2-3 days. Thanks for choosing us.
          </p>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <MobileNav />
      <div className="mx-auto max-w-4xl space-y-6 pb-24 lg:pb-0">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Your Cart</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"} ready to ship
            </p>
          </div>
          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Clear your cart?")) clearCart()
              }}
              className="text-sm font-semibold text-neutral-500 hover:text-red-500"
            >
              Clear all
            </button>
          )}
        </header>

        {cartItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-neutral-100">
              <ShoppingBag className="size-7 text-neutral-400" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">Your cart is empty</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Browse healthy products and add them to your cart.
            </p>
            <a
              href="/dashboard/products"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              Browse products
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-4"
                >
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-white text-2xl">
                    {item.product.category === "snack"
                      ? "🥨"
                      : item.product.category === "drink"
                        ? "🍵"
                        : item.product.category === "supplement"
                          ? "💊"
                          : "🥗"}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900">{item.product.nameEn}</p>
                    <p className="text-xs text-neutral-500">{item.product.nameAr}</p>
                    <p className="mt-1 text-sm font-bold text-teal-700">
                      {item.product.price} AED
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.productId, item.quantity - 1)}
                      className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-neutral-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                      className="flex size-8 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId)}
                    className="flex size-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-500"
                    aria-label="Remove"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-neutral-100 bg-white p-6">
              <h2 className="font-bold text-neutral-900">Order summary</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <Row label="Subtotal" value={`${subtotal} AED`} />
                <Row label="Shipping" value={`${shipping} AED`} />
                <div className="border-t border-neutral-100 pt-2">
                  <Row
                    label="Total"
                    value={`${total} AED`}
                    className="text-base font-bold"
                  />
                </div>
              </dl>
              <button
                type="button"
                onClick={checkout}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
              >
                <CreditCard className="size-4" />
                Checkout
              </button>
              <p className="mt-3 text-center text-xs text-neutral-400">
                Secure checkout · Cash on delivery available
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

function Row({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-semibold text-neutral-900">{value}</dd>
    </div>
  )
}
