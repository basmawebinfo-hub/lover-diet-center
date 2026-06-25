"use client"

import { cn } from "@/lib/utils"

/** Minimal SVG donut/progress ring used across the dashboard (TeamHub style). */
export function Donut({
  value,
  max = 100,
  size = 96,
  stroke = 10,
  color = "#10b981",
  track = "#e6f4ee",
  label,
  sub,
}: {
  value: number
  max?: number
  size?: number
  stroke?: number
  color?: string
  track?: string
  label?: string
  sub?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, max ? value / max : 0))
  const dash = c * pct

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label && <span className="text-lg font-extrabold leading-none text-neutral-900">{label}</span>}
        {sub && <span className="mt-0.5 text-[10px] font-medium text-neutral-400">{sub}</span>}
      </div>
    </div>
  )
}

/** Small stat card with a colored icon chip — TeamHub style. */
export function StatChip({
  icon,
  label,
  value,
  delta,
  tone = "emerald",
}: {
  icon: React.ReactNode
  label: string
  value: string
  delta?: string
  tone?: "emerald" | "sky" | "amber" | "violet"
}) {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600",
    sky: "bg-sky-50 text-sky-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  }
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm shadow-neutral-900/[0.03]">
      <span className={cn("flex size-10 items-center justify-center rounded-xl", tones[tone])}>{icon}</span>
      <p className="mt-3 text-xs font-medium text-neutral-400">{label}</p>
      <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-neutral-900">{value}</p>
      {delta && <p className="mt-1 text-xs font-semibold text-emerald-600">{delta}</p>}
    </div>
  )
}
