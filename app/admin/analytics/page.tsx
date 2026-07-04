"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { StatChip } from "@/components/dashboard/stat-widgets"
import {
  adminFetchClients,
  adminFetchOrders,
  adminFetchProducts,
  adminFetchAllPlans,
  adminFetchSessions,
} from "@/lib/supabase/db"
import { useCurrency } from "@/lib/currency"
import {
  TrendingUp,
  Users,
  DollarSign,
  ShoppingBag,
  Package,
  UtensilsCrossed,
  CalendarCheck,
  UserPlus,
  Scale,
  AlertTriangle,
} from "lucide-react"
import { useLocale, t } from "@/lib/locale"

type Range = "7d" | "30d" | "90d" | "all"

type ClientLite = {
  id: string
  gender: "male" | "female"
  goal: string
  joinedAt: string
  blocked: boolean
  currentWeightKg: number
  startWeightKg: number
  targetWeightKg: number
}
type OrderLite = { id: string; total: number; date: string; status: string; items: number }
type ProductLite = { id: string; nameEn: string; nameAr: string; category: string; price: number; inStock: boolean }
type PlanLite = { id: string; userId: string; goal: string; dailyCalories: number; itemCount: number; createdAt: string }
type SessionLite = { id: string; type: string; status: string; date: string }

function daysAgo(iso: string): number {
  if (!iso) return Infinity
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return Infinity
  return (Date.now() - t) / 86400000
}

function inRange(iso: string, range: Range): boolean {
  if (range === "all") return true
  const limit = range === "7d" ? 7 : range === "30d" ? 30 : 90
  return daysAgo(iso) <= limit
}

function monthKey(iso: string): string {
  return (iso || "").slice(0, 7)
}

function monthLabel(y: number, m: number): string {
  return new Date(y, m, 1).toLocaleString("en", { month: "short" })
}

function buildMonths(count: number): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    out.push({ key, label: monthLabel(d.getFullYear(), d.getMonth()) })
  }
  return out
}

function buildDays(count: number): { key: string; label: string; short: string }[] {
  const out: { key: string; label: string; short: string }[] = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    out.push({
      key,
      label: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
      short: String(d.getDate()),
    })
  }
  return out
}

// Convert a horizontal series into a smoothed SVG path.
function seriesPath(values: number[], W: number, H: number, PAD: number, max: number): { line: string; area: string; points: { x: number; y: number }[] } {
  const n = values.length
  const denom = Math.max(1, n - 1)
  const xs = (i: number) => PAD + (i / denom) * (W - 2 * PAD)
  const ys = (v: number) => PAD + (1 - v / Math.max(1, max)) * (H - 2 * PAD)
  const points = values.map((v, i) => ({ x: xs(i), y: ys(v) }))
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")
  const area = `${line} L ${xs(n - 1)} ${H - PAD} L ${xs(0)} ${H - PAD} Z`
  return { line, area, points }
}

// Standard chart palette.
const COLOR = {
  primary: "#059669", // emerald 600
  primaryLight: "#10b981", // emerald 500
  violet: "#7c3aed",
  sky: "#0284c7",
  amber: "#f59e0b",
  coral: "#e07a5f",
  rose: "#e11d48",
  slate: "#64748b",
  female: "#e07a9c",
  male: "#4f86c6",
  categories: ["#059669", "#7c3aed", "#0284c7", "#f59e0b", "#e07a5f", "#e11d48"],
  statusOrder: {
    pending: "#f59e0b",
    processing: "#0284c7",
    shipped: "#7c3aed",
    delivered: "#059669",
    cancelled: "#94a3b8",
  } as Record<string, string>,
  statusSession: {
    scheduled: "#7c3aed",
    completed: "#059669",
    cancelled: "#94a3b8",
    "no-show": "#e11d48",
  } as Record<string, string>,
}

