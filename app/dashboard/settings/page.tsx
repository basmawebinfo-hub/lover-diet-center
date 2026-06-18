"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Save, User as UserIcon, Target, ShieldCheck, Camera } from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { BodyAvatar } from "@/components/body-avatar"
import { useApp } from "@/lib/store"
import { analyzeUser, buildAvatarConfig, idealWeightKg } from "@/lib/analysis"
import type { ActivityLevel, Gender, GoalType, User } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"
import { useToast } from "@/components/ui/toast"

const goalCopy: Record<GoalType, { en: string; ar: string; icon: string }> = {
  lose_weight: { en: "Lose Weight", ar: "إنقاص الوزن", icon: "🔥" },
  tone: { en: "Tone & Sculpt", ar: "شد ونحت", icon: "💎" },
  gain_muscle: { en: "Build Muscle", ar: "بناء العضلات", icon: "💪" },
  maintain: { en: "Stay Healthy", ar: "الحفاظ على الصحة", icon: "⚖️" },
}

const activityCopy: Record<ActivityLevel, { en: string; ar: string }> = {
  sedentary: { en: "Sedentary", ar: "خامل" },
  light: { en: "Light", ar: "خفيف" },
  moderate: { en: "Moderate", ar: "متوسط" },
  active: { en: "Active", ar: "نشط" },
  very_active: { en: "Very Active", ar: "نشط جداً" },
}

type Tab = "profile" | "goal" | "account"

