"use client"

// Public checkout — works for BOTH guests and signed-in users.
// Guests: fill the form → COD order via /api/orders/guest → success screen
//         with an optional "create an account" prompt.
// Signed-in: fields prefill from the profile; the same endpoint attaches
//         their user_id so the order appears in their dashboard.

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft, ShoppingBag, Loader2, ShieldCheck, CheckCircle2, UserPlus, Package,
} from "lucide-react"
import { useApp } from "@/lib/store"
import { useLocale, t } from "@/lib/locale"
import { useCurrency } from "@/lib/currency"
import { useToast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
import { fetchProfile } from "@/lib/supabase/db"

const SHIPPING_USD = 15

type FormState = {
  name: string
  phone: string
  email: string
  city: string
  address: string
  notes: string
}

export default function ShopCheckoutPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const { format } = useCurrency()
  const { notify } = useToast()
  const { state, clearCart } = useApp()

  const [form, setForm] = useState<FormState>({
    name: "", phone: "", email: "", city: "", address: "", notes: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null)
  const [placedAsGuest, setPlacedAsGuest] = useState(false)

  const isSignedIn = Boolean(state.user)

  // Prefill for signed-in users
  useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || !active) return
      const profile = await fetchProfile(data.user.id)
      if (!active) return
      setForm((f) => ({
        ...f,
        name: f.name || profile?.nameEn || "",
        phone: f.phone || profile?.phone || "",
        email: f.email || data.user!.email || "",
        city: f.city || (profile as { city?: string } | null)?.city || "",
      }))
    })
    return () => { active = false }
  }, [])

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
    () => cartItems.reduce((s, it) => s + it.product.price * it.quantity, 0),
    [cartItems],
  )
  const shipping = subtotal > 0 ? SHIPPING_USD : 0
  const total = subtotal + shipping

  const isValid = useMemo(
    () =>
      form.name.trim().length >= 2 &&
      form.phone.trim().length >= 6 &&
      (form.email.trim() === "" || /^\S+@\S+\.\S+$/.test(form.email.trim())) &&
      form.city.trim().length >= 2 &&
      form.address.trim().length >= 5,
    [form],
  )

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function submit() {
    if (!isValid || cartItems.length === 0) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/orders/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((it) => ({ productId: it.product.id, quantity: it.quantity })),
          customer: {
            name: form.name.trim(),
            phone: form.phone.trim(),
            email: form.email.trim() || undefined,
            city: form.city.trim(),
            address: form.address.trim(),
            notes: form.notes.trim() || undefined,
          },
        }),
      })
      const data = (await res.json()) as { orderId?: string; isGuest?: boolean; error?: string }
      if (!res.ok || !data.orderId) {
        notify(
          data.error ?? t(locale, "Could not place order. Please try again.", "تعذر تأكيد الطلب. حاول مرة أخرى."),
          "error",
        )
        return
      }
      clearCart()
      setPlacedOrderId(data.orderId)
      setPlacedAsGuest(Boolean(data.isGuest))
    } catch {
      notify(t(locale, "Network error. Please try again.", "تعذر الاتصال. حاول مرة أخرى."), "error")
    } finally {
      setSubmitting(false)
    }
  }

  // ============ Success screen ============
  if (placedOrderId) {
    return (
      <main className="min-h-screen bg-[#f6faf8] pt-24">
        <div className="mx-auto max-w-lg px-4 pb-20 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="size-9 text-emerald-600" aria-hidden />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-neutral-900">
            {t(locale, "Order placed successfully!", "تم تأكيد طلبك بنجاح!")}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            {t(
              locale,
              "Our team will contact you shortly to confirm delivery. Payment is cash on delivery.",
              "سيتواصل معك فريقنا قريباً لتأكيد التوصيل. الدفع عند الاستلام.",
            )}
          </p>
          <p className="mt-3 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-neutral-500 shadow-sm">
            {t(locale, "Order reference:", "رقم الطلب:")}{" "}
            <span className="font-mono text-neutral-800">{placedOrderId.slice(0, 8)}</span>
          </p>

          {placedAsGuest && (
            <div className="mt-8 rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-emerald-50">
                <UserPlus className="size-5 text-emerald-600" aria-hidden />
              </div>
              <h2 className="mt-3 text-base font-bold text-neutral-900">
                {t(locale, "Want to track your orders easily?", "هل ترغب في تتبع طلباتك بسهولة؟")}
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                {t(
                  locale,
                  "Create a free account to track orders, get personalized nutrition plans, and more.",
                  "أنشئ حساباً مجانياً لتتبع الطلبات والحصول على خطط تغذية مخصصة والمزيد.",
                )}
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Link
                  href={form.email ? `/sign-up?email=${encodeURIComponent(form.email)}` : "/sign-up"}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  <UserPlus className="size-4" />
                  {t(locale, "Create account", "إنشاء حساب")}
                </Link>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50"
                >
                  {t(locale, "Continue shopping", "مواصلة التسوق")}
                </Link>
              </div>
            </div>
          )}

          {!placedAsGuest && (
            <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/dashboard/orders")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                <Package className="size-4" />
                {t(locale, "Track my order", "تتبع طلبي")}
              </button>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50"
              >
                {t(locale, "Continue shopping", "مواصلة التسوق")}
              </Link>
            </div>
          )}
        </div>
      </main>
    )
  }

  // ============ Empty cart ============
  if (state.hydrated && cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#f6faf8] pt-24">
        <div className="mx-auto max-w-lg px-4 pb-20 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-neutral-100">
            <ShoppingBag className="size-7 text-neutral-400" aria-hidden />
          </div>
          <h1 className="mt-4 text-xl font-bold text-neutral-900">
            {t(locale, "Your cart is empty", "سلتك فارغة")}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t(locale, "Add products from the shop to check out.", "أضف منتجات من المتجر لإتمام الشراء.")}
          </p>
          <Link
            href="/shop"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            <ShoppingBag className="size-4" />
            {t(locale, "Browse shop", "تصفّح المتجر")}
          </Link>
        </div>
      </main>
    )
  }

  // ============ Checkout form ============
  return (
    <main className="min-h-screen bg-[#f6faf8] pt-24">
      <div className="mx-auto max-w-4xl px-4 pb-20">
        <Link
          href="/shop"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 transition hover:text-emerald-700 focus:outline-none focus:underline"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
          {t(locale, "Back to shop", "العودة للمتجر")}
        </Link>

        <h1 className="text-2xl font-extrabold text-neutral-900 sm:text-3xl">
          {t(locale, "Checkout", "إتمام الشراء")}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {isSignedIn
            ? t(locale, "Review your details and confirm your order.", "راجع بياناتك وأكّد طلبك.")
            : t(
                locale,
                "No account needed — enter your details and we'll deliver to your door.",
                "لا حاجة لحساب — أدخل بياناتك وسنوصّل الطلب إلى بابك.",
              )}
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Form */}
          <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-neutral-900">
              {t(locale, "Delivery details", "بيانات التوصيل")}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label={t(locale, "Full name", "الاسم الكامل")} required>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={inputCls}
                  autoComplete="name"
                />
              </Field>
              <Field label={t(locale, "Phone", "الهاتف")} required>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={inputCls}
                  autoComplete="tel"
                  dir="ltr"
                />
              </Field>
              <Field
                label={t(locale, "Email (optional — for order updates)", "البريد الإلكتروني (اختياري — لتحديثات الطلب)")}
                className="sm:col-span-2"
              >
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={inputCls}
                  autoComplete="email"
                  dir="ltr"
                />
              </Field>
              <Field label={t(locale, "City", "المدينة")} required>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  className={inputCls}
                  autoComplete="address-level2"
                />
              </Field>
              <Field label={t(locale, "Address", "العنوان")} required className="sm:col-span-2">
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  className={inputCls}
                  autoComplete="street-address"
                  placeholder={t(locale, "Building, street, area…", "المبنى، الشارع، المنطقة…")}
                />
              </Field>
              <Field label={t(locale, "Order notes (optional)", "ملاحظات الطلب (اختياري)")} className="sm:col-span-2">
                <textarea
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  rows={3}
                  className={inputCls}
                  placeholder={t(locale, "Delivery time preference, allergies…", "وقت التوصيل المفضل، حساسية طعام…")}
                />
              </Field>
            </div>
            {!isSignedIn && (
              <p className="mt-4 text-xs text-neutral-400">
                {t(locale, "Already have an account?", "لديك حساب بالفعل؟")}{" "}
                <Link href="/sign-in?redirect=/shop/checkout" className="font-semibold text-emerald-600 hover:underline">
                  {t(locale, "Sign in to prefill your details", "سجّل الدخول لتعبئة بياناتك تلقائياً")}
                </Link>
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-neutral-900">
                {t(locale, "Order summary", "ملخص الطلب")}
              </h2>
              <ul className="mt-3 space-y-3">
                {cartItems.map((it) => {
                  const name = locale === "ar" ? it.product.nameAr : it.product.nameEn
                  return (
                    <li key={it.productId} className="flex items-center gap-3 text-sm">
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-emerald-50">
                        {it.product.imageUrl && (
                          <Image src={it.product.imageUrl} alt={name} fill sizes="44px" className="object-cover" />
                        )}
                      </div>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-1 font-semibold text-neutral-800">{name}</span>
                        <span className="text-xs text-neutral-400">× {it.quantity}</span>
                      </span>
                      <span className="font-semibold tabular-nums text-neutral-900">
                        {format(it.product.price * it.quantity)}
                      </span>
                    </li>
                  )
                })}
              </ul>
              <dl className="mt-4 space-y-1.5 border-t border-neutral-100 pt-3 text-sm">
                <div className="flex justify-between text-neutral-500">
                  <dt>{t(locale, "Subtotal", "المجموع الفرعي")}</dt>
                  <dd className="tabular-nums">{format(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <dt>{t(locale, "Shipping", "الشحن")}</dt>
                  <dd className="tabular-nums">{format(shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-neutral-100 pt-2 text-base font-bold text-neutral-900">
                  <dt>{t(locale, "Total", "الإجمالي")}</dt>
                  <dd className="tabular-nums">{format(total)}</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={submit}
                disabled={!isValid || submitting || cartItems.length === 0}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {t(locale, "Placing order…", "جارٍ تأكيد الطلب…")}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4" />
                    {t(locale, "Place order — cash on delivery", "تأكيد الطلب — الدفع عند الاستلام")}
                  </>
                )}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-neutral-400">
                <ShieldCheck className="size-3.5" aria-hidden />
                {t(locale, "Your details are only used for delivery.", "بياناتك تُستخدم للتوصيل فقط.")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

const inputCls =
  "block w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"

function Field({
  label, required, className, children,
}: {
  label: string
  required?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-xs font-semibold text-neutral-600">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
    </label>
  )
}
