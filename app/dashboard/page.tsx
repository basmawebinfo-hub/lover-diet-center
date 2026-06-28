"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Scale, Apple, Calendar, ShoppingBag, Target, Flame, Droplets,
  Bell, Plus, Minus, Search, ArrowUpRight,
} from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { BodyAvatar } from "@/components/body-avatar"
import { WeightChart } from "@/components/dashboard/weight-chart"
import { Donut, StatChip } from "@/components/dashboard/stat-widgets"
import { useApp } from "@/lib/store"
import { analyzeUser, progressPercent } from "@/lib/analysis"
import type { User } from "@/lib/types"
import { useLocale, t } from "@/lib/locale"
import { ClientNotifications } from "@/components/dashboard/client-notifications"
import { WHATSAPP_SUPPORT } from "@/lib/site"
import { useToast } from "@/components/ui/toast"

function getLocalUser(): User | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem("loverDietUser")
    if (raw) return JSON.parse(raw) as User
  } catch { /* ignore */ }
  return null
}

function greeting(locale: "en" | "ar") {
  const h = new Date().getHours()
  if (h < 12) return t(locale, "Good morning", "صباح الخير")
  if (h < 18) return t(locale, "Good afternoon", "مساء الخير")
  return t(locale, "Good evening", "مساء الخير")
}

