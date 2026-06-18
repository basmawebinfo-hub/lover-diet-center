"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import { Avatar } from "@/components/avatar"
import type { AvatarConfig } from "@/lib/types"
import { useLocale, t } from "@/lib/locale"

type AvatarIntroProps = {
  name: string
  startingConfig: AvatarConfig
  targetConfig: AvatarConfig
  onContinue: () => void
}

// The wow moment — shows the user's current body, then a subtle hint of the goal.
export function AvatarIntro({ name, startingConfig, targetConfig, onContinue }: AvatarIntroProps) {
  const { locale } = useLocale()
  const [phase, setPhase] = useState<"entrance" | "analyze" | "reveal" | "ready">("entrance")
  const [hintConfig, setHintConfig] = useState<AvatarConfig>(startingConfig)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("analyze"), 600)
    const t2 = setTimeout(() => {
      setPhase("reveal")
      setHintConfig(targetConfig)
    }, 2200)
    const t3 = setTimeout(() => setPhase("ready"), 3400)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [targetConfig])

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0D4F4A] via-[#0a3d38] to-[#082f2c] p-6 text-white">
      {/* Decorative orbs */}
      <div
        className="absolute -top-32 -left-32 size-96 rounded-full bg-lime-400/20 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -bottom-32 -right-32 size-96 rounded-full bg-lime-600/20 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-white/80 backdrop-blur-sm">
          <Sparkles className="size-3.5" />
          {t(locale, "AI-POWERED HEALTH ANALYSIS", "تحليل صحي بالذكاء الاصطناعي")}
        </div>

        <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {phase === "ready" ? t(locale, `Welcome, ${name}.`, `أهلاً بك، ${name}.`) : t(locale, `Analyzing your profile, ${name}…`, `نحلّل ملفك، ${name}…`)}
        </h1>
        <p className="mt-3 max-w-sm text-sm text-white/70 sm:text-base">
          {phase === "ready"
            ? t(locale, "This is you today. Every kilo you log brings you closer to your goal.", "هذا أنت اليوم. كل كيلو تسجّله يقرّبك أكثر من هدفك.")
            : t(locale, "We're reading your measurements, calculating your ideal weight, and building a custom plan.", "نقرأ قياساتك، ونحسب وزنك المثالي، ونبني لك خطة مخصصة.")}
        </p>

        {/* Avatar stage */}
        <div className="relative mt-10 flex h-[260px] w-full items-center justify-center">
          {/* Scanning beam */}
          {phase === "analyze" && (
            <div
              className="absolute inset-0 overflow-hidden rounded-2xl"
              aria-hidden
            >
              <div
                className="absolute inset-x-0 h-1 bg-gradient-to-b from-transparent via-lime-300 to-transparent"
                style={{
                  animation: "scanLine 1.6s ease-in-out infinite",
                  boxShadow: "0 0 24px rgba(94, 234, 212, 0.6)",
                }}
              />
            </div>
          )}

          {/* Pulse rings */}
          {phase === "analyze" && (
            <>
              <div className="absolute size-40 animate-ping rounded-full border border-lime-300/30" />
              <div
                className="absolute size-52 animate-ping rounded-full border border-lime-300/20"
                style={{ animationDelay: "0.4s" }}
              />
            </>
          )}

          <div
            key={phase}
            className="animate-in fade-in zoom-in-95 duration-700"
          >
            <Avatar config={hintConfig} size={220} />
          </div>
        </div>

        {/* Status text under avatar */}
        <div className="mt-8 h-12">
          {phase === "entrance" && (
            <p className="text-sm text-white/60">{t(locale, "Loading your data…", "جارٍ تحميل بياناتك…")}</p>
          )}
          {phase === "analyze" && (
            <div className="flex items-center gap-2 text-sm text-lime-200">
              <span className="size-1.5 animate-pulse rounded-full bg-lime-300" />
              {t(locale, "Computing BMI · body composition · goal timeline", "حساب مؤشر الكتلة · تكوين الجسم · الجدول الزمني للهدف")}
            </div>
          )}
          {phase === "reveal" && (
            <p className="text-sm text-lime-200">{t(locale, "This is your starting point.", "هذه نقطة انطلاقك.")}</p>
          )}
          {phase === "ready" && (
            <button
              type="button"
              onClick={onContinue}
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-lime-900 shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {t(locale, "Open my dashboard →", "افتح لوحة التحكم ←")}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes scanLine {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(220px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
