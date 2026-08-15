"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { InAppActionButton } from '@/components/in-app-action-button'
import { ArrowRight, ChefHat } from 'lucide-react'
import { useLocale, t } from '@/lib/locale'
import { useCurrency } from '@/lib/currency'
import { fetchProducts } from '@/lib/supabase/db'
import type { Product } from '@/lib/types'

export function HealthyMealsContent() {
  const { locale } = useLocale()
  const { format } = useCurrency()
  const [meals, setMeals] = useState<Product[] | null>(null)

  useEffect(() => {
    fetchProducts().then((all) => setMeals(all.filter((p) => p.category === 'meal')))
  }, [])

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
            <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center">
              <p className="text-neutral-500">{t(locale, 'Our meal menu is being updated — browse the full shop in the meantime.', 'قائمة وجباتنا قيد التحديث — تصفّح المتجر بالكامل في هذه الأثناء.')}</p>
              <div className="mt-5">
                <InAppActionButton mode="shop" label={t(locale, 'Browse the shop', 'تصفّح المتجر')} variant="light" />
              </div>
            </div>
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
