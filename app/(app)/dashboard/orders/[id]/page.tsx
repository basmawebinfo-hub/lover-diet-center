"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { fetchUserOrders } from "@/lib/supabase/db"
import { useCurrency } from "@/lib/currency"
import { useLocale, t } from "@/lib/locale"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import type { Order } from "@/lib/types"
import { CheckCircle2, XCircle, Clock, ArrowLeft, Loader2 } from "lucide-react"

type PaymentStatusLocal = "paid" | "failed" | "pending" | null

function OrderDetailInner() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const success = searchParams.get("success") === "true"
  const { locale } = useLocale()
  const { format } = useCurrency()

  const orderId = String(params?.id ?? "")

  const [ready, setReady] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusLocal>(null)
  const [orderStatus, setOrderStatus] = useState<string>("pending")
  const [notFound, setNotFound] = useState(false)
  const [polling, setPolling] = useState(false)

  async function loadOrder() {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      router.push(`/sign-in?redirect=/dashboard/orders/${orderId}`)
      return
    }
    // Fetch the order via the standard user-scoped list and pick this one.
    const orders = await fetchUserOrders(data.user.id)
    const match = orders.find((o) => o.id === orderId) ?? null
    if (!match) {
      setNotFound(true)
      setReady(true)
      return
    }
    setOrder(match)
    setOrderStatus(match.status ?? "pending")

    // Query payment_status from Supabase directly for freshness.
    const { data: row } = await supabase
      .from("orders")
      .select("payment_status, status")
      .eq("id", orderId)
      .eq("user_id", data.user.id)
      .maybeSingle()
    if (row) {
      setPaymentStatus((row.payment_status as PaymentStatusLocal) ?? null)
      setOrderStatus((row.status as string) ?? "pending")
    }
    setReady(true)
  }

  useEffect(() => {
    if (!orderId) {
      setNotFound(true)
      setReady(true)
      return
    }
    void loadOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  // If we landed with ?success=true and payment_status hasn't caught up yet,
  // do one polled refresh at ~2.5s to catch webhook lag.
  useEffect(() => {
    if (!success) return
    if (paymentStatus === "paid") return
    if (polling) return
    setPolling(true)
    const timer = setTimeout(() => {
      void loadOrder().finally(() => setPolling(false))
    }, 2500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success, paymentStatus, polling])

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
              "This order could not be located under your account.",
              "تعذر إيجاد هذا الطلب في حسابك."
            )}
          </p>
          <button
            onClick={() => router.push("/dashboard/orders")}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
          >
            {t(locale, "Back to orders", "العودة إلى الطلبات")}
          </button>
        </div>
      </DashboardShell>
    )
  }

  const isPaid = paymentStatus === "paid" || orderStatus !== "pending"
  const isFailed = paymentStatus === "failed" && orderStatus === "pending"
  const isPending = paymentStatus !== "paid" && paymentStatus !== "failed"

  return (
    <DashboardShell>
      <MobileNav />
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-6">
        <button
          onClick={() => router.push("/dashboard/orders")}
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
        >
          <ArrowLeft className="size-4" />
          {t(locale, "All orders", "كل الطلبات")}
        </button>

        {/* Status card */}
        {isPaid && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-8 text-emerald-600" />
              <div>
                <h1 className="text-lg font-semibold text-emerald-900">
                  {t(locale, "Payment successful", "تم الدفع بنجاح")}
                </h1>
                <p className="text-sm text-emerald-800">
                  {t(
                    locale,
                    "We have received your order and will contact you shortly.",
                    "تم استلام طلبك وسنتواصل معك قريبًا."
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
        {isFailed && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <div className="flex items-center gap-3">
              <XCircle className="size-8 text-rose-600" />
              <div>
                <h1 className="text-lg font-semibold text-rose-900">
                  {t(locale, "Payment failed", "فشل الدفع")}
                </h1>
                <p className="text-sm text-rose-800">
                  {t(
                    locale,
                    "Your payment was not completed. You can retry checkout below.",
                    "لم يكتمل الدفع. يمكنك المحاولة مجددًا من الأسفل."
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/dashboard/checkout?orderId=${order.id}`)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm text-white hover:bg-rose-700"
            >
              {t(locale, "Retry payment", "إعادة المحاولة")}
            </button>
          </div>
        )}
        {isPending && !isFailed && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-3">
              <Clock className="size-8 text-amber-600" />
              <div>
                <h1 className="text-lg font-semibold text-amber-900">
                  {t(locale, "Payment pending", "الدفع قيد المعالجة")}
                </h1>
                <p className="text-sm text-amber-800">
                  {polling
                    ? t(locale, "Checking status…", "جاري التحقق من الحالة…")
                    : t(
                        locale,
                        "We are still awaiting confirmation from the payment provider.",
                        "ما زلنا بانتظار تأكيد من مزود الدفع."
                      )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Order details */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            {t(locale, "Order details", "تفاصيل الطلب")}
          </h2>
          <p className="mt-1 text-xs text-slate-500 font-mono">#{order.id.slice(0, 8)}</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
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
        </div>
      </div>
    </DashboardShell>
  )
}

export default function OrderDetailPage() {
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
      <OrderDetailInner />
    </Suspense>
  )
}
