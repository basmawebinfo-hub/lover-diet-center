"use client"

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { LocaleLink as Link } from '@/components/ui/locale-link'
import { ArrowRight, ChefHat, Flame, Beef, MessageCircle } from 'lucide-react'
import { useLocale, t } from '@/lib/locale'
import { fetchMeals } from '@/lib/supabase/db'
import { WHATSAPP_DIRECT } from '@/lib/site'
import type { Meal } from '@/lib/types'

// Meal groups, in the order a day runs.
const MEAL_TYPES = [
  { id: 'breakfast', en: 'Breakfast', ar: 'الفطار' },
  { id: 'lunch',     en: 'Lunch',     ar: 'الغداء' },
  { id: 'dinner',    en: 'Dinner',    ar: 'العشاء' },
  { id: 'snack',     en: 'Snacks',    ar: 'سناكس' },
] as const

type Filter = 'all' | (typeof MEAL_TYPES)[number]['id']

export function HealthyMealsContent() {
  const { locale } = useLocale()
  const [meals, setMeals] = useState<Meal[] | null>(null)
  const [filter, setFilter] = useState<Filter>('all')

  // Meals come from the `meals` table, not `products`.
  //
  // This page used to call fetchProducts() and filter for category === 'meal'.
  // No product has ever carried that category — the catalogue is snacks,
  // drinks and supplements — so the filter always returned an empty array and
  // every visitor saw the "menu is being updated" placeholder instead of the
  // 23 meals that were sitting in the database the whole time.
  useEffect(() => {
    fetchMeals().then(setMeals).catch(() => setMeals([]))
  }, [])

  const shown = useMemo(
    () => (meals ?? []).filter((m) => filter === 'all' || m.mealType === filter),
    [meals, filter],
  )

  // Only offer a tab if there is something behind it.
  const availableTypes = useMemo(
    () => MEAL_TYPES.filter((mt) => (meals ?? []).some((m) => m.mealType === mt.id)),
    [meals],
  )

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f0faf7] to-white px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#4d7c0f]/10 px-4 py-2 text-sm font-semibold text-[#4d7c0f]">
            <ChefHat className="size-4" />
            {t(locale, 'Healthy Meals', 'الوجبات الصحية')}
          </div>
          <h1 className="mb-6 text-4xl font-bold leading-tight text-neutral-900 md:text-5xl">
            {locale === 'ar' ? (
              <>وجبات يحضّرها الطهاة،{' '}<span className="text-[#4d7c0f]">تصلك طازجة</span></>
            ) : (
              <>Chef-Prepared Meals,{' '}<span className="text-[#4d7c0f]">Delivered Fresh</span></>
            )}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-neutral-600">
            {t(
              locale,
              'Every meal is designed by certified nutritionists and prepared by professional chefs. Macro-balanced, delicious, and delivered to your door across the UAE.',
              'كل وجبة يصمّمها أخصائيو تغذية معتمدون ويحضّرها طهاة محترفون. متوازنة العناصر، لذيذة، وتصلك إلى باب منزلك في مختلف أنحاء الإمارات.'
            )}
          </p>
          <a
            href="#meals"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-lime-400 to-lime-500 px-8 py-4 text-base font-bold text-lime-950 shadow-lg shadow-lime-500/40 transition-all hover:-translate-y-0.5"
          >
            {t(locale, 'See the meals', 'شوف الوجبات')}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </a>
        </div>
      </section>

      {/* Meals */}
      <section id="meals" className="scroll-mt-20 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-neutral-900">
            {t(locale, 'Our Meals', 'وجباتنا')}
          </h2>

          {/* Filters */}
          {availableTypes.length > 1 && (
            <div className="mb-10 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                  filter === 'all'
                    ? 'bg-[#4d7c0f] text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {t(locale, 'All', 'الكل')}
              </button>
              {availableTypes.map((mt) => (
                <button
                  key={mt.id}
                  type="button"
                  onClick={() => setFilter(mt.id)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                    filter === mt.id
                      ? 'bg-[#4d7c0f] text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {locale === 'ar' ? mt.ar : mt.en}
                </button>
              ))}
            </div>
          )}

          {meals === null ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-3xl border border-neutral-100">
                  <div className="h-44 animate-pulse bg-neutral-100" />
                  <div className="space-y-2 p-4">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-100" />
                    <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : shown.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center">
              <p className="text-neutral-500">
                {t(locale, 'No meals in this category yet.', 'لا توجد وجبات في هذا القسم بعد.')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {shown.map((meal) => (
                <article
                  key={meal.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm transition-all hover:border-lime-300 hover:shadow-lg"
                >
                  <div className="relative h-44 overflow-hidden bg-[#f3fae6]">
                    {meal.imageUrl ? (
                      <Image
                        src={meal.imageUrl}
                        alt={locale === 'ar' ? meal.nameAr : meal.nameEn}
                        fill
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-4xl">🥗</span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="line-clamp-2 font-bold text-neutral-900">
                      {locale === 'ar' ? meal.nameAr : meal.nameEn}
                    </h3>
                    {(locale === 'ar' ? meal.descriptionAr : meal.descriptionEn) && (
                      <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
                        {locale === 'ar' ? meal.descriptionAr : meal.descriptionEn}
                      </p>
                    )}
                    {/* Macros carry the value here — these meals are sold as part
                        of the monthly plan, so there is no per-item price. */}
                    <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-sm">
                      {meal.calories > 0 && (
                        <span className="inline-flex items-center gap-1 font-semibold text-[#4d7c0f]">
                          <Flame className="size-3.5" /> {meal.calories} {t(locale, 'kcal', 'سعرة')}
                        </span>
                      )}
                      {meal.protein > 0 && (
                        <span className="inline-flex items-center gap-1 text-neutral-500">
                          <Beef className="size-3.5" /> {meal.protein}g {t(locale, 'protein', 'بروتين')}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Monthly plan CTA */}
      <section className="bg-[#4d7c0f] px-4 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-3xl font-bold text-white">
            {t(locale, 'Monthly Meal Plan', 'باقة الوجبات الشهرية')}
          </h2>
          <p className="mb-8 text-white/80">
            {t(
              locale,
              'Meals are delivered as a monthly plan built around your goals. Message us and we will put yours together.',
              'الوجبات تُقدَّم ضمن باقة شهرية مصمّمة حسب أهدافك. راسلنا وهنجهّزلك باقتك.'
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={WHATSAPP_DIRECT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-bold text-[#4d7c0f] transition-colors hover:bg-neutral-100"
            >
              <MessageCircle className="size-4" />
              {t(locale, 'Order the plan', 'اطلب الباقة')}
            </a>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/40 px-8 py-4 font-bold text-white transition-colors hover:bg-white/10"
            >
              {t(locale, 'Browse the shop', 'تصفّح المتجر')}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
