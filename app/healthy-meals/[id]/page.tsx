"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Flame, Clock, Leaf, ShieldCheck, ChefHat, Dumbbell, Wheat, Droplets } from "lucide-react"
import { fetchMeals } from "@/lib/supabase/db"
import type { Meal } from "@/lib/types"
import { useLocale, t } from "@/lib/locale"
import { waLink } from "@/lib/site"

const MEAL_TYPE_LABELS: Record<string, { en: string; ar: string }> = {
  breakfast: { en: "Breakfast", ar: "إفطار" },
  lunch: { en: "Lunch", ar: "غداء" },
  dinner: { en: "Dinner", ar: "عشاء" },
  snack: { en: "Light meal", ar: "وجبة خفيفة" },
}

export default function MealDetailPage() {
  const params = useParams()
  const { locale } = useLocale()
  const id = String(params?.id ?? "")

  const [meals, setMeals] = useState<Meal[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    fetchMeals()
      .then((m) => { if (active) setMeals(m) })
      .catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [])

  const meal = useMemo(() => (meals ?? []).find((m) => m.id === id), [meals, id])
  const related = useMemo(
    () => (meals ?? []).filter((m) => m.id !== id && m.mealType === meal?.mealType).slice(0, 4),
    [meals, id, meal],
  )

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f6faf8] px-4 text-center">
        <p className="text-lg font-bold text-red-700">{t(locale, "Could not load meal.", "تعذّر تحميل الوجبة.")}</p>
        <Link href="/healthy-meals" className="mt-4 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white">
          {t(locale, "Back to meals", "العودة للوجبات")}
        </Link>
      </main>
    )
  }

  if (meals === null) {
    return (
      <main className="min-h-screen bg-[#f6faf8] pt-24">
        <div className="mx-auto max-w-5xl px-4 pb-16">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-3xl bg-neutral-100" />
            <div className="flex flex-col gap-4">
              <div className="h-6 w-24 animate-pulse rounded-full bg-neutral-100" />
              <div className="h-10 w-3/4 animate-pulse rounded-lg bg-neutral-100" />
              <div className="h-24 animate-pulse rounded-lg bg-neutral-100" />
              <div className="h-28 animate-pulse rounded-2xl bg-neutral-100" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!meal) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f6faf8] px-4 text-center">
        <p className="text-lg font-bold text-neutral-900">{t(locale, "Meal not found", "الوجبة غير موجودة")}</p>
        <Link href="/healthy-meals" className="mt-4 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white">
          {t(locale, "Back to meals", "العودة للوجبات")}
        </Link>
      </main>
    )
  }

  const name = locale === "ar" ? meal.nameAr || meal.nameEn : meal.nameEn
  const desc = locale === "ar" ? meal.descriptionAr || meal.descriptionEn : meal.descriptionEn
  const typeLabel = MEAL_TYPE_LABELS[meal.mealType] ?? MEAL_TYPE_LABELS.snack

  const macros = [
    { icon: Flame, label: t(locale, "Calories", "السعرات"), value: `${meal.calories} kcal`, bg: "bg-orange-50", text: "text-orange-700" },
    { icon: Dumbbell, label: t(locale, "Protein", "بروتين"), value: `${meal.protein}g`, bg: "bg-emerald-50", text: "text-emerald-700" },
    { icon: Wheat, label: t(locale, "Carbs", "كارب"), value: `${meal.carbs}g`, bg: "bg-sky-50", text: "text-sky-700" },
    { icon: Droplets, label: t(locale, "Fat", "دهون"), value: `${meal.fat}g`, bg: "bg-amber-50", text: "text-amber-700" },
  ]

  return (
    <main className="min-h-screen bg-[#f6faf8] pt-24">
      <div className="mx-auto max-w-5xl px-4 pb-16">
        <Link
          href="/healthy-meals"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-emerald-700 focus:outline-none focus:underline"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
          {t(locale, "Back to meals", "العودة للوجبات")}
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-neutral-100 bg-[#f3fae6] shadow-sm">
            {meal.imageUrl ? (
              <Image
                src={meal.imageUrl}
                alt={name}
                fill
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <span className="flex size-full items-center justify-center text-7xl" aria-hidden="true">🥗</span>
            )}
            <span className="absolute top-4 start-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-4 py-1.5 text-sm font-bold text-[#4d7c0f] shadow-sm">
              <Clock className="size-4" />
              {t(locale, typeLabel.en, typeLabel.ar)}
            </span>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#4d7c0f]/10 px-3 py-1 text-xs font-bold text-[#4d7c0f]">
              <ChefHat className="size-3.5" />
              {t(locale, "Nutritionist designed", "من تصميم أخصائي تغذية")}
            </span>

            <h1 className="mt-3 text-3xl font-bold text-neutral-900 text-balance md:text-4xl">{name}</h1>

            {desc && <p className="mt-4 leading-relaxed text-neutral-600">{desc}</p>}

            {/* Macros grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {macros.map((m) => (
                <div key={m.label} className={`flex flex-col items-center gap-1.5 rounded-2xl ${m.bg} p-4 text-center`}>
                  <m.icon className={`size-5 ${m.text}`} aria-hidden />
                  <span className={`text-lg font-bold ${m.text}`}>{m.value}</span>
                  <span className="text-xs font-medium text-neutral-500">{m.label}</span>
                </div>
              ))}
            </div>

            {/* Tags */}
            {meal.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {meal.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Trust row */}
            <div className="mt-6 flex flex-wrap gap-4 border-t border-neutral-200 pt-5 text-sm text-neutral-600">
              <span className="inline-flex items-center gap-1.5">
                <Leaf className="size-4 text-emerald-600" aria-hidden />
                {t(locale, "Fresh ingredients", "مكونات طازجة")}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-emerald-600" aria-hidden />
                {t(locale, "Macro-counted", "محسوبة العناصر")}
              </span>
            </div>

            {/* CTA */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={waLink(
                  t(
                    locale,
                    `Hi! I would like to order the "${meal.nameEn}" meal.`,
                    `مرحباً! أود طلب وجبة "${meal.nameAr || meal.nameEn}".`,
                  ),
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#4d7c0f] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#3f6a0a]"
              >
                <img src="/icons/whatsapp.svg" alt="" className="size-5" aria-hidden="true" />
                {t(locale, "Order via WhatsApp", "اطلب عبر واتساب")}
              </a>
              <Link
                href="/sign-up"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[#4d7c0f] px-6 py-3.5 text-sm font-bold text-[#4d7c0f] transition-colors hover:bg-[#4d7c0f] hover:text-white"
              >
                {t(locale, "Get a meal plan", "احصل على خطة وجبات")}
                <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
              </Link>
            </div>
          </div>
        </div>

        {/* Related meals */}
        {related.length > 0 && (
          <section className="mt-16" aria-label={t(locale, "Similar meals", "وجبات مشابهة")}>
            <h2 className="mb-6 text-xl font-bold text-neutral-900">{t(locale, "Similar meals", "وجبات مشابهة")}</h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/healthy-meals/${r.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm transition-all hover:border-lime-300 hover:shadow-lg"
                >
                  <div className="relative h-32 overflow-hidden bg-[#f3fae6]">
                    {r.imageUrl ? (
                      <Image
                        src={r.imageUrl}
                        alt={locale === "ar" ? r.nameAr || r.nameEn : r.nameEn}
                        fill
                        sizes="(max-width:1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-3xl" aria-hidden="true">🥗</span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <h3 className="text-sm font-bold text-neutral-900 line-clamp-1 group-hover:text-lime-700">
                      {locale === "ar" ? r.nameAr || r.nameEn : r.nameEn}
                    </h3>
                    <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">
                      <Flame className="size-3" aria-hidden />
                      {r.calories} kcal
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
