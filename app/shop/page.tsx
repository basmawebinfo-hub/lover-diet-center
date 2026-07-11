"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ArrowLeft, Flame, Leaf, ShieldCheck, Truck, Sparkles, X } from "lucide-react"
import { fetchProducts, fetchMeals } from "@/lib/supabase/db"
import type { Product, Meal } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"
import { useCurrency, CURRENCIES } from "@/lib/currency"

const CATEGORIES = [
  { id: "all", label: "All", labelAr: "الكل" },
  { id: "snack", label: "Snacks", labelAr: "سناكس" },
  { id: "drink", label: "Drinks", labelAr: "مشروبات" },
  { id: "supplement", label: "Supplements", labelAr: "مكمّلات" },
  { id: "meal", label: "Meals", labelAr: "وجبات" },
] as const

const MEAL_TYPE_LABELS: Record<Meal["mealType"], { en: string; ar: string }> = {
  breakfast: { en: "Breakfast", ar: "إفطار" },
  lunch: { en: "Lunch", ar: "غداء" },
  dinner: { en: "Dinner", ar: "عشاء" },
  snack: { en: "Light meal", ar: "وجبة خفيفة" },
}

const TRUST_BADGES = [
  { icon: Leaf, en: "100% natural ingredients", ar: "مكونات طبيعية 100%" },
  { icon: ShieldCheck, en: "Nutritionist approved", ar: "معتمد من أخصائيي التغذية" },
  { icon: Truck, en: "Fast local delivery", ar: "توصيل سريع" },
] as const

