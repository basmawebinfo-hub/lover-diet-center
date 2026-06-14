"use client"

import { useMemo } from "react"
import type { AvatarConfig, Gender } from "@/lib/types"
import { cn } from "@/lib/utils"

type AvatarProps = {
  config: AvatarConfig
  gender?: Gender
  className?: string
  size?: number
  animated?: boolean
  showProgressRing?: boolean
  progress?: number // 0..100
  showLabel?: string
}

// Pure SVG avatar. Shape morphs based on bodyMass (0..1) and tone.
// All paths parameterized so transitions look natural.
export function Avatar({
  config,
  gender = "male",
  className,
  size = 220,
  animated = true,
  showProgressRing = false,
  progress = 0,
  showLabel,
}: AvatarProps) {
  const { body, head, arms, legs } = useMemo(
    () => morphFromConfig(config, gender),
    [config, gender]
  )

  return (
    <div
      className={cn("relative inline-flex flex-col items-center", className)}
      style={{ width: size }}
    >
      <div
        className="relative inline-flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        {showProgressRing && (
          <svg
            className="absolute inset-0 -rotate-90"
            viewBox="0 0 200 200"
            style={{ width: "100%", height: "100%" }}
            aria-hidden
          >
            <circle
              cx="100"
              cy="100"
              r="92"
              fill="none"
              stroke="rgba(13,79,74,0.1)"
              strokeWidth="6"
            />
            <circle
              cx="100"
              cy="100"
              r="92"
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 92}
              strokeDashoffset={2 * Math.PI * 92 * (1 - progress / 100)}
              strokeLinecap="round"
              style={{
                transition: animated ? "stroke-dashoffset 800ms cubic-bezier(0.16, 1, 0.3, 1)" : "none",
              }}
            />
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0D4F4A" />
                <stop offset="100%" stopColor="#1A7A6E" />
              </linearGradient>
            </defs>
          </svg>
        )}

        <svg
          viewBox="0 0 200 240"
          width={size * 0.85}
          height={size}
          className={cn(animated && "transition-all duration-700 ease-out")}
          style={{ filter: "drop-shadow(0 8px 24px rgba(13, 79, 74, 0.15))" }}
          aria-label="Personal avatar"
        >
          {/* Soft background circle */}
          <defs>
            <radialGradient id="bodyBg" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="rgba(13, 79, 74, 0.08)" />
              <stop offset="100%" stopColor="rgba(13, 79, 74, 0)" />
            </radialGradient>
            <linearGradient id="bodyShade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={config.skinTone} stopOpacity="0.95" />
              <stop offset="100%" stopColor={config.skinTone} stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="shirtColor" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1A7A6E" />
              <stop offset="100%" stopColor="#0D4F4A" />
            </linearGradient>
            <linearGradient id="pantsColor" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2A3F4F" />
              <stop offset="100%" stopColor="#1A2A3A" />
            </linearGradient>
          </defs>

          <circle cx="100" cy="120" r="100" fill="url(#bodyBg)" />

          {/* Legs */}
          <g
            className={cn(animated && "transition-all duration-700 ease-out")}
            style={{ transformOrigin: "center" }}
          >
            <path
              d={legs.left}
              fill="url(#pantsColor)"
              stroke="#0F1E2A"
              strokeWidth="0.5"
            />
            <path
              d={legs.right}
              fill="url(#pantsColor)"
              stroke="#0F1E2A"
              strokeWidth="0.5"
            />
            {/* Shoes */}
            <ellipse cx="80" cy={legs.shoeY} rx="14" ry="5" fill="#0a1a1f" />
            <ellipse cx="120" cy={legs.shoeY} rx="14" ry="5" fill="#0a1a1f" />
          </g>

          {/* Body / Torso */}
          <g className={cn(animated && "transition-all duration-700 ease-out")}>
            <path d={body.torso} fill="url(#shirtColor)" />
            {/* Body shading to imply tone */}
            <ellipse
              cx="100"
              cy="120"
              rx={body.width * 0.5}
              ry={body.height * 0.4}
              fill="rgba(0,0,0,0.06)"
            />
            {config.tone === "fit" && (
              <>
                <path
                  d="M70 120 Q100 130 130 120"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M75 140 Q100 148 125 140"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                  fill="none"
                />
              </>
            )}
            {config.tone === "lean" && (
              <path
                d="M75 130 L125 130"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1.2"
                fill="none"
              />
            )}
          </g>

          {/* Arms */}
          <g className={cn(animated && "transition-all duration-700 ease-out")}>
            <path
              d={arms.left}
              fill="url(#shirtColor)"
              stroke="#0a3d38"
              strokeWidth="0.5"
            />
            <path
              d={arms.right}
              fill="url(#shirtColor)"
              stroke="#0a3d38"
              strokeWidth="0.5"
            />
            {/* Hands */}
            <circle cx={arms.leftHand.x} cy={arms.leftHand.y} r="6" fill={config.skinTone} />
            <circle cx={arms.rightHand.x} cy={arms.rightHand.y} r="6" fill={config.skinTone} />
          </g>

          {/* Neck */}
          <rect
            x="92"
            y={head.neckY}
            width="16"
            height="14"
            fill={config.skinTone}
            opacity="0.9"
          />

          {/* Head */}
          <g className={cn(animated && "transition-all duration-700 ease-out")}>
            {/* Hair back */}
            {config.hairStyle !== "bald" && (
              <path
                d={head.hair}
                fill="#2A1810"
                opacity="0.95"
              />
            )}
            {/* Face */}
            <ellipse cx="100" cy={head.cy} rx={head.faceRx} ry={head.faceRy} fill="url(#bodyShade)" />
            {/* Cheek shadow for round face */}
            {config.face === "round" && (
              <ellipse cx="100" cy={head.cy + 4} rx={head.faceRx * 0.85} ry={head.faceRy * 0.5} fill="rgba(0,0,0,0.05)" />
            )}
            {/* Eyes */}
            <ellipse cx={head.leftEye.x} cy={head.eyesY} rx="2.5" ry="3" fill="#1a1a1a" />
            <ellipse cx={head.rightEye.x} cy={head.eyesY} rx="2.5" ry="3" fill="#1a1a1a" />
            {/* Eye highlights */}
            <circle cx={head.leftEye.x - 0.6} cy={head.eyesY - 1} r="0.8" fill="white" />
            <circle cx={head.rightEye.x - 0.6} cy={head.eyesY - 1} r="0.8" fill="white" />
            {/* Smile */}
            <path
              d={`M ${100 - head.smileW / 2} ${head.cy + 12} Q 100 ${head.cy + 12 + head.smileCurve} ${100 + head.smileW / 2} ${head.cy + 12}`}
              stroke="#3A2010"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Eyebrows */}
            {config.face === "angular" && (
              <>
                <path d={`M ${head.leftEye.x - 4} ${head.eyesY - 6} L ${head.leftEye.x + 4} ${head.eyesY - 5}`} stroke="#2A1810" strokeWidth="1.5" strokeLinecap="round" />
                <path d={`M ${head.rightEye.x - 4} ${head.eyesY - 5} L ${head.rightEye.x + 4} ${head.eyesY - 6}`} stroke="#2A1810" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
            {/* Hair front */}
            {config.hairStyle === "short" && (
              <path
                d={`M ${100 - head.faceRx + 2} ${head.cy} Q 100 ${head.cy - head.faceRy - 6} ${100 + head.faceRx - 2} ${head.cy} L ${100 + head.faceRx - 4} ${head.cy - 4} Q 100 ${head.cy - head.faceRy + 2} ${100 - head.faceRx + 4} ${head.cy - 4} Z`}
                fill="#2A1810"
              />
            )}
            {config.hairStyle === "medium" && (
              <path
                d={`M ${100 - head.faceRx} ${head.cy + 4} Q 90 ${head.cy - head.faceRy - 6} 100 ${head.cy - head.faceRy - 2} Q 110 ${head.cy - head.faceRy - 6} ${100 + head.faceRx} ${head.cy + 4} Q ${100 + head.faceRx + 6} ${head.cy + 20} ${100 + head.faceRx + 4} ${head.cy + 28} L ${100 + head.faceRx - 2} ${head.cy + 12} Q 100 ${head.cy - 2} ${100 - head.faceRx + 2} ${head.cy + 12} L ${100 - head.faceRx - 4} ${head.cy + 28} Q ${100 - head.faceRx - 6} ${head.cy + 20} ${100 - head.faceRx} ${head.cy + 4} Z`}
                fill="#2A1810"
              />
            )}
          </g>
        </svg>
      </div>

      {showLabel && (
        <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          {showLabel}
        </span>
      )}
    </div>
  )
}

