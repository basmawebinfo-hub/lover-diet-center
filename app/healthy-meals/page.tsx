import Link from 'next/link'
import Image from 'next/image'
import { WHATSAPP_DIRECT } from '@/lib/site'
import { ArrowRight, ChefHat } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Healthy Meals',
  description: 'Chef-prepared, macro-balanced healthy meals delivered fresh to your door in UAE.',
}

const meals = [
  {
    nameEn: 'Oats & Berry Bowl',
    nameAr: 'شوفان مع التوت',
    calories: 380,
    type: 'Breakfast',
    image: '/meals/breakfast.png',
  },
  {
    nameEn: 'Grilled Chicken Quinoa',
    nameAr: 'دجاج مشوي مع كينوا',
    calories: 520,
    type: 'Lunch',
    image: '/meals/lunch.png',
  },
  {
    nameEn: 'Salmon & Greens',
    nameAr: 'سلمون مع الخضار',
    calories: 480,
    type: 'Dinner',
    image: '/meals/dinner.png',
  },
  {
    nameEn: 'Protein Snack Box',
    nameAr: 'صندوق سناك بروتين',
    calories: 210,
    type: 'Snack',
    image: '/meals/snack.png',
  },
]

export default function HealthyMealsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f0faf7] to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#1A7A6E]/10 text-[#1A7A6E] text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <ChefHat className="w-4 h-4" />
            Healthy Meals
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
            Chef-Prepared Meals,{' '}
            <span className="text-[#1A7A6E]">Delivered Fresh</span>
          </h1>
          <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            Every meal is designed by certified nutritionists and prepared by professional chefs. Macro-balanced, delicious, and delivered to your door across the UAE.
          </p>
          <a
            href={WHATSAPP_DIRECT}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#1A7A6E] text-white font-semibold px-8 py-4 rounded-2xl hover:bg-[#155f56] transition-colors"
          >
            Order Now
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Meal Cards */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-10">Sample Menu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {meals.map((meal, i) => (
              <div key={i} className="bg-white border border-neutral-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-44 bg-[#f0faf7]">
                  <Image src={meal.image} alt={meal.nameEn} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <span className="text-xs font-semibold text-[#1A7A6E] bg-[#1A7A6E]/10 px-2 py-1 rounded-full">
                    {meal.type}
                  </span>
                  <h3 className="font-bold text-neutral-900 mt-2">{meal.nameEn}</h3>
                  <p className="text-sm text-neutral-500">{meal.nameAr}</p>
                  <p className="text-sm font-semibold text-neutral-700 mt-2">{meal.calories} kcal</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1A7A6E] py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Get Your Personalized Meal Plan</h2>
          <p className="text-white/80 mb-8">Tell us your goals and we'll design a full weekly meal plan just for you.</p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-white text-[#1A7A6E] font-bold px-8 py-4 rounded-2xl hover:bg-neutral-100 transition-colors"
          >
            Start Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  )
}
