"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Package, ShoppingBag, ChevronLeft } from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { useApp } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"

const STATUS: Record<string, { en: string; ar: string; cls: string }> = {
  pending:    { en: "Pending",    ar: "قيد الانتظار", cls: "bg-amber-50 text-amber-600" },
  processing: { en: "Processing", ar: "قيد التجهيز",  cls: "bg-blue-50 text-blue-600" },
  shipped:    { en: "Shipped",    ar: "تم الشحن",     cls: "bg-indigo-50 text-indigo-600" },
  delivered:  { en: "Delivered",  ar: "تم التوصيل",   cls: "bg-emerald-50 text-emerald-700" },
  cancelled:  { en: "Cancelled",  ar: "ملغي",         cls: "bg-red-50 text-red-500" },
}

export default function OrdersPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const { state } = useApp()
  const user = state.user

  useEffect(() => {
    if (state.hydrated && !user) router.replace("/onboarding")
  }, [state.hydrated, user, router])

  if (!user) return null

  const aed = t(locale, "AED", "درهم")
  const orders = state.orders

  return (
    <DashboardShell>
      <MobileNav />
      <div className="mx-auto max-w-4xl space-y-6 pb-28 lg:pb-0">
        <header>
          <h1 className="text-3xl font-bold text-neutral-900">{t(locale, "My Orders", "طلباتي")}</h1>
          <p className="mt-1 text-sm text-neutral-500">{t(locale, "Track your purchases and delivery status.", "تابع مشترياتك وحالة التوصيل.")}</p>
        </header>

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-neutral-100">
              <Package className="size-7 text-neutral-400" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">{t(locale, "No orders yet", "لا توجد طلبات بعد")}</h2>
            <p className="mt-1 text-sm text-neutral-500">{t(locale, "When you place an order, it will show up here.", "عند إتمام طلب، سيظهر هنا.")}</p>
            <Link href="/dashboard/products" className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
              <ShoppingBag className="size-4" /> {t(locale, "Browse products", "تصفّح المنتجات")}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const st = STATUS[order.status] ?? STATUS.pending
              return (
                <div key={order.id} className="rounded-3xl border border-neutral-100 bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-50 pb-4">
                    <div>
                      <p className="text-sm font-bold text-neutral-900">#{order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-neutral-400">
                        {new Date(order.date).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <span className={cn("rounded-full px-3 py-1 text-xs font-bold", st.cls)}>
                      {locale === "ar" ? st.ar : st.en}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    {order.items.map((it) => (
                      <div key={it.productId} className="flex items-center justify-between text-sm">
                        <span className="text-neutral-700">
                          {locale === "ar" ? it.nameAr : it.nameEn} <span className="text-neutral-400">× {it.quantity}</span>
                        </span>
                        <span className="font-semibold text-neutral-900">{it.price * it.quantity} {aed}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-neutral-50 pt-4">
                    <span className="text-sm text-neutral-500">{t(locale, "Total", "الإجمالي")}</span>
                    <span className="text-lg font-bold text-emerald-700">{order.total} {aed}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
