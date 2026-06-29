"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Minus, Plus, CreditCard, Check, ShoppingBag, MessageCircle } from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import Link from "next/link"
import { useApp } from "@/lib/store"
import type { Order } from "@/lib/types"
import { useToast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
import { placeOrder } from "@/lib/supabase/db"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"
import { WHATSAPP_NUMBER } from "@/lib/site"
import { useCurrency, CURRENCIES } from "@/lib/currency"

export default function CartPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const { state, updateCartQty, removeFromCart, clearCart, placeOrderLocal } = useApp()
  const { format, currency, setCurrency } = useCurrency()
  const { notify } = useToast()
  const user = state.user
  const [checkedOut, setCheckedOut] = useState(false)
  const [lastOrder, setLastOrder] = useState<Order | null>(null)

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

  async function checkout() {
    setCheckedOut(true)
    // Persist the order to Supabase if signed in (non-blocking for UX)
    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        await placeOrder(
          data.user.id,
          cartItems.map((it) => ({
            productId: it.product.id,
            quantity: it.quantity,
            price: it.product.price,
          })),
          total,
        )
      }
    } catch {
      // ignore — order still clears locally
    }
    // Build a local order so it shows in "My Orders" (frontend-only for now)
    const order: Order = {
      id: `o_${Date.now()}`,
      date: new Date().toISOString(),
      items: cartItems.map((it) => ({
        productId: it.product.id,
        nameEn: it.product.nameEn,
        nameAr: it.product.nameAr,
        quantity: it.quantity,
        price: it.product.price,
      })),
      subtotal,
      shipping,
      total,
      status: "processing",
    }
    setLastOrder(order)
    placeOrderLocal(order) // also clears the cart in the reducer
    notify(t(locale, "Order placed successfully", "تم تأكيد طلبك بنجاح"), "success")
    setTimeout(() => {
      setCheckedOut(false)
    }, 2000)
  }

  if (checkedOut) {
    const ord = lastOrder
    const orderNo = ord ? ord.id.slice(-6).toUpperCase() : ""
    const waMsg = ord
      ? `${t(locale, "New order", "طلب جديد")} #${orderNo}\n` +
        ord.items.map((it) => `• ${locale === "ar" ? it.nameAr : it.nameEn} ×${it.quantity}`).join("\n") +
        `\n${t(locale, "Total", "الإجمالي")}: ${format(ord.total)}\n${t(locale, "Customer", "العميل")}: ${user?.nameEn ?? ""} ${user?.phone ?? ""}`
      : ""
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`
    return (
      <DashboardShell>
        <MobileNav />
        <div className="mx-auto max-w-md py-12">
          <div className="rounded-3xl border border-neutral-100 bg-white p-7 text-center shadow-sm">
            <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-emerald-100 animate-pop">
              <Check className="size-10 text-emerald-700" />
            </div>
            <h1 className="text-2xl font-extrabold text-neutral-900">{t(locale, "Order confirmed!", "تم تأكيد طلبك!")}</h1>
            {orderNo && <p className="mt-1 text-sm font-semibold text-emerald-600">{t(locale, "Order", "رقم الطلب")} #{orderNo}</p>}
            <p className="mt-2 text-sm text-neutral-500">{t(locale, "We'll deliver within 2-3 days. We'll contact you to confirm.", "سنوصل طلبك خلال 2-3 أيام. سنتواصل معك للتأكيد.")}</p>

            {ord && (
              <div className="mt-5 space-y-2 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4 text-start">
                {ord.items.map((it, i) => (
                  <div key={i} className="flex justify-between text-sm text-neutral-700">
                    <span>{locale === "ar" ? it.nameAr : it.nameEn} × {it.quantity}</span>
                    <span className="font-semibold">{format(it.price * it.quantity)}</span>
                  </div>
                ))}
                <div className="mt-2 flex justify-between border-t border-neutral-200 pt-2 text-base font-bold text-neutral-900">
                  <span>{t(locale, "Total", "الإجمالي")}</span>
                  <span className="text-emerald-700">{format(ord.total)}</span>
                </div>
              </div>
            )}

            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700">
              <MessageCircle className="size-4" /> {t(locale, "Notify clinic on WhatsApp", "أبلغ العيادة عبر واتساب")}
            </a>
            <div className="mt-3 flex gap-3">
              <Link href="/dashboard/orders" className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-bold text-neutral-700 hover:bg-neutral-50">{t(locale, "My orders", "طلباتي")}</Link>
              <Link href="/shop" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 py-2.5 text-sm font-bold text-neutral-700 hover:bg-neutral-50"><ShoppingBag className="size-4" /> {t(locale, "Keep shopping", "تابع التسوق")}</Link>
            </div>
          </div>
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
            <h1 className="text-3xl font-bold text-neutral-900">{t(locale,"Your Cart","سلتك")}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {cartItems.length} {locale === "ar" ? "منتج جاهز للشحن" : (cartItems.length === 1 ? "item" : "items") + " ready to ship"}
            </p>
          </div>
          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm(t(locale,"Clear your cart?","تفريغ سلتك؟"))) clearCart()
              }}
              className="text-sm font-semibold text-neutral-500 hover:text-red-500"
            >
              {t(locale,"Clear all","تفريغ الكل")}
            </button>
          )}
        </header>

        {cartItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-neutral-100">
              <ShoppingBag className="size-7 text-neutral-400" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">{t(locale,"Your cart is empty","سلتك فارغة")}</h2>
            <p className="mt-1 text-sm text-neutral-500">
              {t(locale,"Browse healthy products and add them to your cart.","تصفّح المنتجات الصحية وأضفها إلى سلتك.")}
            </p>
            <a
              href="/dashboard/products"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              {t(locale,"Browse products","تصفّح المنتجات")}
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
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-white text-2xl">
                    {item.product.category === "snack"
                      ? "🥨"
                      : item.product.category === "drink"
                        ? "🍵"
                        : item.product.category === "supplement"
                          ? "💊"
                          : "🥗"}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900">{locale === "ar" ? item.product.nameAr : item.product.nameEn}</p>
                    <p className="mt-1 text-sm font-bold text-emerald-700">
                      {format(item.product.price)}
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
                    aria-label={t(locale,"Remove","إزالة")}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-neutral-100 bg-white p-6">
              <h2 className="font-bold text-neutral-900">{t(locale,"Order summary","ملخص الطلب")}</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-700">{t(locale,"Currency","العملة")}</span>
                <select value={currency} onChange={(e)=>setCurrency(e.target.value as typeof currency)} className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-700 focus:border-emerald-400 focus:outline-none">
                  {CURRENCIES.map((c)=><option key={c.code} value={c.code}>{c.code}</option>)}
                </select>
              </div>
              <Row label={t(locale,"Subtotal","المجموع الفرعي")} value={format(subtotal)} />
                <Row label={t(locale,"Shipping","الشحن")} value={format(shipping)} />
                <div className="border-t border-neutral-100 pt-2">
                  <Row
                    label={t(locale,"Total","الإجمالي")}
                    value={format(total)}
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
                {t(locale,"Checkout","إتمام الشراء")}
              </button>
              <p className="mt-3 text-center text-xs text-neutral-400">
                {t(locale,"Secure checkout · Cash on delivery available","دفع آمن · الدفع عند الاستلام متاح")}
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