export default function ShopPage() {
  const { locale } = useLocale()
  const { format, currency, setCurrency } = useCurrency()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("all")
  const [products, setProducts] = useState<Product[] | null>(null)
  const [meals, setMeals] = useState<Meal[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([fetchProducts(), fetchMeals()])
      .then(([p, m]) => {
        if (active) {
          setProducts(p)
          setMeals(m)
        }
      })
      .catch(() => {
        if (active) setError(true)
      })
    return () => { active = false }
  }, [])

  const filteredProducts = useMemo(() => {
    return (products ?? []).filter((p) => {
      if (category !== "all" && p.category !== category) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          p.nameEn.toLowerCase().includes(q) ||
          p.nameAr.includes(search) ||
          p.descriptionEn.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [products, search, category])

  // Catalog meals appear under "all" and "meal" filters.
  const filteredMeals = useMemo(() => {
    if (category !== "all" && category !== "meal") return []
    return (meals ?? []).filter((m) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        m.nameEn.toLowerCase().includes(q) ||
        m.nameAr.includes(search) ||
        m.descriptionEn.toLowerCase().includes(q) ||
        m.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    })
  }, [meals, search, category])

  const loading = products === null || meals === null
  const totalResults = filteredProducts.length + filteredMeals.length
  const totalItems = (products?.length ?? 0) + (meals?.length ?? 0)

  const retry = () => {
    setError(false)
    setProducts(null)
    setMeals(null)
    Promise.all([fetchProducts(), fetchMeals()])
      .then(([p, m]) => { setProducts(p); setMeals(m) })
      .catch(() => setError(true))
  }

  return (
    <main className="min-h-screen bg-[#f6faf8]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D4F4A] via-[#15604f] to-[#10b981] px-4 pt-28 pb-20 text-center text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -end-24 size-72 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -start-16 size-80 rounded-full bg-emerald-300/10 blur-3xl"
        />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold tracking-wide backdrop-blur-sm animate-fade-up">
          <Sparkles className="size-3.5" aria-hidden />
          {t(locale, "Curated by our nutrition team", "مختار بعناية فريق التغذية")}
        </span>
        <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl text-balance animate-fade-up delay-100">
          {t(locale, "Our Shop", "متجرنا")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-white/85 leading-relaxed animate-fade-up delay-200">
          {t(
            locale,
            "Healthy snacks, drinks, supplements and macro-counted meals — everything you need for a better lifestyle.",
            "سناكس صحية، مشروبات، مكمّلات، ووجبات محسوبة السعرات — كل ما تحتاجه لنمط حياة أفضل.",
          )}
        </p>
        {/* Trust badges */}
        <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-3 animate-fade-up delay-300">
          {TRUST_BADGES.map((b) => (
            <span
              key={b.en}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-sm"
            >
              <b.icon className="size-4 text-emerald-200" aria-hidden />
              {t(locale, b.en, b.ar)}
            </span>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Search + filters bar */}
        <div className="sticky top-16 z-10 -mx-4 mb-8 border-b border-neutral-100 bg-[#f6faf8]/95 px-4 py-4 backdrop-blur-sm sm:static sm:z-auto sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 sm:w-80">
              <Search className="size-4 shrink-0 text-neutral-400" aria-hidden />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t(locale, "Search products & meals…", "ابحث عن منتج أو وجبة…")}
                aria-label={t(locale, "Search products and meals", "ابحث عن منتج أو وجبة")}
                className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label={t(locale, "Clear search", "مسح البحث")}
                  className="rounded-full p-0.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                >
                  <X className="size-4" aria-hidden />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as typeof currency)}
                className="rounded-full border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                aria-label={t(locale, "Currency", "العملة")}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  aria-pressed={category === c.id}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-200",
                    category === c.id
                      ? "bg-emerald-600 text-white shadow-emerald-200"
                      : "bg-white text-neutral-600 hover:bg-emerald-50 hover:text-emerald-800",
                  )}
                >
                  {locale === "ar" ? c.labelAr : c.label}
                </button>
              ))}
            </div>
          </div>
          {/* Result count */}
          {!loading && !error && totalItems > 0 && (
            <p className="mt-3 text-xs font-semibold text-neutral-400">
              {t(locale, `Showing ${totalResults} of ${totalItems} items`, `عرض ${totalResults} من ${totalItems} عنصر`)}
            </p>
          )}
        </div>

        {/* Grid */}
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm font-semibold text-red-700">
              {t(locale, "Could not load products.", "تعذّر تحميل المنتجات.")}
            </p>
            <button
              type="button"
              onClick={retry}
              className="mt-3 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              {t(locale, "Try again", "إعادة المحاولة")}
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm">
                <div className="h-44 animate-pulse bg-neutral-100" />
                <div className="flex flex-col gap-2 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-100" />
                  <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
                  <div className="h-5 w-1/3 animate-pulse rounded bg-neutral-100" />
                </div>
              </div>
            ))}
          </div>
        ) : totalResults === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-white p-10 text-center">
            <p className="text-sm font-semibold text-neutral-500">
              {totalItems === 0
                ? t(locale, "No products yet. Check back soon!", "لا توجد منتجات بعد. تابعنا قريباً!")
                : t(locale, "No products match your search.", "لا توجد منتجات تطابق بحثك.")}
            </p>
            {(search || category !== "all") && totalItems > 0 && (
              <button
                type="button"
                onClick={() => { setSearch(""); setCategory("all") }}
                className="mt-2 text-xs font-semibold text-emerald-700 hover:underline"
              >
                {t(locale, "Clear filters", "مسح الفلاتر")}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {/* Store products */}
            {filteredProducts.map((p, i) => {
              const hasDiscount = p.discountPrice != null && p.discountPrice < p.price
              const discountPct = hasDiscount
                ? Math.round((1 - (p.discountPrice as number) / p.price) * 100)
                : 0
              return (
                <Link
                  key={p.id}
                  href={`/shop/${p.id}`}
                  style={{ animationDelay: `${Math.min(i, 7) * 70}ms` }}
                  className="group card-glow animate-fade-up flex flex-col overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm transition-shadow hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  aria-label={locale === "ar" ? p.nameAr : p.nameEn}
                >
                  <div className="relative h-44 overflow-hidden bg-emerald-50">
                    <Image
                      src={p.imageUrl}
                      alt={locale === "ar" ? p.nameAr : p.nameEn}
                      fill
                      sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    {hasDiscount && (
                      <span className="absolute start-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                        {t(locale, `-${discountPct}%`, `خصم ${discountPct}%`)}
                      </span>
                    )}
                    {!p.inStock && (
                      <span className="absolute end-3 top-3 rounded-full bg-neutral-900/70 px-2.5 py-1 text-xs font-bold text-white">
                        {t(locale, "Out of stock", "نفد")}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-bold text-neutral-900 line-clamp-1">
                      {locale === "ar" ? p.nameAr : p.nameEn}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-400">
                      {locale === "ar" ? p.descriptionAr : p.descriptionEn}
                    </p>
                    {p.calories != null && (
                      <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-600">
                        <Flame className="size-3" aria-hidden />
                        {p.calories} kcal
                      </span>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <span className="flex items-baseline gap-1.5">
                        <span className="text-lg font-extrabold text-emerald-700">
                          {format(hasDiscount ? (p.discountPrice as number) : p.price)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs font-semibold text-neutral-300 line-through">
                            {format(p.price)}
                          </span>
                        )}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white">
                        {t(locale, "View", "عرض")}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}

            {/* Nutrition catalog meals (managed in admin "Meals & Plans") */}
            {filteredMeals.map((m, i) => {
              const typeLabel = MEAL_TYPE_LABELS[m.mealType] ?? MEAL_TYPE_LABELS.snack
              return (
                <div
                  key={m.id}
                  style={{ animationDelay: `${Math.min(filteredProducts.length + i, 7) * 70}ms` }}
                  className="group card-glow animate-fade-up flex flex-col overflow-hidden rounded-3xl border border-lime-100 bg-white shadow-sm transition-shadow hover:shadow-xl"
                >
                  <div className="relative h-44 overflow-hidden bg-[#f3fae6]">
                    {m.imageUrl ? (
                      <Image
                        src={m.imageUrl}
                        alt={locale === "ar" ? m.nameAr || m.nameEn : m.nameEn}
                        fill
                        sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <span className="flex size-full items-center justify-center text-4xl" aria-hidden>🥗</span>
                    )}
                    <span className="absolute start-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-[#4d7c0f] shadow-sm">
                      {t(locale, typeLabel.en, typeLabel.ar)}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-bold text-neutral-900 line-clamp-1">
                      {locale === "ar" ? m.nameAr || m.nameEn : m.nameEn}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-400">
                      {locale === "ar" ? m.descriptionAr || m.descriptionEn : m.descriptionEn}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-600">
                        <Flame className="size-3" aria-hidden />
                        {m.calories} kcal
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                        {t(locale, `${m.protein}g protein`, `${m.protein}g بروتين`)}
                      </span>
                      <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700">
                        {t(locale, `${m.carbs}g carbs`, `${m.carbs}g كارب`)}
                      </span>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <span className="text-xs font-bold text-[#4d7c0f]">
                        {t(locale, "Nutrition meal", "وجبة غذائية")}
                      </span>
                      <Link
                        href="/healthy-meals"
                        className="rounded-full bg-lime-50 px-3 py-1 text-xs font-bold text-[#4d7c0f] transition hover:bg-[#4d7c0f] hover:text-white focus:outline-none focus:ring-2 focus:ring-lime-200"
                      >
                        {t(locale, "Details", "التفاصيل")}
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-emerald-700 focus:outline-none focus:underline"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
            {t(locale, "Back to home", "العودة للرئيسية")}
          </Link>
        </div>
      </div>
    </main>
  )
}
