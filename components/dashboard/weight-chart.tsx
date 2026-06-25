"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"
import type { WeightLog } from "@/lib/types"

type Range = 7 | 30 | 90

export function WeightChart({ logs, goalKg }: { logs: WeightLog[]; goalKg?: number }) {
  const { locale } = useLocale()
  const [range, setRange] = useState<Range>(30)

  const data = useMemo(() => {
    const cutoff = Date.now() - range * 24 * 60 * 60 * 1000
    return [...logs]
      .filter((l) => new Date(l.date).getTime() >= cutoff)
      .sort((a, b) => (a.date < b.date ? -1 : 1))
  }, [logs, range])

  const ranges: { v: Range; label: string }[] = [
    { v: 7, label: t(locale, "7d", "7ي") },
    { v: 30, label: t(locale, "30d", "30ي") },
    { v: 90, label: t(locale, "90d", "90ي") },
  ]

  // chart geometry
  const W = 600, H = 220, PAD = 28
  const weights = data.map((d) => d.weightKg)
  const allVals = goalKg ? [...weights, goalKg] : weights
  const min = allVals.length ? Math.min(...allVals) - 1 : 0
  const max = allVals.length ? Math.max(...allVals) + 1 : 1
  const span = max - min || 1
  const x = (i: number) => PAD + (i / Math.max(1, data.length - 1)) * (W - PAD * 2)
  const y = (w: number) => PAD + (1 - (w - min) / span) * (H - PAD * 2)

  const linePath = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d.weightKg).toFixed(1)}`).join(" ")
  const areaPath = data.length
    ? `${linePath} L ${x(data.length - 1).toFixed(1)} ${H - PAD} L ${x(0).toFixed(1)} ${H - PAD} Z`
    : ""

  return (
    <div className="rounded-3xl border border-neutral-100 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-neutral-900">{t(locale, "Weight Progress", "تقدّم الوزن")}</h2>
        <div className="flex gap-1 rounded-full bg-neutral-100 p-1">
          {ranges.map((r) => (
            <button
              key={r.v}
              type="button"
              onClick={() => setRange(r.v)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-bold transition",
                range === r.v ? "bg-white text-emerald-700 shadow-sm" : "text-neutral-500"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {data.length < 2 ? (
        <div className="flex h-48 items-center justify-center text-sm text-neutral-400">
          {t(locale, "Log at least 2 days to see your trend.", "سجّل يومين على الأقل لرؤية اتجاهك.")}
        </div>
      ) : (
        <div className="mt-4 w-full overflow-hidden">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: "auto" }}>
            <defs>
              <linearGradient id="wfill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* goal line */}
            {goalKg !== undefined && goalKg >= min && goalKg <= max && (
              <line x1={PAD} y1={y(goalKg)} x2={W - PAD} y2={y(goalKg)} stroke="#f97316" strokeWidth="1.5" strokeDasharray="5 4" />
            )}
            <path d={areaPath} fill="url(#wfill)" />
            <path d={linePath} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {data.map((d, i) => (
              <circle key={d.id} cx={x(i)} cy={y(d.weightKg)} r="3.5" fill="#fff" stroke="#059669" strokeWidth="2" />
            ))}
          </svg>
          <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
            <span>{new Date(data[0].date).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-GB", { day: "numeric", month: "short" })}</span>
            {goalKg !== undefined && (
              <span className="inline-flex items-center gap-1 font-semibold text-orange-500">
                <span className="inline-block h-0.5 w-4 bg-orange-400" /> {t(locale, "Goal", "الهدف")} {goalKg}
              </span>
            )}
            <span>{new Date(data[data.length - 1].date).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-GB", { day: "numeric", month: "short" })}</span>
          </div>
        </div>
      )}
    </div>
  )
}
