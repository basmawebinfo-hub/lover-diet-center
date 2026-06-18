"use client"

import Link from 'next/link'
import Image from 'next/image'
import { InAppActionButton } from '@/components/in-app-action-button'
import { ArrowRight, ChefHat } from 'lucide-react'
import { useLocale, t } from '@/lib/locale'

export function HealthyMealsContent() {
  const { locale } = useLocale()

  const meals = [
    {
      id: 'm1',
      name: t(locale, 'Oats & Berry Bowl', 'شوفان مع التوت'),
      description: t(locale, 'Steel-cut oats with mixed berries, chia seeds, and almond milk.', 'شوفان مع توت مشكّل وبذور شيا وحليب لوز.'),
      calories: 380, protein: 14, carbs: 58, fat: 9,
      type: t(locale, 'Breakfast', 'فطور'),
      image: '/meals/breakfast.png',
    },
    {
      id: 'm2',
      name: t(locale, 'Grilled Chicken Quinoa', 'دجاج مشوي مع كينوا'),
      description: t(locale, 'Lean chicken breast, quinoa, roasted veggies, lemon-tahini drizzle.', 'صدر دجاج مشوي، كينوا، خضار محمّصة، صلصة ليمون وطحينة.'),
      calories: 520, protein: 42, carbs: 48, fat: 14,
      type: t(locale, 'Lunch', 'غداء'),
      image: '/meals/lunch.png',
    },
    {
      id: 'm3',
      name: t(locale, 'Salmon & Greens', 'سلمون مع الخضار'),
      description: t(locale, 'Oven-baked salmon fillet over sautéed greens and sweet potato.', 'سلمون مشوي بالفرن مع خضار سوتيه وبطاطا حلوة.'),
      calories: 480, protein: 38, carbs: 30, fat: 22,
      type: t(locale, 'Dinner', 'عشاء'),
      image: '/meals/dinner.png',
    },
    {
      id: 'm4',
      name: t(locale, 'Protein Snack Box', 'صندوق سناك بروتين'),
      description: t(locale, 'A balanced mix of nuts, protein bites, and fresh fruit.', 'مزيج متوازن من المكسرات وكرات البروتين والفاكهة الطازجة.'),
      calories: 210, protein: 16, carbs: 18, fat: 9,
      type: t(locale, 'Snack', 'سناك'),
      image: '/meals/snack.png',
    },
  ]

  const kcal = t(locale, 'kcal', 'سعرة')

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
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-10">{t(locale, 'Sample Menu', 'نموذج من القائمة')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {meals.map((meal, i) => (
              <Link
                key={i}
                href={`/dashboard/meals/${meal.id}`}
                className="group flex flex-col bg-white border border-neutral-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg hover:border-lime-300 transition-all"
              >
                <div className="relative h-44 overflow-hidden bg-[#f3fae6]">
                  <Image src={meal.image} alt={meal.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute left-3 top-3 text-xs font-bold text-lime-700 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full rtl:left-auto rtl:right-3">
                    {meal.type}
                  </span>
                  <span className="absolute right-3 top-3 text-xs font-bold text-neutral-700 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full rtl:right-auto rtl:left-3">
                    {meal.calories} {kcal}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-bold text-neutral-900 group-hover:text-lime-700 transition-colors">{meal.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{meal.description}</p>

                  {/* Macros */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="rounded-md bg-lime-50 px-2 py-0.5 text-[11px] font-semibold text-lime-700">{t(locale,'P','بروتين')} {meal.protein}g</span>
                    <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">{t(locale,'C','كربوهيدرات')} {meal.carbs}g</span>
                    <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-600">{t(locale,'F','دهون')} {meal.fat}g</span>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-lime-700 group-hover:gap-1.5 transition-all">
                      {t(locale, 'View details', 'التفاصيل')} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                    </span>
                    <span className="rounded-full bg-gradient-to-b from-lime-400 to-lime-500 px-3.5 py-1.5 text-xs font-bold text-lime-950 shadow-sm">
                      {t(locale, 'Order now', 'اطلب الآن')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
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