export default function AdminAnalyticsPage() {
  const { locale } = useLocale()
  const { format } = useCurrency()

  const [clients, setClients] = useState<ClientLite[]>([])
  const [orders, setOrders] = useState<OrderLite[]>([])
  const [products, setProducts] = useState<ProductLite[]>([])
  const [plans, setPlans] = useState<PlanLite[]>([])
  const [sessions, setSessions] = useState<SessionLite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState<Range>("30d")

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [c, o, p, pl, s] = await Promise.all([
        adminFetchClients(),
        adminFetchOrders(),
        adminFetchProducts(),
        adminFetchAllPlans(),
        adminFetchSessions(),
      ])
      setClients(
        c.map((x) => ({
          id: x.id,
          gender: x.gender,
          goal: x.goal,
          joinedAt: x.joinedAt,
          blocked: x.blocked,
          currentWeightKg: x.currentWeightKg,
          startWeightKg: x.startWeightKg,
          targetWeightKg: x.targetWeightKg,
        }))
      )
      setOrders(o.map((x) => ({ id: x.id, total: x.total, date: x.date, status: x.status, items: x.items })))
      setProducts(
        p.map((x) => ({ id: x.id, nameEn: x.nameEn, nameAr: x.nameAr, category: x.category, price: x.price, inStock: x.inStock }))
      )
      setPlans(
        pl.map((x) => ({ id: x.id, userId: x.userId, goal: x.goal, dailyCalories: x.dailyCalories, itemCount: x.itemCount, createdAt: (x.createdAt || "").slice(0, 10) }))
      )
      setSessions(s.map((x) => ({ id: x.id, type: x.type, status: x.status, date: x.date })))
    } catch (e) {
      setError((e as Error)?.message ?? "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  // ============================================================
  // Derived scoped datasets
  // ============================================================

  const ordersInRange = useMemo(() => orders.filter((o) => inRange(o.date, range)), [orders, range])
  const clientsInRange = useMemo(() => clients.filter((c) => inRange(c.joinedAt, range)), [clients, range])
  const sessionsInRange = useMemo(() => sessions.filter((s) => inRange(s.date, range)), [sessions, range])
  const plansInRange = useMemo(() => plans.filter((p) => inRange(p.createdAt, range)), [plans, range])

  // ============================================================
  // KPIs
  // ============================================================

  const kpi = useMemo(() => {
    const revenue = ordersInRange.reduce((s, o) => s + (o.total || 0), 0)
    const orderCount = ordersInRange.length
    const aov = orderCount > 0 ? revenue / orderCount : 0
    const activeClients = clients.filter((c) => !c.blocked).length
    const newClients = clientsInRange.length
    const activePlans = plansInRange.length
    const upcomingSessions = sessions.filter((s) => s.status === "scheduled").length
    const inStockProducts = products.filter((p) => p.inStock).length
    return { revenue, orderCount, aov, activeClients, newClients, activePlans, upcomingSessions, inStockProducts }
  }, [ordersInRange, clients, clientsInRange, plansInRange, sessions, products])

  // ============================================================
  // Revenue trend (line + area) — daily granularity for 7d/30d,
  // monthly for 90d/all.
  // ============================================================

  const revenueSeries = useMemo(() => {
    if (range === "7d" || range === "30d") {
      const days = buildDays(range === "7d" ? 7 : 30)
      const map = new Map(days.map((d) => [d.key, 0]))
      for (const o of ordersInRange) {
        const k = (o.date || "").slice(0, 10)
        if (map.has(k)) map.set(k, (map.get(k) ?? 0) + (o.total || 0))
      }
      return { unit: "day" as const, buckets: days.map((d) => ({ key: d.key, label: d.short, full: d.label, value: map.get(d.key) ?? 0 })) }
    }
    const months = buildMonths(range === "90d" ? 3 : 12)
    const map = new Map(months.map((m) => [m.key, 0]))
    for (const o of ordersInRange) {
      const k = monthKey(o.date)
      if (map.has(k)) map.set(k, (map.get(k) ?? 0) + (o.total || 0))
    }
    return { unit: "month" as const, buckets: months.map((m) => ({ key: m.key, label: m.label, full: m.label, value: map.get(m.key) ?? 0 })) }
  }, [ordersInRange, range])

  // ============================================================
  // Order status distribution
  // ============================================================

  const orderStatus = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const o of ordersInRange) counts[o.status] = (counts[o.status] ?? 0) + 1
    const order = ["pending", "processing", "shipped", "delivered", "cancelled"]
    return order.map((k) => ({ key: k, value: counts[k] ?? 0, color: COLOR.statusOrder[k] ?? COLOR.slate }))
  }, [ordersInRange])

  // ============================================================
  // Product analytics — top by revenue (from orderItems join is heavy;
  // use price × orders as a proxy since orders currently carry aggregated
  // totals only). We report a distribution of products by category and
  // stock health.
  // ============================================================

  const productCategoryDist = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of products) counts[p.category] = (counts[p.category] ?? 0) + 1
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return entries.map(([k, v], i) => ({ key: k, value: v, color: COLOR.categories[i % COLOR.categories.length] }))
  }, [products])

  const stockHealth = useMemo(() => {
    const total = products.length
    const inStock = products.filter((p) => p.inStock).length
    return { total, inStock, outOfStock: total - inStock }
  }, [products])

  // ============================================================
  // Meal plans analytics
  // ============================================================

  const planGoalDist = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of plansInRange) {
      const k = p.goal || "unspecified"
      counts[k] = (counts[k] ?? 0) + 1
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k, v], i) => ({ key: k, value: v, color: COLOR.categories[i % COLOR.categories.length] }))
  }, [plansInRange])

  const planCalorieHistogram = useMemo(() => {
    const buckets = [
      { key: "<1200", min: 0, max: 1199 },
      { key: "1200-1499", min: 1200, max: 1499 },
      { key: "1500-1799", min: 1500, max: 1799 },
      { key: "1800-2099", min: 1800, max: 2099 },
      { key: "2100+", min: 2100, max: Infinity },
    ]
    const counts = buckets.map((b) => ({ ...b, value: 0 }))
    for (const p of plansInRange) {
      if (!p.dailyCalories) continue
      const b = counts.find((x) => p.dailyCalories >= x.min && p.dailyCalories <= x.max)
      if (b) b.value += 1
    }
    return counts.map((b) => ({ key: b.key, value: b.value }))
  }, [plansInRange])

  // ============================================================
  // User analytics — signups timeline + gender + goal
  // ============================================================

  const signupsSeries = useMemo(() => {
    if (range === "7d" || range === "30d") {
      const days = buildDays(range === "7d" ? 7 : 30)
      const map = new Map(days.map((d) => [d.key, 0]))
      for (const c of clientsInRange) {
        const k = (c.joinedAt || "").slice(0, 10)
        if (map.has(k)) map.set(k, (map.get(k) ?? 0) + 1)
      }
      return { unit: "day" as const, buckets: days.map((d) => ({ key: d.key, label: d.short, full: d.label, value: map.get(d.key) ?? 0 })) }
    }
    const months = buildMonths(range === "90d" ? 3 : 12)
    const map = new Map(months.map((m) => [m.key, 0]))
    for (const c of clientsInRange) {
      const k = monthKey(c.joinedAt)
      if (map.has(k)) map.set(k, (map.get(k) ?? 0) + 1)
    }
    return { unit: "month" as const, buckets: months.map((m) => ({ key: m.key, label: m.label, full: m.label, value: map.get(m.key) ?? 0 })) }
  }, [clientsInRange, range])

  const genderDist = useMemo(() => {
    const female = clients.filter((c) => c.gender === "female").length
    const male = clients.filter((c) => c.gender === "male").length
    return { female, male, total: female + male }
  }, [clients])

  const clientGoalDist = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of clients) {
      const k = c.goal || "unspecified"
      counts[k] = (counts[k] ?? 0) + 1
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k, v], i) => ({ key: k, value: v, color: COLOR.categories[i % COLOR.categories.length] }))
  }, [clients])

  // ============================================================
  // Weight progress analytics — for each client with start + current,
  // compute delta and bucket. Only clients with both values.
  // ============================================================

  const weightProgress = useMemo(() => {
    const withData = clients.filter((c) => c.startWeightKg > 0 && c.currentWeightKg > 0)
    if (withData.length === 0) return null
    const deltas = withData.map((c) => c.currentWeightKg - c.startWeightKg)
    const avgDelta = deltas.reduce((s, d) => s + d, 0) / deltas.length
    const withTarget = withData.filter((c) => c.targetWeightKg > 0)
    let onTrack = 0
    let progressing = 0
    let stagnant = 0
    for (const c of withTarget) {
      const delta = c.currentWeightKg - c.startWeightKg
      const needed = c.targetWeightKg - c.startWeightKg
      if (needed === 0) {
        stagnant++
        continue
      }
      const progress = delta / needed
      if (progress >= 0.9) onTrack++
      else if (progress > 0.05) progressing++
      else stagnant++
    }
    return { withData: withData.length, avgDelta, onTrack, progressing, stagnant, withTarget: withTarget.length }
  }, [clients])

  // ============================================================
  // Sessions analytics — status donut
  // ============================================================

  const sessionStatusDist = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of sessionsInRange) counts[s.status] = (counts[s.status] ?? 0) + 1
    return Object.entries(counts).map(([k, v]) => ({ key: k, value: v, color: COLOR.statusSession[k] ?? COLOR.slate }))
  }, [sessionsInRange])

  // ============================================================
  // Render helpers
  // ============================================================

  if (loading) {
    return (
      <AdminShell>
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="h-8 w-56 animate-pulse rounded-full bg-neutral-100" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-3xl bg-neutral-100" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-3xl bg-neutral-100" />
            ))}
          </div>
        </div>
      </AdminShell>
    )
  }

  if (error) {
    return (
      <AdminShell>
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-rose-100 bg-rose-50 p-6 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertTriangle className="size-6" />
            </div>
            <h2 className="text-lg font-bold text-rose-900">{t(locale, "Could not load analytics", "تعذر تحميل التحليلات")}</h2>
            <p className="mt-1 text-sm text-rose-700">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-4 rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
            >
              {t(locale, "Try again", "حاول مجددًا")}
            </button>
          </div>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header + range filter */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-emerald-600">{t(locale, "Analytics", "التحليلات")}</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
              {t(locale, "Performance & Growth", "الأداء والنمو")}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label={t(locale, "Date range", "نطاق التاريخ")}>
            {([
              { k: "7d", en: "7 days", ar: "٧ أيام" },
              { k: "30d", en: "30 days", ar: "٣٠ يومًا" },
              { k: "90d", en: "90 days", ar: "٩٠ يومًا" },
              { k: "all", en: "All time", ar: "كل الوقت" },
            ] as { k: Range; en: string; ar: string }[]).map((r) => {
              const active = range === r.k
              return (
                <button
                  key={r.k}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-pressed={active}
                  onClick={() => setRange(r.k)}
                  className={
                    "rounded-full border px-4 py-1.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-200 " +
                    (active
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-emerald-200 hover:text-emerald-700")
                  }
                >
                  {t(locale, r.en, r.ar)}
                </button>
              )
            })}
          </div>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <StatChip tone="emerald" icon={<DollarSign className="size-5" />} label={t(locale, "Revenue", "الإيرادات")} value={format(kpi.revenue)} />
          <StatChip tone="violet" icon={<ShoppingBag className="size-5" />} label={t(locale, "Orders", "الطلبات")} value={`${kpi.orderCount}`} />
          <StatChip tone="sky" icon={<TrendingUp className="size-5" />} label={t(locale, "Avg order", "متوسط الطلب")} value={format(kpi.aov)} />
          <StatChip tone="amber" icon={<UserPlus className="size-5" />} label={t(locale, "New clients", "عملاء جدد")} value={`${kpi.newClients}`} />
          <StatChip tone="emerald" icon={<Users className="size-5" />} label={t(locale, "Active clients", "عملاء نشطون")} value={`${kpi.activeClients}`} />
          <StatChip tone="violet" icon={<UtensilsCrossed className="size-5" />} label={t(locale, "Plans in range", "خطط في النطاق")} value={`${kpi.activePlans}`} />
          <StatChip tone="sky" icon={<CalendarCheck className="size-5" />} label={t(locale, "Upcoming sessions", "الجلسات القادمة")} value={`${kpi.upcomingSessions}`} />
          <StatChip tone="amber" icon={<Package className="size-5" />} label={t(locale, "Products in stock", "منتجات متوفرة")} value={`${kpi.inStockProducts}`} />
        </div>

        {/* Revenue trend */}
        <RevenueChart series={revenueSeries} range={range} locale={locale} formatCurrency={format} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <OrderStatusCard buckets={orderStatus} totalOrders={kpi.orderCount} locale={locale} />
          <SessionStatusCard buckets={sessionStatusDist} totalSessions={sessionsInRange.length} locale={locale} />
        </div>

        <SignupsCard series={signupsSeries} range={range} newClients={kpi.newClients} locale={locale} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <GenderCard genderDist={genderDist} locale={locale} />
          <GoalDistributionCard title={t(locale, "Client goals", "أهداف العملاء")} buckets={clientGoalDist} locale={locale} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ProductCategoryCard categories={productCategoryDist} stockHealth={stockHealth} locale={locale} />
          <PlanCaloriesCard buckets={planCalorieHistogram} totalPlans={plansInRange.length} locale={locale} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <GoalDistributionCard title={t(locale, "Plan goals", "أهداف الخطط")} buckets={planGoalDist} locale={locale} />
          <WeightProgressCard stats={weightProgress} locale={locale} />
        </div>
      </div>
    </AdminShell>
  )
}

// ============================================================
// Section components
// ============================================================

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-neutral-900">{title}</h2>
      {children}
    </div>
  )
}

