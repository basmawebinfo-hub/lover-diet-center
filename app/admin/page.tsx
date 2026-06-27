"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Users, ShoppingBag, DollarSign, Calendar, TrendingUp, ArrowUpRight } from "lucide-react"
import { AdminShell } from "@/components/admin/admin-shell"
import { StatChip } from "@/components/dashboard/stat-widgets"
import { adminClients, adminOrders, adminSessions, adminRevenue } from "@/lib/admin-mock"
import { adminFetchClients, adminFetchOrders, adminFetchSessions } from "@/lib/supabase/db"
import { useLocale, t } from "@/lib/locale"

export default function AdminOverviewPage() {
  const { locale } = useLocale()
  const aed = t(locale, "AED", "درهم")

  const [clientsCount, setClientsCount] = useState<number | null>(null)
  const [orders, setOrders] = useState<typeof adminOrders>([])
  const [sessionsCount, setSessionsCount] = useState<number | null>(null)

  useEffect(() => {
    adminFetchClients().then((r) => setClientsCount(r.length))
    adminFetchOrders().then((r) => { setOrders(r.map((o)=>({ id:o.id, client:o.client, date:o.date, items:o.items, total:o.total, status:o.status as typeof adminOrders[number]["status"] }))) })
    adminFetchSessions().then((r) => setSessionsCount(r.filter((s)=>s.status==="scheduled").length))
  }, [])

  const totalRevenue = adminRevenue.reduce((s, r) => s + r.value, 0)
  const activeClients = clientsCount ?? 0
  const pendingOrders = orders.filter((o) => o.status === "pending" || o.status === "processing").length
  const upcomingSessions = sessionsCount ?? 0

  const maxRev = Math.max(...adminRevenue.map((r) => r.value))

  const statusColor: Record<string, string> = {
    pending: "bg-amber-50 text-amber-600", processing: "bg-blue-50 text-blue-600",
    shipped: "bg-indigo-50 text-indigo-600", delivered: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-red-50 text-red-500",
  }
  const statusLabel: Record<string, { en: string; ar: string }> = {
    pending: { en: "Pending", ar: "قيد الانتظار" }, processing: { en: "Processing", ar: "قيد التجهيز" },
    shipped: { en: "Shipped", ar: "تم الشحن" }, delivered: { en: "Delivered", ar: "تم التوصيل" },
    cancelled: { en: "Cancelled", ar: "ملغي" },
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div>
          <p className="text-sm font-medium text-emerald-600">{t(locale, "Admin Dashboard", "لوحة الإدارة")}</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">{t(locale, "Business Overview", "نظرة عامة على النشاط")}</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatChip tone="emerald" icon={<DollarSign className="size-5" />} label={t(locale, "Total Revenue", "إجمالي الإيرادات")} value={`${(totalRevenue/1000).toFixed(1)}k ${aed}`} delta={`+12% ${t(locale,"vs last period","عن الفترة السابقة")}`} />
          <StatChip tone="violet" icon={<Users className="size-5" />} label={t(locale, "Active Clients", "العملاء النشطون")} value={`${activeClients}`} delta={`${adminClients.length} ${t(locale,"total","إجمالي")}`} />
          <StatChip tone="amber" icon={<ShoppingBag className="size-5" />} label={t(locale, "Open Orders", "طلبات مفتوحة")} value={`${pendingOrders}`} delta={`${adminOrders.length} ${t(locale,"total","إجمالي")}`} />
          <StatChip tone="sky" icon={<Calendar className="size-5" />} label={t(locale, "Upcoming Sessions", "جلسات قادمة")} value={`${upcomingSessions}`} delta={t(locale,"this week","هذا الأسبوع")} />
        </div>

        {/* Revenue chart + quick links */}
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">{t(locale, "Monthly Revenue", "الإيرادات الشهرية")}</h2>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600"><TrendingUp className="size-4" /> +12%</span>
            </div>
            <div className="mt-6 flex h-52 items-end justify-between gap-2">
              {adminRevenue.map((r) => (
                <div key={r.month} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full items-end justify-center" style={{ height: "170px" }}>
                    <div className="w-full max-w-[34px] rounded-t-lg bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all" style={{ height: `${(r.value / maxRev) * 100}%` }} title={`${r.value} ${aed}`} />
                  </div>
                  <span className="text-xs font-medium text-neutral-400">{r.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {[
              { href: "/admin/clients", icon: Users, en: "Manage Clients", ar: "إدارة العملاء" },
              { href: "/admin/orders", icon: ShoppingBag, en: "View Orders", ar: "عرض الطلبات" },
              { href: "/admin/products", icon: ShoppingBag, en: "Edit Products", ar: "تعديل المنتجات" },
            ].map((q) => {
              const Icon = q.icon
              return (
                <Link key={q.href} href={q.href} className="group flex items-center justify-between rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Icon className="size-5" /></span>
                    <span className="font-semibold text-neutral-900">{locale === "ar" ? q.ar : q.en}</span>
                  </div>
                  <ArrowUpRight className="size-4 text-neutral-300 group-hover:text-emerald-600" />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent orders */}
        <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">{t(locale, "Recent Orders", "أحدث الطلبات")}</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-emerald-600 hover:underline">{t(locale, "View all", "عرض الكل")}</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-start text-xs uppercase tracking-wider text-neutral-400">
                  <th className="pb-3 text-start font-medium">{t(locale, "Order", "الطلب")}</th>
                  <th className="pb-3 text-start font-medium">{t(locale, "Client", "العميل")}</th>
                  <th className="pb-3 text-start font-medium">{t(locale, "Total", "الإجمالي")}</th>
                  <th className="pb-3 text-start font-medium">{t(locale, "Status", "الحالة")}</th>
                </tr>
              </thead>
              <tbody>
                {adminOrders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="border-b border-neutral-50">
                    <td className="py-3 font-bold text-neutral-900">#{o.id.slice(-4)}</td>
                    <td className="py-3 text-neutral-600">{o.client}</td>
                    <td className="py-3 font-semibold text-neutral-900">{o.total} {aed}</td>
                    <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusColor[o.status]}`}>{locale === "ar" ? statusLabel[o.status].ar : statusLabel[o.status].en}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
