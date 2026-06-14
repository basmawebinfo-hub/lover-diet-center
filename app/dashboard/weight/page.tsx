"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Scale, TrendingDown, TrendingUp, Save, Check } from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { BodyAvatar } from "@/components/body-avatar"
import { useApp } from "@/lib/store"
import { analyzeUser } from "@/lib/analysis"
import type { WeightLog } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function WeightPage() {
  const router = useRouter()
  const { state, logWeight } = useApp()
  const user = state.user
  const today = new Date().toISOString().slice(0, 10)

  const [input, setInput] = useState(user ? user.currentWeightKg.toFixed(1) : "")
  const [savedFor, setSavedFor] = useState<string | null>(null)

  useEffect(() => {
    if (!user) router.replace("/onboarding")
  }, [user, router])

  useEffect(() => {
    if (user) setInput(user.currentWeightKg.toFixed(1))
  }, [user])

  if (!user) return null

  const inputWeight = Number(input) || user.currentWeightKg
  const todayLog = state.weightLogs.find((l) => l.date === today)
  const lastLog = state.weightLogs[0]
  const diff = lastLog ? inputWeight - lastLog.weightKg : 0

  const analysis = analyzeUser({
    age: user.age,
    gender: user.gender,
    heightCm: user.heightCm,
    startWeightKg: user.startWeightKg,
    currentWeightKg: inputWeight,
    goal: user.goal,
    activityLevel: user.activityLevel,
  }, "en")

  function save() {
    const w = Number(input)
    if (!w || w < 30 || w > 300) return
    const log: WeightLog = {
      id: `w_${Date.now()}`,
      date: today,
      weightKg: w,
    }
    logWeight(log)
    setSavedFor(today)
    setTimeout(() => setSavedFor(null), 3000)
  }

  return (
    <DashboardShell>
      <MobileNav />
      <div className="mx-auto max-w-4xl space-y-6 pb-24 lg:pb-0">

        <header>
          <h1 className="text-2xl font-bold text-neutral-900">Daily Weight</h1>
          <p className="text-sm text-neutral-500 mt-1">Log your weight and watch your body transform</p>
        </header>

        {/* Main: Avatar + Input side by side */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Live avatar - updates as you type */}
          <div className="rounded-3xl border border-neutral-100 bg-white p-6 flex flex-col items-center gap-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Live Preview
            </p>

            <BodyAvatar
              weightKg={inputWeight}
              heightCm={user.heightCm}
              gender={user.gender === "female" ? "female" : "male"}
              size="lg"
              showLabel
              showBMI
              previousWeightKg={user.startWeightKg}
            />

            <p className="text-center text-xs text-neutral-400">
              BMI {analysis.bmi.toFixed(1)} · {analysis.bmiCategoryEn}
            </p>
          </div>

          {/* Weight input */}
          <div className="rounded-3xl border border-neutral-100 bg-white p-6 flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                Today — {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
              </p>

              {/* Big number input */}
              <div className="flex items-end gap-2">
                <input
                  type="number"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  step="0.1"
                  min="30"
                  max="300"
                  className="w-full text-5xl font-black text-neutral-900 border-b-2 border-teal-400 bg-transparent focus:outline-none focus:border-teal-600 pb-2"
                />
                <span className="text-2xl font-bold text-neutral-400 pb-2">kg</span>
              </div>

              {/* Change indicator */}
              {lastLog && diff !== 0 && (
                <div className={cn(
                  "mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold",
                  diff < 0 ? "bg-teal-50 text-teal-700" : "bg-orange-50 text-orange-600"
                )}>
                  {diff < 0 ? <TrendingDown className="size-4" /> : <TrendingUp className="size-4" />}
                  {diff < 0 ? `${Math.abs(diff).toFixed(1)} kg less than last log` : `${diff.toFixed(1)} kg more than last log`}
                </div>
              )}
            </div>

            {/* Quick adjust buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[-1, -0.5, +0.5, +1].map((delta) => (
                <button
                  key={delta}
                  onClick={() => setInput((prev) => (Math.max(30, Number(prev) + delta)).toFixed(1))}
                  className="rounded-xl border border-neutral-200 py-2 text-sm font-semibold text-neutral-600 hover:border-teal-400 hover:text-teal-700 transition-colors"
                >
                  {delta > 0 ? `+${delta}` : delta}
                </button>
              ))}
            </div>

            {/* Save button */}
            <button
              onClick={save}
              disabled={savedFor === today}
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold transition-all",
                savedFor === today
                  ? "bg-teal-100 text-teal-700 cursor-default"
                  : "bg-teal-600 text-white hover:bg-teal-700 active:scale-95"
              )}
            >
              {savedFor === today ? (
                <><Check className="size-5" /> Saved for today</>
              ) : (
                <><Save className="size-5" /> Save Weight</>
              )}
            </button>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-neutral-100">
              <div className="text-center">
                <p className="text-xs text-neutral-400">Start</p>
                <p className="text-lg font-bold text-neutral-700">{user.startWeightKg} kg</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-neutral-400">Lost</p>
                <p className="text-lg font-bold text-teal-600">
                  {Math.max(0, user.startWeightKg - inputWeight).toFixed(1)} kg
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-neutral-400">To go</p>
                <p className="text-lg font-bold text-neutral-700">
                  {Math.max(0, inputWeight - user.targetWeightKg).toFixed(1)} kg
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* History */}
        {state.weightLogs.length > 0 && (
          <section className="rounded-3xl border border-neutral-100 bg-white p-6">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">Weight History</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[...state.weightLogs]
                .sort((a, b) => (a.date > b.date ? -1 : 1))
                .map((log, i) => {
                  const prev = state.weightLogs[i + 1]
                  const change = prev ? log.weightKg - prev.weightKg : 0
                  return (
                    <div key={log.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                      <span className="text-sm text-neutral-500">
                        {new Date(log.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                      </span>
                      <div className="flex items-center gap-3">
                        {change !== 0 && (
                          <span className={cn("text-xs font-medium", change < 0 ? "text-teal-600" : "text-orange-500")}>
                            {change < 0 ? "" : "+"}{change.toFixed(1)} kg
                          </span>
                        )}
                        <span className="text-base font-bold text-neutral-900">{log.weightKg} kg</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </section>
        )}

      </div>
    </DashboardShell>
  )
}
