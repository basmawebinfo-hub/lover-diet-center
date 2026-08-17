"use client"

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Cookie, ShoppingCart, Check, ArrowRight } from 'lucide-react'
import { LocaleLink as Link } from '@/components/ui/locale-link'
import { useLocale, t } from '@/lib/locale'
import { useCurrency } from '@/lib/currency'
import { useApp } from '@/lib/store'
import { fetchProducts } from '@/lib/supabase/db'
import type { Product } from '@/lib/types'

export function HealthySnacksContent() {
  const { locale } = useLocale()
  const { format } = useCurrency()
  const { addToCart } = useApp()
  const [products, setProducts] = useState<Product[] | null>(null)
  // id of the product just added, so the button can confirm the click
  const [justAdded, setJustAdded] = useState<string | null>(null)

  const handleAdd = (id: string) => {
    addToCart(id, 1)
    setJustAdded(id)
    window.setTimeout(() => setJustAdded((cur) => (cur === id ? null : cur)), 1600)
  }

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
          {/* Straight to the products below. This used to be a button that
              checked the session and sent anyone not signed in to /sign-up —
              a registration wall in front of a shop that has always supported
              guest checkout. */}
          <a
            href="#products"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-lime-400 to-lime-500 px-8 py-4 text-base font-bold text-lime-950 shadow-lg shadow-lime-500/40 transition-all hover:-translate-y-0.5"
          >
            {t(locale, 'Shop Now', 'تسوّق الآن')}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </a>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="scroll-mt-20 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-10">{t(locale, 'Featured Products', 'منتجات مختارة')}</h2>

          {products === null ? (
            <p className="py-10 text-center text-neutral-400">{t(locale, 'Loading…', 'جارٍ التحميل…')}</p>
          ) : products.length === 0 ? (
            <p className="py-10 text-center text-neutral-400">{t(locale, 'No products yet. Check back soon!', 'لا توجد منتجات بعد. تابعنا قريباً!')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="group flex flex-col bg-white border border-neutral-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-lime-300 transition-all">
                  {/* The card body links to the public product page. Cards used
                      to be inert divs, so a visitor could see a snack but had
                      no way to open or buy it from here. */}
                  <Link href={`/shop/${product.id}`} className="flex flex-1 flex-col">
                    <div className="relative h-44 bg-[#f0faf7]">
                      {product.imageUrl ? (
                        <Image src={product.imageUrl} alt={locale === 'ar' ? product.nameAr : product.nameEn} fill sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <span className="flex size-full items-center justify-center text-4xl">🥨</span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <span className="self-start text-xs font-semibold text-[#4d7c0f] bg-[#4d7c0f]/10 px-2 py-1 rounded-full">
                        {categoryLabel(product.category)}
                      </span>
                      <h3 className="font-bold text-neutral-900 mt-2 line-clamp-2 group-hover:text-lime-700 transition-colors">{locale === 'ar' ? product.nameAr : product.nameEn}</h3>
                      <p className="text-lg font-bold text-[#4d7c0f] mt-auto pt-2">{format(product.price)}</p>
                    </div>
                  </Link>
                  {/* Add to cart without leaving the page, and without an
                      account — checkout supports guests. */}
                  <div className="px-4 pb-4">
                    <button
                      type="button"
                      onClick={() => handleAdd(product.id)}
                      aria-label={t(locale, `Add ${product.nameEn} to cart`, `أضف ${product.nameAr} إلى السلة`)}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
                        justAdded === product.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#4d7c0f] text-white hover:bg-[#3f6a0c]'
                      }`}
                    >
                      {justAdded === product.id ? (
                        <><Check className="size-4" /> {t(locale, 'Added', 'تمت الإضافة')}</>
                      ) : (
                        <><ShoppingCart className="size-4" /> {t(locale, 'Add to cart', 'أضف للسلة')}</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-lime-800 shadow-sm ring-1 ring-neutral-200 transition-colors hover:bg-neutral-50"
            >
              {t(locale, 'View All Products', 'عرض كل المنتجات')}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
