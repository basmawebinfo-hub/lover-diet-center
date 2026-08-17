"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Scale, Apple, Calendar, ShoppingBag, Target, Flame, Droplets,
  Plus, Minus, ArrowUpRight, ArrowRight, Package, MessageCircle, Sparkles,
} from "lucide-react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { BodyAvatar } from "@/components/body-avatar"
import { WeightChart } from "@/components/dashboard/weight-chart"
import { Donut } from "@/components/dashboard/stat-widgets"
import { Card, CardHeader, StatTile, EmptyState } from "@/components/ui/kit"
import { LocaleLink } from "@/components/ui/locale-link"
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
  const { state, logWater, refreshSessions } = useApp()
  const user = useMemo(() => state.user || getLocalUser(), [state.user])

  useEffect(() => {
    if (state.authChecked && !user) router.replace("/onboarding")
  }, [state.authChecked, user, router])

  // Keep the upcoming-sessions count fresh: pull sessions from the DB on open
  // so a session an admin booked after login shows up without a re-login.
  useEffect(() => {
    if (user) refreshSessions()
  }, [user, refreshSessions])

  if (!state.authChecked && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6faf8]">
        <div className="size-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
      </div>
    )
  }
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
  const lostKg = Math.max(0, user.startWeightKg - user.currentWeightKg)
  const firstName = user.nameEn.split(" ")[0]
  const initial = firstName.charAt(0).toUpperCase()
  const addWater = (d: number) => logWater(todayStr, Math.max(0, Math.round((waterToday + d) * 10) / 10))
  const loggedToday = state.weightLogs.some((w) => w.date === todayStr)
  const upcomingSessions = state.sessions.filter((s) => s.status === "scheduled").length

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-5">

        {/* ------------------------------------------------------ Header --- */}
        {/*
          The old header carried a search box that was a div with an icon and
          the word "Search…" — no input, no handler, hidden below `sm`. A
          control that looks interactive and does nothing costs more trust
          than the space it saves, so it is gone rather than faked.
        */}
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-emerald-600">{greeting(locale)} 👋</p>
            <h1 className="truncate text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
              {t(locale, `Welcome back, ${firstName}`, `أهلاً بعودتك، ${firstName}`)}
            </h1>
          </div>
          <Link
            href="/dashboard/settings"
            aria-label={t(locale, "Profile & goal", "الملف والهدف")}
            className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-100 text-base font-bold text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            {user.avatarUrl
              ? <Image src={user.avatarUrl} alt="" fill sizes="44px" className="object-cover" />
              : initial}
          </Link>
        </header>

        <ClientNotifications />

        {/* ------------------------------------------------ Today's action -- */}
        {/*
          First thing on the page, above every metric. On a phone the old
          layout put four stat chips and a full-height body illustration ahead
          of anything the client could act on — they had to scroll past their
          own numbers to find the one button that changes them.
        */}
        {!hasWeight ? (
          <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50 to-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-xl">👋</span>
                <div>
                  <p className="font-extrabold text-neutral-900">{t(locale, "Let's get started", "يلا نبدأ")}</p>
                  <p className="mt-0.5 text-sm text-neutral-500">
                    {t(locale, "Log your first weight to unlock your plan and progress.", "سجّل وزنك الأول عشان تتفعّل خطتك ومتابعة تقدّمك.")}
                  </p>
                </div>
              </div>
              <Link href="/dashboard/weight" className="flex min-h-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-bold text-white transition-colors hover:bg-emerald-700">
                {t(locale, "Log my weight", "سجّل وزني")}
              </Link>
            </div>
          </Card>
        ) : !loggedToday ? (
          <Link
            href="/dashboard/weight"
            className="flex items-center gap-3 rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Scale className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-neutral-900">{t(locale, "Log today's weight", "سجّل وزن النهاردة")}</p>
              <p className="truncate text-sm text-neutral-500">{t(locale, "Takes a few seconds — keeps your chart honest.", "ثواني معدودة — بيخلّي الرسم البياني دقيق.")}</p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-neutral-300 rtl:rotate-180" />
          </Link>
        ) : (
          <Link
            href="/dashboard/plan"
            className="flex items-center gap-3 rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Apple className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-neutral-900">{t(locale, "Today's weight is logged ✓", "وزن النهاردة اتسجّل ✓")}</p>
              <p className="truncate text-sm text-neutral-500">{t(locale, "See what's on your plan today.", "شوف خطة أكلك النهاردة.")}</p>
            </div>
            <ArrowRight className="size-4 shrink-0 text-neutral-300 rtl:rotate-180" />
          </Link>
        )}

        {/* -------------------------------------------------------- Stats --- */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <StatTile
            tone="emerald"
            icon={<Scale className="size-4.5" />}
            label={t(locale, "Current Weight", "الوزن الحالي")}
            value={`${user.currentWeightKg.toFixed(1)}`}
            hint={`${t(locale, "kg", "كجم")} · ${lostKg.toFixed(1)} ${t(locale, "kg lost", "كجم مفقودة")}`}
          />
          <StatTile
            tone="violet"
            icon={<Target className="size-4.5" />}
            label={t(locale, "Target", "الهدف")}
            value={`${user.targetWeightKg.toFixed(1)}`}
            hint={`${t(locale, "kg", "كجم")} · ${progress.toFixed(0)}% ${t(locale, "there", "أُنجز")}`}
          />
          <StatTile
            tone="amber"
            icon={<Flame className="size-4.5" />}
            label={t(locale, "Daily Calories", "السعرات اليومية")}
            value={analysis.recommendedDailyCalories > 0 ? analysis.recommendedDailyCalories : "—"}
            hint={`${analysis.recommendedProteinG}${t(locale, "g protein", "غ بروتين")}`}
          />
          <StatTile
            tone="sky"
            icon={<Droplets className="size-4.5" />}
            label={t(locale, "Water Today", "ماء اليوم")}
            value={`${waterToday}`}
            hint={`${t(locale, "L", "لتر")} / ${waterGoal} ${t(locale, "goal", "الهدف")}`}
          />
        </div>

        {/* -------------------------------------------------------- Rings --- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="flex flex-col items-center">
            <Donut value={progress} max={100} color="#10b981" label={`${progress.toFixed(0)}%`} sub={t(locale, "to goal", "للهدف")} />
            <p className="mt-3 text-sm font-semibold text-neutral-700">{t(locale, "Goal progress", "نحو الهدف")}</p>
          </Card>

          <Card className="flex flex-col items-center">
            <Donut value={waterToday} max={waterGoal} color="#0ea5e9" track="#e0f2fe" label={`${waterToday}${t(locale, "L", "ل")}`} sub={`/ ${waterGoal}`} />
            <div className="mt-3 flex items-center gap-2">
              {/* 44px targets — these were 32px, the hardest thing on the page
                  to hit accurately on a phone. */}
              <button
                type="button"
                onClick={() => addWater(-0.25)}
                aria-label={t(locale, "Remove 250ml", "اطرح 250 مل")}
                className="flex size-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-colors hover:border-sky-300 hover:text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-14 text-center text-sm font-semibold text-neutral-700">{t(locale, "Water", "ماء")}</span>
              <button
                type="button"
                onClick={() => {
                  addWater(0.25)
                  if (waterToday + 0.25 >= waterGoal) notify(t(locale, "Water goal reached! 💧", "وصلت لهدف الماء! 💧"))
                }}
                aria-label={t(locale, "Add 250ml", "أضف 250 مل")}
                className="flex size-11 items-center justify-center rounded-full bg-sky-500 text-white transition-colors hover:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </Card>

          <Card className="flex flex-col items-center">
            <Donut
              value={Math.min(100, (lostKg / Math.max(1, user.startWeightKg - user.targetWeightKg)) * 100)}
              max={100}
              color="#f59e0b"
              track="#fef3c7"
              label={`${lostKg.toFixed(1)}`}
              sub={t(locale, "kg lost", "كجم")}
            />
            <p className="mt-3 text-sm font-semibold text-neutral-700">{t(locale, "Lost so far", "المفقود حتى الآن")}</p>
          </Card>
        </div>

        {/* ------------------------------------------------ Chart + body ---- */}
        {/*
          Chart before the illustration on mobile: the chart answers "am I
          moving?", the avatar is encouragement. On desktop they sit side by
          side and the order stops mattering.
        */}
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <WeightChart logs={state.weightLogs} goalKg={Math.round(user.targetWeightKg * 10) / 10} />

          <Card className="flex flex-col items-center">
            <div className="flex w-full items-center justify-between">
              <p className="text-sm font-bold text-neutral-900">{t(locale, "Your Body", "جسمك")}</p>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                {t(locale, "BMI", "مؤشر")} {analysis.bmi.toFixed(1)}
              </span>
            </div>
            <BodyAvatar
              gender={user.gender === "female" ? "female" : "male"}
              weightKg={user.currentWeightKg}
              heightCm={user.heightCm}
              fullBody
              showLabel
              previousWeightKg={user.startWeightKg !== user.currentWeightKg ? user.startWeightKg : undefined}
              className="mt-2 w-full max-w-[200px]"
            />
          </Card>
        </div>

        {/* ----------------------------------------------------- Analysis --- */}
        {/*
          Was labelled "AI Analysis". lib/analysis.ts is a deterministic
          rule-based calculation and the project ships no AI dependency, so
          the label was claiming something the product does not do — on a
          clinically licensed brand, of all places.
        */}
        <div className="rounded-3xl border border-neutral-100 bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-100">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {t(locale, "Your analysis", "تحليل حالتك")}
          </p>
          <h2 className="mt-2 text-lg font-bold leading-snug">{locale === "ar" ? analysis.summaryAr : analysis.summaryEn}</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/80">{locale === "ar" ? analysis.motivationAr : analysis.motivationEn}</p>
        </div>

        {/* ------------------------------------------------- Quick links ---- */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[
            { href: "/dashboard/plan", icon: Apple, en: "My Plan", ar: "خطتي", sub: t(locale, "Today's meals", "وجبات اليوم") },
            { href: "/dashboard/sessions", icon: Calendar, en: "Sessions", ar: "الجلسات", sub: `${upcomingSessions} ${t(locale, "upcoming", "قادمة")}` },
            { href: "/dashboard/products", icon: ShoppingBag, en: "Shop", ar: "تسوّق", sub: t(locale, "Healthy products", "منتجات صحية") },
            { href: "/dashboard/settings", icon: Target, en: "My Goal", ar: "هدفي", sub: t(locale, "Profile & goal", "الملف والهدف") },
          ].map((a) => {
            const Icon = a.icon
            return (
              <Link
                key={a.href}
                href={a.href}
                className="group rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md sm:p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100">
                    <Icon className="size-4.5" />
                  </span>
                  <ArrowUpRight className="size-4 text-neutral-300 transition group-hover:text-emerald-600 rtl:-scale-x-100" />
                </div>
                <p className="mt-3 font-bold text-neutral-900">{locale === "ar" ? a.ar : a.en}</p>
                <p className="truncate text-xs text-neutral-400">{a.sub}</p>
              </Link>
            )
          })}
        </div>

        {/* --------------------------------------------- Orders + support --- */}
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <Card padded={false} className="p-5 sm:p-6">
            <CardHeader
              title={t(locale, "Recent Orders", "آخر طلباتك")}
              action={
                state.orders.length > 0 ? (
                  <Link href="/dashboard/orders" className="text-sm font-semibold text-emerald-600 hover:underline">
                    {t(locale, "View all", "عرض الكل")}
                  </Link>
                ) : undefined
              }
            />
            {state.orders.length === 0 ? (
              <EmptyState
                icon={<Package className="size-5" />}
                title={t(locale, "No orders yet", "لا توجد طلبات بعد")}
                description={t(
                  locale,
                  "Snacks, drinks and supplements picked by the nutrition team — delivered across the UAE.",
                  "سناكس ومشروبات ومكمّلات مختارة من فريق التغذية، وتوصيل في كل الإمارات.",
                )}
                action={
                  <LocaleLink href="/shop" className="inline-flex min-h-12 items-center rounded-2xl bg-emerald-600 px-5 text-sm font-bold text-white transition-colors hover:bg-emerald-700">
                    {t(locale, "Browse the shop", "تصفّح المتجر")}
                  </LocaleLink>
                }
                className="border-0 py-8"
              />
            ) : (
              <ul className="space-y-3">
                {state.orders.slice(0, 3).map((o) => (
                  <li key={o.id}>
                    <Link
                      href={`/dashboard/orders/${o.id}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-100 p-3 transition-colors hover:bg-neutral-50"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-neutral-900">#{o.id.slice(-4)}</p>
                        <p className="truncate text-xs text-neutral-400">
                          {(o.date || "").slice(0, 10)} · {o.items.length} {t(locale, "items", "عناصر")}
                        </p>
                      </div>
                      <span className="shrink-0 font-bold tabular-nums text-emerald-700">${o.total.toFixed(2)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <a
            href={WHATSAPP_SUPPORT}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col justify-between rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-600 to-emerald-500 p-6 text-white shadow-sm transition hover:shadow-md"
          >
            <div>
              <p className="text-lg font-extrabold">{t(locale, "Need help?", "محتاج مساعدة؟")}</p>
              <p className="mt-1 text-sm text-white/80">
                {t(locale, "Chat with our nutrition team on WhatsApp.", "تواصل مع فريق التغذية عبر واتساب.")}
              </p>
            </div>
            <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-sm font-bold backdrop-blur">
              <MessageCircle className="size-4" aria-hidden="true" />
              {t(locale, "Message us", "راسلنا الآن")}
            </span>
          </a>
        </div>
      </div>
    </DashboardShell>
  )
}
