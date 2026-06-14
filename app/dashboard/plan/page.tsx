"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Apple, Flame, Beef, Wheat, Droplet, ChefHat, ShoppingCart } from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { useApp } from "@/lib/store"
import { cn } from "@/lib/utils"

const DAYS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const DAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

export default function PlanPage() {
  const router = useRouter()
  const { state, addToCart } = useApp()
  const user = state.user
  const plan = state.doctorPlan

  useEffect(() => {
    if (!user) router.replace("/onboarding")
  }, [user, router])

  if (!user || !plan) return null

  // Group plan items by day
  const byDay: Record<number, typeof plan.planItems> = {}
  plan.planItems.forEach((item) => {
    if (!byDay[item.dayOfWeek]) byDay[item.dayOfWeek] = []
    byDay[item.dayOfWeek].push(item)
  })

  return (
    <DashboardShell>
      <MobileNav />
      <div className="mx-auto max-w-5xl space-y-6 pb-24 lg:pb-0">
        <header>
          <h1 className="text-3xl font-bold text-neutral-900">My Plan</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Designed by {plan.doctorName} · {plan.dailyCalories} kcal/day · {plan.waterLiters}L water
          </p>
        </header>

        {/* Doctor notes */}
        <section className="rounded-3xl border border-lime-100 bg-gradient-to-br from-lime-50 to-white p-6">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-lime-600 text-white">
              <ChefHat className="size-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-lime-700">
                Doctor's Notes
              </p>
              <p className="mt-1 text-base font-semibold text-neutral-900">
                {plan.notesEn}
              </p>
              <p className="mt-1 text-sm text-neutral-600">{plan.notesAr}</p>
            </div>
          </div>
        </section>

        {/* Daily macros */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MacroCard
            icon={<Flame className="size-4" />}
            label="Calories"
            value={`${plan.dailyCalories}`}
            unit="kcal"
            color="orange"
          />
          <MacroCard
            icon={<Beef className="size-4" />}
            label="Protein"
            value={`${Math.round(plan.dailyCalories * 0.30 / 4)}`}
            unit="g"
            color="teal"
          />
          <MacroCard
            icon={<Wheat className="size-4" />}
            label="Carbs"
            value={`${Math.round(plan.dailyCalories * 0.45 / 4)}`}
            unit="g"
            color="yellow"
          />
          <MacroCard
            icon={<Droplet className="size-4" />}
            label="Water"
            value={`${plan.waterLiters}`}
            unit="L"
            color="blue"
          />
        </section>

        {/* Plan by day */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-neutral-900">Weekly meal plan</h2>
          {[0, 1, 2, 3, 4, 5, 6].map((day) => {
            const items = byDay[day] ?? []
            if (items.length === 0) return null
            return (
              <div
                key={day}
                className="rounded-2xl border border-neutral-100 bg-white p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-bold text-neutral-900">
                    {DAYS_EN[day]}{" "}
                    <span className="text-sm font-normal text-neutral-400">
                      · {DAYS_AR[day]}
                    </span>
                  </h3>
                  <span className="text-xs text-neutral-500">
                    {items.length} {items.length === 1 ? "meal" : "meals"}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-neutral-100 bg-neutral-50 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-lime-700">
                          {item.meal.mealType}
                        </span>
                        <span className="text-xs font-bold text-neutral-700">
                          {item.meal.calories} kcal
                        </span>
                      </div>
                      <p className="mt-2 font-semibold text-neutral-900">
                        {item.meal.nameEn}
                      </p>
                      <p className="text-xs text-neutral-500">{item.meal.nameAr}</p>
                      <p className="mt-1 text-xs text-neutral-600 line-clamp-2">
                        {item.meal.descriptionEn}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[10px] font-semibold">
                        <span className="rounded bg-lime-100 px-1.5 py-0.5 text-lime-700">
                          P {item.meal.protein}g
                        </span>
                        <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-yellow-700">
                          C {item.meal.carbs}g
                        </span>
                        <span className="rounded bg-orange-100 px-1.5 py-0.5 text-orange-700">
                          F {item.meal.fat}g
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </section>

        {/* Suggested products from clinic */}
        <section className="rounded-3xl border border-neutral-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">
              Suggested products from the clinic
            </h2>
            <a
              href="/dashboard/products"
              className="text-sm font-semibold text-lime-700 hover:underline"
            >
              View all →
            </a>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            Hand-picked to fit your plan
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {state.products.slice(0, 3).map((product) => (
              <div
                key={product.id}
                className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4"
              >
                <div className="flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-lime-100 to-lime-50 text-3xl">
                  🥗
                </div>
                <p className="mt-3 font-semibold text-neutral-900">{product.nameEn}</p>
                <p className="text-xs text-neutral-500">{product.nameAr}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-bold text-lime-700">{product.price} AED</span>
                  <button
                    type="button"
                    onClick={() => addToCart(product.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-lime-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-lime-800"
                  >
                    <ShoppingCart className="size-3" />
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}

function MacroCard({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
  color: "orange" | "teal" | "yellow" | "blue"
}) {
  const colorMap = {
    orange: "bg-orange-50 text-orange-700",
    teal: "bg-lime-50 text-lime-700",
    yellow: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-50 text-blue-700",
  } as const
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-4">
      <div
        className={cn(
          "flex size-8 items-center justify-center rounded-lg",
          colorMap[color]
        )}
      >
        {icon}
      </div>
      <p className="mt-2 text-xs text-neutral-500">{label}</p>
      <p className="mt-0.5 text-xl font-bold text-neutral-900">
        {value} <span className="text-sm font-normal text-neutral-500">{unit}</span>
      </p>
    </div>
  )
}