// Map config -> concrete shape data
function morphFromConfig(config: AvatarConfig, gender: Gender) {
  const mass = config.bodyMass // 0..1
  // Body dimensions scale with mass
  const torsoTopWidth = 36 + mass * 26 // 36..62
  const torsoBottomWidth = 50 + mass * 32 // 50..82
  const torsoHeight = 60 + mass * 8 // 60..68

  const torsoCx = 100
  const torsoTopY = 80
  const torsoBottomY = torsoTopY + torsoHeight

  // Torso path — narrows or widens with mass
  const torso = `M ${torsoCx - torsoTopWidth / 2} ${torsoTopY}
                  C ${torsoCx - torsoBottomWidth / 2 - 2} ${torsoTopY + torsoHeight * 0.4},
                    ${torsoCx - torsoBottomWidth / 2} ${torsoBottomY - 8},
                    ${torsoCx - torsoBottomWidth / 2 + 4} ${torsoBottomY}
                  L ${torsoCx + torsoBottomWidth / 2 - 4} ${torsoBottomY}
                  C ${torsoCx + torsoBottomWidth / 2} ${torsoBottomY - 8},
                    ${torsoCx + torsoTopWidth / 2 + 2} ${torsoTopY + torsoHeight * 0.4},
                    ${torsoCx + torsoTopWidth / 2} ${torsoTopY}
                  Z`

  // Arms
  const armWidth = 8 + mass * 4
  const armLength = 56 - mass * 4 // shorter & thicker when heavier
  const leftArm = `M ${torsoCx - torsoTopWidth / 2 + 4} ${torsoTopY + 4}
                   Q ${torsoCx - torsoTopWidth / 2 - armLength * 0.5} ${torsoTopY + armLength * 0.5},
                     ${torsoCx - torsoTopWidth / 2 - 6} ${torsoTopY + armLength}
                   L ${torsoCx - torsoTopWidth / 2 - 6 + armWidth} ${torsoTopY + armLength}
                   Q ${torsoCx - torsoTopWidth / 2 - armLength * 0.5 + armWidth} ${torsoTopY + armLength * 0.5 + armWidth},
                     ${torsoCx - torsoTopWidth / 2 + 4 + armWidth} ${torsoTopY + 4}
                   Z`
  const rightArm = `M ${torsoCx + torsoTopWidth / 2 - 4} ${torsoTopY + 4}
                    Q ${torsoCx + torsoTopWidth / 2 + armLength * 0.5} ${torsoTopY + armLength * 0.5},
                      ${torsoCx + torsoTopWidth / 2 + 6} ${torsoTopY + armLength}
                    L ${torsoCx + torsoTopWidth / 2 + 6 - armWidth} ${torsoTopY + armLength}
                    Q ${torsoCx + torsoTopWidth / 2 + armLength * 0.5 - armWidth} ${torsoTopY + armLength * 0.5 + armWidth},
                      ${torsoCx + torsoTopWidth / 2 - 4 - armWidth} ${torsoTopY + 4}
                    Z`

  // Legs
  const legWidth = 12 + mass * 4
  const legTopY = torsoBottomY
  const legBottomY = legTopY + 56
  const leftLeg = `M ${torsoCx - legWidth - 2} ${legTopY}
                   L ${torsoCx - 2} ${legTopY}
                   L ${torsoCx - 2} ${legBottomY}
                   L ${torsoCx - legWidth - 2} ${legBottomY}
                   Z`
  const rightLeg = `M ${torsoCx + 2} ${legTopY}
                    L ${torsoCx + legWidth + 2} ${legTopY}
                    L ${torsoCx + legWidth + 2} ${legBottomY}
                    L ${torsoCx + 2} ${legBottomY}
                    Z`

  // Head — round face wider
  const faceRx = config.face === "round" ? 24 : config.face === "oval" ? 21 : 19
  const faceRy = config.face === "round" ? 26 : config.face === "oval" ? 24 : 23
  const headCy = 56
  const headTop = headCy - faceRy
  const neckY = headTop + faceRy * 2 - 2

  // Eyes position depends on face width
  const eyeOffset = 8
  const leftEye = { x: 100 - eyeOffset, y: 0 }
  const rightEye = { x: 100 + eyeOffset, y: 0 }
  const eyesY = headCy - 2

  const smileW = config.face === "round" ? 12 : 10
  const smileCurve = config.tone === "fit" ? 4 : 3

  const hair = `M ${100 - faceRx - 2} ${headCy - 2}
                Q 100 ${headCy - faceRy - 8}
                  ${100 + faceRx + 2} ${headCy - 2}
                L ${100 + faceRx + 4} ${headCy + 6}
                Q 100 ${headCy - faceRy + 2}
                  ${100 - faceRx - 4} ${headCy + 6}
                Z`

  return {
    body: {
      torso,
      width: torsoBottomWidth,
      height: torsoHeight,
    },
    head: {
      cy: headCy,
      faceRx,
      faceRy,
      neckY,
      leftEye,
      rightEye,
      eyesY,
      smileW,
      smileCurve,
      hair,
    },
    arms: {
      left: leftArm,
      right: rightArm,
      leftHand: {
        x: torsoCx - torsoTopWidth / 2 - 6 + armWidth / 2,
        y: torsoTopY + armLength + 2,
      },
      rightHand: {
        x: torsoCx + torsoTopWidth / 2 + 6 - armWidth / 2,
        y: torsoTopY + armLength + 2,
      },
    },
    legs: {
      left: leftLeg,
      right: rightLeg,
      shoeY: legBottomY + 4,
    },
  }
}

// A comparison-style avatar that shows a "before" and an "after" state side by side
export function AvatarComparison({
  before,
  after,
  progress,
  className,
}: {
  before: AvatarConfig
  after: AvatarConfig
  progress: number
  className?: string
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-6", className)}>
      <div className="flex flex-col items-center gap-2">
        <Avatar config={before} size={180} animated />
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Before
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar
          config={after}
          size={180}
          animated
          showProgressRing
          progress={progress}
        />
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-600">
          Now · {Math.round(progress)}%
        </span>
      </div>
    </div>
  )
}
