"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { InAppActionButton } from '@/components/in-app-action-button'
import { ArrowRight, ChefHat, Flame, Clock, Sunrise, Sun, Moon, Cookie } from 'lucide-react'
import { useLocale, t } from '@/lib/locale'
import { useCurrency } from '@/lib/currency'
import { fetchProducts, fetchMeals } from '@/lib/supabase/db'
import type { Product, Meal } from '@/lib/types'

const MEAL_TYPE_LABELS: Record<string, { en: string; ar: string }> = {
  breakfast: { en: 'Breakfast', ar: 'إفطار' },
  lunch: { en: 'Lunch', ar: 'غداء' },
  dinner: { en: 'Dinner', ar: 'عشاء' },
  snack: { en: 'Light meal', ar: 'وجبة خفيفة' },
}

const MEAL_TYPE_SECTIONS = [
  {
    key: 'breakfast',
    icon: Sunrise,
    en: 'Breakfast Meals',
    ar: 'وجبات الإفطار',
    descEn: 'Start your day with balanced energy.',
    descAr: 'ابدأ يومك بطاقة متوازنة.',
    accent: 'text-amber-600',
    accentBg: 'bg-amber-50',
    ring: 'border-amber-200',
  },
  {
    key: 'lunch',
    icon: Sun,
    en: 'Lunch Meals',
    ar: 'وجبات الغداء',
    descEn: 'Hearty macro-balanced midday plates.',
    descAr: 'أطباق غداء مشبعة ومتوازنة العناصر.',
    accent: 'text-orange-600',
    accentBg: 'bg-orange-50',
    ring: 'border-orange-200',
  },
  {
    key: 'dinner',
    icon: Moon,
    en: 'Dinner Meals',
    ar: 'وجبات العشاء',
    descEn: 'Light yet satisfying evening options.',
    descAr: 'خيارات مسائية خفيفة ومشبعة.',
    accent: 'text-indigo-600',
    accentBg: 'bg-indigo-50',
    ring: 'border-indigo-200',
  },
  {
    key: 'snack',
    icon: Cookie,
    en: 'Snacks & Light Meals',
    ar: 'سناكس ووجبات خفيفة',
    descEn: 'Smart bites between your main meals.',
    descAr: 'لقيمات ذكية بين وجباتك الأساسية.',
    accent: 'text-emerald-600',
    accentBg: 'bg-emerald-50',
    ring: 'border-emerald-200',
  },
] as const