function EmptyBlock({ label }: { label: string }) {
  return <p className="py-10 text-center text-sm text-neutral-400">{label}</p>
}

function RevenueChart({
  series,
  range,
  locale,
  formatCurrency,
}: {
  series: { unit: "day" | "month"; buckets: { key: string; label: string; full: string; value: number }[] }
  range: Range
  locale: string
  formatCurrency: (n: number) => string
}) {
  const values = series.buckets.map((b) => b.value)
  const max = Math.max(...values, 1)
  const W = 720
  const H = 240
  const PAD = 32
  const { line, area, points } = seriesPath(values, W, H, PAD, max)
  const total = values.reduce((s, v) => s + v, 0)

  const skipLabel = series.unit === "day" && series.buckets.length > 12
  const showEvery = series.unit === "day" ? Math.ceil(series.buckets.length / 8) : 1

  return (
    <ChartCard title={t(locale, "Revenue trend", "اتجاه الإيرادات")}>
      {total === 0 ? (
        <EmptyBlock label={t(locale, "No revenue yet in this range.", "لا توجد إيرادات بعد في هذا النطاق.")} />
      ) : (
        <>
          <div className="mb-2 text-xs text-neutral-500">
            {t(locale, "Total this period:", "الإجمالي في هذه الفترة:")}{" "}
            <span className="font-semibold text-neutral-800">{formatCurrency(total)}</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            <defs>
              <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLOR.primaryLight} stopOpacity="0.28" />
                <stop offset="100%" stopColor={COLOR.primaryLight} stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((f) => {
              const y = PAD + f * (H - 2 * PAD)
              return <line key={f} x1={PAD} x2={W - PAD} y1={y} y2={y} stroke="#f1f5f9" strokeWidth={1} />
            })}
            <path d={area} fill="url(#rev)" />
            <path d={line} fill="none" stroke={COLOR.primary} strokeWidth="2.5" strokeLinejoin="round" />
            {points.map((p, i) => (
              <circle key={series.buckets[i].key} cx={p.x} cy={p.y} r="3.2" fill="#fff" stroke={COLOR.primary} strokeWidth="2">
                <title>{`${series.buckets[i].full}: ${formatCurrency(values[i])}`}</title>
              </circle>
            ))}
          </svg>
          <div className="mt-2 flex justify-between text-[10px] text-neutral-400 sm:text-xs">
            {series.buckets.map((b, i) => (
              <span key={b.key} className={skipLabel && i % showEvery !== 0 ? "opacity-0" : ""}>{b.label}</span>
            ))}
          </div>
        </>
      )}
      <p className="mt-3 text-xs text-neutral-500">
        {range === "7d" || range === "30d"
          ? t(locale, "Daily revenue over the selected window.", "الإيرادات اليومية خلال الفترة المحددة.")
          : t(locale, "Monthly revenue over the selected window.", "الإيرادات الشهرية خلال الفترة المحددة.")}
      </p>
    </ChartCard>
  )
}

