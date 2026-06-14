"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowRight,
  Scale,
  Apple,
  Calendar,
  ShoppingBag,
  TrendingDown,
  Target,
  Flame,
  Droplets,
} from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { BodyAvatar, BodyComparison } from "@/components/body-avatar"
import { useApp } from "@/lib/store"
import { analyzeUser, progressPercent } from "@/lib/analysis"
import { cn } from "@/lib/utils"
import type { User } from "@/lib/types"

function getLocalUser(): User | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem("loverDietUser")
    if (raw) return JSON.parse(raw) as User
  } catch { /* ignore */ }
  return null
}

function greetingForTime() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 18) return "Good afternoon"
  return "Good evening"
}

export default function DashboardOverviewPage() {
  const router = useRouter()
  const { state } = useApp()
  const user = useMemo(() => state.user || getLocalUser(), [state.user])

  useEffect(() => {
    if (!user) router.replace("/onboarding")
  }, [user, router])

  if (!user) return null

  const analysis = analyzeUser({
    age: user.age,
    gender: user.gender,
    heightCm: user.heightCm,
    startWeightKg: user.startWeightKg,
    currentWeightKg: user.currentWeightKg,
    goal: user.goal,
    activityLevel: user.activityLevel,
  }, "en")

  const progress = progressPercent(user)
  const recent = [...state.weightLogs].sort((a, b) => (a.date < b.date ? -1 : 1)).slice(-7)
  const hasProgress = user.startWeightKg !== user.currentWeightKg

  return (
    <DashboardShell>
      <MobileNav />
      <div className="mx-auto max-w-6xl space-y-6 pb-24 lg:pb-0">

        {/* Greeting */}
        <header className="flex flex-col gap-1">
          <p className="text-sm font-medium text-teal-700">
            {greetingForTime()} · {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}
          </p>
          <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
            {user.nameEn.split(" ")[0]}, your plan is live.
          </h1>
        </header>

        {/* Avatar + Stats */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">

          {/* Avatar card */}
          <div className="rounded-3xl border border-neutral-100 bg-white p-6 flex flex-col items-center gap-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Your Body Now</p>

            <BodyAvatar
              weightKg={user.currentWeightKg}
              heightCm={user.heightCm}
              gender={user.gender === "female" ? "female" : "male"}
              size="lg"
              showLabel
              showBMI
              previousWeightKg={hasProgress ? user.startWeightKg : undefined}
            />

            <p className="text-center text-sm text-neutral-500 max-w-[220px]">
              {user.goal === "lose_weight"
                ? "Every kg you lose changes this image. Keep logging daily."
                : user.goal === "gain_muscle"
                ? "Stack protein-rich meals to build that physique."
                : "Stay consistent. The body follows the routine."}
            </p>

            <Link
              href="/dashboard/weight"
              className="inline-flex items-center gap-1.5 rounded-full bg-teal-600 text-white px-4 py-2 text-sm font-semibold hover:bg-teal-700 transition-colors"
            >
              <Scale className="size-3.5" />
              Log today's weight
            </Link>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 content-start">
            <StatCard
              icon={<Scale className="size-5" />}
              label="Current Weight"
              value={`${user.currentWeightKg.toFixed(1)} kg`}
              delta={user.goal === "gain_muscle"
                ? `+${(user.currentWeightKg - user.startWeightKg).toFixed(1)} kg gained`
                : `${Math.max(0, user.startWeightKg - user.currentWeightKg).toFixed(1)} kg lost`}
              deltaTone="positive"
            />
            <StatCard
              icon={<Target className="size-5" />}
              label="Target Weight"
              value={`${user.targetWeightKg.toFixed(1)} kg`}
              delta={`${progress.toFixed(0)}% there`}
            />
            <StatCard
              icon={<Flame className="size-5" />}
              label="Daily Calories"
              value={`${analysis.recommendedDailyCalories}`}
              delta={`${analysis.recommendedProteinG}g protein`}
            />
            <StatCard
              icon={<Droplets className="size-5" />}
              label="Water Target"
              value={`${state.doctorPlan?.waterLiters ?? 2.5} L`}
              delta="per day"
            />
          </div>
        </section>

        {/* Before / After comparison (only if weight changed) */}
        {hasProgress && user.startWeightKg !== user.currentWeightKg && (
          <section className="rounded-3xl border border-neutral-100 bg-white p-6">
            <h2 className="text-lg font-bold text-neutral-900 mb-6 text-center">Your Transformation</h2>
            <BodyComparison
              startWeightKg={user.startWeightKg}
              currentWeightKg={user.currentWeightKg}
              heightCm={user.heightCm}
              gender={user.gender === "female" ? "female" : "male"}
            />
          </section>
        )}

        {/* Weight chart + AI */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-neutral-100 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">Weight Progress</h2>
              <TrendingDown className="size-5 text-teal-600" />
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              Last 7 days · {Math.max(0, user.startWeightKg - user.currentWeightKg).toFixed(1)} kg total
            </p>
            <div className="mt-6 flex h-32 items-end gap-2">
              {recent.length > 0 ? recent.map((log) => {
                const min = Math.min(...recent.map((l) => l.weightKg))
                const max = Math.max(...recent.map((l) => l.weightKg))
                const range = max - min || 1
                const heightPct = ((log.weightKg - min) / range) * 80 + 20
                return (
                  <div key={log.id} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-teal-600 to-teal-400"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[10px] text-neutral-400">
                      {new Date(log.date).toLocaleDateString("en-GB", { day: "numeric" })}
                    </span>
                  </div>
                )
              }) : (
                <div className="flex-1 flex items-center justify-center text-sm text-neutral-400">
                  No weight logs yet. Start logging!
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-100 bg-gradient-to-br from-teal-700 to-teal-900 p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-200">AI Analysis</p>
            <h2 className="mt-2 text-xl font-bold leading-snug">{analysis.summaryEn}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80">{analysis.motivationEn}</p>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-center text-xs">
              <div>
                <p className="text-white/60">Ideal</p>
                <p className="mt-1 font-semibold">{analysis.idealWeightKg} kg</p>
              </div>
              <div>
                <p className="text-white/60">Timeline</p>
                <p className="mt-1 font-semibold">{analysis.estimatedWeeks > 0 ? `${analysis.estimatedWeeks}w` : "—"}</p>
              </div>
              <div>
                <p className="text-white/60">Daily</p>
                <p className="mt-1 font-semibold">{analysis.recommendedDailyCalories} kcal</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <QuickAction href="/dashboard/weight" icon={<Scale className="size-5" />} label="Log weight" subtitle="Daily check-in" />
          <QuickAction href="/dashboard/plan" icon={<Apple className="size-5" />} label="View plan" subtitle="Today's meals" />
          <QuickAction href="/dashboard/sessions" icon={<Calendar className="size-5" />} label="Sessions" subtitle={`${state.sessions.filter((s) => s.status === "scheduled").length} upcoming`} />
          <QuickAction href="/dashboard/products" icon={<ShoppingBag className="size-5" />} label="Shop" subtitle="Healthy products" />
        </section>

      </div>
    </DashboardShell>
  )
}

function StatCard({ icon, label, value, delta, deltaTone = "neutral" }: {
  icon: React.ReactNode; label: string; value: string; delta: string; deltaTone?: "positive" | "neutral" | "negative"
}) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-4">
      <span className="flex size-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600">{icon}</span>
      <p className="mt-3 text-xs text-neutral-500">{label}</p>
      <p className="mt-0.5 text-2xl font-bold text-neutral-900">{value}</p>
      <p className={cn("mt-1 text-xs font-medium",
        deltaTone === "positive" && "text-teal-600",
        deltaTone === "negative" && "text-red-500",
        deltaTone === "neutral" && "text-neutral-500"
      )}>{delta}</p>
    </div>
  )
}

function QuickAction({ href, icon, label, subtitle }: {
  href: string; icon: React.ReactNode; label: string; subtitle: string
}) {
  return (
    <Link href={href} className="group flex flex-col items-start gap-2 rounded-2xl border border-neutral-100 bg-white p-4 transition-all hover:border-teal-300 hover:shadow-md">
      <span className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-100">{icon}</span>
      <div>
        <p className="font-semibold text-neutral-900">{label}</p>
        <p className="text-xs text-neutral-500">{subtitle}</p>
      </div>
      <ArrowRight className="mt-1 size-4 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-600" />
    </Link>
  )
}