export function HealthyMealsContent() {
  const { locale } = useLocale()
  const { format } = useCurrency()
  const [meals, setMeals] = useState<Product[] | null>(null)
  const [catalogMeals, setCatalogMeals] = useState<Meal[] | null>(null)
  const [mealTypeFilter, setMealTypeFilter] = useState<string>('all')

  useEffect(() => {
    fetchProducts().then((all) => setMeals(all.filter((p) => p.category === 'meal')))
    fetchMeals().then(setCatalogMeals)
  }, [])

  const filteredCatalogMeals = (catalogMeals ?? []).filter(
    (m) => mealTypeFilter === 'all' || (m.mealType ?? 'snack') === mealTypeFilter,
  )

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f0faf7] to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#4d7c0f]/10 text-[#4d7c0f] text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <ChefHat className="w-4 h-4" />
            {t(locale, 'Healthy Meals', 'الوجبات الصحية')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
            {locale === 'ar' ? (
              <>وجبات يحضّرها الطهاة،{' '}<span className="text-[#4d7c0f]">تصلك طازجة</span></>
            ) : (
              <>Chef-Prepared Meals,{' '}<span className="text-[#4d7c0f]">Delivered Fresh</span></>
            )}
          </h1>
          <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            {t(
              locale,
              'Every meal is designed by certified nutritionists and prepared by professional chefs. Macro-balanced, delicious, and delivered to your door across the UAE.',
              'كل وجبة يصمّمها أخصائيو تغذية معتمدون ويحضّرها طهاة محترفون. متوازنة العناصر، لذيذة، وتصلك إلى باب منزلك في مختلف أنحاء الإمارات.'
            )}
          </p>
          <InAppActionButton mode="shop" label={t(locale, 'Order Now', 'اطلب الآن')} variant="light" />
        </div>
      </section>

      {/* Meal Cards */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-10">{t(locale, 'Our Meals', 'وجباتنا')}</h2>

          {meals === null ? (
            <p className="py-10 text-center text-neutral-400">{t(locale, 'Loading…', 'جارٍ التحميل…')}</p>
          ) : meals.length === 0 ? (
            (catalogMeals?.length ?? 0) === 0 ? (
              <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center">
                <p className="text-neutral-500">{t(locale, 'Our meal menu is being updated — browse the full shop in the meantime.', 'قائمة وجباتنا قيد التحديث — تصفّح المتجر بالكامل في هذه الأثناء.')}</p>
                <div className="mt-5">
                  <InAppActionButton mode="shop" label={t(locale, 'Browse the shop', 'تصفّح المتجر')} variant="light" />
                </div>
              </div>
            ) : null
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {meals.map((meal) => (
                <Link
                  key={meal.id}
                  href={`/shop/${meal.id}`}
                  className="group flex flex-col bg-white border border-neutral-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg hover:border-lime-300 transition-all"
                >
                  <div className="relative h-44 overflow-hidden bg-[#f3fae6]">
                    {meal.imageUrl ? (
                      <Image src={meal.imageUrl} alt={locale === 'ar' ? meal.nameAr : meal.nameEn} fill sizes="(max-width:640px) 100vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <span className="flex size-full items-center justify-center text-4xl">🥗</span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-bold text-neutral-900 group-hover:text-lime-700 transition-colors line-clamp-1">{locale === 'ar' ? meal.nameAr : meal.nameEn}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{locale === 'ar' ? meal.descriptionAr : meal.descriptionEn}</p>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <span className="text-lg font-bold text-[#4d7c0f]">{format(meal.price)}</span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-lime-700 group-hover:gap-1.5 transition-all">
                        {t(locale, 'View details', 'التفاصيل')} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Nutrition catalog meals (managed from admin "Meals & Plans") */}
      {(catalogMeals?.length ?? 0) > 0 && (
        <section className="bg-[#f7fbf4] py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-neutral-900">{t(locale, 'Nutrition Menu', 'قائمة الوجبات الغذائية')}</h2>
              <p className="mt-2 text-neutral-600">
                {t(locale, 'Macro-counted meals designed by our nutritionists.', 'وجبات محسوبة السعرات والعناصر من تصميم أخصائيي التغذية لدينا.')}
              </p>
            </div>
            {/* Filter tabs — click a type to show only its meals, like the shop */}
            <div
              role="tablist"
              aria-label={t(locale, 'Filter meals by type', 'تصفية الوجبات حسب النوع')}
              className="mb-10 flex flex-wrap justify-center gap-2"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mealTypeFilter === 'all'}
                onClick={() => setMealTypeFilter('all')}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
                  mealTypeFilter === 'all'
                    ? 'bg-[#4d7c0f] text-white shadow-md scale-105'
                    : 'border border-neutral-200 bg-white text-neutral-700 hover:border-lime-300 hover:text-[#4d7c0f]'
                }`}
              >
                {t(locale, 'All', 'الكل')}
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${mealTypeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'}`}>
                  {(catalogMeals ?? []).length}
                </span>
              </button>
              {MEAL_TYPE_SECTIONS.map((section) => {
                const count = (catalogMeals ?? []).filter((m) => (m.mealType ?? 'snack') === section.key).length
                if (count === 0) return null
                const SectionIcon = section.icon
                const active = mealTypeFilter === section.key
                return (
                  <button
                    key={section.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setMealTypeFilter(section.key)}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
                      active
                        ? 'bg-[#4d7c0f] text-white shadow-md scale-105'
                        : `border ${section.ring} ${section.accentBg} ${section.accent} hover:scale-105`
                    }`}
                  >
                    <SectionIcon className="size-4" />
                    {t(locale, MEAL_TYPE_LABELS[section.key].en, MEAL_TYPE_LABELS[section.key].ar)}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${active ? 'bg-white/20 text-white' : 'bg-white'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Active section description */}
            {mealTypeFilter !== 'all' && (
              <p className="mb-8 text-center text-sm text-neutral-500">
                {(() => {
                  const section = MEAL_TYPE_SECTIONS.find((s) => s.key === mealTypeFilter)
                  return section ? t(locale, section.descEn, section.descAr) : null
                })()}
              </p>
            )}

            {filteredCatalogMeals.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center">
                <p className="text-neutral-500">{t(locale, 'No meals in this category yet.', 'لا توجد وجبات في هذا التصنيف بعد.')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredCatalogMeals.map((meal, i) => {
                  const mealType = meal.mealType ?? 'snack'
                  const section = MEAL_TYPE_SECTIONS.find((s) => s.key === mealType) ?? MEAL_TYPE_SECTIONS[3]
                  const typeLabel = MEAL_TYPE_LABELS[mealType] ?? MEAL_TYPE_LABELS.snack
                  return (
                    <Link
                      key={meal.id}
                      href={`/healthy-meals/${meal.id}`}
                      style={{ animationDelay: `${Math.min(i, 7) * 60}ms` }}
                      className="group animate-fade-up flex flex-col bg-white border border-neutral-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-lime-300 transition-all duration-300"
                    >
                      <div className="relative h-48 overflow-hidden bg-[#f3fae6]">
                        {meal.imageUrl ? (
                          <Image
                            src={meal.imageUrl}
                            alt={locale === 'ar' ? meal.nameAr || meal.nameEn : meal.nameEn}
                            fill
                            sizes="(max-width:640px) 100vw, 25vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <span className="flex size-full items-center justify-center text-4xl" aria-hidden="true">🥗</span>
                        )}
                        <span className={`absolute top-3 start-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold ${section.accent} shadow-sm`}>
                          <Clock className="size-3" />
                          {t(locale, typeLabel.en, typeLabel.ar)}
                        </span>
                        <span className="absolute bottom-3 end-3 inline-flex items-center gap-1 rounded-full bg-neutral-900/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                          <Flame className="size-3 text-orange-400" />
                          {meal.calories} kcal
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <h4 className="font-bold text-neutral-900 group-hover:text-lime-700 transition-colors line-clamp-1">
                          {locale === 'ar' ? meal.nameAr || meal.nameEn : meal.nameEn}
                        </h4>
                        <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
                          {locale === 'ar' ? meal.descriptionAr || meal.descriptionEn : meal.descriptionEn}
                        </p>
                        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            {t(locale, `${meal.protein}g protein`, `${meal.protein}g بروتين`)}
                          </span>
                          <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                            {t(locale, `${meal.carbs}g carbs`, `${meal.carbs}g كارب`)}
                          </span>
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            {t(locale, `${meal.fat}g fat`, `${meal.fat}g دهون`)}
                          </span>
                        </div>
                        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-lime-700 group-hover:gap-1.5 transition-all">
                          {t(locale, 'View details', 'التفاصيل')}
                          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                        </span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-[#4d7c0f] py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">{t(locale, 'Get Your Personalized Meal Plan', 'احصل على خطة وجباتك المخصصة')}</h2>
          <p className="text-white/80 mb-8">{t(locale, "Tell us your goals and we'll design a full weekly meal plan just for you.", 'أخبرنا بأهدافك وسنصمّم لك خطة وجبات أسبوعية كاملة خصيصاً لك.')}</p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-white text-[#4d7c0f] font-bold px-8 py-4 rounded-2xl hover:bg-neutral-100 transition-colors"
          >
            {t(locale, 'Start Free', 'ابدأ مجاناً')}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </main>
  )
}