function OrderStatusCard({ buckets, totalOrders, locale }: { buckets: { key: string; value: number; color: string }[]; totalOrders: number; locale: string }) {
  const withValues = buckets.filter((b) => b.value > 0)
  const total = buckets.reduce((s, b) => s + b.value, 0)
  return (
    <ChartCard title={t(locale, "Orders by status", "الطلبات حسب الحالة")}>
      {total === 0 ? (
        <EmptyBlock label={t(locale, "No orders in this range yet.", "لا توجد طلبات في هذا النطاق بعد.")} />
      ) : (
        <div className="space-y-3">
          {buckets.map((b) => (
            <div key={b.key}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="capitalize text-neutral-700">{t(locale, b.key, arStatus(b.key))}</span>
                <span className="font-semibold text-neutral-900">{b.value}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full rounded-full" style={{ width: `${(b.value / Math.max(1, total)) * 100}%`, background: b.color }} />
              </div>
            </div>
          ))}
          <p className="pt-2 text-xs text-neutral-500">
            {t(locale, `Across ${totalOrders} orders in range.`, `عبر ${totalOrders} طلبات في النطاق.`)}
          </p>
          {withValues.length === 0 && <EmptyBlock label={t(locale, "No status data yet.", "لا توجد بيانات حالة بعد.")} />}
        </div>
      )}
    </ChartCard>
  )
}

