"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Check, Sparkles, Loader2, RefreshCw, AlertCircle, Phone } from "lucide-react"
import { useApp } from "@/lib/store"
import { analyzeUser, buildAvatarConfig, calculateBMI } from "@/lib/analysis"
import type { ActivityLevel, Gender, GoalType, User } from "@/lib/types"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useLocale, t } from "@/lib/locale"
import { createClient } from "@/lib/supabase/client"
import { upsertProfile, setOnboardingCompleted } from "@/lib/supabase/db"
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries"

// 9 steps: Name -> Phone -> Age -> Height -> Weight -> Goal -> Activity -> Review -> Finalize
const TOTAL_STEPS = 9

const goalCopy: Record<GoalType, { en: string; ar: string; icon: string }> = {
  lose_weight: { en: "Lose Weight",  ar: "إنقاص الوزن",     icon: "🔥" },
  tone:        { en: "Tone & Sculpt", ar: "نحت الجسم",       icon: "💎" },
  gain_muscle: { en: "Build Muscle",  ar: "زيادة العضلات",   icon: "💪" },
  maintain:    { en: "Stay Healthy",  ar: "الحفاظ على الوزن", icon: "⚖️" },
}

const activityCopy: Record<ActivityLevel, { en: string; ar: string; emoji: string }> = {
  sedentary:   { en: "Sedentary",   ar: "خامل",     emoji: "🛋️" },
  light:       { en: "Light",       ar: "خفيف",     emoji: "🚶" },
  moderate:    { en: "Moderate",    ar: "متوسط",    emoji: "🏃" },
  active:      { en: "Active",      ar: "نشط",      emoji: "🚴" },
  very_active: { en: "Very Active", ar: "نشط جداً", emoji: "🏋️" },
}

type OnboardingData = {
  name: string
  phone: string        // digits only, without country dial code
  countryCode: string  // ISO code like "AE" — dial code resolved from COUNTRIES
  age: number
  gender: Gender
  heightCm: number
  weightKg: number
  goal: GoalType
  activity: ActivityLevel
}

