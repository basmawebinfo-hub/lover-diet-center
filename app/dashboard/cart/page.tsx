"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Trash2, Minus, Plus, CreditCard, Check, ShoppingBag, MessageCircle, Loader2, AlertCircle, ShieldCheck, Package,
} from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import Link from "next/link"
import Image from "next/image"
import { useApp } from "@/lib/store"
import type { Order } from "@/lib/types"
import { useToast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
import { placeOrder } from "@/lib/supabase/db"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"
import { WHATSAPP_NUMBER } from "@/lib/site"
import { useCurrency, CURRENCIES } from "@/lib/currency"
import { validatePhone, phoneErrorMessage } from "@/lib/phone"

// Flat-rate shipping in USD (the canonical currency across the app + DB).
// If shipping ever becomes variable (weight-based, address-based, etc.), move
// this to a helper that returns a USD number so the display path stays the same.
const SHIPPING_USD = 15

export default function CartPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const { state, updateCartQty, removeFromCart, clearCart, placeOrderLocal } = useApp()
  const { format, currency, setCurrency } = useCurrency()
  const { notify } = useToast()
  const user = state.user

  const [checkedOut, setCheckedOut] = useState(false)
  const [lastOrder, setLastOrder] = useState<Order | null>(null)
  const [placing, setPlacing] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    if (state.authChecked && !user) router.replace("/onboarding")
  }, [state.authChecked, user, router])

  const cartItems = useMemo(
    () =>
      state.cart
        .map((c) => {
          const product = state.products.find((p) => p.id === c.productId)
          return product ? { ...c, product } : null
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [state.cart, state.products],
  )

  const subtotal = useMemo(
    () => cartItems.reduce((s, item) => s + item.product.price * item.quantity, 0),
    [cartItems],
  )
  const shipping = subtotal > 0 ? SHIPPING_USD : 0
  const total = subtotal + shipping

  // Any out-of-stock items in the cart get their own inline warning; we do NOT
  // block checkout (COD only right now) but we surface it.
  const hasOutOfStock = cartItems.some((it) => it.product.inStock === false)

  async function checkout() {
    setPlacing(true)
    let persistedOrderId: string | null = null
    let persistFailed = false

    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        persistedOrderId = await placeOrder(
          data.user.id,
          cartItems.map((it) => ({
            productId: it.product.id,
            quantity: it.quantity,
            price: it.product.price,
          })),
          total,
        )
        if (!persistedOrderId) persistFailed = true
      }
    } catch {
      persistFailed = true
    } finally {
      setPlacing(false)
    }

    if (persistFailed) {
      notify(
        t(locale, "Could not place order. Please try again.", "تعذر تأكيد الطلب. حاول مرة أخرى."),
        "error",
      )
      return
    }

    // Build the local order first so /dashboard/orders reflects it immediately
    // if the user navigates before the store's refreshOrders() runs.
    const order: Order = {
      id: persistedOrderId ?? `o_${Date.now()}`,
      date: new Date().toISOString(),
      items: cartItems.map((it) => ({
        productId: it.product.id,
        nameEn: it.product.nameEn,
        nameAr: it.product.nameAr,
        quantity: it.quantity,
        price: it.product.price,
        imageUrl: it.product.imageUrl,
        inStock: it.product.inStock,
      })),
      subtotal,
      shipping,
      total,
      status: "pending",
    }
    setLastOrder(order)
    setCheckedOut(true)
    placeOrderLocal(order) // clears the cart in the reducer
    notify(t(locale, "Order placed successfully", "تم تأكيد طلبك بنجاح"), "success")
  }

  if (!state.authChecked && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6faf8]">
        <div className="size-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
      </div>
    )
  }
  if (!user) return null

  // ==== Success screen ====
  if (checkedOut) {
    return (
      <CheckoutSuccess
        order={lastOrder}
        userName={user.nameEn ?? ""}
        userPhone={user.phone ?? ""}
        locale={locale}
        format={format}
      />
    )
  }

  // ==== Loading skeleton (products haven't hydrated yet) ====
  if (!state.hydrated) {
    return (
      <DashboardShell>
        <MobileNav />
        <div className="mx-auto max-w-4xl space-y-6 pb-32 lg:pb-0">
          <header>
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t(locale, "Your Cart", "سلتك")}</h1>
          </header>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-neutral-100" />
              ))}
            </div>
            <div className="h-64 animate-pulse rounded-2xl bg-neutral-100" />
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <MobileNav />
      <div className="mx-auto max-w-4xl space-y-6 pb-32 lg:pb-0">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t(locale, "Your Cart", "سلتك")}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {cartItems.length === 0
                ? t(locale, "Nothing here yet.", "لا شيء هنا بعد.")
                : t(
                    locale,
                    `${cartItems.length} item${cartItems.length === 1 ? "" : "s"} ready to check out.`,
                    `${cartItems.length} منتج جاهز للطلب.`,
                  )}
            </p>
          </div>
          {cartItems.length > 0 && !confirmClear && (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-500 transition hover:border-red-200 hover:text-red-600"
            >
              <Trash2 className="size-3.5" />
              {t(locale, "Clear all", "تفريغ الكل")}
            </button>
          )}
          {confirmClear && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs">
              <span className="font-semibold text-red-700">{t(locale, "Are you sure?", "هل أنت متأكد؟")}</span>
              <button
                type="button"
                onClick={() => {
                  clearCart()
                  setConfirmClear(false)
                  notify(t(locale, "Cart cleared", "تم تفريغ السلة"), "success")
                }}
                className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-red-700"
              >
                <Trash2 className="size-3" />
                {t(locale, "Clear", "تفريغ")}
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                {t(locale, "Cancel", "إلغاء")}
              </button>
            </div>
          )}
        </header>

        {cartItems.length === 0 ? (
          <EmptyCart locale={locale} />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            {/* Items */}
            <div className="space-y-3">
              {hasOutOfStock && (
                <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <p>
                    {t(
                      locale,
                      "Some items are out of stock. Please remove them before you checkout.",
                      "بعض المنتجات غير متوفرة. من فضلك أزلها قبل إتمام الطلب.",
                    )}
                  </p>
                </div>
              )}
              {cartItems.map((item) => (
                <CartRow
                  key={item.productId}
                  item={item}
                  locale={locale}
                  format={format}
                  onDecrement={() => updateCartQty(item.productId, item.quantity - 1)}
                  onIncrement={() => updateCartQty(item.productId, item.quantity + 1)}
                  onRemove={() => removeFromCart(item.productId)}
                />
              ))}
            </div>

            {/* Summary */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-neutral-900">{t(locale, "Order summary", "ملخص الطلب")}</h2>

                {/* Currency picker */}
                <div className="mt-4 flex items-center justify-between text-sm">
                  <label htmlFor="cart-currency" className="font-semibold text-neutral-700">
                    {t(locale, "Currency", "العملة")}
                  </label>
                  <select
                    id="cart-currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as typeof currency)}
                    className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-semibold text-neutral-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.code}</option>
                    ))}
                  </select>
                </div>

                <dl className="mt-4 space-y-2 text-sm">
                  <Row label={t(locale, "Subtotal", "المجموع الفرعي")} value={format(subtotal)} />
                  <Row label={t(locale, "Shipping", "الشحن")} value={format(shipping)} />
                  <div className="border-t border-neutral-100 pt-2">
                    <Row
                      label={t(locale, "Total", "الإجمالي")}
                      value={format(total)}
                      className="text-base font-bold"
                    />
                  </div>
                </dl>

                <button
                  type="button"
                  onClick={checkout}
                  disabled={placing || hasOutOfStock}
                  className={cn(
                    "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold shadow-sm transition",
                    hasOutOfStock
                      ? "cursor-not-allowed bg-neutral-100 text-neutral-400"
                      : placing
                        ? "bg-orange-400 text-white"
                        : "bg-orange-500 text-white hover:bg-orange-600",
                  )}
                >
                  {placing ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
                  {placing
                    ? t(locale, "Placing order...", "جارٍ تأكيد الطلب...")
                    : t(locale, "Checkout", "إتمام الشراء")}
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-neutral-400">
                  <ShieldCheck className="size-3.5" />
                  {t(locale, "Cash on delivery available", "الدفع عند الاستلام متاح")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky checkout bar */}
      {cartItems.length > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-neutral-100 bg-white/95 px-4 py-3 shadow-lg backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                {t(locale, "Total", "الإجمالي")}
              </p>
              <p className="text-lg font-black text-neutral-900">{format(total)}</p>
            </div>
            <button
              type="button"
              onClick={checkout}
              disabled={placing || hasOutOfStock}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition",
                hasOutOfStock
                  ? "cursor-not-allowed bg-neutral-100 text-neutral-400"
                  : "bg-orange-500 text-white hover:bg-orange-600",
              )}
            >
              {placing ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
              {t(locale, "Checkout", "إتمام الشراء")}
            </button>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}

