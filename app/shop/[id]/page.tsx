"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Minus, Plus, ShoppingCart, ShieldCheck, Truck, Leaf } from "lucide-react"
import { fetchProducts } from "@/lib/supabase/db"
import type { Product } from "@/lib/types"
import { useApp } from "@/lib/store"
import { useLocale, t } from "@/lib/locale"
import { useCurrency, CURRENCIES } from "@/lib/currency"
import { useToast } from "@/components/ui/toast"

export default function ShopProductPage() {
  const params = useParams()
  const router = useRouter()
  const { locale } = useLocale()
  const { notify } = useToast()
  const { format, currency, setCurrency } = useCurrency()
  const { state, addToCart } = useApp()

  const id = String(params?.id ?? "")
  const [allProducts, setAllProducts] = useState<Product[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    fetchProducts()
      .then((p) => { if (active) setAllProducts(p) })
      .catch(() => { if (active) setError(true) })
    return () => { active = false }
  }, [])

  const product = useMemo(
    () => (allProducts ?? []).find((p) => p.id === id),
    [allProducts, id],
  )
  const related = useMemo(
    () => (allProducts ?? []).filter((p) => p.id !== id && p.category === product?.category).slice(0, 4),
    [allProducts, id, product],
  )
  const [qty, setQty] = useState(1)

  const isSignedIn = () => {
    if (state.user) return true
    if (typeof window !== "undefined" && window.localStorage.getItem("loverDietUser")) return true
    return false
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f6faf8] px-4 text-center">
        <p className="text-lg font-bold text-red-700">
          {t(locale, "Could not load product.", "تعذّر تحميل المنتج.")}
        </p>
        <Link href="/shop" className="mt-4 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white">
          {t(locale, "Back to shop", "العودة للمتجر")}
        </Link>
      </main>
    )
  }

  if (allProducts === null) {
    return (
      <main className="min-h-screen bg-[#f6faf8] pt-24">
        <div className="mx-auto max-w-5xl px-4 pb-16">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-3xl bg-neutral-100" />
            <div className="space-y-4">
              <div className="h-6 w-24 animate-pulse rounded-full bg-neutral-100" />
              <div className="h-10 w-3/4 animate-pulse rounded-lg bg-neutral-100" />
              <div className="h-24 animate-pulse rounded-lg bg-neutral-100" />
              <div className="h-12 w-1/3 animate-pulse rounded-lg bg-neutral-100" />
              <div className="h-14 animate-pulse rounded-2xl bg-neutral-100" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f6faf8] px-4 text-center">
        <p className="text-lg font-bold text-neutral-900">
          {t(locale, "Product not found", "المنتج غير موجود")}
        </p>
        <Link href="/shop" className="mt-4 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white">
          {t(locale, "Back to shop", "العودة للمتجر")}
        </Link>
      </main>
    )
  }

  const name = locale === "ar" ? product.nameAr : product.nameEn
  const desc = locale === "ar" ? product.descriptionAr : product.descriptionEn

  // Guest checkout: no account required. Signed-in users go through the
  // dashboard cart (existing flow); guests go straight to /shop/checkout.
  function buyNow() {
    addToCart(product!.id, qty)
    notify(t(locale, "Added to cart", "تمت الإضافة للسلة"), "success")
    router.push(isSignedIn() ? "/dashboard/cart" : "/shop/checkout")
  }

  function addOnly() {
    addToCart(product!.id, qty)
    notify(t(locale, "Added to cart", "تمت الإضافة للسلة"), "success")
  }

  return (
    <main className="min-h-screen bg-[#f6faf8] pt-24">
      <div className="mx-auto max-w-5xl px-4 pb-16">
        <Link
          href="/shop"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-emerald-700 focus:outline-none focus:underline"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
          {t(locale, "Back to shop", "العودة للمتجر")}
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-neutral-100 bg-emerald-50">
            <Image
              src={product.imageUrl}
              alt={name}
              fill
              sizes="(max-width:1024px) 100vw, 480px"
              className="object-cover"
              priority
            />
            {!product.inStock && (
              <span className="absolute right-4 top-4 rounded-full bg-neutral-900/80 px-3 py-1 text-xs font-bold text-white">
                {t(locale, "Out of stock", "نفد المخزون")}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600">
              {product.category}
            </span>
            <h1 className="mt-3 text-3xl font-extrabold text-neutral-900 sm:text-4xl">{name}</h1>
            <p className="mt-3 leading-relaxed text-neutral-500">{desc}</p>
            <p className="mt-5 text-4xl font-black text-emerald-700">{format(product.price)}</p>

            <div className="mt-3">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as typeof currency)}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                aria-label={t(locale, "Currency", "العملة")}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} — {locale === "ar" ? c.ar : c.en}</option>
                ))}
              </select>
            </div>

            {/* Qty */}
            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm font-semibold text-neutral-700">{t(locale, "Quantity", "الكمية")}</span>
              <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="flex size-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:text-neutral-300"
                  aria-label={t(locale, "Decrease quantity", "إنقاص الكمية")}
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-8 text-center font-bold text-neutral-900" aria-live="polite">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  className="flex size-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-50"
                  aria-label={t(locale, "Increase quantity", "زيادة الكمية")}
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={buyNow}
                disabled={!product.inStock}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <ShoppingCart className="size-4" />
                {t(locale, "Buy Now", "اشترِ الآن")} · {format(product.price * qty)}
              </button>
              <button
                type="button"
                onClick={addOnly}
                disabled={!product.inStock}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-6 py-3.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <Plus className="size-4" />
                {t(locale, "Add to cart", "أضف للسلة")}
              </button>
            </div>
            {!isSignedIn() && (
              <p className="mt-3 text-center text-xs text-neutral-400 sm:text-start">
                {t(
                  locale,
                  "No account needed — check out as a guest with cash on delivery.",
                  "لا حاجة لحساب — أتمم الشراء كضيف مع الدفع عند الاستلام.",
                )}
              </p>
            )}

            {/* Trust */}
            <div className="mt-7 grid grid-cols-3 gap-3 border-t border-neutral-100 pt-6">
              {[
                { icon: Leaf, en: "Natural", ar: "طبيعي" },
                { icon: ShieldCheck, en: "Quality checked", ar: "جودة مضمونة" },
                { icon: Truck, en: "UAE delivery", ar: "توصيل بالإمارات" },
              ].map((b, i) => {
                const Icon = b.icon
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5 text-center">
                    <span
                      className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
                      aria-hidden
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="text-xs font-medium text-neutral-500">
                      {locale === "ar" ? b.ar : b.en}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-5 text-xl font-bold text-neutral-900">
              {t(locale, "You may also like", "قد يعجبك أيضاً")}
            </h2>
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/shop/${p.id}`}
                  className="group overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  aria-label={locale === "ar" ? p.nameAr : p.nameEn}
                >
                  <div className="relative h-36 overflow-hidden bg-emerald-50">
                    <Image
                      src={p.imageUrl}
                      alt={locale === "ar" ? p.nameAr : p.nameEn}
                      fill
                      sizes="(max-width:640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="truncate text-sm font-bold text-neutral-900">
                      {locale === "ar" ? p.nameAr : p.nameEn}
                    </h3>
                    <span className="text-sm font-extrabold text-emerald-700">{format(p.price)}</span>
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