export default function DashboardOverviewPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const { notify } = useToast()
  const { state, logWater } = useApp()
  const user = useMemo(() => state.user || getLocalUser(), [state.user])

  useEffect(() => {
    if (state.hydrated && !user) router.replace("/onboarding")
  }, [state.hydrated, user, router])

  if (!user) return null

  const analysis = analyzeUser({
    age: user.age, gender: user.gender, heightCm: user.heightCm,
    startWeightKg: user.startWeightKg, currentWeightKg: user.currentWeightKg,
    goal: user.goal, activityLevel: user.activityLevel,
  }, locale)

  const hasWeight = user.currentWeightKg >= 30
  const progress = progressPercent(user)
  const todayStr = new Date().toISOString().slice(0, 10)
  const waterToday = state.waterLogs.find((w) => w.date === todayStr)?.liters ?? 0
  const waterGoal = state.doctorPlan?.waterLiters ?? 2.5
  const loggedToday = state.weightLogs.some((l) => l.date === todayStr)
  const lostKg = Math.max(0, user.startWeightKg - user.currentWeightKg)
  const firstName = user.nameEn.split(" ")[0]
  const initial = firstName.charAt(0).toUpperCase()
  const addWater = (d: number) => logWater(todayStr, Math.max(0, Math.round((waterToday + d) * 10) / 10))

  return (
    <DashboardShell>
      <MobileNav />
      <div className="mx-auto max-w-6xl space-y-5 pb-28 lg:pb-6">

        {/* Top bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">{greeting(locale)} 👋</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
              {t(locale, `Welcome back, ${firstName}`, `أهلاً بعودتك، ${firstName}`)}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-400 sm:flex">
              <Search className="size-4" />
              <span>{t(locale, "Search…", "بحث…")}</span>
            </div>
            <span className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-base font-bold text-emerald-700">{initial}</span>
          </div>
        </div>

        {/* Notifications */}
        <ClientNotifications /></p>
            </div>
            <Link href="/dashboard/weight" className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600">{t(locale, "Log now", "سجّل الآن")}</Link>
          </div>
        )}

        {/* Stat chips */}
        {!hasWeight && (
          <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 text-xl">👋</span>
              <div>
                <p className="font-extrabold text-neutral-900">{t(locale, "Welcome! Let's get started", "أهلاً بك! لنبدأ رحلتك")}</p>
                <p className="text-sm text-neutral-500">{t(locale, "Log your first weight to unlock your personalized plan & stats.", "سجّل وزنك الأول لتفعيل خطتك وإحصائياتك المخصصة.")}</p>
              </div>
            </div>
            <button onClick={() => router.push("/dashboard/weight")} className="shrink-0 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
              {t(locale, "Log my weight", "سجّل وزني")}
            </button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatChip tone="emerald" icon={<Scale className="size-5" />} label={t(locale, "Current Weight", "الوزن الحالي")} value={`${user.currentWeightKg.toFixed(1)} ${t(locale,"kg","كجم")}`} delta={`${lostKg.toFixed(1)} ${t(locale,"kg lost","كجم مفقودة")}`} />
          <StatChip tone="violet" icon={<Target className="size-5" />} label={t(locale, "Target", "الهدف")} value={`${user.targetWeightKg.toFixed(1)} ${t(locale,"kg","كجم")}`} delta={`${progress.toFixed(0)}% ${t(locale,"there","أُنجز")}`} />
          <StatChip tone="amber" icon={<Flame className="size-5" />} label={t(locale, "Daily Calories", "السعرات اليومية")} value={analysis.recommendedDailyCalories > 0 ? `${analysis.recommendedDailyCalories}` : "—"} delta={`${analysis.recommendedProteinG}${t(locale,"g protein","غ بروتين")}`} />
          <StatChip tone="sky" icon={<Droplets className="size-5" />} label={t(locale, "Water Today", "ماء اليوم")} value={`${waterToday} ${t(locale,"L","لتر")}`} delta={`${Math.min(100, Math.round((waterToday/waterGoal)*100))}% ${t(locale,"of goal","من الهدف")}`} />
        </div>

        {/* Main grid: avatar + rings */}
        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          {/* Avatar card (transparent image, no background box) */}
          <div className="flex flex-col items-center rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm">
            <div className="flex w-full items-center justify-between">
              <p className="text-sm font-bold text-neutral-900">{t(locale, "Your Body", "جسمك")}</p>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">{t(locale, locale==="ar"?"":"BMI", "مؤشر")} {analysis.bmi.toFixed(1)}</span>
            </div>
            <BodyAvatar
              gender={user.gender === "female" ? "female" : "male"}
              weightKg={user.currentWeightKg}
              heightCm={user.heightCm}
              fullBody
              showLabel
              previousWeightKg={user.startWeightKg !== user.currentWeightKg ? user.startWeightKg : undefined}
              className="mt-2 w-full max-w-[220px]"
            />
            <Link href="/dashboard/weight" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
              <Scale className="size-3.5" /> {t(locale, "Log weight", "سجّل الوزن")}
            </Link>
          </div>

          {/* Rings + AI */}
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col items-center rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm">
                <Donut value={progress} max={100} color="#10b981" label={`${progress.toFixed(0)}%`} sub={t(locale,"to goal","للهدف")} />
                <p className="mt-3 text-sm font-semibold text-neutral-700">{t(locale, "Goal progress", "نحو الهدف")}</p>
              </div>
              <div className="flex flex-col items-center rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm">
                <Donut value={waterToday} max={waterGoal} color="#0ea5e9" track="#e0f2fe" label={`${waterToday}${t(locale,"L","ل")}`} sub={`/ ${waterGoal}`} />
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => addWater(-0.25)} className="flex size-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:border-sky-300 hover:text-sky-600"><Minus className="size-3.5" /></button>
                  <span className="text-sm font-semibold text-neutral-700">{t(locale,"Water","ماء")}</span>
                  <button onClick={() => { addWater(0.25); if (waterToday + 0.25 >= waterGoal) notify(t(locale,"Water goal reached! 💧","وصلت لهدف الماء! 💧")) }} className="flex size-8 items-center justify-center rounded-full bg-sky-500 text-white hover:bg-sky-600"><Plus className="size-3.5" /></button>
                </div>
              </div>
              <div className="flex flex-col items-center rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm">
                <Donut value={Math.min(100, (lostKg / Math.max(1, user.startWeightKg - user.targetWeightKg)) * 100)} max={100} color="#f59e0b" track="#fef3c7" label={`${lostKg.toFixed(1)}`} sub={t(locale,"kg lost","كجم")} />
                <p className="mt-3 text-sm font-semibold text-neutral-700">{t(locale, "Lost so far", "المفقود حتى الآن")}</p>
              </div>
            </div>

            {/* AI card */}
            <div className="rounded-3xl border border-neutral-100 bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">{t(locale, "AI Analysis", "تحليل بالذكاء الاصطناعي")}</p>
              <h2 className="mt-2 text-lg font-bold leading-snug">{locale === "ar" ? analysis.summaryAr : analysis.summaryEn}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/80">{locale === "ar" ? analysis.motivationAr : analysis.motivationEn}</p>
            </div>
          </div>
        </div>

        {/* Weight trend */}
        <WeightChart logs={state.weightLogs} goalKg={Math.round(user.targetWeightKg * 10) / 10} />

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { href: "/dashboard/plan", icon: Apple, en: "My Plan", ar: "خطتي", sub: t(locale, "Today's meals", "وجبات اليوم") },
            { href: "/dashboard/sessions", icon: Calendar, en: "Sessions", ar: "الجلسات", sub: `${state.sessions.filter((s) => s.status === "scheduled").length} ${t(locale,"upcoming","قادمة")}` },
            { href: "/dashboard/products", icon: ShoppingBag, en: "Shop", ar: "تسوّق", sub: t(locale, "Healthy products", "منتجات صحية") },
            { href: "/dashboard/settings", icon: Target, en: "My Goal", ar: "هدفي", sub: t(locale, "Profile & goal", "الملف والهدف") },
          ].map((a) => {
            const Icon = a.icon
            return (
              <Link key={a.href} href={a.href} className="group rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"><Icon className="size-5" /></span>
                  <ArrowUpRight className="size-4 text-neutral-300 transition group-hover:text-emerald-600" />
                </div>
                <p className="mt-3 font-bold text-neutral-900">{locale === "ar" ? a.ar : a.en}</p>
                <p className="text-xs text-neutral-400">{a.sub}</p>
              </Link>
            )
          })}
        </div>

        {/* Recent orders + quick contact */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_300px]">
          <div className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">{t(locale, "Recent Orders", "آخر طلباتك")}</h2>
              <Link href="/dashboard/orders" className="text-sm font-semibold text-emerald-600 hover:underline">{t(locale, "View all", "عرض الكل")}</Link>
            </div>
            {state.orders.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-neutral-400">{t(locale, "No orders yet.", "لا توجد طلبات بعد.")}</p>
                <Link href="/shop" className="mt-3 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">{t(locale, "Browse shop", "تصفّح المتجر")}</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {state.orders.slice(0, 3).map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-2xl border border-neutral-100 p-3">
                    <div>
                      <p className="font-bold text-neutral-900">#{o.id.slice(-4)}</p>
                      <p className="text-xs text-neutral-400">{(o.date || "").slice(0, 10)} · {o.items.length} {t(locale, "items", "عناصر")}</p>
                    </div>
                    <span className="font-bold text-emerald-700">${o.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <a href={WHATSAPP_SUPPORT} target="_blank" rel="noopener noreferrer" className="flex flex-col justify-between rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-600 to-emerald-500 p-6 text-white shadow-sm transition hover:shadow-md">
            <div>
              <p className="text-lg font-extrabold">{t(locale, "Need help?", "محتاج مساعدة؟")}</p>
              <p className="mt-1 text-sm text-white/80">{t(locale, "Chat with our nutrition team on WhatsApp.", "تواصل مع فريق التغذية عبر واتساب.")}</p>
            </div>
            <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-bold backdrop-blur">{t(locale, "Message us", "راسلنا الآن")}</span>
          </a>
        </div>
      </div>
    </DashboardShell>
  )
}
