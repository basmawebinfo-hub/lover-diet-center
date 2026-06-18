"use client"

import { use } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Flame, Beef, Wheat, Droplet, ShoppingCart, CalendarPlus, Check } from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { useApp } from "@/lib/store"
import type { Meal } from "@/lib/types"
import { useLocale, t } from "@/lib/locale"

const MEAL_TYPE_AR: Record<Meal["mealType"], string> = {
  breakfast: "فطار",
  lunch: "غداء",
  dinner: "عشاء",
  snack: "سناك",
}

export default function MealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { locale } = useLocale()
  const { state, addToCart } = useApp()

  const meal = state.meals.find((m) => m.id === id)

  if (!state.hydrated) return null

  if (!meal) {
    return (
      <DashboardShell>
        <MobileNav />
        <div className="mx-auto max-w-3xl py-20 text-center">
          <p className="text-lg font-semibold text-neutral-700">{t(locale,"Meal not found.","الوجبة غير موجودة.")}</p>
          <Link href="/dashboard/plan" className="mt-4 inline-block text-sm font-semibold text-lime-700 hover:underline">
            {t(locale,"Back to my plan","العودة إلى خطتي")}
          </Link>
        </div>
      </DashboardShell>
    )
  }

  // Match a purchasable product by name, if any
  const product = state.products.find(
    (p) => p.nameEn.toLowerCase() === meal.nameEn.toLowerCase()
  )

  const macros = [
    { label: t(locale,"Calories","سعرات"), value: `${meal.calories}`, unit: t(locale,"kcal","سعرة"), icon: Flame, color: "text-orange-500 bg-orange-50" },
    { label: t(locale,"Protein","بروتين"), value: `${meal.protein}`, unit: t(locale,"g","غ"), icon: Beef, color: "text-lime-700 bg-lime-50" },
    { label: t(locale,"Carbs","كربوهيدرات"), value: `${meal.carbs}`, unit: t(locale,"g","غ"), icon: Wheat, color: "text-amber-600 bg-amber-50" },
    { label: t(locale,"Fat","دهون"), value: `${meal.fat}`, unit: t(locale,"g","غ"), icon: Droplet, color: "text-sky-600 bg-sky-50" },
  ]

  return (
    <DashboardShell>
      <MobileNav />
      <div className="mx-auto max-w-4xl space-y-6 pb-24 lg:pb-0">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-neutral-500">
          <Link href="/dashboard" className="hover:text-lime-700">{t(locale,"Dashboard","لوحة التحكم")}</Link>
          <span>/</span>
          <Link href="/dashboard/plan" className="hover:text-lime-700">{t(locale,"My Plan","خطتي")}</Link>
          <span>/</span>
          <span className="font-semibold text-neutral-800">{locale === "ar" ? meal.nameAr : meal.nameEn}</span>
        </nav>

        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-lime-700"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" /> {t(locale,"Back","رجوع")}
        </button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-lime-50 shadow-sm">
            <Image src={meal.imageUrl} alt={meal.nameEn} fill className="object-cover" sizes="(min-width:1024px) 50vw, 100vw" priority />
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-lime-700 backdrop-blur">
              {locale === "ar" ? MEAL_TYPE_AR[meal.mealType] : meal.mealType}
            </span>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">{locale === "ar" ? meal.nameAr : meal.nameEn}</h1>

            <p className="mt-4 leading-relaxed text-neutral-600">{locale === "ar" ? meal.descriptionAr : meal.descriptionEn}</p>

            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {meal.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-lime-200 bg-lime-50 px-3 py-1 text-xs font-semibold text-lime-700">
                  {tag}
                </span>
              ))}
            </div>

            {/* Macros */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {macros.map((m) => {
                const Icon = m.icon
                return (
                  <div key={m.label} className="rounded-2xl border border-neutral-100 bg-white p-3 text-center shadow-sm">
                    <div className={`mx-auto flex size-9 items-center justify-center rounded-xl ${m.color}`}>
                      <Icon className="size-4" />
                    </div>
                    <p className="mt-2 text-lg font-extrabold text-neutral-900">{m.value}<span className="text-xs font-medium text-neutral-400"> {m.unit}</span></p>
                    <p className="text-[11px] text-neutral-500">{m.label}</p>
                  </div>
                )
              })}
            </div>

            {/* CTAs */}
            <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row">
              {product ? (
                <button
                  type="button"
                  onClick={() => { addToCart(product.id); router.push("/dashboard/cart") }}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-lime-400 to-lime-500 px-6 py-4 text-base font-bold text-lime-950 shadow-lg shadow-lime-500/40 transition hover:-translate-y-0.5"
                >
                  <ShoppingCart className="size-5" /> {t(locale,"Buy Now","اشترِ الآن")} · {product.price} {t(locale,"AED","درهم")}
                </button>
              ) : (
                <Link
                  href="/dashboard/products"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-lime-400 to-lime-500 px-6 py-4 text-base font-bold text-lime-950 shadow-lg shadow-lime-500/40 transition hover:-translate-y-0.5"
                >
                  <ShoppingCart className="size-5" /> {t(locale,"Shop Products","تسوّق المنتجات")}
                </Link>
              )}
              <Link
                href="/dashboard/plan"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-6 py-4 text-base font-semibold text-neutral-800 transition hover:border-lime-300"
              >
                <CalendarPlus className="size-5" /> {t(locale,"View in My Plan","عرض في خطتي")}
              </Link>
            </div>
          </div>
        </div>

        {/* Other meals */}
        <div className="pt-6">
          <h2 className="text-lg font-bold text-neutral-900">{t(locale,"More meals","وجبات أخرى")}</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {state.meals.filter((m) => m.id !== meal.id).slice(0, 4).map((m) => (
              <Link key={m.id} href={`/dashboard/meals/${m.id}`} className="group overflow-hidden rounded-2xl border border-neutral-100 bg-white transition hover:border-lime-300 hover:shadow-md">
                <div className="relative h-28 bg-lime-50">
                  <Image src={m.imageUrl} alt={m.nameEn} fill className="object-cover transition group-hover:scale-105" sizes="25vw" />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold text-neutral-900">{locale === "ar" ? m.nameAr : m.nameEn}</p>
                  <p className="text-xs text-neutral-400">{m.calories} {t(locale,"kcal","سعرة")}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