function arStatus(k: string): string {
  const map: Record<string, string> = {
    pending: "معلق",
    processing: "قيد المعالجة",
    shipped: "شُحن",
    delivered: "تم التسليم",
    cancelled: "ملغى",
    scheduled: "مجدول",
    completed: "مكتمل",
    "no-show": "لم يحضر",
  }
  return map[k] ?? k
}

function SessionStatusCard({
  buckets,
  totalSessions,
  locale,
}: {
  buckets: { key: string; value: number; color: string }[]
  totalSessions: number
  locale: string
}) {
  const total = buckets.reduce((s, b) => s + b.value, 0)
  const size = 200
  const radius = 80
  const inner = 48
  const cx = size / 2
  const cy = size / 2

  const arcs = useMemo(() => {
    if (total === 0) return []
    let acc = 0
    return buckets.map((b) => {
      const start = (acc / total) * Math.PI * 2
      acc += b.value
      const end = (acc / total) * Math.PI * 2
      return { ...b, start, end }
    })
  }, [buckets, total])

  return (
    <ChartCard title={t(locale, "Sessions by status", "الجلسات حسب الحالة")}>
      {total === 0 ? (
        <EmptyBlock label={t(locale, "No sessions in this range yet.", "لا توجد جلسات في هذا النطاق بعد.")} />
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto size-40 shrink-0">
            {arcs.map((a) => {
              if (a.value === 0) return null
              // If a single segment fills 100%, use a full circle instead of an SVG arc,
              // because ECharts-style arc math collapses to zero-degree sweep when start==end.
              if (a.value === total) {
                return (
                  <g key={a.key}>
                    <circle cx={cx} cy={cy} r={radius} fill={a.color} />
                    <circle cx={cx} cy={cy} r={inner} fill="#fff" />
                  </g>
                )
              }
              const x1 = cx + Math.sin(a.start) * radius
              const y1 = cy - Math.cos(a.start) * radius
              const x2 = cx + Math.sin(a.end) * radius
              const y2 = cy - Math.cos(a.end) * radius
              const large = a.end - a.start > Math.PI ? 1 : 0
              const path = [
                `M ${cx} ${cy}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`,
                "Z",
              ].join(" ")
              return (
                <g key={a.key}>
                  <path d={path} fill={a.color} />
                </g>
              )
            })}
            <circle cx={cx} cy={cy} r={inner} fill="#fff" />
            <text x={cx} y={cy - 4} textAnchor="middle" className="fill-neutral-900" style={{ fontSize: 20, fontWeight: 700 }}>
              {totalSessions}
            </text>
            <text x={cx} y={cy + 16} textAnchor="middle" className="fill-neutral-500" style={{ fontSize: 11 }}>
              {t(locale, "sessions", "جلسة")}
            </text>
          </svg>
          <ul className="w-full space-y-2 text-sm">
            {buckets.filter((b) => b.value > 0).map((b) => (
              <li key={b.key} className="flex items-center justify-between">
                <span className="flex items-center gap-2 capitalize text-neutral-700">
                  <span className="inline-block size-3 rounded-full" style={{ background: b.color }} />
                  {t(locale, b.key, arStatus(b.key))}
                </span>
                <span className="font-semibold text-neutral-900">{b.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartCard>
  )
}

function SignupsCard({
  series,
  range,
  newClients,
  locale,
}: {
  series: { unit: "day" | "month"; buckets: { key: string; label: string; full: string; value: number }[] }
  range: Range
  newClients: number
  locale: string
}) {
  const values = series.buckets.map((b) => b.value)
  const max = Math.max(...values, 1)
  const W = 720
  const H = 200
  const PAD = 32
  const barGap = 4
  const n = series.buckets.length
  const barWidth = (W - 2 * PAD) / n - barGap
  const total = values.reduce((s, v) => s + v, 0)

  const skipLabel = series.unit === "day" && n > 12
  const showEvery = series.unit === "day" ? Math.ceil(n / 8) : 1

  return (
    <ChartCard title={t(locale, "New client signups", "تسجيلات العملاء الجدد")}>
      {total === 0 ? (
        <EmptyBlock label={t(locale, "No new clients in this range yet.", "لا يوجد عملاء جدد في هذا النطاق بعد.")} />
      ) : (
        <>
          <div className="mb-2 text-xs text-neutral-500">
            {t(locale, "Total this period:", "الإجمالي في هذه الفترة:")}{" "}
            <span className="font-semibold text-neutral-800">{newClients}</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            {[0, 0.25, 0.5, 0.75, 1].map((f) => {
              const y = PAD + f * (H - 2 * PAD)
              return <line key={f} x1={PAD} x2={W - PAD} y1={y} y2={y} stroke="#f1f5f9" strokeWidth={1} />
            })}
            {series.buckets.map((b, i) => {
              const x = PAD + i * (barWidth + barGap)
              const h = (b.value / max) * (H - 2 * PAD)
              const y = H - PAD - h
              return (
                <g key={b.key}>
                  <rect x={x} y={y} width={barWidth} height={h} fill={COLOR.violet} rx={3}>
                    <title>{`${b.full}: ${b.value}`}</title>
                  </rect>
                </g>
              )
            })}
          </svg>
          <div className="mt-2 flex justify-between text-[10px] text-neutral-400 sm:text-xs">
            {series.buckets.map((b, i) => (
              <span key={b.key} className={skipLabel && i % showEvery !== 0 ? "opacity-0" : ""}>{b.label}</span>
            ))}
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            {range === "7d" || range === "30d"
              ? t(locale, "Daily signups over the selected window.", "التسجيلات اليومية خلال الفترة المحددة.")
              : t(locale, "Monthly signups over the selected window.", "التسجيلات الشهرية خلال الفترة المحددة.")}
          </p>
        </>
      )}
    </ChartCard>
  )
}

function GenderCard({ genderDist, locale }: { genderDist: { female: number; male: number; total: number }; locale: string }) {
  const total = genderDist.total
  return (
    <ChartCard title={t(locale, "Clients by gender", "العملاء حسب الجنس")}>
      {total === 0 ? (
        <EmptyBlock label={t(locale, "No clients yet.", "لا يوجد عملاء بعد.")} />
      ) : (
        <div className="space-y-3">
          {[
            { k: "female", n: genderDist.female, col: COLOR.female, en: "Female", ar: "إناث" },
            { k: "male", n: genderDist.male, col: COLOR.male, en: "Male", ar: "ذكور" },
          ].map((g) => (
            <div key={g.k}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-neutral-700">{t(locale, g.en, g.ar)}</span>
                <span className="font-semibold text-neutral-900">
                  {g.n} <span className="text-xs text-neutral-400">({Math.round((g.n / Math.max(1, total)) * 100)}%)</span>
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full rounded-full" style={{ width: `${(g.n / Math.max(1, total)) * 100}%`, background: g.col }} />
              </div>
            </div>
          ))}
          <p className="pt-2 text-xs text-neutral-500">
            {t(locale, `${total} clients total.`, `${total} عميل إجمالًا.`)}
          </p>
        </div>
      )}
    </ChartCard>
  )
}

function GoalDistributionCard({
  title,
  buckets,
  locale,
}: {
  title: string
  buckets: { key: string; value: number; color: string }[]
  locale: string
}) {
  const total = buckets.reduce((s, b) => s + b.value, 0)
  return (
    <ChartCard title={title}>
      {total === 0 ? (
        <EmptyBlock label={t(locale, "No data yet.", "لا توجد بيانات بعد.")} />
      ) : (
        <div className="space-y-3">
          {buckets.map((b) => (
            <div key={b.key}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="capitalize text-neutral-700">{t(locale, prettifyGoal(b.key), arGoal(b.key))}</span>
                <span className="font-semibold text-neutral-900">
                  {b.value} <span className="text-xs text-neutral-400">({Math.round((b.value / Math.max(1, total)) * 100)}%)</span>
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full rounded-full" style={{ width: `${(b.value / Math.max(1, total)) * 100}%`, background: b.color }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </ChartCard>
  )
}

function prettifyGoal(k: string): string {
  const map: Record<string, string> = {
    lose_weight: "Lose weight",
    gain_muscle: "Gain muscle",
    maintain: "Maintain",
    body_recomposition: "Body recomposition",
    healthy_lifestyle: "Healthy lifestyle",
    unspecified: "Unspecified",
  }
  return map[k] ?? k.replace(/_/g, " ")
}

function arGoal(k: string): string {
  const map: Record<string, string> = {
    lose_weight: "خسارة الوزن",
    gain_muscle: "بناء العضلات",
    maintain: "الحفاظ على الوزن",
    body_recomposition: "إعادة تكوين الجسم",
    healthy_lifestyle: "نمط حياة صحي",
    unspecified: "غير محدد",
  }
  return map[k] ?? k.replace(/_/g, " ")
}

function ProductCategoryCard({
  categories,
  stockHealth,
  locale,
}: {
  categories: { key: string; value: number; color: string }[]
  stockHealth: { total: number; inStock: number; outOfStock: number }
  locale: string
}) {
  const total = categories.reduce((s, b) => s + b.value, 0)
  return (
    <ChartCard title={t(locale, "Product catalog", "كتالوج المنتجات")}>
      {stockHealth.total === 0 ? (
        <EmptyBlock label={t(locale, "No products yet.", "لا توجد منتجات بعد.")} />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-2xl bg-emerald-50 p-3 text-center">
              <p className="text-xl font-extrabold text-emerald-700">{stockHealth.total}</p>
              <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-800">{t(locale, "Total", "الإجمالي")}</p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-3 text-center">
              <p className="text-xl font-extrabold text-sky-700">{stockHealth.inStock}</p>
              <p className="text-[11px] font-medium uppercase tracking-wide text-sky-800">{t(locale, "In stock", "متوفر")}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 text-center">
              <p className="text-xl font-extrabold text-amber-700">{stockHealth.outOfStock}</p>
              <p className="text-[11px] font-medium uppercase tracking-wide text-amber-800">{t(locale, "Out of stock", "غير متوفر")}</p>
            </div>
          </div>
          {total > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{t(locale, "By category", "حسب الفئة")}</p>
              <ul className="space-y-2">
                {categories.map((b) => (
                  <li key={b.key}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="capitalize text-neutral-700">{t(locale, b.key, arCategory(b.key))}</span>
                      <span className="font-semibold text-neutral-900">{b.value}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                      <div className="h-full rounded-full" style={{ width: `${(b.value / total) * 100}%`, background: b.color }} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </ChartCard>
  )
}

function arCategory(k: string): string {
  const map: Record<string, string> = {
    snack: "وجبات خفيفة",
    supplement: "مكملات غذائية",
    drink: "مشروبات",
    accessory: "إكسسوارات",
    other: "أخرى",
  }
  return map[k] ?? k
}

function PlanCaloriesCard({
  buckets,
  totalPlans,
  locale,
}: {
  buckets: { key: string; value: number }[]
  totalPlans: number
  locale: string
}) {
  const total = buckets.reduce((s, b) => s + b.value, 0)
  const max = Math.max(1, ...buckets.map((b) => b.value))
  return (
    <ChartCard title={t(locale, "Plans by daily calories", "الخطط حسب السعرات اليومية")}>
      {totalPlans === 0 ? (
        <EmptyBlock label={t(locale, "No plans in this range yet.", "لا توجد خطط في هذا النطاق بعد.")} />
      ) : total === 0 ? (
        <EmptyBlock label={t(locale, "No calorie targets set on plans yet.", "لم يتم ضبط أهداف السعرات على الخطط بعد.")} />
      ) : (
        <div className="space-y-3">
          {buckets.map((b) => (
            <div key={b.key}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-mono text-neutral-700">{b.key} kcal</span>
                <span className="font-semibold text-neutral-900">{b.value}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(b.value / max) * 100}%` }} />
              </div>
            </div>
          ))}
          <p className="pt-2 text-xs text-neutral-500">
            {t(
              locale,
              `Distribution across ${totalPlans} plans in range.`,
              `التوزيع عبر ${totalPlans} خطط في النطاق.`,
            )}
          </p>
        </div>
      )}
    </ChartCard>
  )
}

function WeightProgressCard({
  stats,
  locale,
}: {
  stats: null | { withData: number; avgDelta: number; onTrack: number; progressing: number; stagnant: number; withTarget: number }
  locale: string
}) {
  return (
    <ChartCard title={t(locale, "Weight progress", "تقدم الوزن")}>
      {!stats ? (
        <EmptyBlock label={t(locale, "No weight data yet.", "لا توجد بيانات وزن بعد.")} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-baseline gap-2">
            <Scale className="size-5 text-emerald-600" />
            <p className="text-3xl font-extrabold text-neutral-900">
              {stats.avgDelta > 0 ? "+" : ""}
              {stats.avgDelta.toFixed(1)} kg
            </p>
            <p className="text-sm text-neutral-500">
              {t(locale, "avg change across", "متوسط التغيير عبر")} {stats.withData} {t(locale, "clients", "عملاء")}
            </p>
          </div>
          {stats.withTarget === 0 ? (
            <EmptyBlock label={t(locale, "No clients with target weight yet.", "لا يوجد عملاء بأوزان مستهدفة بعد.")} />
          ) : (
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl bg-emerald-50 p-3 text-center">
                <p className="text-2xl font-extrabold text-emerald-700">{stats.onTrack}</p>
                <p className="text-[11px] font-medium text-emerald-800">{t(locale, "On track (>=90%)", "على المسار (٩٠٪+)")}</p>
              </div>
              <div className="rounded-2xl bg-sky-50 p-3 text-center">
                <p className="text-2xl font-extrabold text-sky-700">{stats.progressing}</p>
                <p className="text-[11px] font-medium text-sky-800">{t(locale, "Progressing", "يتقدم")}</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3 text-center">
                <p className="text-2xl font-extrabold text-amber-700">{stats.stagnant}</p>
                <p className="text-[11px] font-medium text-amber-800">{t(locale, "Stagnant", "ثابت")}</p>
              </div>
            </div>
          )}
          <p className="text-xs text-neutral-500">
            {t(
              locale,
              `Based on start vs. current weight for ${stats.withData} clients (${stats.withTarget} with a target).`,
              `بناءً على الوزن الابتدائي مقارنة بالحالي لـ ${stats.withData} عميل (${stats.withTarget} لديهم هدف).`,
            )}
          </p>
        </div>
      )}
    </ChartCard>
  )
}
