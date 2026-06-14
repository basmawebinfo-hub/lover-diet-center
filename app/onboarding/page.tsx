"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react"
import { useApp } from "@/lib/store"
import { analyzeUser, buildAvatarConfig, calculateBMI } from "@/lib/analysis"
import type { ActivityLevel, Gender, GoalType, User } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const TOTAL_STEPS = 8

const goalCopy: Record<GoalType, { en: string; ar: string; icon: string }> = {
  lose_weight: { en: "Lose Weight", ar: "إنقاص الوزن", icon: "🔥" },
  tone: { en: "Tone & Sculpt", ar: "نحت الجسم", icon: "💎" },
  gain_muscle: { en: "Build Muscle", ar: "زيادة العضلات", icon: "💪" },
  maintain: { en: "Stay Healthy", ar: "الحفاظ على الوزن", icon: "⚖️" },
}

const activityCopy: Record<ActivityLevel, { en: string; ar: string; emoji: string }> = {
  sedentary: { en: "Sedentary", ar: "خامل", emoji: "🛋️" },
  light: { en: "Light", ar: "خفيف", emoji: "🚶" },
  moderate: { en: "Moderate", ar: "متوسط", emoji: "🏃" },
  active: { en: "Active", ar: "نشط", emoji: "🚴" },
  very_active: { en: "Very Active", ar: "نشط جداً", emoji: "🏋️" },
}

