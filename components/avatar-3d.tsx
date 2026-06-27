"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

/**
 * Avatar3D — a dynamic, 3D-styled human figure rendered as SVG.
 * The silhouette actually reshapes with BMI (lean -> full) and uses
 * gradients + highlights + a soft floor shadow for a 3D look.
 * No external images; smooth CSS transitions when weight changes.
 */
export function Avatar3D({
  bmi,
  gender = "male",
  className,
}: {
  bmi: number
  gender?: "male" | "female"
  className?: string
}) {
  // mass: 0 (lean ~18 BMI) .. 1 (obese ~40+ BMI). Drives body width.
  const mass = useMemo(() => Math.max(0, Math.min(1, (bmi - 18) / (40 - 18))), [bmi])

  // Width multipliers for body parts (interpolated by mass)
  const torsoW = 26 + mass * 34        // torso half-width
  const waistW = 18 + mass * 40        // waist (grows most)
  const hipW = (gender === "female" ? 26 : 22) + mass * 34
  const thighW = 11 + mass * 16
  const armW = 8 + mass * 10
  const neckW = 7 + mass * 4
  const chestY = gender === "female" ? 1 : 0

  const skin = gender === "female" ? "#f3c9a8" : "#e8b48c"
  const shirt = gender === "female" ? "#5b8def" : "#3f4756"
  const pants = "#2b3140"

  // Build a symmetric body path around centerX=100
  const cx = 100
  const P = (dx: number) => cx + dx
  const N = (dx: number) => cx - dx

  // Torso + waist + hips silhouette (right side then mirror)
  const torso = `
    M ${P(neckW)} 60
    C ${P(torsoW)} 70, ${P(torsoW)} 95, ${P(waistW)} 120
    C ${P(waistW)} 135, ${P(hipW)} 145, ${P(hipW)} 165
    L ${N(hipW)} 165
    C ${N(hipW)} 145, ${N(waistW)} 135, ${N(waistW)} 120
    C ${N(torsoW)} 95, ${N(torsoW)} 70, ${N(neckW)} 60
    Z`

  return (
    <div className={cn("group relative [perspective:900px]", className)}>
      <svg
        viewBox="0 0 200 320"
        className="w-full transition-transform duration-500 ease-out [transform-style:preserve-3d] group-hover:[transform:rotateY(14deg)]"
        style={{ filter: "drop-shadow(0 18px 22px rgba(16,80,74,0.18))" }}
      >
        <defs>
          <radialGradient id="a3d-skin" cx="42%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#ffe6cf" />
            <stop offset="60%" stopColor={skin} />
            <stop offset="100%" stopColor="#b07f5c" />
          </radialGradient>
          <linearGradient id="a3d-shirt" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={shirt} stopOpacity="0.95" />
            <stop offset="50%" stopColor={shirt} />
            <stop offset="100%" stopColor="#1f2530" />
          </linearGradient>
          <linearGradient id="a3d-pants" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3a4153" />
            <stop offset="100%" stopColor={pants} />
          </linearGradient>
          <radialGradient id="a3d-floor" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10504a" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#10504a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* floor shadow */}
        <ellipse cx={cx} cy="300" rx={hipW + 34} ry="14" fill="url(#a3d-floor)" className="transition-all duration-700" />

        {/* legs */}
        <g style={{ transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)" }}>
          <path d={`M ${N(hipW - 2)} 162 C ${N(thighW + 14)} 210, ${N(thighW + 6)} 250, ${N(thighW)} 292 L ${N(thighW - 9)} 292 C ${N(2)} 250, ${N(6)} 205, ${N(4)} 165 Z`} fill="url(#a3d-pants)" />
          <path d={`M ${P(hipW - 2)} 162 C ${P(thighW + 14)} 210, ${P(thighW + 6)} 250, ${P(thighW)} 292 L ${P(thighW - 9)} 292 C ${P(2)} 250, ${P(6)} 205, ${P(4)} 165 Z`} fill="url(#a3d-pants)" />
          {/* shoes */}
          <ellipse cx={N(thighW - 4)} cy="296" rx="11" ry="6" fill="#e7eef0" />
          <ellipse cx={P(thighW - 4)} cy="296" rx="11" ry="6" fill="#e7eef0" />
        </g>

        {/* arms (behind torso) */}
        <g style={{ transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)" }}>
          <path d={`M ${N(torsoW - 2)} 66 C ${N(torsoW + armW)} 90, ${N(torsoW + armW - 2)} 120, ${N(waistW + 4)} 140 L ${N(waistW - 4)} 134 C ${N(torsoW + 2)} 110, ${N(torsoW - 4)} 88, ${N(torsoW - 8)} 70 Z`} fill="url(#a3d-shirt)" />
          <path d={`M ${P(torsoW - 2)} 66 C ${P(torsoW + armW)} 90, ${P(torsoW + armW - 2)} 120, ${P(waistW + 4)} 140 L ${P(waistW - 4)} 134 C ${P(torsoW + 2)} 110, ${P(torsoW - 4)} 88, ${P(torsoW - 8)} 70 Z`} fill="url(#a3d-shirt)" />
        </g>

        {/* torso */}
        <path d={torso} fill="url(#a3d-shirt)" style={{ transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)" }} />
        {/* chest/torso highlight for 3D */}
        <path d={torso} fill="#ffffff" opacity="0.06" />
        {gender === "female" && (
          <>
            <ellipse cx={N(11)} cy={84 + chestY} rx={7 + mass * 2} ry={6} fill="#ffffff" opacity="0.08" />
            <ellipse cx={P(11)} cy={84 + chestY} rx={7 + mass * 2} ry={6} fill="#ffffff" opacity="0.08" />
          </>
        )}

        {/* neck */}
        <rect x={N(neckW)} y="48" width={neckW * 2} height="16" rx="6" fill="url(#a3d-skin)" />

        {/* head */}
        <ellipse cx={cx} cy="34" rx="20" ry="22" fill="url(#a3d-skin)" />
        {/* hair */}
        {gender === "female" ? (
          <path d="M80 30 C80 8, 120 8, 120 30 C 124 24, 126 44, 120 52 L120 30 C116 18, 84 18, 80 30 L80 52 C74 44, 76 24, 80 30 Z" fill="#2a2118" />
        ) : (
          <path d="M81 28 C82 12, 118 12, 119 28 C 119 22, 81 22, 81 28 Z" fill="#2a2118" />
        )}
        {/* face hint */}
        <circle cx="93" cy="34" r="1.6" fill="#5a4636" />
        <circle cx="107" cy="34" r="1.6" fill="#5a4636" />
        <path d="M95 42 Q100 45 105 42" stroke="#a9785a" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}
