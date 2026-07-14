"use client"

import Image from "next/image"
import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"

// BMI -> body stage mapping (shared by male & female; images live in
// /public/body-stages/male/ and /public/body-stages/female/)
const STAGES = [
  { stage: "stage_1",  bmiMin: 40,   label: "Morbidly Obese",      labelAr: "سمنة مفرطة جداً" },
  { stage: "stage_2",  bmiMin: 35,   label: "Severely Obese",       labelAr: "سمنة شديدة" },
  { stage: "stage_4",  bmiMin: 32,   label: "Obese",                labelAr: "سمنة" },
  { stage: "stage_5",  bmiMin: 30,   label: "Obese I",              labelAr: "سمنة درجة أولى" },
  { stage: "stage_6",  bmiMin: 27,   label: "Overweight",           labelAr: "زيادة وزن" },
  { stage: "stage_7",  bmiMin: 25,   label: "Slightly Overweight",  labelAr: "زيادة طفيفة" },
  { stage: "stage_8",  bmiMin: 22,   label: "Normal",               labelAr: "وزن طبيعي" },
  { stage: "stage_10", bmiMin: 19,   label: "Lean",                 labelAr: "رشيق" },
  { stage: "stage_9",  bmiMin: 0,    label: "Athletic",             labelAr: "رياضي" },
] as const

export function getBodyStage(bmi: number, gender: "male" | "female" = "male") {
  // Find the matching stage (first one where bmi >= bmiMin)
  const match = STAGES.find((s) => bmi >= s.bmiMin)
  return match ?? STAGES[STAGES.length - 1]
}

export function getBodyStageFromWeight(
  weightKg: number,
  heightCm: number,
  gender: "male" | "female" = "male"
) {
  const heightM = heightCm / 100
  const bmi = weightKg / (heightM * heightM)
  return { ...getBodyStage(bmi, gender), bmi: Math.round(bmi * 10) / 10, gender }
}

type BodyAvatarProps = {
  weightKg: number
  heightCm: number
  gender?: "male" | "female"
  size?: "sm" | "md" | "lg" | "xl"
  showLabel?: boolean
  showBMI?: boolean
  className?: string
  previousWeightKg?: number
  /** When true, render the full standing body (3:4, no crop) instead of a square. */
  fullBody?: boolean
}

const SIZE_MAP = {
  sm:  { px: 120, cls: "w-[120px] h-[120px]" },
  md:  { px: 200, cls: "w-[200px] h-[200px]" },
  lg:  { px: 280, cls: "w-[280px] h-[280px]" },
  xl:  { px: 380, cls: "w-[380px] h-[380px]" },
}

