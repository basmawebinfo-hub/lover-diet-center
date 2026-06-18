"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Save } from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { Avatar } from "@/components/avatar"
import { AvatarComparison } from "@/components/avatar"
import { useApp } from "@/lib/store"
import { analyzeUser, buildAvatarConfig, idealWeightKg } from "@/lib/analysis"
import type { ActivityLevel, GoalType, User } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"

const goalCopy: Record<GoalType, { en: string; ar: string }> = {
  lose_weight: { en: "Lose Weight", ar: "إنقاص الوزن" },
  tone: { en: "Tone & Sculpt", ar: "شد ونحت" },
  gain_muscle: { en: "Build Muscle", ar: "بناء العضلات" },
  maintain: { en: "Stay Healthy", ar: "الحفاظ على الصحة" },
}

const activityCopy: Record<ActivityLevel, { en: string; ar: string }> = {
  sedentary: { en: "Sedentary", ar: "خامل" },
  light: { en: "Light", ar: "خفيف" },
  moderate: { en: "Moderate", ar: "متوسط" },
  active: { en: "Active", ar: "نشط" },
  very_active: { en: "Very Active", ar: "نشط جداً" },
}

export default function SettingsPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const { state, setUser } = useApp()
  const user = state.user

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<User | null>(user)

  useEffect(() => {
    if (!user) router.replace("/onboarding")
  }, [user, router])

  useEffect(() => {
    setDraft(user)
  }, [user])

  if (!user || !draft) return null

  const analysis = analyzeUser(
    {
      age: draft.age,
      gender: draft.gender,
      heightCm: draft.heightCm,
      startWeightKg: draft.startWeightKg,
      currentWeightKg: draft.currentWeightKg,
      goal: draft.goal,
      activityLevel: draft.activityLevel,
    },
    locale
  )

  const startingConfig = buildAvatarConfig(
    {
      gender: draft.gender,
      heightCm: draft.heightCm,
      currentWeightKg: draft.startWeightKg,
      startWeightKg: draft.startWeightKg,
      goal: draft.goal,
    },
    []
  )
  const currentConfig = buildAvatarConfig(
    {
      gender: draft.gender,
      heightCm: draft.heightCm,
      currentWeightKg: draft.currentWeightKg,
      startWeightKg: draft.startWeightKg,
      goal: draft.goal,
    },
    state.weightLogs
  )
  const targetWeight = idealWeightKg(draft.heightCm, draft.gender)
  const targetConfig = buildAvatarConfig(
    {
      gender: draft.gender,
      heightCm: draft.heightCm,
      currentWeightKg: targetWeight,
      startWeightKg: draft.startWeightKg,
      goal: draft.goal,
    },
    []
  )

  const progress = (() => {
    if (draft.goal === "gain_muscle") {
      const total = draft.targetWeightKg - draft.startWeightKg
      if (total <= 0) return 100
      return Math.max(0, Math.min(100, ((draft.currentWeightKg - draft.startWeightKg) / total) * 100))
    }
    const total = draft.startWeightKg - draft.targetWeightKg
    if (total <= 0) return 100
    return Math.max(0, Math.min(100, ((draft.startWeightKg - draft.currentWeightKg) / total) * 100))
  })()

  function save() {
    if (!draft) return
    const nextAvatar = buildAvatarConfig(
      {
        gender: draft.gender,
        heightCm: draft.heightCm,
        currentWeightKg: draft.currentWeightKg,
        startWeightKg: draft.startWeightKg,
        goal: draft.goal,
      },
      state.weightLogs
    )
    setUser({ ...draft, avatarConfig: nextAvatar })
    setEditing(false)
  }

  return (
    <DashboardShell>
      <MobileNav />
      <div className="mx-auto max-w-5xl space-y-6 pb-24 lg:pb-0">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{t(locale,"Profile & Goal","الملف والهدف")}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {t(locale,"Your measurements, your goal, and the avatar that reflects your progress.","قياساتك وهدفك والمجسّم الذي يعكس تقدّمك.")}
            </p>
          </div>
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-xl border border-lime-200 bg-white px-4 py-2.5 text-sm font-semibold text-lime-700 transition hover:bg-lime-50"
            >
              {t(locale,"Edit","تعديل")}
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraft(user)
                  setEditing(false)
                }}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
              >
                {t(locale,"Cancel","إلغاء")}
              </button>
              <button
                type="button"
                onClick={save}
                className="inline-flex items-center gap-1.5 rounded-xl bg-lime-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-lime-800"
              >
                <Save className="size-4" />
                {t(locale,"Save","حفظ")}
              </button>
            </div>
          )}
        </header>

        {/* Avatar comparison */}
        <section className="rounded-3xl border border-neutral-100 bg-white p-6">
          <h2 className="text-lg font-bold text-neutral-900">{t(locale,"Your transformation","تحوّلك")}</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {t(locale,"This is you at the start, now, and at your goal weight.","هذا أنت في البداية، والآن، وعند وزنك المستهدف.")}
          </p>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <AvatarStage
              avatar={startingConfig}
              gender={draft.gender}
              label={t(locale,"Start","البداية")}
              value={`${draft.startWeightKg.toFixed(1)} ${t(locale,"kg","كجم")}`}
            />
            <AvatarStage
              avatar={currentConfig}
              gender={draft.gender}
              label={t(locale,"Now","الآن")}
              value={`${draft.currentWeightKg.toFixed(1)} ${t(locale,"kg","كجم")}`}
              highlight
              progress={progress}
            />
            <AvatarStage
              avatar={targetConfig}
              gender={draft.gender}
              label={t(locale,"Goal","الهدف")}
              value={`${targetWeight.toFixed(1)} ${t(locale,"kg","كجم")}`}
            />
          </div>
        </section>

        {/* Profile details */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-neutral-100 bg-white p-6">
            <h2 className="text-lg font-bold text-neutral-900">{t(locale,"Personal info","المعلومات الشخصية")}</h2>
            <div className="mt-4 space-y-3">
              <Row
                label={t(locale,"Full name","الاسم الكامل")}
                value={draft.nameEn}
                editing={editing}
                onChange={(v) => setDraft({ ...draft, nameEn: v })}
              />
              <Row
                label={t(locale,"Age","العمر")}
                value={`${draft.age} ${t(locale,"years","سنة")}`}
                editing={editing}
                onChange={(v) => setDraft({ ...draft, age: Number(v) || draft.age })}
                inputType="number"
              />
              <Row
                label={t(locale,"Height","الطول")}
                value={`${draft.heightCm} ${t(locale,"cm","سم")}`}
                editing={editing}
                onChange={(v) => setDraft({ ...draft, heightCm: Number(v) || draft.heightCm })}
                inputType="number"
              />
              <Row
                label={t(locale,"Email","البريد الإلكتروني")}
                value={draft.email}
                editing={editing}
                onChange={(v) => setDraft({ ...draft, email: v })}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-100 bg-white p-6">
            <h2 className="text-lg font-bold text-neutral-900">{t(locale,"Goal & targets","الهدف والمستهدفات")}</h2>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  {t(locale,"Primary goal","الهدف الأساسي")}
                </p>
                {editing ? (
                  <select
                    value={draft.goal}
                    onChange={(e) => setDraft({ ...draft, goal: e.target.value as GoalType })}
                    className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900"
                  >
                    {(Object.keys(goalCopy) as GoalType[]).map((g) => (
                      <option key={g} value={g}>
                        {locale === "ar" ? goalCopy[g].ar : goalCopy[g].en}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-1 font-semibold text-neutral-900">
                    {locale === "ar" ? goalCopy[draft.goal].ar : goalCopy[draft.goal].en}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  {t(locale,"Activity level","مستوى النشاط")}
                </p>
                {editing ? (
                  <select
                    value={draft.activityLevel}
                    onChange={(e) =>
                      setDraft({ ...draft, activityLevel: e.target.value as ActivityLevel })
                    }
                    className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900"
                  >
                    {(Object.keys(activityCopy) as ActivityLevel[]).map((a) => (
                      <option key={a} value={a}>
                        {locale === "ar" ? activityCopy[a].ar : activityCopy[a].en}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-1 font-semibold text-neutral-900">
                    {locale === "ar" ? activityCopy[draft.activityLevel].ar : activityCopy[draft.activityLevel].en}
                  </p>
                )}
              </div>

              <Row
                label={t(locale,"Target weight","الوزن المستهدف")}
                value={`${draft.targetWeightKg.toFixed(1)} ${t(locale,"kg","كجم")}`}
                editing={editing}
                onChange={(v) =>
                  setDraft({ ...draft, targetWeightKg: Number(v) || draft.targetWeightKg })
                }
                inputType="number"
              />
            </div>
          </div>
        </section>

        {/* AI summary */}
        <section className="rounded-3xl border border-neutral-100 bg-gradient-to-br from-lime-50 to-white p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-lime-700">
            {t(locale,"AI Summary","ملخص الذكاء الاصطناعي")}
          </p>
          <h2 className="mt-2 text-xl font-bold text-neutral-900">{locale === "ar" ? analysis.summaryAr : analysis.summaryEn}</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Mini label={t(locale,"Daily kcal","سعرات يومية")} value={`${analysis.recommendedDailyCalories}`} />
            <Mini label={t(locale,"Protein","بروتين")} value={`${analysis.recommendedProteinG}${t(locale,"g","غ")}`} />
            <Mini label={t(locale,"Carbs","كربوهيدرات")} value={`${analysis.recommendedCarbsG}${t(locale,"g","غ")}`} />
            <Mini label={t(locale,"Fat","دهون")} value={`${analysis.recommendedFatG}${t(locale,"g","غ")}`} />
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}

function AvatarStage({
  avatar,
  gender,
  label,
  value,
  highlight,
  progress,
}: {
  avatar: ReturnType<typeof buildAvatarConfig>
  gender: "male" | "female"
  label: string
  value: string
  highlight?: boolean
  progress?: number
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl p-4 transition",
        highlight ? "bg-lime-50 ring-2 ring-lime-300" : "bg-neutral-50"
      )}
    >
      <Avatar
        config={avatar}
        gender={gender}
        size={160}
        showProgressRing={highlight && progress !== undefined}
        progress={progress ?? 0}
      />
      <div className="text-center">
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-wider",
            highlight ? "text-lime-700" : "text-neutral-500"
          )}
        >
          {label}
        </p>
        <p className="mt-0.5 text-lg font-bold text-neutral-900">{value}</p>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  editing,
  onChange,
  inputType = "text",
}: {
  label: string
  value: string
  editing: boolean
  onChange: (v: string) => void
  inputType?: "text" | "number"
}) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-100 py-2 last:border-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
        {label}
      </p>
      {editing ? (
        <input
          type={inputType}
          value={value.replace(/[^\d.]/g, "")}
          onChange={(e) => onChange(e.target.value)}
          className="w-32 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-right text-sm font-semibold text-neutral-900 outline-none focus:border-lime-400"
        />
      ) : (
        <p className="font-semibold text-neutral-900">{value}</p>
      )}
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
