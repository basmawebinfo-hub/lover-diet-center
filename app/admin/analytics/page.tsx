"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { StatChip } from "@/components/dashboard/stat-widgets"
import { adminFetchClients, adminFetchOrders } from "@/lib/supabase/db"
import { useCurrency } from "@/lib/currency"
import { TrendingUp, Users, DollarSign, ShoppingBag } from "lucide-react"
import { useLocale, t } from "@/lib/locale"

export default function AdminAnalyticsPage() {
  const { locale } = useLocale()
  const { format } = useCurrency()
  const [clients, setClients] = useState<{ gender: string }[]>([])
  const [orders, setOrders] = useState<{ total: number; date: string }[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    Promise.all([adminFetchClients(), adminFetchOrders()]).then(([c, o]) => {
      setClients(c.map((x) => ({ gender: x.gender })))
      setOrders(o.map((x) => ({ total: x.total, date: x.date })))
      setLoaded(true)
    })
  }, [])

  const total = useMemo(() => orders.reduce((s, o) => s + (o.total || 0), 0), [orders])
  const monthly = useMemo(() => {
    const months: { key: string; label: string; value: number }[] = []
    const now = new Date()
    for (let i = 7; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleString("en", { month: "short" }), value: 0 })
    }
    for (const o of orders) { const m = months.find((x) => x.key === (o.date || "").slice(0, 7)); if (m) m.value += o.total || 0 }
    return months
  }, [orders])
  const maxRev = Math.max(1, ...monthly.map((m) => m.value))
  const avg = orders.length ? Math.round(total / Math.max(1, monthly.filter((m) => m.value > 0).length)) : 0

  const W = 700, H = 240, PAD = 30
  const xs = (i: number) => PAD + (i / (monthly.length - 1)) * (W - 2 * PAD)
  const ys = (v: number) => PAD + (1 - v / maxRev) * (H - 2 * PAD)
  const line = monthly.map((r, i) => `${i === 0 ? "M" : "L"} ${xs(i).toFixed(1)} ${ys(r.value).toFixed(1)}`).join(" ")
  const area = `${line} L ${xs(monthly.length - 1)} ${H - PAD} L ${xs(0)} ${H - PAD} Z`

  const genders = { female: clients.filter((c) => c.gender === "female").length, male: clients.filter((c) => c.gender === "male").length }
  const totalClients = clients.length

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="text-sm font-medium text-emerald-600">{t(locale, "Analytics", "التحليلات")}</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">{t(locale, "Performance & Growth", "الأداء والنمو")}</h1>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatChip tone="emerald" icon={<DollarSign className="size-5" />} label={t(locale, "Total Revenue", "إجمالي الإيرادات")} value={format(total)} />
          <StatChip tone="violet" icon={<TrendingUp className="size-5" />} label={t(locale, "Avg / month", "متوسط شهري")} value={format(avg)} />
          <StatChip tone="sky" icon={<Users className="size-5" />} label={t(locale, "Total Clients", "إجمالي العملاء")} value={`${totalClients}`} />
          <StatChip tone="amber" icon={<ShoppingBag className="size-5" />} label={t(locale, "Total Orders", "إجمالي الطلبات")} value={`${orders.length}`} />
        </div>

        <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-neutral-900">{t(locale, "Revenue Trend", "اتجاه الإيرادات")}</h2>
          {total === 0 ? (
            <p className="py-16 text-center text-sm text-neutral-400">{t(locale, "No data yet.", "لا توجد بيانات بعد.")}</p>
          ) : (
            <>
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity="0.25" /><stop offset="100%" stopColor="#10b981" stopOpacity="0" /></linearGradient></defs>
                <path d={area} fill="url(#rev)" />
                <path d={line} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinejoin="round" />
                {monthly.map((r, i) => <circle key={r.key} cx={xs(i)} cy={ys(r.value)} r="3.5" fill="#fff" stroke="#059669" strokeWidth="2" />)}
              </svg>
              <div className="mt-2 flex justify-between text-xs text-neutral-400">{monthly.map((r) => <span key={r.key}>{r.label}</span>)}</div>
            </>
          )}
        </div>

        <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-neutral-900">{t(locale, "Clients by gender", "العملاء حسب الجنس")}</h2>
          {totalClients === 0 ? (
            <p className="py-10 text-center text-sm text-neutral-400">{t(locale, "No clients yet.", "لا يوجد عملاء بعد.")}</p>
          ) : (
            <div className="space-y-3">
              {[["female", "👩", genders.female, "#e07a9c"], ["male", "👨", genders.male, "#4f86c6"]].map(([k, emoji, n, col]: [string, string, number, string]) => (
                <div key={k}>
                  <div className="mb-1 flex justify-between text-sm"><span>{emoji} {k === "female" ? t(locale, "Female", "إناث") : t(locale, "Male", "ذكور")}</span><span className="font-bold">{n}</span></div>
                  <div className="h-2.5 w-full rounded-full bg-neutral-100"><div className="h-full rounded-full" style={{ width: `${(n / totalClients) * 100}%`, background: col }} /></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
