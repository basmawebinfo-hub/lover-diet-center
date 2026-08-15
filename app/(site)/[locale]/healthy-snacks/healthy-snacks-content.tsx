"use client"

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Cookie } from 'lucide-react'
import { InAppActionButton } from '@/components/in-app-action-button'
import { useLocale, t } from '@/lib/locale'
import { useCurrency } from '@/lib/currency'
import { fetchProducts } from '@/lib/supabase/db'
import type { Product } from '@/lib/types'

export function HealthySnacksContent() {
  const { locale } = useLocale()
  const { format } = useCurrency()
  const [products, setProducts] = useState<Product[] | null>(null)

  useEffect(() => {
    fetchProducts().then((all) =>
      // This page is about snacks & supplements
      setProducts(all.filter((p) => p.category === 'snack' || p.category === 'supplement'))
    )
  }, [])

  const categoryLabel = (c: Product['category']) =>
    c === 'supplement'
      ? t(locale, 'Supplement', 'مكمّل غذائي')
      : c === 'drink'
        ? t(locale, 'Drink', 'مشروب')
        : c === 'meal'
          ? t(locale, 'Meal', 'وجبة')
          : t(locale, 'Snack', 'سناك')

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f0faf7] to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#4d7c0f]/10 text-[#4d7c0f] text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Cookie className="w-4 h-4" />
            {t(locale, 'Healthy Snacks & Supplements', 'السناكس والمكمّلات الصحية')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
            {locale === 'ar' ? (
              <>سناكس يعمل{' '}<span className="text-[#4d7c0f]">لأجل أهدافك</span></>
            ) : (
              <>Snacks That Work{' '}<span className="text-[#4d7c0f]">For Your Goals</span></>
            )}
          </h1>
          <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            {t(
              locale,
              'Protein bars, dried fruits, nuts, and certified supplements — all curated by our nutrition team to support your health journey.',
              'ألواح بروتين، وفواكه مجففة، ومكسرات، ومكمّلات معتمدة — منتقاة بعناية من فريق التغذية لدينا لدعم رحلتك الصحية.'
            )}
          </p>
          <InAppActionButton mode="shop" label={t(locale, 'Shop Now', 'تسوّق الآن')} />
        </div>
      </section>

      {/* Products */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-10">{t(locale, 'Featured Products', 'منتجات مختارة')}</h2>

          {products === null ? (
            <p className="py-10 text-center text-neutral-400">{t(locale, 'Loading…', 'جارٍ التحميل…')}</p>
          ) : products.length === 0 ? (
            <p className="py-10 text-center text-neutral-400">{t(locale, 'No products yet. Check back soon!', 'لا توجد منتجات بعد. تابعنا قريباً!')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white border border-neutral-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative h-44 bg-[#f0faf7]">
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={locale === 'ar' ? product.nameAr : product.nameEn} fill sizes="(max-width:640px) 100vw, 25vw" className="object-cover" />
                    ) : (
                      <span className="flex size-full items-center justify-center text-4xl">🥨</span>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-xs font-semibold text-[#4d7c0f] bg-[#4d7c0f]/10 px-2 py-1 rounded-full">
                      {categoryLabel(product.category)}
                    </span>
                    <h3 className="font-bold text-neutral-900 mt-2 line-clamp-1">{locale === 'ar' ? product.nameAr : product.nameEn}</h3>
                    <p className="text-lg font-bold text-[#4d7c0f] mt-2">{format(product.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <InAppActionButton mode="shop" label={t(locale, 'View All Products', 'عرض كل المنتجات')} variant="light" />
          </div>
        </div>
      </section>
    </main>
  )
}
