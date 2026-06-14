"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Scale, TrendingDown, TrendingUp, Save, Check, Sparkles } from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { Avatar } from "@/components/avatar"
import { useApp } from "@/lib/store"
import { analyzeUser, buildAvatarConfig, progressPercent } from "@/lib/analysis"
import type { WeightLog } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function WeightPage() {
  const router = useRouter()
  const { state, logWeight } = useApp()
  const user = state.user
  const today = new Date().toISOString().slice(0, 10)

  const [input, setInput] = useState<string>(
    user ? user.currentWeightKg.toFixed(1) : ""
  )
  const [savedFor, setSavedFor] = useState<string | null>(null)

  useEffect(() => {
    if (!user) router.replace("/onboarding")
  }, [user, router])

  useEffect(() => {
    if (user) setInput(user.currentWeightKg.toFixed(1))
  }, [user])

  if (!user) return null

  const todayLog = state.weightLogs.find((l) => l.date === today)
  const lastLog = state.weightLogs[0]
  const liveAvatar = buildAvatarConfig(
    {
      gender: user.gender,
      heightCm: user.heightCm,
      currentWeightKg: Number(input) || user.currentWeightKg,
      startWeightKg: user.startWeightKg,
      goal: user.goal,
    },
    state.weightLogs
  )

  const previousAvatar = buildAvatarConfig(
    {
      gender: user.gender,
      heightCm: user.heightCm,
      currentWeightKg: user.currentWeightKg,
      startWeightKg: user.startWeightKg,
      goal: user.goal,
    },
    state.weightLogs
  )

  const progress = (() => {
    const tempUser = { ...user, currentWeightKg: Number(input) || user.currentWeightKg }
    return progressPercent(tempUser)
  })()

  const todayAnalysis = analyzeUser(
    {
      age: user.age,
      gender: user.gender,
      heightCm: user.heightCm,
      startWeightKg: user.startWeightKg,
      currentWeightKg: Number(input) || user.currentWeightKg,
      goal: user.goal,
      activityLevel: user.activityLevel,
    },
    "en"
  )

  function save() {
    const value = Number(input)
    if (!value || value < 30 || value > 250) return
    const log: WeightLog = {
      id: `w_${Date.now()}`,
      date: today,
      weightKg: value,
    }
    logWeight(log)
    setSavedFor(today)
    setTimeout(() => setSavedFor(null), 2500)
  }

  const sorted = [...state.weightLogs].sort((a, b) => (a.date < b.date ? 1 : -1))
  const weekDelta = (() => {
    if (sorted.length < 2) return 0
    const latest = sorted[0].weightKg
    const weekAgoEntry = sorted.find((l) => {
      const days = (new Date(sorted[0].date).getTime() - new Date(l.date).getTime()) / 86400000
      return days >= 6
    })
    if (!weekAgoEntry) return 0
    return latest - weekAgoEntry.weightKg
  })()

  // Mood line
  const trendIsDown = weekDelta < 0
  const trendIsGood =
    (user.goal === "lose_weight" && trendIsDown) ||
    (user.goal === "gain_muscle" && weekDelta > 0)

  return (
    <DashboardShell>
      <MobileNav />
      <div className="mx-auto max-w-5xl space-y-6 pb-24 lg:pb-0">
        <header>
          <h1 className="text-3xl font-bold text-neutral-900">Daily Weight</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Log your weight every morning. Watch your avatar reflect every kilo.
          </p>
        </header>

        {/* Hero: log + live avatar */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-3xl border border-neutral-100 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Today · {new Date().toLocaleDateString("en-GB", { weekday: "long" })}
                </p>
                <p className="mt-1 text-2xl font-bold text-neutral-900">
                  {user.currentWeightKg.toFixed(1)} <span className="text-base font-normal text-neutral-500">kg</span>
                </p>
              </div>
              {todayLog && (
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  Logged today
                </span>
              )}
            </div>

            <div className="mt-6 flex items-end gap-3">
              <div className="flex-1">
                <label className="text-xs font-semibold text-neutral-500">
                  New weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="250"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-2xl font-bold text-neutral-900 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                />
              </div>
              <button
                type="button"
                onClick={save}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                <Save className="size-4" />
                Save
              </button>
            </div>

            {savedFor && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700">
                <Check className="size-4" />
                Saved for {savedFor}
              </div>
            )}

            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-neutral-100 pt-4 text-center">
              <Mini label="BMI" value={todayAnalysis.bmi.toFixed(1)} />
              <Mini label="Category" value={todayAnalysis.bmiCategoryEn} />
              <Mini
                label="vs Start"
                value={`${(user.startWeightKg - (Number(input) || user.currentWeightKg)).toFixed(1)} kg`}
                tone="positive"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-100 bg-gradient-to-br from-white to-teal-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
              Live preview
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              {Number(input) < user.currentWeightKg
                ? "Trimmed a bit ✨"
                : Number(input) > user.currentWeightKg
                  ? "Holding strong"
                  : "Steady"}
            </p>
            <div className="mt-4 flex justify-center">
              <Avatar
                config={liveAvatar}
                gender={user.gender}
                size={180}
                showProgressRing
                progress={progress}
              />
            </div>
            <div className="mt-4 text-center text-xs text-neutral-500">
              Progress: <span className="font-semibold text-teal-700">{progress.toFixed(0)}%</span>
            </div>
          </div>
        </section>

        {/* Mood / weekly delta */}
        {sorted.length > 1 && (
          <section
            className={cn(
              "rounded-3xl border p-6",
              trendIsGood
                ? "border-teal-200 bg-teal-50"
                : "border-orange-200 bg-orange-50"
            )}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "flex size-12 items-center justify-center rounded-2xl",
                  trendIsGood ? "bg-teal-600 text-white" : "bg-orange-500 text-white"
                )}
              >
                {trendIsDown ? (
                  <TrendingDown className="size-6" />
                ) : (
                  <TrendingUp className="size-6" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  This week
                </p>
                <h2 className="mt-1 text-xl font-bold text-neutral-900">
                  {weekDelta === 0
                    ? "Holding steady"
                    : `${weekDelta > 0 ? "+" : ""}${weekDelta.toFixed(1)} kg this week`}
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  {trendIsGood
                    ? "You're moving in the right direction. Stay consistent."
                    : "Plateaus happen. Stick to the plan — the trend will turn."}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* History */}
        <section className="rounded-3xl border border-neutral-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">History</h2>
            <span className="text-xs text-neutral-500">
              {sorted.length} {sorted.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          <div className="mt-4 divide-y divide-neutral-100">
            {sorted.map((log, i) => {
              const prev = sorted[i + 1]
              const delta = prev ? log.weightKg - prev.weightKg : 0
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                      <Scale className="size-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900">
                        {new Date(log.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {new Date(log.date).toLocaleDateString("en-GB", {
                          weekday: "long",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-neutral-900">
                      {log.weightKg.toFixed(1)} kg
                    </p>
                    {delta !== 0 && (
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          delta < 0 ? "text-teal-600" : "text-orange-500"
                        )}
                      >
                        {delta > 0 ? "+" : ""}
                        {delta.toFixed(1)} kg
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
            {sorted.length === 0 && (
              <p className="py-6 text-center text-sm text-neutral-500">
                No entries yet. Log your first weight above.
              </p>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}

function Mini({
  label,
  value,
  tone = "neutral",
}: {
  label: string
  value: string
  tone?: "neutral" | "positive"
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-sm font-bold",
          tone === "positive" ? "text-teal-600" : "text-neutral-900"
        )}
      >
        {value}
      </p>
    </div>
  )
}
