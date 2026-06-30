"use client"

import { useState, useMemo } from "react"
import { BodyAvatar, getBodyStageFromWeight } from "@/components/body-avatar"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"
import type { Gender } from "@/lib/types"

/**
 * Interactive transformation slider.
 * Drag between the start weight and the goal weight to preview how the body changes.
 */
export function TransformationSlider({
  gender,
  heightCm,
  startWeightKg,
  currentWeightKg,
  goalWeightKg,
}: {
  gender: Gender
  heightCm: number
  startWeightKg: number
  currentWeightKg: number
  goalWeightKg: number
}) {
  const { locale } = useLocale()

  // Slider goes from the heavier end to the lighter end so dragging feels like "progress".
  const hi = Math.max(startWeightKg, goalWeightKg, currentWeightKg)
  const lo = Math.min(startWeightKg, goalWeightKg, currentWeightKg)

  const [value, setValue] = useState<number>(Math.round(currentWeightKg * 10) / 10)

  const stage = useMemo(
    () => getBodyStageFromWeight(value, heightCm, gender),
    [value, heightCm, gender]
  )

  const lostFromStart = Math.max(0, startWeightKg - value)
  const toGoal = Math.max(0, value - goalWeightKg)
  const atGoal = value <= goalWeightKg + 0.05
  const label = locale === "ar" ? stage.labelAr : stage.label

  // progress 0..100 from start (0%) to goal (100%)
  const totalSpan = startWeightKg - goalWeightKg
  const progress = totalSpan > 0
    ? Math.max(0, Math.min(100, ((startWeightKg - value) / totalSpan) * 100))
    : 0
  const progressPct = Math.round(progress)

  // Position of the slider thumb along the [lo, hi] track (as a %), so the
  // filled progress bar and the draggable thumb line up visually.
  const trackSpan = hi - lo
  const thumbPct = trackSpan > 0 ? ((hi - value) / trackSpan) * 100 : 0
  // Where the Start and Goal markers sit on that same track.
  const startMarkerPct = trackSpan > 0 ? ((hi - startWeightKg) / trackSpan) * 100 : 0
  const goalMarkerPct = trackSpan > 0 ? ((hi - goalWeightKg) / trackSpan) * 100 : 100

  const quick: { w: number; en: string; ar: string }[] = [
    { w: Math.round(startWeightKg * 10) / 10, en: "Start", ar: "البداية" },
    { w: Math.round(currentWeightKg * 10) / 10, en: "Now", ar: "الآن" },
    { w: Math.round(goalWeightKg * 10) / 10, en: "Goal", ar: "الهدف" },
  ]

  return (
    <div>
      {/* Avatar stage */}
      <div className="relative mx-auto flex max-w-sm flex-col items-center">
        <div className={cn(
          "relative w-full rounded-3xl p-3 transition-colors",
          atGoal ? "bg-lime-50 ring-2 ring-lime-300" : "bg-neutral-50"
        )}>
          <BodyAvatar
            gender={gender}
            weightKg={value}
            heightCm={heightCm}
            fullBody
            showLabel={false}
            className="mx-auto w-full max-w-[260px]"
          />
          {atGoal && (
            <span className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-lime-600 px-3 py-1 text-xs font-bold text-white shadow">
              {t(locale, "Goal reached! 🎉", "وصلت للهدف! 🎉")}
            </span>
          )}
        </div>

        {/* Big live readout */}
        <div className="mt-4 text-center">
          <p className="text-4xl font-black tracking-tight text-neutral-900">
            {value.toFixed(1)}<span className="ms-1 text-lg font-bold text-neutral-400">{t(locale, "kg", "كجم")}</span>
          </p>
          <p className={cn("mt-1 text-sm font-semibold", atGoal ? "text-lime-700" : "text-neutral-500")}>{label}</p>
        </div>
      </div>

      {/* Progress headline */}
      <div className="mx-auto mt-5 max-w-md px-1">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-sm font-semibold text-neutral-500">{t(locale, "Journey progress", "تقدّم رحلتك")}</span>
          <span className={cn("text-lg font-black", atGoal ? "text-lime-700" : "text-lime-600")}>{progressPct}%</span>
        </div>

        {/* Slider track with start/goal markers */}
        <div className="relative h-3 w-full rounded-full bg-neutral-100">
          {/* filled progress aligned to the thumb position */}
          <div
            className="absolute inset-y-0 rounded-full bg-gradient-to-r from-lime-400 to-lime-600 rtl:bg-gradient-to-l"
            style={{ width: `${thumbPct}%` }}
          />
          {/* Goal flag marker */}
          <span
            className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500 ring-2 ring-white"
            style={{ left: `${goalMarkerPct}%` }}
            aria-hidden
          />
        </div>

        <input
          type="range"
          min={lo}
          max={hi}
          step={0.1}
          value={value}
          onChange={(e) => setValue(parseFloat(e.target.value))}
          aria-label={t(locale, "Preview weight", "وزن المعاينة")}
          className="-mt-3 h-3 w-full cursor-pointer appearance-none bg-transparent
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-7
            [&::-webkit-slider-thumb]:-mt-2 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:bg-lime-600 [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:shadow-lime-500/40
            [&::-moz-range-thumb]:size-7 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white
            [&::-moz-range-thumb]:bg-lime-600 [&::-moz-range-thumb]:shadow-lg"
        />

        {/* Quick jump chips */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {quick.map((q) => {
            const active = Math.abs(value - q.w) < 0.05
            return (
              <button
                key={q.en}
                type="button"
                onClick={() => setValue(q.w)}
                className={cn(
                  "rounded-xl border px-2 py-2 text-center transition",
                  active ? "border-lime-400 bg-lime-50" : "border-neutral-200 bg-white hover:border-lime-300"
                )}
              >
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">{locale === "ar" ? q.ar : q.en}</span>
                <span className="block text-sm font-bold text-neutral-900">{q.w} {t(locale, "kg", "كجم")}</span>
              </button>
            )
          })}
        </div>

        {/* Delta cards */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-lime-100 bg-lime-50/60 p-3 text-center">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-lime-700/70">{t(locale, "Lost from start", "المفقود من البداية")}</span>
            <span className="mt-0.5 block text-xl font-black text-lime-700">{lostFromStart.toFixed(1)}<span className="ms-1 text-xs font-bold text-lime-700/60">{t(locale, "kg", "كجم")}</span></span>
          </div>
          <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-3 text-center">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-orange-500/80">{t(locale, "To goal", "حتى الهدف")}</span>
            <span className="mt-0.5 block text-xl font-black text-orange-500">{toGoal.toFixed(1)}<span className="ms-1 text-xs font-bold text-orange-500/60">{t(locale, "kg", "كجم")}</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}