export default function OnboardingPage() {
  const { setUser, markIntroSeen } = useApp()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    name: "",
    age: 30,
    gender: "male" as Gender,
    heightCm: 175,
    weightKg: 90,
    goal: "lose_weight" as GoalType,
    activity: "light" as ActivityLevel,
  })

  const update = <K extends keyof typeof data>(k: K, v: (typeof data)[K]) =>
    setData((p) => ({ ...p, [k]: v }))

  const bmi = useMemo(
    () => calculateBMI(data.weightKg, data.heightCm),
    [data.weightKg, data.heightCm]
  )

  const canContinue = useMemo(() => {
    if (step === 1) return data.name.trim().length >= 2
    if (step === 2) return data.age >= 12 && data.age <= 100
    if (step === 3) return data.heightCm >= 120 && data.heightCm <= 230
    if (step === 4) return data.weightKg >= 30 && data.weightKg <= 250
    return true
  }, [step, data])

  const next = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1)
    else finish()
  }
  const prev = () => setStep((s) => Math.max(1, s - 1))

  function finish() {
    const targetWeight = computeTarget(data)
    const user: User = {
      id: `u_${Date.now()}`,
      nameEn: data.name,
      email: `${data.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      age: data.age,
      gender: data.gender,
      heightCm: data.heightCm,
      startWeightKg: data.weightKg,
      currentWeightKg: data.weightKg,
      goal: data.goal,
      targetWeightKg: targetWeight,
      activityLevel: data.activity,
      avatarConfig: buildAvatarConfig(
        {
          gender: data.gender,
          heightCm: data.heightCm,
          currentWeightKg: data.weightKg,
          startWeightKg: data.weightKg,
          goal: data.goal,
        },
        []
      ),
      createdAt: new Date().toISOString(),
    }
    setUser(user)
    markIntroSeen()
    // Save to localStorage before redirect
    localStorage.setItem("loverDietUser", JSON.stringify(user))
    // Redirect to dashboard
    router.push("/dashboard")
  }

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100

  return (
    <div className="min-h-screen bg-[#F0FAF8] lg:grid lg:grid-cols-2">
      <PreviewPanel
        data={data}
        bmi={bmi}
        step={step}
      />
      <div className="flex min-h-screen flex-col bg-white">
        <div className="border-b border-neutral-100 px-6 pt-8 pb-6">
          <p className="mb-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">
            Step {step} of {TOTAL_STEPS}
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-[#0D4F4A] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-6 mb-2 lg:hidden">
            <span className="text-xl font-bold text-lime-700 tracking-tight">
              lovers<span className="text-lime-500">dc</span>
            </span>
          </div>
        </div>

        <div className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-md">
            {step === 1 && <NameStep data={data} update={update} />}
            {step === 2 && <AgeStep data={data} update={update} />}
            {step === 3 && <HeightStep data={data} update={update} />}
            {step === 4 && <WeightStep data={data} update={update} />}
            {step === 5 && <GoalStep data={data} update={update} />}
            {step === 6 && <ActivityStep data={data} update={update} />}
            {step === 7 && <ReviewStep data={data} bmi={bmi} />}
            {step === 8 && <AIAnalysisStep data={data} />}
          </div>
        </div>

        {step !== 8 && (
          <div className="border-t border-neutral-100 px-6 py-5">
            <div className="mx-auto max-w-md flex items-center gap-3">
              <button
                type="button"
                onClick={prev}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl border border-neutral-200 px-5 py-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50",
                  step === 1 && "invisible"
                )}
              >
                <ArrowLeft className="size-4" />
                Back
              </button>
              <button
                type="button"
                onClick={next}
                disabled={!canContinue}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#0D4F4A] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0a3d38] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {step === 7 ? (
                  <>
                    See My Plan →
                    <Sparkles className="size-4" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AIAnalysisStep({ data }: { data: any }) {
  const router = useRouter()
  const { setUser, markIntroSeen } = useApp()

  useEffect(() => {
    const timer = setTimeout(() => {
      // Build user object and save before redirect
      const targetWeight = computeTarget(data)
      const user: User = {
        id: `u_${Date.now()}`,
        nameEn: data.name,
        email: `${data.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        age: data.age,
        gender: data.gender,
        heightCm: data.heightCm,
        startWeightKg: data.weightKg,
        currentWeightKg: data.weightKg,
        goal: data.goal,
        targetWeightKg: targetWeight,
        activityLevel: data.activity,
        avatarConfig: buildAvatarConfig(
          {
            gender: data.gender,
            heightCm: data.heightCm,
            currentWeightKg: data.weightKg,
            startWeightKg: data.weightKg,
            goal: data.goal,
          },
          []
        ),
        createdAt: new Date().toISOString(),
      }
      setUser(user)
      markIntroSeen()
      localStorage.setItem("loverDietUser", JSON.stringify(user))
      router.push("/dashboard")
    }, 4000)
    return () => clearTimeout(timer)
  }, [router, data, setUser, markIntroSeen])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="relative mb-6">
        <div className="absolute -inset-4 rounded-full bg-lime-400/20 blur-xl animate-pulse" />
        <Sparkles className="relative mx-auto h-16 w-16 text-lime-600 animate-bounce" />
      </div>
      <h2 className="text-2xl font-bold text-neutral-900">AI Analysis</h2>
      <p className="mt-2 text-sm text-neutral-500">
        Computing your personalized diet plan...
      </p>
      <div className="mt-6 w-full max-w-xs h-2 rounded-full bg-lime-100 overflow-hidden">
        <div className="h-full bg-lime-500 animate-pulse rounded-full" style={{ width: '60%' }} />
      </div>
    </div>
  )
}

