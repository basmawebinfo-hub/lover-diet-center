"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Flame, Beef, Wheat, Droplet, ChefHat, ClipboardList, MessageCircle, RefreshCw, Loader2, Utensils, Target, Sparkles,
} from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { useApp } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"
import { WHATSAPP_SUPPORT } from "@/lib/site"
import { useToast } from "@/components/ui/toast"
import type { DoctorPlan, PlanItem, Meal } from "@/lib/types"

const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const DAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
const MEAL_ORDER: Meal["mealType"][] = ["breakfast", "lunch", "dinner", "snack"]
const MEAL_LABEL: Record<Meal["mealType"], { en: string; ar: string; icon: string }> = {
  breakfast: { en: "Breakfast", ar: "الإفطار", icon: "🍳" },
  lunch: { en: "Lunch", ar: "الغداء", icon: "🥗" },
  dinner: { en: "Dinner", ar: "العشاء", icon: "🍽️" },
  snack: { en: "Snack", ar: "وجبة خفيفة", icon: "🥜" },
}

type Totals = { calories: number; protein: number; carbs: number; fat: number; count: number }

function sumMacros(items: PlanItem[]): Totals {
  return items.reduce<Totals>(
    (acc, it) => ({
      calories: acc.calories + (it.meal.calories || 0),
      protein: acc.protein + (it.meal.protein || 0),
      carbs: acc.carbs + (it.meal.carbs || 0),
      fat: acc.fat + (it.meal.fat || 0),
      count: acc.count + 1,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 },
  )
}

export default function PlanPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const { state, refreshPlan } = useApp()
  const { notify } = useToast()
  const user = state.user
  const plan = state.doctorPlan

  const [refreshing, setRefreshing] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (state.authChecked && !user) router.replace("/onboarding")
  }, [state.authChecked, user, router])

  // On every mount, pull the latest plan straight from the DB so a plan edit
  // an admin made after the user's initial hydration is picked up. If the
  // fetch fails we keep whatever the store already had (stale is better than
  // blank in this case).
  const refresh = useCallback(async (isInitial: boolean) => {
    if (!user) return
    if (isInitial) setInitialLoad(true)
    else setRefreshing(true)
    setError(null)
    try {
      await refreshPlan()
    } catch {
      setError(t(locale, "Could not load your plan. Please try again.", "تعذّر تحميل خطتك. يرجى المحاولة مرة أخرى."))
    } finally {
      setInitialLoad(false)
      setRefreshing(false)
    }
  }, [user, refreshPlan, locale])

  useEffect(() => {
    if (state.authChecked && user) {
      refresh(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.authChecked, user?.id])

  async function onManualRefresh() {
    await refresh(false)
    notify(t(locale, "Plan refreshed", "تم تحديث الخطة"), "success")
  }

  if (!state.authChecked && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6faf8]">
        <div className="size-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
      </div>
    )
  }
  if (!user) return null

  // ==== Loading state (first fetch) ====
  if (initialLoad && !plan) {
    return (
      <DashboardShell>
        <MobileNav />
        <div className="mx-auto max-w-5xl space-y-6 pb-24 lg:pb-0">
          <header>
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t(locale, "My Plan", "خطتي")}</h1>
            <p className="mt-1 text-sm text-neutral-500">{t(locale, "Loading your latest plan...", "جارٍ تحميل آخر نسخة من خطتك...")}</p>
          </header>
          <SkeletonPlan />
        </div>
      </DashboardShell>
    )
  }

  // ==== Error state ====
  if (error && !plan) {
    return (
      <DashboardShell>
        <MobileNav />
        <div className="mx-auto max-w-2xl pb-24 lg:pb-0">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t(locale, "My Plan", "خطتي")}</h1>
          </header>
          <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
            <h2 className="text-lg font-bold text-red-700">{t(locale, "Could not load your plan", "تعذّر تحميل خطتك")}</h2>
            <p className="mt-2 text-sm text-neutral-600">{error}</p>
            <button
              type="button"
              onClick={() => refresh(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-lime-700 px-5 py-3 text-sm font-bold text-white hover:bg-lime-800"
            >
              <RefreshCw className="size-4" /> {t(locale, "Try again", "إعادة المحاولة")}
            </button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  // ==== Empty state (no plan yet) ====
  if (!plan) {
    return (
      <DashboardShell>
        <MobileNav />
        <div className="mx-auto max-w-2xl pb-24 lg:pb-0">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t(locale, "My Plan", "خطتي")}</h1>
          </header>
          <div className="flex flex-col items-center rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-10 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <ClipboardList className="size-8" />
            </span>
            <h2 className="mt-5 text-xl font-extrabold text-neutral-900">
              {t(locale, "Your plan is on the way", "خطتك في الطريق")}
            </h2>
            <p className="mt-2 max-w-md text-sm text-neutral-500">
              {t(
                locale,
                "Our nutrition team is preparing a personalized plan for you. Book a consultation to get started faster.",
                "فريق التغذية لدينا يجهّز لك خطة مخصصة. احجز استشارة لتبدأ أسرع.",
              )}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={WHATSAPP_SUPPORT}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
              >
                <MessageCircle className="size-4" /> {t(locale, "Book a consultation", "احجز استشارة")}
              </a>
              <button
                onClick={() => router.push("/dashboard/sessions")}
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-bold text-neutral-700 hover:bg-neutral-50"
              >
                {t(locale, "View sessions", "عرض الجلسات")}
              </button>
            </div>
            <button
              onClick={onManualRefresh}
              disabled={refreshing}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-600 disabled:opacity-60"
            >
              {refreshing ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
              {t(locale, "Check again", "تحقق مجدداً")}
            </button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  // ==== Loaded plan ====
  return <PlanView plan={plan} locale={locale} refreshing={refreshing} onRefresh={onManualRefresh} />
}

// ============================================================================
// PlanView: render the full plan once we know it exists.
// ============================================================================
function PlanView({
  plan, locale, refreshing, onRefresh,
}: {
  plan: DoctorPlan
  locale: "en" | "ar"
  refreshing: boolean
  onRefresh: () => void
}) {
  // Group plan items by day; within each day, sort by meal type in canonical
  // order (breakfast -> lunch -> dinner -> snack).
  const byDay = useMemo(() => {
    const map: Record<number, PlanItem[]> = {}
    for (const item of plan.planItems) {
      if (!map[item.dayOfWeek]) map[item.dayOfWeek] = []
      map[item.dayOfWeek].push(item)
    }
    for (const day of Object.keys(map)) {
      const d = Number(day)
      map[d].sort(
        (a, b) => MEAL_ORDER.indexOf(a.meal.mealType) - MEAL_ORDER.indexOf(b.meal.mealType),
      )
    }
    return map
  }, [plan.planItems])

  // Compute per-day totals + week total from the ACTUAL plan items (not the
  // theoretical daily_calories macro split that the admin sets on the plan).
  const dailyTotals = useMemo(() => {
    const totals: Record<number, Totals> = {}
    for (let d = 0; d < 7; d++) {
      totals[d] = sumMacros(byDay[d] ?? [])
    }
    return totals
  }, [byDay])

  const weekTotal = useMemo(() => sumMacros(plan.planItems), [plan.planItems])
  const daysWithMeals = Object.values(byDay).filter((items) => items.length > 0).length
  const avgDaily: Totals =
    daysWithMeals > 0
      ? {
          calories: Math.round(weekTotal.calories / daysWithMeals),
          protein: Math.round(weekTotal.protein / daysWithMeals),
          carbs: Math.round(weekTotal.carbs / daysWithMeals),
          fat: Math.round(weekTotal.fat / daysWithMeals),
          count: Math.round(weekTotal.count / daysWithMeals),
        }
      : { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 }

  // The 0-based JS Date.getDay() returns 0 for Sunday, matching our schema.
  const todayIdx = new Date().getDay()

  return (
    <DashboardShell>
      <MobileNav />
      <div className="mx-auto max-w-5xl space-y-6 pb-24 lg:pb-0">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t(locale, "My Plan", "خطتي")}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {t(locale, "Designed by", "إعداد")} <span className="font-semibold text-neutral-700">{plan.doctorName || t(locale, "your nutritionist", "أخصائي التغذية")}</span>
              {plan.startDate && (
                <>
                  {" · "}
                  {new Date(plan.startDate).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  {plan.endDate && ` → ${new Date(plan.endDate).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-600 hover:border-lime-300 hover:text-lime-700 disabled:opacity-60"
          >
            {refreshing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            {refreshing ? t(locale, "Refreshing...", "جارٍ التحديث...") : t(locale, "Refresh", "تحديث")}
          </button>
        </header>

        {/* Doctor's notes */}
        {(plan.notesEn || plan.notesAr) && (
          <section className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <ChefHat className="size-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  {t(locale, "Doctor's notes", "ملاحظات الطبيب")}
                </p>
                <p className="mt-1 whitespace-pre-line text-base font-semibold text-neutral-900">
                  {locale === "ar" ? plan.notesAr || plan.notesEn : plan.notesEn || plan.notesAr}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Prescribed targets */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Target className="size-4 text-lime-700" />
            <h2 className="text-lg font-bold text-neutral-900">{t(locale, "Daily targets (prescribed)", "الأهداف اليومية (الموصوفة)")}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MacroCard icon={<Flame className="size-4" />} label={t(locale, "Calories", "السعرات")} value={`${plan.dailyCalories || 0}`} unit={t(locale, "kcal/day", "سعرة/يوم")} tone="orange" />
            <MacroCard icon={<Beef className="size-4" />} label={t(locale, "Protein", "بروتين")} value={`${Math.round((plan.dailyCalories || 0) * 0.3 / 4)}`} unit={`${t(locale, "g/day", "غ/يوم")} (30%)`} tone="teal" />
            <MacroCard icon={<Wheat className="size-4" />} label={t(locale, "Carbs", "كربوهيدرات")} value={`${Math.round((plan.dailyCalories || 0) * 0.45 / 4)}`} unit={`${t(locale, "g/day", "غ/يوم")} (45%)`} tone="yellow" />
            <MacroCard icon={<Droplet className="size-4" />} label={t(locale, "Water", "ماء")} value={`${plan.waterLiters || 0}`} unit={t(locale, "L/day", "لتر/يوم")} tone="blue" />
          </div>
        </section>

        {/* Actual vs prescribed */}
        {plan.planItems.length > 0 && (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="size-4 text-lime-700" />
              <h2 className="text-lg font-bold text-neutral-900">{t(locale, "Actual (from the meals)", "الفعلي (من الوجبات)")}</h2>
            </div>
            <p className="mb-3 text-xs text-neutral-500">
              {t(locale, "Averaged over days with meals assigned.", "المتوسط على الأيام التي بها وجبات مُسندة.")}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MacroCard icon={<Flame className="size-4" />} label={t(locale, "Calories", "السعرات")} value={`${avgDaily.calories}`} unit={t(locale, "kcal avg", "سعرة متوسط")} tone="orange" delta={avgDaily.calories - (plan.dailyCalories || 0)} />
              <MacroCard icon={<Beef className="size-4" />} label={t(locale, "Protein", "بروتين")} value={`${avgDaily.protein}`} unit={t(locale, "g avg", "غ متوسط")} tone="teal" />
              <MacroCard icon={<Wheat className="size-4" />} label={t(locale, "Carbs", "كربوهيدرات")} value={`${avgDaily.carbs}`} unit={t(locale, "g avg", "غ متوسط")} tone="yellow" />
              <MacroCard icon={<Droplet className="size-4" />} label={t(locale, "Fat", "دهون")} value={`${avgDaily.fat}`} unit={t(locale, "g avg", "غ متوسط")} tone="red" />
            </div>
          </section>
        )}

        {/* Week overview */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <Utensils className="size-4 text-lime-700" />
            <h2 className="text-lg font-bold text-neutral-900">{t(locale, "Weekly meal plan", "خطة الوجبات الأسبوعية")}</h2>
          </div>
          {plan.planItems.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-neutral-200 py-10 text-center">
              <p className="text-sm font-semibold text-neutral-500">{t(locale, "This plan has no meals assigned yet.", "لا توجد وجبات مُسندة في هذه الخطة بعد.")}</p>
              <p className="mt-1 text-xs text-neutral-400">{t(locale, "Your nutritionist will fill it in soon.", "سيقوم أخصائي التغذية بتعبئتها قريباً.")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                const items = byDay[day] ?? []
                if (items.length === 0) return null
                const totals = dailyTotals[day]
                const isToday = day === todayIdx
                return (
                  <DayCard
                    key={day}
                    day={day}
                    isToday={isToday}
                    items={items}
                    totals={totals}
                    locale={locale}
                  />
                )
              })}
            </div>
          )}
        </section>

        {/* Weekly totals */}
        {plan.planItems.length > 0 && (
          <section className="rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900">{t(locale, "Weekly totals", "الإجمالي الأسبوعي")}</h2>
            <p className="mt-1 text-sm text-neutral-500">
              {t(locale, "Sum of all meals in your plan.", "مجموع كل وجبات خطتك.")}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SmallStat label={t(locale, "Meals", "وجبات")} value={`${weekTotal.count}`} />
              <SmallStat label={t(locale, "Calories", "سعرات")} value={`${weekTotal.calories}`} suffix={t(locale, "kcal", "سعرة")} />
              <SmallStat label={t(locale, "Protein", "بروتين")} value={`${weekTotal.protein}`} suffix={t(locale, "g", "غ")} />
              <SmallStat label={t(locale, "Carbs", "كربوهيدرات")} value={`${weekTotal.carbs}`} suffix={t(locale, "g", "غ")} />
            </div>
          </section>
        )}
      </div>
    </DashboardShell>
  )
}

// ============================================================================
// DayCard
// ============================================================================
function DayCard({
  day, isToday, items, totals, locale,
}: {
  day: number
  isToday: boolean
  items: PlanItem[]
  totals: Totals
  locale: "en" | "ar"
}) {
  const dayName = locale === "ar" ? DAYS_AR[day] : DAYS_EN[day]
  return (
    <div className={cn(
      "rounded-2xl border bg-white p-4 shadow-sm sm:p-5",
      isToday ? "border-lime-300 ring-2 ring-lime-100" : "border-neutral-100",
    )}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-neutral-900">{dayName}</h3>
          {isToday && (
            <span className="rounded-full bg-lime-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-lime-700">
              {t(locale, "Today", "اليوم")}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <MiniPill label={`${totals.calories}`} unit={t(locale, "kcal", "سعرة")} tone="orange" />
          <MiniPill label={`P ${totals.protein}`} unit={t(locale, "g", "غ")} tone="teal" />
          <MiniPill label={`C ${totals.carbs}`} unit={t(locale, "g", "غ")} tone="yellow" />
          <MiniPill label={`F ${totals.fat}`} unit={t(locale, "g", "غ")} tone="red" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <MealCard key={item.id} item={item} locale={locale} />
        ))}
      </div>
    </div>
  )
}

function MealCard({ item, locale }: { item: PlanItem; locale: "en" | "ar" }) {
  const meta = MEAL_LABEL[item.meal.mealType]
  const label = locale === "ar" ? meta.ar : meta.en
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50 transition hover:border-lime-200 hover:shadow-sm">
      <div className="relative h-24 w-full overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-50">
        {item.meal.imageUrl ? (
          <Image src={item.meal.imageUrl} alt={locale === "ar" ? item.meal.nameAr : item.meal.nameEn} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-4xl">{meta.icon}</div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 shadow-sm rtl:left-auto rtl:right-2">
          {label}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="line-clamp-2 text-sm font-semibold text-neutral-900">
          {locale === "ar" ? item.meal.nameAr : item.meal.nameEn}
        </p>
        {(locale === "ar" ? item.meal.descriptionAr : item.meal.descriptionEn) && (
          <p className="line-clamp-2 text-xs text-neutral-500">
            {locale === "ar" ? item.meal.descriptionAr : item.meal.descriptionEn}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-1 pt-1 text-[10px] font-semibold">
          <span className="rounded bg-orange-100 px-1.5 py-0.5 text-orange-700">
            {item.meal.calories} {t(locale, "kcal", "سعرة")}
          </span>
          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-700">P {item.meal.protein}g</span>
          <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-yellow-700">C {item.meal.carbs}g</span>
          <span className="rounded bg-red-100 px-1.5 py-0.5 text-red-700">F {item.meal.fat}g</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Reusable presentational bits
// ============================================================================
function MacroCard({
  icon, label, value, unit, tone, delta,
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
  tone: "orange" | "teal" | "yellow" | "blue" | "red"
  delta?: number
}) {
  const toneCls: Record<string, string> = {
    orange: "bg-orange-50 text-orange-700",
    teal: "bg-emerald-50 text-emerald-700",
    yellow: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
  }
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className={cn("flex size-8 items-center justify-center rounded-lg", toneCls[tone])}>
          {icon}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</span>
      </div>
      <p className="mt-2 text-xl font-black text-neutral-900">
        {value} <span className="text-sm font-normal text-neutral-500">{unit}</span>
      </p>
      {delta !== undefined && delta !== 0 && (
        <p className={cn("mt-0.5 text-[11px] font-semibold", delta > 0 ? "text-orange-600" : "text-emerald-700")}>
          {delta > 0 ? "+" : ""}{delta} vs prescribed
        </p>
      )}
    </div>
  )
}

function SmallStat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-neutral-900">
        {value}{suffix ? <span className="ms-1 text-xs font-normal text-neutral-500">{suffix}</span> : null}
      </p>
    </div>
  )
}

function MiniPill({ label, unit, tone }: { label: string; unit: string; tone: "orange" | "teal" | "yellow" | "red" }) {
  const toneCls: Record<string, string> = {
    orange: "bg-orange-100 text-orange-700",
    teal: "bg-emerald-100 text-emerald-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
  }
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", toneCls[tone])}>
      {label} <span className="font-normal">{unit}</span>
    </span>
  )
}

function SkeletonPlan() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-neutral-100" />
        ))}
      </div>
      <div className="h-28 animate-pulse rounded-3xl bg-neutral-100" />
      <div className="h-64 animate-pulse rounded-2xl bg-neutral-100" />
      <div className="h-64 animate-pulse rounded-2xl bg-neutral-100" />
    </div>
  )
}
