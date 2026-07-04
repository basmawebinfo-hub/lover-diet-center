"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { fetchProfile, fetchUserOrders } from "@/lib/supabase/db"
import { useApp } from "@/lib/store"
import { useCurrency } from "@/lib/currency"
import { useLocale, t } from "@/lib/locale"
import { useToast } from "@/components/ui/toast"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries"
import type { Order } from "@/lib/types"
import { ArrowLeft, ShieldCheck, Loader2 } from "lucide-react"

type FormState = {
  name: string
  phone: string
  email: string
  line1: string
  line2: string
  city: string
  region: string
  country: string
  postalCode: string
}

function CheckoutInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId") ?? ""
  const { locale } = useLocale()
  const { format } = useCurrency()
  const { state } = useApp()
  const { notify } = useToast()

  const [ready, setReady] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    region: "",
    country: DEFAULT_COUNTRY,
    postalCode: "",
  })

  useEffect(() => {
    let cancelled = false
    async function boot() {
      if (!orderId) {
        setNotFound(true)
        setReady(true)
        return
      }
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push(`/sign-in?redirect=/dashboard/checkout?orderId=${orderId}`)
        return
      }
      const [profile, orders] = await Promise.all([
        fetchProfile(data.user.id),
        fetchUserOrders(data.user.id),
      ])
      if (cancelled) return
      const found = orders.find((o) => o.id === orderId) ?? null
      if (!found) {
        setNotFound(true)
      } else {
        setOrder(found)
        setForm((f) => ({
          ...f,
          name: profile?.nameEn ?? "",
          phone: profile?.phone ?? "",
          email: data.user!.email ?? "",
          city: profile?.city ?? "",
          country: profile?.country ?? DEFAULT_COUNTRY,
        }))
      }
      setReady(true)
    }
    void boot()
    return () => {
      cancelled = true
    }
  }, [orderId, router])

  const isValid = useMemo(() => {
    return (
      form.name.trim().length >= 2 &&
      form.phone.trim().length >= 6 &&
      /@/.test(form.email) &&
      form.line1.trim().length > 0 &&
      form.city.trim().length > 0 &&
      form.country.trim().length > 0
    )
  }, [form])

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function pay() {
    if (!order || !isValid) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/checkout/paymob", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          shipping: {
            name: form.name,
            phone: form.phone,
            email: form.email,
            line1: form.line1,
            line2: form.line2 || undefined,
            city: form.city,
            region: form.region || undefined,
            country: form.country,
            postalCode: form.postalCode || undefined,
          },
        }),
      })
      const data = (await res.json()) as {
        iframeUrl?: string
        error?: string
      }
      if (!res.ok || !data.iframeUrl) {
        notify(
          data.error ??
            t(locale, "Could not start payment. Please try again.", "تعذر بدء عملية الدفع. حاول مرة أخرى."),
          "error"
        )
        setSubmitting(false)
        return
      }
      window.location.href = data.iframeUrl
    } catch (e) {
      notify(
        (e as Error).message ??
          t(locale, "Network error", "تعذر الاتصال"),
        "error"
      )
      setSubmitting(false)
    }
  }

  if (!ready) {
    return (
      <DashboardShell>
        <MobileNav />
        <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center">
          <Loader2 className="size-8 animate-spin text-emerald-500" />
        </div>
      </DashboardShell>
    )
  }
  if (notFound || !order) {
    return (
      <DashboardShell>
        <MobileNav />
        <div className="mx-auto max-w-2xl px-4 pb-24 pt-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            {t(locale, "Order not found", "الطلب غير موجود")}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {t(
              locale,
              "This order could not be located. It may have been placed on a different account.",
              "تعذر إيجاد هذا الطلب. ربما تم من حساب مختلف."
            )}
          </p>
          <button
            onClick={() => router.push("/dashboard/cart")}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
          >
            {t(locale, "Back to cart", "العودة إلى السلة")}
          </button>
        </div>
      </DashboardShell>
    )
  }

  const countryOptions = COUNTRIES.map((c) => ({ code: c.code, name: locale === "ar" ? c.ar : c.en }))

  return (
    <DashboardShell>
      <MobileNav />
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-6">
        <button
          onClick={() => router.push("/dashboard/cart")}
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
        >
          <ArrowLeft className="size-4" />
          {t(locale, "Back", "رجوع")}
        </button>
        <h1 className="text-2xl font-semibold text-slate-900">
          {t(locale, "Checkout", "إتمام الشراء")}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {t(
            locale,
            "Enter your shipping details, then continue to secure payment.",
            "أدخل معلومات الشحن ثم انتقل إلى الدفع الآمن."
          )}
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900">
              {t(locale, "Shipping details", "تفاصيل الشحن")}
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
                />
              </Field>
              <Field label={t(locale, "Email", "البريد الإلكتروني")} required className="sm:col-span-2">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={inputCls}
                  autoComplete="email"
                />
              </Field>
              <Field label={t(locale, "Address line 1", "العنوان — السطر 1")} required className="sm:col-span-2">
                <input
                  type="text"
                  value={form.line1}
                  onChange={(e) => set("line1", e.target.value)}
                  className={inputCls}
                  autoComplete="address-line1"
                />
              </Field>
              <Field label={t(locale, "Address line 2 (optional)", "العنوان — السطر 2 (اختياري)")} className="sm:col-span-2">
                <input
                  type="text"
                  value={form.line2}
                  onChange={(e) => set("line2", e.target.value)}
                  className={inputCls}
                  autoComplete="address-line2"
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
              <Field label={t(locale, "State / Region (optional)", "المنطقة (اختياري)")}>
                <input
                  type="text"
                  value={form.region}
                  onChange={(e) => set("region", e.target.value)}
                  className={inputCls}
                  autoComplete="address-level1"
                />
              </Field>
              <Field label={t(locale, "Country", "الدولة")} required>
                <select
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  className={inputCls}
                  autoComplete="country"
                >
                  {countryOptions.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label={t(locale, "Postal code (optional)", "الرمز البريدي (اختياري)")}>
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => set("postalCode", e.target.value)}
                  className={inputCls}
                  autoComplete="postal-code"
                />
              </Field>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6 lg:h-fit">
            <h2 className="text-base font-semibold text-slate-900">
              {t(locale, "Order summary", "ملخص الطلب")}
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {order.items.map((it) => (
                <li key={it.productId} className="flex items-center justify-between gap-2">
                  <span className="line-clamp-1">
                    {locale === "ar" ? it.nameAr : it.nameEn}
                    <span className="ms-1 text-slate-400">× {it.quantity}</span>
                  </span>
                  <span className="font-medium tabular-nums">{format(it.price * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-slate-100 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>{t(locale, "Subtotal", "المجموع الفرعي")}</span>
                <span className="tabular-nums">{format(order.subtotal)}</span>
              </div>
              {order.shipping > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>{t(locale, "Shipping", "الشحن")}</span>
                  <span className="tabular-nums">{format(order.shipping)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold text-slate-900">
                <span>{t(locale, "Total", "الإجمالي")}</span>
                <span className="tabular-nums">{format(order.total)}</span>
              </div>
            </div>
            <button
              onClick={pay}
              disabled={!isValid || submitting}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t(locale, "Redirecting…", "جاري التحويل…")}
                </>
              ) : (
                <>
                  <ShieldCheck className="size-4" />
                  {t(locale, "Pay securely", "الدفع الآمن")}
                </>
              )}
            </button>
            <p className="mt-3 text-center text-xs text-slate-500">
              {t(
                locale,
                "You will be redirected to Paymob to complete payment.",
                "سيتم تحويلك إلى Paymob لإتمام الدفع."
              )}
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

const inputCls =
  "block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
    </label>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <DashboardShell>
          <MobileNav />
          <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center">
            <Loader2 className="size-8 animate-spin text-emerald-500" />
          </div>
        </DashboardShell>
      }
    >
      <CheckoutInner />
    </Suspense>
  )
}
