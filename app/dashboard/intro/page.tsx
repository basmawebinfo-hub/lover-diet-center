"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"
import { useApp } from "@/lib/store"
import { AvatarIntro } from "@/components/avatar-intro"
import { buildAvatarConfig, idealWeightKg } from "@/lib/analysis"

export default function IntroPage() {
  const router = useRouter()
  const { state } = useApp()
  const user = state.user

  // Compute avatar configs unconditionally — they default to a "neutral" state
  // when the user isn't loaded yet. This keeps hook order stable.
  const startingConfig = useMemo(() => {
    if (!user) return null
    return buildAvatarConfig(
      {
        gender: user.gender,
        heightCm: user.heightCm,
        currentWeightKg: user.startWeightKg,
        startWeightKg: user.startWeightKg,
        goal: user.goal,
      },
      []
    )
  }, [user])

  const targetConfig = useMemo(() => {
    if (!user) return null
    const targetWeight = idealWeightKg(user.heightCm, user.gender)
    return buildAvatarConfig(
      {
        gender: user.gender,
        heightCm: user.heightCm,
        currentWeightKg: targetWeight,
        startWeightKg: user.startWeightKg,
        goal: user.goal,
      },
      []
    )
  }, [user])

  // Redirect to onboarding if there's no user — runs on every render unconditionally
  useEffect(() => {
    if (!user) {
      router.replace("/onboarding")
    }
  }, [user, router])

  // Early return AFTER all hooks have been registered
  if (!user || !startingConfig || !targetConfig) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0D4F4A] to-[#082f2c]">
        <div className="size-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    )
  }

  return (
    <AvatarIntro
      name={user.nameEn.split(" ")[0]}
      startingConfig={startingConfig}
      targetConfig={targetConfig}
      onContinue={() => router.push("/dashboard")}
    />
  )
}