export function BodyAvatar({
  weightKg,
  heightCm,
  gender = "male",
  size = "lg",
  showLabel = true,
  showBMI = false,
  className,
  previousWeightKg,
  fullBody = false,
}: BodyAvatarProps) {
  const { locale } = useLocale()
  const current = useMemo(
    () => getBodyStageFromWeight(weightKg, heightCm, gender),
    [weightKg, heightCm, gender]
  )

  const previous = useMemo(
    () => previousWeightKg
      ? getBodyStageFromWeight(previousWeightKg, heightCm, gender)
      : null,
    [previousWeightKg, heightCm, gender]
  )

  const improved = previous && previous.stage !== current.stage
  const { px, cls } = SIZE_MAP[size]

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Avatar image with smooth transition. The stage photos ship with a
          white background, so in fullBody mode we blend the white away with
          mix-blend-multiply over a soft themed backdrop instead of showing
          a hard white box. */}
      <div
        className={cn(
          "relative overflow-hidden",
          fullBody
            ? "w-full rounded-2xl bg-gradient-to-b from-emerald-50/60 via-[#f6faf8] to-emerald-100/50"
            : cn("rounded-3xl shadow-sm bg-gradient-to-b from-neutral-50 to-white", cls),
          improved && "ring-2 ring-emerald-400 ring-offset-2"
        )}
        style={fullBody ? { aspectRatio: "3 / 4" } : undefined}
      >
        {fullBody && (
          <>
            {/* Decorative aura rings behind the figure */}
            <div aria-hidden className="absolute left-1/2 top-1/2 size-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-emerald-200/70 animate-spin-slow" />
            <div aria-hidden className="absolute left-1/2 top-1/2 size-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-200/30 blur-2xl animate-pulse-glow" />
            {/* Ground shadow under the feet */}
            <div aria-hidden className="absolute bottom-[4%] left-1/2 h-3 w-1/2 -translate-x-1/2 rounded-[100%] bg-emerald-900/15 blur-[6px]" />
          </>
        )}
        <div className={cn("absolute inset-0", fullBody && "animate-float-soft")}>
          <Image
            key={current.stage}
            src={`/body-stages/${current.gender}/${current.stage}.png`}
            alt={`Body stage: ${current.label}`}
            fill
            className={cn(
              "transition-all duration-700 ease-in-out",
              fullBody
                ? "object-contain object-bottom mix-blend-multiply drop-shadow-md"
                : "object-cover object-top"
            )}
            priority
            sizes={fullBody ? "(max-width:640px) 33vw, 220px" : `${px}px`}
          />
        </div>

        {/* Improvement badge */}
        {improved && (
          <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
            {t(locale, "Progress!", "تقدّم!")}
          </div>
        )}
      </div>

      {/* Label */}
      {showLabel && (
        <div className="text-center">
          <p className="text-sm font-semibold text-neutral-700">{locale === "ar" ? current.labelAr : current.label}</p>
        </div>
      )}

      {/* BMI badge */}
      {showBMI && (
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
          <span className="text-xs text-emerald-600 font-medium">BMI</span>
          <span className="text-sm font-bold text-emerald-700">{current.bmi}</span>
        </div>
      )}
    </div>
  )
}

// Comparison component: shows before vs after
type BodyComparisonProps = {
  startWeightKg: number
  currentWeightKg: number
  heightCm: number
  gender?: "male" | "female"
}

export function BodyComparison({
  startWeightKg,
  currentWeightKg,
  heightCm,
  gender = "male",
}: BodyComparisonProps) {
  const { locale } = useLocale()
  const start = getBodyStageFromWeight(startWeightKg, heightCm, gender)
  const current = getBodyStageFromWeight(currentWeightKg, heightCm, gender)
  const lostKg = Math.max(0, startWeightKg - currentWeightKg)
  const sameStage = start.stage === current.stage
  const kg = t(locale, "kg", "كجم")

  return (
    <div className="flex items-end justify-center gap-6">
      {/* Before */}
      <div className="flex flex-col items-center gap-2 opacity-60">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{t(locale, "Before", "قبل")}</p>
        <div className="relative w-[140px] h-[140px] rounded-2xl overflow-hidden bg-neutral-100">
          <Image
            src={`/body-stages/${start.gender}/${start.stage}.png`}
            alt="Starting body"
            fill
            className="object-cover object-top grayscale"
            sizes="140px"
          />
        </div>
        <p className="text-sm font-bold text-neutral-500">{startWeightKg} {kg}</p>
      </div>

      {/* Arrow + progress */}
      <div className="flex flex-col items-center gap-1 pb-8">
        {lostKg > 0 ? (
          <>
            <div className="text-2xl font-black text-emerald-600">-{lostKg.toFixed(1)}</div>
            <div className="text-xs text-emerald-500 font-semibold">{t(locale, "kg lost", "كجم مفقودة")}</div>
            <div className="text-xl text-emerald-400 mt-1">→</div>
          </>
        ) : (
          <div className="text-xl text-neutral-300">→</div>
        )}
      </div>

      {/* After */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">{t(locale, "Now", "الآن")}</p>
        <div className={cn(
          "relative w-[140px] h-[140px] rounded-2xl overflow-hidden bg-neutral-100",
          !sameStage && "ring-2 ring-emerald-400 ring-offset-2"
        )}>
          <Image
            src={`/body-stages/${current.gender}/${current.stage}.png`}
            alt="Current body"
            fill
            className="object-cover object-top"
            sizes="140px"
          />
        </div>
        <p className="text-sm font-bold text-emerald-700">{currentWeightKg} {kg}</p>
      </div>
    </div>
  )
}