function PreviewPanel({
  data,
  bmi,
  step,
}: {
  data: { name: string; heightCm: number; weightKg: number; gender: Gender; goal: GoalType; age: number; activity: ActivityLevel }
  bmi: number
  step: number
}) {
  const analysis = useMemo(
    () =>
      analyzeUser(
        {
          age: data.age,
          gender: data.gender,
          heightCm: data.heightCm,
          startWeightKg: data.weightKg,
          currentWeightKg: data.weightKg,
          goal: data.goal,
          activityLevel: data.activity,
        },
        "en"
      ),
    [data]
  )

  return (
    <div className="hidden lg:flex sticky top-0 h-screen flex-col items-center justify-center bg-[#0D4F4A] text-white p-8">
      <div
        className="absolute -top-20 -start-20 size-64 rounded-full bg-lime-600/30 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -bottom-20 -end-20 size-64 rounded-full bg-lime-400/20 blur-3xl"
        aria-hidden
      />
      <div className="relative z-10 flex w-full max-w-sm flex-col">
        <div className="mb-2 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/80 backdrop-blur-sm">
          <Sparkles className="size-3.5" />
          LIVE PREVIEW
        </div>
        <h2 className="text-2xl font-bold leading-tight">
          {data.name ? `Hello, ${data.name}` : "Your profile"}
        </h2>
        <p className="mt-2 text-sm text-white/70">
          As you fill in your details, we calculate your BMI and tailor the plan.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
          <Stat label="Height" value={`${data.heightCm} cm`} />
          <Stat label="Weight" value={`${data.weightKg} kg`} />
          <Stat label="BMI" value={bmi > 0 ? bmi.toFixed(1) : "—"} />
          <Stat label="Goal" value={goalCopy[data.goal].en} />
        </div>

        {step >= 5 && (
          <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm">
            <p className="font-semibold text-lime-200">AI Analysis</p>
            <p className="mt-1 text-white/80 leading-relaxed">{analysis.summaryEn}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-white/60">
              <span>Daily target</span>
              <span className="font-semibold text-white">
                {analysis.recommendedDailyCalories} kcal
              </span>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                i + 1 <= step ? "w-6 bg-white" : "w-2 bg-white/30"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs text-white/60">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  )
}

// === Steps ===

function NameStep({
  data,
  update,
}: {
  data: { name: string }
  update: <K extends "name">(k: K, v: (typeof data)[K]) => void
}) {
  return (
    <StepFrame
      title="What should we call you?"
      subtitle="We'll use this across your dashboard and reminders."
    >
      <input
        type="text"
        value={data.name}
        onChange={(e) => update("name", e.target.value)}
        placeholder="e.g. Ahmed Ahmed"
        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-base text-neutral-900 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-100"
        autoFocus
      />
    </StepFrame>
  )
}

function AgeStep({
  data,
  update,
}: {
  data: { age: number }
  update: <K extends "age">(k: K, v: (typeof data)[K]) => void
}) {
  return (
    <StepFrame
      title="How old are you?"
      subtitle="Your metabolism changes with age, so this matters for calorie targets."
    >
      <NumberStepper
        value={data.age}
        onChange={(v) => update("age", v)}
        min={12}
        max={100}
        unit="years"
      />
    </StepFrame>
  )
}

function HeightStep({
  data,
  update,
}: {
  data: { heightCm: number }
  update: <K extends "heightCm">(k: K, v: (typeof data)[K]) => void
}) {
  return (
    <StepFrame
      title="What's your height?"
      subtitle="Used to compute your BMI and ideal weight range."
    >
      <NumberStepper
        value={data.heightCm}
        onChange={(v) => update("heightCm", v)}
        min={120}
        max={230}
        step={1}
        unit="cm"
      />
    </StepFrame>
  )
}

function WeightStep({
  data,
  update,
}: {
  data: { weightKg: number }
  update: <K extends "weightKg">(k: K, v: (typeof data)[K]) => void
}) {
  return (
    <StepFrame
      title="What's your current weight?"
      subtitle="You can log a new weight every day from your dashboard."
    >
      <NumberStepper
        value={data.weightKg}
        onChange={(v) => update("weightKg", v)}
        min={30}
        max={250}
        step={0.1}
        unit="kg"
      />
    </StepFrame>
  )
}

function GoalStep({
  data,
  update,
}: {
  data: { goal: GoalType }
  update: <K extends "goal">(k: K, v: (typeof data)[K]) => void
}) {
  return (
    <StepFrame
      title="What's your main goal?"
      subtitle="Your plan, meals, and timeline will be built around this."
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(Object.keys(goalCopy) as GoalType[]).map((g) => {
          const active = data.goal === g
          return (
            <button
              key={g}
              type="button"
              onClick={() => update("goal", g)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all",
                active
                  ? "border-lime-500 bg-lime-50 shadow-sm"
                  : "border-neutral-200 bg-white hover:border-lime-300"
              )}
            >
              <span className="text-2xl">{goalCopy[g].icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-neutral-900">{goalCopy[g].en}</p>
                <p className="text-xs text-neutral-500">{goalCopy[g].ar}</p>
              </div>
              {active && (
                <Check className="size-5 text-lime-600" />
              )}
            </button>
          )
        })}
      </div>
    </StepFrame>
  )
}

function ActivityStep({
  data,
  update,
}: {
  data: { activity: ActivityLevel }
  update: <K extends "activity">(k: K, v: (typeof data)[K]) => void
}) {
  return (
    <StepFrame
      title="How active are you normally?"
      subtitle="Honest answer = better calorie and protein target."
    >
      <div className="space-y-2">
        {(Object.keys(activityCopy) as ActivityLevel[]).map((a) => {
          const active = data.activity === a
          return (
            <button
              key={a}
              type="button"
              onClick={() => update("activity", a)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all",
                active
                  ? "border-lime-500 bg-lime-50"
                  : "border-neutral-200 bg-white hover:border-lime-300"
              )}
            >
              <span className="text-xl">{activityCopy[a].emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-neutral-900">{activityCopy[a].en}</p>
                <p className="text-xs text-neutral-500">{activityCopy[a].ar}</p>
              </div>
              {active && <Check className="size-5 text-lime-600" />}
            </button>
          )
        })}
      </div>
    </StepFrame>
  )
}

function ReviewStep({
  data,
  bmi,
}: {
  data: { name: string; age: number; gender: Gender; heightCm: number; weightKg: number; goal: GoalType; activity: ActivityLevel }
  bmi: number
}) {
  const analysis = useMemo(
    () =>
      analyzeUser(
        {
          age: data.age,
          gender: data.gender,
          heightCm: data.heightCm,
          startWeightKg: data.weightKg,
          currentWeightKg: data.weightKg,
          goal: data.goal,
          activityLevel: data.activity,
        },
        "en"
      ),
    [data]
  )
  return (
    <StepFrame
      title="Ready to meet your future self?"
      subtitle="Here's a quick summary of what we computed."
    >
      <div className="rounded-2xl border border-lime-100 bg-lime-50/50 p-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Row label="Name" value={data.name} />
          <Row label="BMI" value={bmi.toFixed(1)} />
          <Row label="Category" value={analysis.bmiCategoryEn} />
          <Row label="Daily target" value={`${analysis.recommendedDailyCalories} kcal`} />
          <Row
            label="Goal"
            value={goalCopy[data.goal].en}
          />
          {analysis.estimatedWeeks > 0 && (
            <Row
              label="Timeline"
              value={`${analysis.estimatedWeeks} weeks`}
            />
          )}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-neutral-700">
          {analysis.summaryEn}
        </p>
      </div>
    </StepFrame>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-0.5 font-semibold text-neutral-900">{value}</p>
    </div>
  )
}

function StepFrame({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-900">{title}</h2>
      <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  )
}

function NumberStepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
}: {
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  unit: string
}) {
  const dec = () => onChange(Math.max(min, Math.round((value - step) * 10) / 10))
  const inc = () => onChange(Math.min(max, Math.round((value + step) * 10) / 10))
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={dec}
        className="flex size-12 items-center justify-center rounded-xl border border-neutral-200 bg-white text-2xl font-semibold text-neutral-700 transition hover:bg-neutral-50"
        aria-label="Decrease"
      >
        −
      </button>
      <div className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-center">
        <p className="text-3xl font-bold text-neutral-900">{value}</p>
        <p className="text-xs text-neutral-500">{unit}</p>
      </div>
      <button
        type="button"
        onClick={inc}
        className="flex size-12 items-center justify-center rounded-xl border border-neutral-200 bg-white text-2xl font-semibold text-neutral-700 transition hover:bg-neutral-50"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  )
}

function computeTarget(data: { heightCm: number; weightKg: number; gender: Gender; goal: GoalType }): number {
  const targetByGoal: Record<GoalType, number> = {
    lose_weight: Math.max(data.weightKg * 0.85, data.weightKg - 20),
    tone: Math.max(data.weightKg * 0.92, data.weightKg - 10),
    maintain: data.weightKg,
    gain_muscle: data.weightKg * 1.1,
  }
  return Math.round(targetByGoal[data.goal] * 10) / 10
}