export default function OnboardingPage() {
  const { setUser, markIntroSeen } = useApp()
  const { locale } = useLocale()
  const router = useRouter()

  // Persist onboarding progress in localStorage so a refresh does not lose data.
  const [step, setStep] = useState<number>(1)
  const [data, setData] = useState<OnboardingData>({
    name: "",
    phone: "",
    countryCode: DEFAULT_COUNTRY.code,
    age: 30,
    gender: "male",
    heightCm: 175,
    weightKg: 90,
    goal: "lose_weight",
    activity: "light",
  })

  // Hydrate from localStorage on first mount (SSR-safe).
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = localStorage.getItem("ldc_onboarding_draft")
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === "object") {
          setData((d) => ({ ...d, ...parsed.data }))
          if (typeof parsed.step === "number" && parsed.step >= 1 && parsed.step <= TOTAL_STEPS) {
            setStep(parsed.step)
          }
        }
      }
      // If Supabase auth already has the user's name/phone from sign-up, prefill.
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: auth }) => {
        const meta = auth.user?.user_metadata as { name?: string; phone?: string; country?: string } | undefined
        if (meta) {
          setData((d) => ({
            ...d,
            name: d.name || meta.name || "",
            phone: d.phone || (meta.phone ? meta.phone.replace(/[^0-9]/g, '').slice(-9) : ""),
            countryCode: d.countryCode || meta.country || DEFAULT_COUNTRY.code,
          }))
        }
      })
    } catch { /* ignore */ }
  }, [])

  // Persist progress on every change.
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem("ldc_onboarding_draft", JSON.stringify({ step, data }))
    } catch { /* quota / disabled */ }
  }, [step, data])

  const update = <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) =>
    setData((p) => ({ ...p, [k]: v }))

  const bmi = useMemo(
    () => calculateBMI(data.weightKg, data.heightCm),
    [data.weightKg, data.heightCm]
  )

  const canContinue = useMemo(() => {
    if (step === 1) return data.name.trim().length >= 2
    if (step === 2) {
      // Phone step: needs >= 6 digits after stripping non-digits.
      const digits = data.phone.replace(/[^0-9]/g, "")
      return digits.length >= 6
    }
    if (step === 3) return data.age >= 12 && data.age <= 100
    if (step === 4) return data.heightCm >= 120 && data.heightCm <= 230
    if (step === 5) return data.weightKg >= 30 && data.weightKg <= 250
    return true
  }, [step, data])

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  const prev = () => setStep((s) => Math.max(1, s - 1))

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100

  return (
    <div className="min-h-screen bg-[#e7f5ee] lg:grid lg:grid-cols-2">
      <PreviewPanel data={data} step={step} />
      <div className="flex min-h-screen flex-col bg-white">
        <div className="border-b border-neutral-100 px-6 pt-8 pb-6">
          <p className="mb-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">
            {t(locale, `Step ${step} of ${TOTAL_STEPS}`, `الخطوة ${step} من ${TOTAL_STEPS}`)}
          </p>
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="absolute inset-y-0 start-0 rounded-full bg-[#34857b] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-6 mb-2 lg:hidden">
            <span className="inline-flex items-center gap-2">
              <Image src="/ldc-logo.png" alt="Lover Diet Center" width={32} height={32} className="size-8 rounded-full object-cover" />
              <span className="text-xl font-bold text-[#1f5d54] tracking-tight">lovers<span className="text-[#34857b]">dc</span></span>
            </span>
          </div>
        </div>

        <div className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-md">
            {step === 1 && <NameStep data={data} update={(k, v) => update(k, v as never)} />}
            {step === 2 && <PhoneStep data={data} update={(k, v) => update(k, v as never)} />}
            {step === 3 && <AgeStep data={data} update={update} />}
            {step === 4 && <HeightStep data={data} update={update} />}
            {step === 5 && <WeightStep data={data} update={update} />}
            {step === 6 && <GoalStep data={data} update={update} />}
            {step === 7 && <ActivityStep data={data} update={update} />}
            {step === 8 && <ReviewStep data={data} bmi={bmi} />}
            {step === 9 && (
              <FinalizeStep
                data={data}
                onSuccess={() => { /* handled in FinalizeStep */ }}
              />
            )}
          </div>
        </div>

        {step !== TOTAL_STEPS && (
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
                <ArrowLeft className="size-4 rtl:rotate-180" />
                {t(locale, "Back", "رجوع")}
              </button>
              <button
                type="button"
                onClick={next}
                disabled={!canContinue}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#34857b] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1f5d54] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {step === TOTAL_STEPS - 1 ? (
                  <>
                    {t(locale, "See My Plan", "اعرض خطتي")}
                    <Sparkles className="size-4" />
                  </>
                ) : (
                  <>
                    {t(locale, "Continue", "متابعة")}
                    <ArrowRight className="size-4 rtl:rotate-180" />
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

// ============================================================================
// FinalizeStep — the CRITICAL fix for the "AI Analysis freezes" bug.
//
// Old behavior:
//   - Fired a 4-second setTimeout, then blindly upserted and pushed /dashboard.
//   - If the save silently failed (e.g. missing phone -> onboarding gate bounces
//     the user right back), the user saw an infinite spinner.
//
// New behavior — proper state machine:
//   IDLE  -> SAVING -> DONE       (success path)
//                   \-> ERROR    (visible message + Retry button)
//   Instead of a fixed 4s timeout we WAIT for the save. On success we do a
//   hard navigation (window.location) so any middleware redirect is followed
//   as a full page load, not a client-side hop that could get stuck.
// ============================================================================
function FinalizeStep({ data, onSuccess }: { data: OnboardingData; onSuccess: () => void }) {
  const router = useRouter()
  const { locale } = useLocale()
  const { setUser, markIntroSeen } = useApp()

  const [status, setStatus] = useState<"saving" | "error">("saving")
  const [errorMsg, setErrorMsg] = useState<string>("")
  const [attempts, setAttempts] = useState(0)

  const run = async () => {
    setStatus("saving")
    setErrorMsg("")
    try {
      const supabase = createClient()
      const { data: auth, error: authErr } = await supabase.auth.getUser()
      if (authErr || !auth.user) {
        throw new Error("You are not signed in. Please sign in again.")
      }

      // Compose full phone (dial + digits).
      const dial = COUNTRIES.find((c) => c.code === data.countryCode)?.dial ?? DEFAULT_COUNTRY.dial
      const digits = data.phone.replace(/[^0-9]/g, "")
      const fullPhone = `${dial}${digits}`
      const targetWeight = computeTarget(data)

      const finalUser: User = {
        id: auth.user.id,
        nameEn: data.name.trim(),
        email: auth.user.email ?? "",
        phone: fullPhone,
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

      // Persist to Supabase. This is the critical call — do NOT swallow errors here.
      const ok = await upsertProfile(auth.user.id, finalUser)
      if (!ok) throw new Error("Could not save your profile. Please retry.")

      // Belt-and-suspenders on top of upsertProfile's completeness heuristic:
      // explicitly flip profiles.onboarding_completed to true. If this second
      // call fails we still consider onboarding done — the boolean is a
      // fast-path index, not the security gate.
      await setOnboardingCompleted(auth.user.id, true).catch((e) => {
        console.warn("[onboarding] setOnboardingCompleted failed (non-fatal)", e)
      })

      // Update client store + local mirror.
      setUser(finalUser)
      markIntroSeen()
      try { localStorage.setItem("loverDietUser", JSON.stringify(finalUser)) } catch { /* quota */ }
      // Clear the onboarding draft — we're done with it.
      try { localStorage.removeItem("ldc_onboarding_draft") } catch { /* ignore */ }

      onSuccess()

      // Hard navigation avoids any client-cached RSC payload from before the
      // profile was complete. The server will now render /dashboard freshly
      // with the up-to-date profile.
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard"
      } else {
        router.push("/dashboard")
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error"
      console.error("[onboarding] finalize failed", e)
      setErrorMsg(msg)
      setStatus("error")
    }
  }

  useEffect(() => {
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempts])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      {status === "saving" ? (
        <>
          <div className="relative mb-6">
            <div className="absolute -inset-4 rounded-full bg-emerald-400/20 blur-xl animate-pulse" />
            <Sparkles className="relative mx-auto h-16 w-16 text-emerald-600 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">
            {t(locale, "Building your plan…", "نجهّز خطتك…")}
          </h2>
          <p className="mt-2 text-sm text-neutral-500 max-w-xs">
            {t(locale,
              "Saving your profile and computing your personalized targets.",
              "نحفظ ملفك ونحسب أهدافك المخصصة.")}
          </p>
          <div className="mt-6 w-full max-w-xs h-2 rounded-full bg-emerald-100 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full animate-pulse" style={{ width: '75%' }} />
          </div>
          <p className="mt-4 text-xs text-neutral-400">
            {t(locale, "This usually takes a few seconds.", "عادةً ما يستغرق هذا بضع ثوانٍ.")}
          </p>
        </>
      ) : (
        <>
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertCircle className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900">
            {t(locale, "We could not save your profile", "تعذّر حفظ ملفك")}
          </h2>
          <p className="mt-2 text-sm text-neutral-500 max-w-sm">
            {errorMsg || t(locale, "Please try again.", "يرجى المحاولة مرة أخرى.")}
          </p>
          <button
            type="button"
            onClick={() => setAttempts((n) => n + 1)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700"
          >
            <RefreshCw className="size-4" />
            {t(locale, "Try again", "أعد المحاولة")}
          </button>
        </>
      )}
    </div>
  )
}

// ============================================================================
// PreviewPanel — decorative left column (unchanged)
// ============================================================================
function PreviewPanel({
  data,
  step,
}: {
  data: OnboardingData
  step: number
}) {
  const { locale } = useLocale()
  return (
    <div className="relative hidden overflow-hidden lg:block">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e5f7e2" />
            <stop offset="55%" stopColor="#bfe9cf" />
            <stop offset="100%" stopColor="#a4ddbf" />
          </linearGradient>
          <linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8fd3b3" />
            <stop offset="100%" stopColor="#6fc4a0" />
          </linearGradient>
          <linearGradient id="hill2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4fae8e" />
            <stop offset="100%" stopColor="#2f8f72" />
          </linearGradient>
          <linearGradient id="hill3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f6a57" />
            <stop offset="100%" stopColor="#134a3c" />
          </linearGradient>
        </defs>
        <rect width="600" height="900" fill="url(#sky)" />
        <circle cx="430" cy="170" r="46" fill="#f4fff0" opacity="0.7" />
        <path d="M0 430 Q150 360 300 410 T600 380 L600 900 L0 900 Z" fill="url(#hill1)" opacity="0.85" />
        <path d="M0 560 Q170 470 340 540 T600 510 L600 900 L0 900 Z" fill="url(#hill2)" opacity="0.95" />
        <path d="M0 700 Q200 620 400 690 T600 660 L600 900 L0 900 Z" fill="url(#hill3)" />
        {[ [70,640],[120,665],[500,560],[540,585],[300,600] ].map(([x,y],i)=>(
          <g key={i} transform={`translate(${x} ${y})`} fill="#0f3b30" opacity="0.85">
            <polygon points="0,0 14,34 -14,34" />
            <polygon points="0,18 18,58 -18,58" />
            <rect x="-3" y="56" width="6" height="14" fill="#0c2f26" />
          </g>
        ))}
      </svg>
      <div className="relative z-10 flex h-full min-h-screen flex-col items-center justify-center p-10 text-center">
        <p className="text-3xl font-extrabold tracking-[0.4em] text-[#0f3b30] drop-shadow-sm">
          {t(locale, "WELCOME", "أهلاً بك")}
        </p>
        <p className="mt-3 max-w-xs text-sm font-medium text-[#0f3b30]/70">
          {data.name
            ? t(locale, `Great to have you, ${data.name}!`, `سعداء بانضمامك يا ${data.name}!`)
            : t(locale, "Let's build your personalized plan.", "لنُجهّز خطتك المخصصة.")}
        </p>
        <div className="mt-8 flex items-center gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                i + 1 <= step ? "w-6 bg-[#0f3b30]" : "w-2 bg-[#0f3b30]/25"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Individual steps
// ============================================================================

function NameStep({
  data,
  update,
}: {
  data: OnboardingData
  update: (k: keyof OnboardingData, v: string | Gender) => void
}) {
  const { locale } = useLocale()
  const genders: { value: Gender; en: string; ar: string; icon: string }[] = [
    { value: "male", en: "Male", ar: "رجل", icon: "👨" },
    { value: "female", en: "Female", ar: "امرأة", icon: "👩" },
  ]
  return (
    <StepFrame
      title={t(locale, "What should we call you?", "بماذا نناديك؟")}
      subtitle={t(locale, "We'll use this across your dashboard and reminders.", "سنستخدمه في لوحة التحكم والتذكيرات.")}
    >
      <input
        type="text"
        value={data.name}
        onChange={(e) => update("name", e.target.value)}
        placeholder={t(locale, "e.g. Ahmed Ahmed", "مثال: أحمد أحمد")}
        className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-base text-neutral-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        autoFocus
      />
      <p className="mt-6 mb-2 text-sm font-semibold text-neutral-700">
        {t(locale, "You are", "أنت")}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {genders.map((g) => {
          const active = data.gender === g.value
          return (
            <button
              key={g.value}
              type="button"
              onClick={() => update("gender", g.value)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl border-2 p-4 text-base font-semibold transition-all",
                active
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-emerald-300"
              )}
            >
              <span className="text-2xl">{g.icon}</span>
              {locale === "ar" ? g.ar : g.en}
            </button>
          )
        })}
      </div>
    </StepFrame>
  )
}

function PhoneStep({
  data,
  update,
}: {
  data: OnboardingData
  update: (k: keyof OnboardingData, v: string) => void
}) {
  const { locale } = useLocale()
  return (
    <StepFrame
      title={t(locale, "What's your phone number?", "ما رقم هاتفك؟")}
      subtitle={t(locale, "So our team can reach you about your plan and orders.", "لنتمكن من التواصل معك بخصوص خطتك وطلباتك.")}
    >
      <div className="flex gap-2">
        <select
          value={data.countryCode}
          onChange={(e) => update("countryCode", e.target.value)}
          aria-label={t(locale, "Country", "الدولة")}
          className="shrink-0 rounded-xl border border-neutral-200 bg-white px-2 py-3 text-sm text-neutral-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.flag} {c.dial}</option>
          ))}
        </select>
        <div className="relative flex-1">
          <Phone className="absolute inset-y-0 start-3 my-auto size-4 text-neutral-400 pointer-events-none" />
          <input
            type="tel"
            inputMode="numeric"
            value={data.phone}
            onChange={(e) => update("phone", e.target.value.replace(/[^0-9]/g, ""))}
            placeholder={t(locale, "5x xxx xxxx", "5x xxx xxxx")}
            autoFocus
            className="w-full rounded-xl border border-neutral-200 bg-white ps-9 pe-4 py-3.5 text-base text-neutral-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>
      <p className="mt-3 text-xs text-neutral-400">
        {t(locale, "Digits only. We'll never share your number.", "أرقام فقط. لن نشارك رقمك.")}
      </p>
    </StepFrame>
  )
}

function AgeStep({
  data,
  update,
}: {
  data: OnboardingData
  update: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void
}) {
  const { locale } = useLocale()
  return (
    <StepFrame
      title={t(locale, "How old are you?", "كم عمرك؟")}
      subtitle={t(locale, "Your metabolism changes with age, so this matters for calorie targets.", "يتغيّر الأيض مع العمر، لذا يهمّنا هذا لتحديد السعرات.")}
    >
      <ValueSlider
        value={data.age}
        onChange={(v) => update("age", v)}
        min={12}
        max={100}
        step={1}
        unit={t(locale, "years", "سنة")}
      />
    </StepFrame>
  )
}

function HeightStep({
  data,
  update,
}: {
  data: OnboardingData
  update: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void
}) {
  const { locale } = useLocale()
  return (
    <StepFrame
      title={t(locale, "What's your height?", "كم طولك؟")}
      subtitle={t(locale, "Used to compute your BMI and ideal weight range.", "يُستخدم لحساب مؤشر كتلة جسمك ونطاق وزنك المثالي.")}
    >
      <ValueSlider
        value={data.heightCm}
        onChange={(v) => update("heightCm", v)}
        min={120}
        max={230}
        step={1}
        unit={t(locale, "cm", "سم")}
      />
    </StepFrame>
  )
}

function WeightStep({
  data,
  update,
}: {
  data: OnboardingData
  update: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void
}) {
  const { locale } = useLocale()
  return (
    <StepFrame
      title={t(locale, "What's your current weight?", "كم وزنك الحالي؟")}
      subtitle={t(locale, "You can log a new weight every day from your dashboard.", "يمكنك تسجيل وزن جديد كل يوم من لوحة التحكم.")}
    >
      <ValueSlider
        value={data.weightKg}
        onChange={(v) => update("weightKg", v)}
        min={30}
        max={250}
        step={0.5}
        unit={t(locale, "kg", "كجم")}
      />
    </StepFrame>
  )
}

function GoalStep({
  data,
  update,
}: {
  data: OnboardingData
  update: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void
}) {
  const { locale } = useLocale()
  return (
    <StepFrame
      title={t(locale, "What's your main goal?", "ما هدفك الأساسي؟")}
      subtitle={t(locale, "Your plan, meals, and timeline will be built around this.", "ستُبنى خطتك ووجباتك وجدولك الزمني حول هذا الهدف.")}
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
                  ? "border-emerald-500 bg-emerald-50 shadow-sm"
                  : "border-neutral-200 bg-white hover:border-emerald-300"
              )}
            >
              <span className="text-2xl">{goalCopy[g].icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-neutral-900">{locale === "ar" ? goalCopy[g].ar : goalCopy[g].en}</p>
              </div>
              {active && <Check className="size-5 text-emerald-600" />}
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
  data: OnboardingData
  update: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void
}) {
  const { locale } = useLocale()
  return (
    <StepFrame
      title={t(locale, "How active are you normally?", "ما مستوى نشاطك عادةً؟")}
      subtitle={t(locale, "Honest answer = better calorie and protein target.", "إجابة صادقة = هدف أدق للسعرات والبروتين.")}
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
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-neutral-200 bg-white hover:border-emerald-300"
              )}
            >
              <span className="text-xl">{activityCopy[a].emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-neutral-900">{locale === "ar" ? activityCopy[a].ar : activityCopy[a].en}</p>
              </div>
              {active && <Check className="size-5 text-emerald-600" />}
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
  data: OnboardingData
  bmi: number
}) {
  const { locale } = useLocale()
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
        locale
      ),
    [data, locale]
  )
  return (
    <StepFrame
      title={t(locale, "Ready to meet your future self?", "جاهز لتقابل نسختك المستقبلية؟")}
      subtitle={t(locale, "Here's a quick summary of what we computed.", "إليك ملخصاً سريعاً لما حسبناه.")}
    >
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Row label={t(locale, "Name", "الاسم")} value={data.name} />
          <Row label={t(locale, "BMI", "مؤشر الكتلة")} value={bmi.toFixed(1)} />
          <Row label={t(locale, "Category", "التصنيف")} value={locale === "ar" ? analysis.bmiCategoryAr : analysis.bmiCategoryEn} />
          <Row label={t(locale, "Daily target", "الهدف اليومي")} value={`${analysis.recommendedDailyCalories} ${t(locale, "kcal", "سعرة")}`} />
          <Row
            label={t(locale, "Goal", "الهدف")}
            value={locale === "ar" ? goalCopy[data.goal].ar : goalCopy[data.goal].en}
          />
          {analysis.estimatedWeeks > 0 && (
            <Row
              label={t(locale, "Timeline", "المدة")}
              value={`${analysis.estimatedWeeks} ${t(locale, "weeks", "أسبوع")}`}
            />
          )}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-neutral-700">
          {locale === "ar" ? analysis.summaryAr : analysis.summaryEn}
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

function ValueSlider({
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
  const { locale } = useLocale()
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step))
  const dec = () => onChange(clamp(Math.round((value - step) * 100) / 100))
  const inc = () => onChange(clamp(Math.round((value + step) * 100) / 100))
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-center gap-2">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (!Number.isNaN(v)) onChange(clamp(v))
          }}
          className="w-40 bg-transparent text-center text-6xl font-extrabold tracking-tight text-neutral-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          aria-label={unit}
        />
        <span className="mb-3 text-xl font-semibold text-emerald-600">{unit}</span>
      </div>
      <div className="relative px-1">
        <div className="relative h-3 w-full rounded-full bg-neutral-100">
          <div
            className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          type="range"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 h-3 w-full cursor-pointer appearance-none bg-transparent
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-7
            [&::-webkit-slider-thumb]:-mt-2 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:shadow-emerald-500/40 [&::-webkit-slider-thumb]:transition
            [&::-moz-range-thumb]:size-7 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white
            [&::-moz-range-thumb]:bg-emerald-500 [&::-moz-range-thumb]:shadow-lg"
          aria-label={unit}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-400">{min} {unit}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={dec}
            className="flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-xl font-semibold text-neutral-600 transition hover:border-emerald-300 hover:text-emerald-700"
            aria-label={t(locale, "Decrease", "إنقاص")}
          >
            −
          </button>
          <button
            type="button"
            onClick={inc}
            className="flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-xl font-semibold text-neutral-600 transition hover:border-emerald-300 hover:text-emerald-700"
            aria-label={t(locale, "Increase", "زيادة")}
          >
            +
          </button>
        </div>
        <span className="text-xs font-medium text-neutral-400">{max} {unit}</span>
      </div>
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
