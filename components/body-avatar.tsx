"use client"

import Image from "next/image"
import { useMemo } from "react"
import { cn } from "@/lib/utils"

// BMI -> body stage mapping (male)
// Stages based on real photos uploaded to /public/body-stages/male/
const MALE_STAGES = [
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
  const match = MALE_STAGES.find((s) => bmi >= s.bmiMin)
  return match ?? MALE_STAGES[MALE_STAGES.length - 1]
}

export function getBodyStageFromWeight(
  weightKg: number,
  heightCm: number,
  gender: "male" | "female" = "male"
) {
  const heightM = heightCm / 100
  const bmi = weightKg / (heightM * heightM)
  return { ...getBodyStage(bmi, gender), bmi: Math.round(bmi * 10) / 10 }
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
}: BodyAvatarProps) {
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
      {/* Avatar image with smooth transition */}
      <div
        className={cn(
          "relative rounded-3xl overflow-hidden bg-gradient-to-b from-neutral-50 to-neutral-100 shadow-sm",
          cls,
          improved && "ring-2 ring-teal-400 ring-offset-2"
        )}
      >
        <Image
          key={current.stage}
          src={`/body-stages/male/${current.stage}.png`}
          alt={`Body stage: ${current.label}`}
          fill
          className="object-cover object-top transition-all duration-700 ease-in-out"
          priority
          sizes={`${px}px`}
        />

        {/* Improvement badge */}
        {improved && (
          <div className="absolute top-2 right-2 bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
            Progress!
          </div>
        )}
      </div>

      {/* Label */}
      {showLabel && (
        <div className="text-center">
          <p className="text-sm font-semibold text-neutral-700">{current.label}</p>
          <p className="text-xs text-neutral-400">{current.labelAr}</p>
        </div>
      )}

      {/* BMI badge */}
      {showBMI && (
        <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-100 rounded-full px-3 py-1">
          <span className="text-xs text-teal-600 font-medium">BMI</span>
          <span className="text-sm font-bold text-teal-700">{current.bmi}</span>
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
  const start = getBodyStageFromWeight(startWeightKg, heightCm, gender)
  const current = getBodyStageFromWeight(currentWeightKg, heightCm, gender)
  const lostKg = Math.max(0, startWeightKg - currentWeightKg)
  const sameStage = start.stage === current.stage

  return (
    <div className="flex items-end justify-center gap-6">
      {/* Before */}
      <div className="flex flex-col items-center gap-2 opacity-60">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Before</p>
        <div className="relative w-[140px] h-[140px] rounded-2xl overflow-hidden bg-neutral-100">
          <Image
            src={`/body-stages/male/${start.stage}.png`}
            alt="Starting body"
            fill
            className="object-cover object-top grayscale"
            sizes="140px"
          />
        </div>
        <p className="text-sm font-bold text-neutral-500">{startWeightKg} kg</p>
      </div>

      {/* Arrow + progress */}
      <div className="flex flex-col items-center gap-1 pb-8">
        {lostKg > 0 ? (
          <>
            <div className="text-2xl font-black text-teal-600">-{lostKg.toFixed(1)}</div>
            <div className="text-xs text-teal-500 font-semibold">kg lost</div>
            <div className="text-xl text-teal-400 mt-1">→</div>
          </>
        ) : (
          <div className="text-xl text-neutral-300">→</div>
        )}
      </div>

      {/* After */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider">Now</p>
        <div className={cn(
          "relative w-[140px] h-[140px] rounded-2xl overflow-hidden bg-neutral-100",
          !sameStage && "ring-2 ring-teal-400 ring-offset-2"
        )}>
          <Image
            src={`/body-stages/male/${current.stage}.png`}
            alt="Current body"
            fill
            className="object-cover object-top"
            sizes="140px"
          />
        </div>
        <p className="text-sm font-bold text-teal-700">{currentWeightKg} kg</p>
      </div>
    </div>
  )
}