// ============================================================================
// CartRow
// ============================================================================
function CartRow({
  item, locale, format, onDecrement, onIncrement, onRemove,
}: {
  item: { productId: string; quantity: number; product: import("@/lib/types").Product }
  locale: "en" | "ar"
  format: (usd: number) => string
  onDecrement: () => void
  onIncrement: () => void
  onRemove: () => void
}) {
  const name = locale === "ar" ? item.product.nameAr : item.product.nameEn
  const outOfStock = item.product.inStock === false
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-3 shadow-sm sm:gap-4 sm:p-4",
        outOfStock ? "border-amber-200 bg-amber-50/40" : "border-neutral-100 bg-white",
      )}
    >
      {/* Thumbnail */}
      <Link
        href={`/dashboard/products/${item.product.id}`}
        className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-white sm:size-20"
        aria-label={name}
      >
        {item.product.imageUrl ? (
          <Image
            src={item.product.imageUrl}
            alt={name}
            fill
            sizes="(max-width:640px) 64px, 80px"
            className="object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-2xl">
            {item.product.category === "snack" ? "🥨" :
              item.product.category === "drink" ? "🍵" :
              item.product.category === "supplement" ? "💊" : "🥗"}
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <Link
          href={`/dashboard/products/${item.product.id}`}
          className="line-clamp-1 text-sm font-semibold text-neutral-900 hover:text-emerald-700 sm:text-base"
        >
          {name}
        </Link>
        <p className="mt-0.5 text-xs font-bold text-emerald-700 sm:text-sm">
          {format(item.product.price)}
        </p>
        {outOfStock && (
          <p className="mt-0.5 text-[11px] font-semibold text-amber-700">
            {t(locale, "Out of stock", "غير متوفر")}
          </p>
        )}
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-white">
        <button
          type="button"
          onClick={onDecrement}
          disabled={item.quantity <= 1}
          className="flex size-8 items-center justify-center text-neutral-600 transition hover:text-emerald-700 disabled:cursor-not-allowed disabled:text-neutral-300"
          aria-label={t(locale, "Decrease quantity", "إنقاص الكمية")}
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-6 text-center text-sm font-semibold text-neutral-900" aria-live="polite">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          className="flex size-8 items-center justify-center text-neutral-600 transition hover:text-emerald-700"
          aria-label={t(locale, "Increase quantity", "زيادة الكمية")}
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        className="flex size-9 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
        aria-label={t(locale, "Remove item", "إزالة العنصر")}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  )
}