export default function SettingsPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const { notify } = useToast()
  const { state, setUser, resetOnboarding } = useApp()
  const user = state.user

  const [tab, setTab] = useState<Tab>("profile")
  const [draft, setDraft] = useState<User | null>(user)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (state.hydrated && !user) router.replace("/onboarding")
  }, [state.hydrated, user, router])

  useEffect(() => { setDraft(user) }, [user])

  if (!user || !draft) return null

  const set = <K extends keyof User>(k: K, v: User[K]) => {
    setDraft((p) => (p ? { ...p, [k]: v } : p))
    setDirty(true)
  }

  const analysis = analyzeUser({
    age: draft.age, gender: draft.gender, heightCm: draft.heightCm,
    startWeightKg: draft.startWeightKg, currentWeightKg: draft.currentWeightKg,
    goal: draft.goal, activityLevel: draft.activityLevel,
  }, locale)

  const targetWeight = idealWeightKg(draft.heightCm, draft.gender)

  function save() {
    if (!draft) return
    const nextAvatar = buildAvatarConfig({
      gender: draft.gender, heightCm: draft.heightCm,
      currentWeightKg: draft.currentWeightKg, startWeightKg: draft.startWeightKg, goal: draft.goal,
    }, state.weightLogs)
    setUser({ ...draft, avatarConfig: nextAvatar })
    setDirty(false)
    notify(t(locale, "Changes saved", "تم حفظ التغييرات"), "success")
  }

  const initials = (draft.nameEn || "U").trim().charAt(0).toUpperCase()

  const tabs: { id: Tab; label: string; icon: typeof UserIcon }[] = [
    { id: "profile", label: t(locale, "Profile", "الملف"), icon: UserIcon },
    { id: "goal", label: t(locale, "Goal & Body", "الهدف والجسم"), icon: Target },
    { id: "account", label: t(locale, "Account", "الحساب"), icon: ShieldCheck },
  ]

  return (
    <DashboardShell>
      <MobileNav />
      <div className="mx-auto max-w-5xl space-y-6 pb-28 lg:pb-0">

        {/* Profile header (no banner) */}
        <section className="flex flex-col gap-4 rounded-3xl border border-neutral-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-lime-100 to-lime-50 text-3xl font-black text-lime-700 shadow-sm ring-1 ring-lime-100">
                {initials}
              </div>
              <button
                type="button"
                onClick={() => notify(t(locale, "Photo upload coming soon", "رفع الصورة قريباً"), "success")}
                className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full bg-lime-600 text-white shadow ring-2 ring-white transition hover:bg-lime-700 rtl:left-0 rtl:right-auto"
                aria-label={t(locale, "Change photo", "تغيير الصورة")}
              >
                <Camera className="size-3.5" />
              </button>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-neutral-900 sm:text-2xl">{draft.nameEn}</h1>
              <p className="text-sm text-neutral-500">{draft.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={!dirty}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-sm font-bold transition",
              dirty
                ? "bg-lime-700 text-white shadow-sm hover:bg-lime-800"
                : "cursor-not-allowed bg-neutral-100 text-neutral-400"
            )}
          >
            <Save className="size-4" />
            {dirty ? t(locale, "Save changes", "حفظ التغييرات") : t(locale, "Saved", "محفوظ")}
          </button>
        </section>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto rounded-2xl border border-neutral-100 bg-white p-1.5">
          {tabs.map((tb) => {
            const Icon = tb.icon
            const active = tab === tb.id
            return (
              <button
                key={tb.id}
                type="button"
                onClick={() => setTab(tb.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                  active ? "bg-lime-50 text-lime-700" : "text-neutral-500 hover:bg-neutral-50"
                )}
              >
                <Icon className="size-4" />
                {tb.label}
              </button>
            )
          })}
        </div>

        {/* PROFILE TAB */}
        {tab === "profile" && (
          <section className="space-y-4">
            <div className="rounded-3xl border border-neutral-100 bg-white p-6">
              <h2 className="text-lg font-bold text-neutral-900">{t(locale, "Personal info", "المعلومات الشخصية")}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <FieldText label={t(locale, "Full name", "الاسم الكامل")} value={draft.nameEn} onChange={(v) => set("nameEn", v)} />
                <FieldText label={t(locale, "Email", "البريد الإلكتروني")} value={draft.email} onChange={(v) => set("email", v)} type="email" />
                <FieldNumber label={t(locale, "Age", "العمر")} value={draft.age} onChange={(v) => set("age", v)} suffix={t(locale, "years", "سنة")} />
                <FieldNumber label={t(locale, "Height", "الطول")} value={draft.heightCm} onChange={(v) => set("heightCm", v)} suffix={t(locale, "cm", "سم")} />
              </div>

              {/* Gender selector */}
              <p className="mt-6 mb-2 text-sm font-semibold text-neutral-700">{t(locale, "Gender", "الجنس")}</p>
              <div className="grid max-w-sm grid-cols-2 gap-3">
                {([
                  { v: "male" as Gender, en: "Male", ar: "رجل", icon: "👨" },
                  { v: "female" as Gender, en: "Female", ar: "امرأة", icon: "👩" },
                ]).map((g) => {
                  const active = draft.gender === g.v
                  return (
                    <button
                      key={g.v}
                      type="button"
                      onClick={() => set("gender", g.v)}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-2xl border-2 p-3.5 text-sm font-semibold transition",
                        active ? "border-lime-500 bg-lime-50 text-lime-700" : "border-neutral-200 text-neutral-600 hover:border-lime-300"
                      )}
                    >
                      <span className="text-xl">{g.icon}</span>
                      {locale === "ar" ? g.ar : g.en}
                    </button>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* GOAL & BODY TAB */}
        {tab === "goal" && (
          <section className="space-y-4">
            {/* Avatar transformation */}
            <div className="rounded-3xl border border-neutral-100 bg-white p-6">
              <h2 className="text-lg font-bold text-neutral-900">{t(locale, "Your transformation", "تحوّلك")}</h2>
              <p className="mt-1 text-sm text-neutral-500">{t(locale, "This is you at the start, now, and at your goal weight.", "هذا أنت في البداية، والآن، وعند وزنك المستهدف.")}</p>
              <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-6">
                <BodyStage gender={draft.gender} weightKg={draft.startWeightKg} heightCm={draft.heightCm} label={t(locale, "Start", "البداية")} value={`${draft.startWeightKg.toFixed(1)} ${t(locale, "kg", "كجم")}`} />
                <BodyStage gender={draft.gender} weightKg={draft.currentWeightKg} heightCm={draft.heightCm} label={t(locale, "Now", "الآن")} value={`${draft.currentWeightKg.toFixed(1)} ${t(locale, "kg", "كجم")}`} highlight />
                <BodyStage gender={draft.gender} weightKg={targetWeight} heightCm={draft.heightCm} label={t(locale, "Goal", "الهدف")} value={`${targetWeight.toFixed(1)} ${t(locale, "kg", "كجم")}`} />
              </div>
            </div>

            {/* Goal selector */}
            <div className="rounded-3xl border border-neutral-100 bg-white p-6">
              <h2 className="text-lg font-bold text-neutral-900">{t(locale, "Primary goal", "الهدف الأساسي")}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(Object.keys(goalCopy) as GoalType[]).map((g) => {
                  const active = draft.goal === g
                  return (
                    <button key={g} type="button" onClick={() => set("goal", g)}
                      className={cn("flex items-center gap-3 rounded-2xl border-2 p-4 text-start transition", active ? "border-lime-500 bg-lime-50" : "border-neutral-200 hover:border-lime-300")}>
                      <span className="text-2xl">{goalCopy[g].icon}</span>
                      <span className="font-semibold text-neutral-900">{locale === "ar" ? goalCopy[g].ar : goalCopy[g].en}</span>
                    </button>
                  )
                })}
              </div>

              <p className="mt-6 mb-2 text-sm font-semibold text-neutral-700">{t(locale, "Activity level", "مستوى النشاط")}</p>
              <select value={draft.activityLevel} onChange={(e) => set("activityLevel", e.target.value as ActivityLevel)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-semibold text-neutral-900 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-100">
                {(Object.keys(activityCopy) as ActivityLevel[]).map((a) => (
                  <option key={a} value={a}>{locale === "ar" ? activityCopy[a].ar : activityCopy[a].en}</option>
                ))}
              </select>

              <div className="mt-4">
                <FieldNumber label={t(locale, "Target weight", "الوزن المستهدف")} value={draft.targetWeightKg} onChange={(v) => set("targetWeightKg", v)} suffix={t(locale, "kg", "كجم")} />
              </div>
            </div>

            {/* AI summary */}
            <div className="rounded-3xl border border-neutral-100 bg-gradient-to-br from-lime-50 to-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-lime-700">{t(locale, "AI Summary", "ملخص الذكاء الاصطناعي")}</p>
              <h2 className="mt-2 text-xl font-bold text-neutral-900">{locale === "ar" ? analysis.summaryAr : analysis.summaryEn}</h2>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Mini label={t(locale, "Daily kcal", "سعرات يومية")} value={`${analysis.recommendedDailyCalories}`} />
                <Mini label={t(locale, "Protein", "بروتين")} value={`${analysis.recommendedProteinG}${t(locale, "g", "غ")}`} />
                <Mini label={t(locale, "Carbs", "كربوهيدرات")} value={`${analysis.recommendedCarbsG}${t(locale, "g", "غ")}`} />
                <Mini label={t(locale, "Fat", "دهون")} value={`${analysis.recommendedFatG}${t(locale, "g", "غ")}`} />
              </div>
            </div>
          </section>
        )}

        {/* ACCOUNT TAB */}
        {tab === "account" && (
          <section className="space-y-4">
            <div className="rounded-3xl border border-neutral-100 bg-white p-6">
              <h2 className="text-lg font-bold text-neutral-900">{t(locale, "Account settings", "إعدادات الحساب")}</h2>
              <div className="mt-5 space-y-3">
                <RowAction label={t(locale, "Change password", "تغيير كلمة المرور")} hint={t(locale, "Coming soon", "قريباً")} onClick={() => notify(t(locale, "Password change coming soon", "تغيير كلمة المرور قريباً"))} />
                <RowAction label={t(locale, "Notification preferences", "تفضيلات الإشعارات")} hint={t(locale, "Coming soon", "قريباً")} onClick={() => notify(t(locale, "Notifications coming soon", "الإشعارات قريباً"))} />
              </div>
            </div>

            <div className="rounded-3xl border border-red-100 bg-red-50/40 p-6">
              <h2 className="text-lg font-bold text-red-700">{t(locale, "Danger zone", "منطقة الخطر")}</h2>
              <p className="mt-1 text-sm text-neutral-500">{t(locale, "This resets your local profile and progress on this device.", "هذا يعيد ضبط ملفك وتقدّمك على هذا الجهاز.")}</p>
              <button
                type="button"
                onClick={() => {
                  if (confirm(t(locale, "Reset your profile and start over?", "إعادة ضبط ملفك والبدء من جديد؟"))) {
                    resetOnboarding()
                    router.replace("/onboarding")
                  }
                }}
                className="mt-4 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                {t(locale, "Reset profile", "إعادة ضبط الملف")}
              </button>
            </div>
          </section>
        )}
      </div>
    </DashboardShell>
  )
}

function FieldText({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-neutral-700">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-900 outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100" />
    </div>
  )
}

function FieldNumber({ label, value, onChange, suffix }: { label: string; value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-neutral-700">{label}</label>
      <div className="flex items-center rounded-xl border border-neutral-200 bg-white focus-within:border-lime-400 focus-within:ring-2 focus-within:ring-lime-100">
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full bg-transparent px-4 py-2.5 text-sm text-neutral-900 outline-none" />
        {suffix && <span className="px-3 text-xs font-medium text-neutral-400">{suffix}</span>}
      </div>
    </div>
  )
}

function RowAction({ label, hint, onClick }: { label: string; hint: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50/50 px-4 py-3.5 text-start transition hover:border-lime-200 hover:bg-lime-50/40">
      <span className="text-sm font-semibold text-neutral-800">{label}</span>
      <span className="text-xs text-neutral-400">{hint}</span>
    </button>
  )
}

function BodyStage({ gender, weightKg, heightCm, label, value, highlight }: {
  gender: "male" | "female"; weightKg: number; heightCm: number; label: string; value: string; highlight?: boolean
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2 rounded-2xl p-2 transition sm:gap-3 sm:p-4", highlight ? "bg-lime-50 ring-2 ring-lime-300" : "bg-neutral-50")}>
      <BodyAvatar gender={gender} weightKg={weightKg} heightCm={heightCm} fullBody showLabel={false} className="w-full" />
      <div className="text-center">
        <p className={cn("text-xs font-semibold uppercase tracking-wider", highlight ? "text-lime-700" : "text-neutral-500")}>{label}</p>
        <p className="mt-0.5 text-base font-bold text-neutral-900 sm:text-lg">{value}</p>
      </div>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white bg-white/60 p-3 text-center">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-neutral-900">{value}</p>
    </div>
  )
}