// ============================================================================
// Empty cart state
// ============================================================================
function EmptyCart({ locale }: { locale: "en" | "ar" }) {
  return (
    <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-10 text-center sm:p-12">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-neutral-100">
        <ShoppingBag className="size-7 text-neutral-400" />
      </div>
      <h2 className="text-lg font-bold text-neutral-900">
        {t(locale, "Your cart is empty", "سلتك فارغة")}
      </h2>
      <p className="mt-1 max-w-md text-sm text-neutral-500 sm:mx-auto">
        {t(
          locale,
          "Browse healthy products, snacks, and supplements curated by our nutritionists.",
          "تصفّح المنتجات الصحية والسناكس والمكمّلات المختارة من فريق التغذية لدينا.",
        )}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
        >
          <ShoppingBag className="size-4" />
          {t(locale, "Browse products", "تصفّح المنتجات")}
        </Link>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 hover:border-emerald-300 hover:text-emerald-700"
        >
          <Package className="size-4" />
          {t(locale, "View past orders", "عرض الطلبات السابقة")}
        </Link>
      </div>
    </div>
  )
}

// ============================================================================
// CheckoutSuccess — separate component so it stays lean and readable
// ============================================================================
function CheckoutSuccess({
  order, userName, userPhone, locale, format,
}: {
  order: Order | null
  userName: string
  userPhone: string
  locale: "en" | "ar"
  format: (usd: number) => string
}) {
  const { notify } = useToast()
  const [phone, setPhone] = useState(userPhone)
  const [phoneError, setPhoneError] = useState<string | null>(null)

  const orderNo = order ? order.id.slice(-6).toUpperCase() : ""
  const waHref = useMemo(() => {
    const validation = validatePhone(phone)
    // We include the customer's own phone in the message so the clinic can call
    // back even if WhatsApp is routed through their agent line.
    const contactLine = validation.valid ? validation.e164 : phone
    const waMsg = order
      ? `${t(locale, "New order", "طلب جديد")} #${orderNo}
` +
        order.items
          .map((it) => `• ${locale === "ar" ? it.nameAr : it.nameEn} ×${it.quantity}`)
          .join("
") +
        `
${t(locale, "Total", "الإجمالي")}: ${format(order.total)}
` +
        `${t(locale, "Customer", "العميل")}: ${userName} ${contactLine}`
      : ""
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`
  }, [order, orderNo, phone, userName, locale, format])

  function tryNotifyClinic(e: React.MouseEvent<HTMLAnchorElement>) {
    const res = validatePhone(phone)
    if (!res.valid) {
      e.preventDefault()
      setPhoneError(phoneErrorMessage(res, locale))
      notify(
        t(locale, "Please enter a valid phone number first.", "من فضلك أدخل رقم هاتف صالحًا أولاً."),
        "error",
      )
      return
    }
    setPhoneError(null)
  }

  return (
    <DashboardShell>
      <MobileNav />
      <div className="mx-auto max-w-md py-8 sm:py-12">
        <div className="rounded-3xl border border-neutral-100 bg-white p-6 text-center shadow-sm sm:p-7">
          <div className="mx-auto mb-5 flex size-20 items-center justify-center rounded-full bg-emerald-100 animate-pop">
            <Check className="size-10 text-emerald-700" />
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900">
            {t(locale, "Order confirmed!", "تم تأكيد طلبك!")}
          </h1>
          {orderNo && (
            <p className="mt-1 text-sm font-semibold text-emerald-600">
              {t(locale, "Order", "رقم الطلب")} #{orderNo}
            </p>
          )}
          <p className="mt-2 text-sm text-neutral-500">
            {t(
              locale,
              "We'll deliver within 2-3 days. We'll contact you to confirm.",
              "سنوصل طلبك خلال 2-3 أيام. سنتواصل معك للتأكيد.",
            )}
          </p>

          {order && (
            <div className="mt-5 space-y-2 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-4 text-start">
              {order.items.map((it, i) => (
                <div key={i} className="flex justify-between text-sm text-neutral-700">
                  <span className="line-clamp-1">
                    {locale === "ar" ? it.nameAr : it.nameEn} × {it.quantity}
                  </span>
                  <span className="ms-2 shrink-0 font-semibold">{format(it.price * it.quantity)}</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-neutral-200 pt-2 text-base font-bold text-neutral-900">
                <span>{t(locale, "Total", "الإجمالي")}</span>
                <span className="text-emerald-700">{format(order.total)}</span>
              </div>
            </div>
          )}

          {/* Phone-verify block for the WhatsApp notify step */}
          <div className="mt-5 rounded-2xl border border-neutral-100 bg-white p-4 text-start">
            <label htmlFor="wa-phone" className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {t(locale, "Your phone (for delivery)", "رقم هاتفك (للتوصيل)")}
            </label>
            <input
              id="wa-phone"
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setPhoneError(null) }}
              placeholder="+971 5X XXX XXXX"
              className={cn(
                "mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:ring-2",
                phoneError
                  ? "border-red-200 focus:border-red-400 focus:ring-red-100"
                  : "border-neutral-200 focus:border-emerald-400 focus:ring-emerald-100",
              )}
            />
            {phoneError && (
              <p className="mt-1 text-xs font-semibold text-red-600">{phoneError}</p>
            )}
          </div>

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={tryNotifyClinic}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            <MessageCircle className="size-4" />
            {t(locale, "Notify clinic on WhatsApp", "أبلغ العيادة عبر واتساب")}
          </a>
          <div className="mt-3 flex gap-3">
            <Link
              href="/dashboard/orders"
              className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-sm font-bold text-neutral-700 hover:bg-neutral-50"
            >
              {t(locale, "My orders", "طلباتي")}
            </Link>
            <Link
              href="/dashboard/products"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 py-2.5 text-sm font-bold text-neutral-700 hover:bg-neutral-50"
            >
              <ShoppingBag className="size-4" />
              {t(locale, "Keep shopping", "تابع التسوق")}
            </Link>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

// ============================================================================
// Row helper for the summary block
// ============================================================================
function Row({
  label, value, className,
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
