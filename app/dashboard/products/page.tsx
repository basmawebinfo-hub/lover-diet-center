"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, Filter, Check, Flame, Clock, Sunrise, Sun, Moon, Cookie } from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { useApp } from "@/lib/store"
import { fetchMeals } from "@/lib/supabase/db"
import type { Product, Meal } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"
import { useCurrency } from "@/lib/currency"
import { useToast } from "@/components/ui/toast"

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

const MEAL_TYPE_TABS = [
  { key: "breakfast", icon: Sunrise, activeCls: "bg-amber-500 text-white shadow-sm", idleCls: "border border-amber-200 bg-amber-50 text-amber-700" },
  { key: "lunch", icon: Sun, activeCls: "bg-orange-500 text-white shadow-sm", idleCls: "border border-orange-200 bg-orange-50 text-orange-700" },
  { key: "dinner", icon: Moon, activeCls: "bg-indigo-500 text-white shadow-sm", idleCls: "border border-indigo-200 bg-indigo-50 text-indigo-700" },
  { key: "snack", icon: Cookie, activeCls: "bg-emerald-600 text-white shadow-sm", idleCls: "border border-emerald-200 bg-emerald-50 text-emerald-700" },
] as const

export default function ProductsPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const { state, addToCart } = useApp()
  const { notify } = useToast()
  const user = state.user
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("all")
  const [mealType, setMealType] = useState<"all" | Meal["mealType"]>("all")
  const [meals, setMeals] = useState<Meal[] | null>(null)

  useEffect(() => {
    if (state.authChecked && !user) router.replace("/onboarding")
  }, [state.authChecked, user, router])

  useEffect(() => {
    fetchMeals().then(setMeals).catch(() => setMeals([]))
  }, [])

  // Nutrition catalog meals (managed from admin "Meals & Plans") appear
  // under the "all" and "meal" category filters, with per-type sub-filters.
  const filteredMeals = useMemo(() => {
    if (category !== "all" && category !== "meal") return []
    return (meals ?? []).filter((m) => {
      if (category === "meal" && mealType !== "all" && (m.mealType ?? "snack") !== mealType) return false
      if (!search) return true
      const q = search.toLowerCase()
      return (
        m.nameEn.toLowerCase().includes(q) ||
        m.nameAr.includes(search) ||
        m.descriptionEn.toLowerCase().includes(q) ||
        m.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    })
  }, [meals, search, category, mealType])

  const filtered = useMemo(() => {
    return state.products.filter((p) => {
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
  }, [state.products, category, search])

  if (!state.authChecked && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6faf8]">
        <div className="size-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
      </div>
    )
  }
  if (!user) return null

  const loading = !state.hydrated

  return (
    <DashboardShell>
      <MobileNav />
      <div className="mx-auto max-w-5xl space-y-6 pb-24 lg:pb-0">
        <header>
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
            {t(locale, "Healthy Products", "المنتجات الصحية")}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t(
              locale,
              "Curated by our nutritionists. Add to cart and we'll deliver to your door.",
              "مختارة من أخصائيي التغذية لدينا. أضف إلى السلة وسنوصلها إلى بابك.",
            )}
          </p>
        </header>

        {/* Search + filter */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(locale, "Search products…", "ابحث عن المنتجات…")}
              aria-label={t(locale, "Search products", "ابحث عن المنتجات")}
              className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 ps-10 pe-4 text-sm text-neutral-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="size-4 shrink-0 text-neutral-400" aria-hidden />
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => { setCategory(c.id); setMealType("all") }}
                aria-pressed={category === c.id}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-200",
                  category === c.id
                    ? "bg-emerald-700 text-white"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300",
                )}
              >
                {locale === "ar" ? c.labelAr : c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Meal type sub-filters — visible when "Meals" category is selected */}
        {category === "meal" && (meals?.length ?? 0) > 0 && (
          <div
            role="tablist"
            aria-label={t(locale, "Filter meals by type", "تصفية الوجبات حسب النوع")}
            className="flex flex-wrap items-center gap-2"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mealType === "all"}
              onClick={() => setMealType("all")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-200",
                mealType === "all"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300",
              )}
            >
              {t(locale, "All meals", "كل الوجبات")}
              <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", mealType === "all" ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-500")}>
                {(meals ?? []).length}
              </span>
            </button>
            {MEAL_TYPE_TABS.map((tab) => {
              const count = (meals ?? []).filter((m) => (m.mealType ?? "snack") === tab.key).length
              if (count === 0) return null
              const TabIcon = tab.icon
              const active = mealType === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setMealType(tab.key)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-200",
                    active ? tab.activeCls : tab.idleCls,
                  )}
                >
                  <TabIcon className="size-3.5" aria-hidden />
                  {t(locale, MEAL_TYPE_LABELS[tab.key].en, MEAL_TYPE_LABELS[tab.key].ar)}
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", active ? "bg-white/20 text-white" : "bg-white")}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            [0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-neutral-100" />
            ))
          ) : filtered.length === 0 && filteredMeals.length === 0 ? (
            <div className="col-span-full rounded-2xl border-2 border-dashed border-neutral-200 bg-white p-10 text-center">
              <p className="text-sm font-semibold text-neutral-500">
                {search
                  ? t(locale, "No products match your search.", "لا توجد منتجات تطابق بحثك.")
                  : t(locale, "No products in this category.", "لا توجد منتجات في هذه الفئة.")}
              </p>
              {(search || category !== "all" || mealType !== "all") && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setCategory("all"); setMealType("all") }}
                  className="mt-2 text-xs font-semibold text-emerald-700 hover:underline"
                >
                  {t(locale, "Clear filters", "مسح الفلاتر")}
                </button>
              )}
            </div>
          ) : (
            <>
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAdd={() => {
                    addToCart(p.id)
                    notify(
                      t(locale, "Added to cart", "تمت الإضافة إلى السلة"),
                      "success",
                    )
                  }}
                />
              ))}
              {filteredMeals.map((m) => (
                <MealCard key={m.id} meal={m} />
              ))}
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}

function MealCard({ meal }: { meal: Meal }) {
  const { locale } = useLocale()
  const mealType = meal.mealType ?? "snack"
  const typeLabel = MEAL_TYPE_LABELS[mealType] ?? MEAL_TYPE_LABELS.snack
  const name = locale === "ar" ? meal.nameAr || meal.nameEn : meal.nameEn

  return (
    <Link
      href={`/healthy-meals/${meal.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-lime-100 bg-white transition hover:border-lime-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-200"
    >
      <div className="relative h-44 overflow-hidden bg-[#f3fae6]">
        {meal.imageUrl ? (
          <Image
            src={meal.imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-4xl" aria-hidden="true">🥗</span>
        )}
        <span className="absolute top-3 start-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#4d7c0f] shadow-sm">
          <Clock className="size-3" aria-hidden />
          {t(locale, typeLabel.en, typeLabel.ar)}
        </span>
        <span className="absolute bottom-3 end-3 inline-flex items-center gap-1 rounded-full bg-neutral-900/80 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
          <Flame className="size-3 text-orange-400" aria-hidden />
          {meal.calories} kcal
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-semibold text-neutral-900 transition-colors group-hover:text-lime-700 line-clamp-1">{name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
          {locale === "ar" ? meal.descriptionAr || meal.descriptionEn : meal.descriptionEn}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            {t(locale, `${meal.protein}g protein`, `${meal.protein}g بروتين`)}
          </span>
          <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
            {t(locale, `${meal.carbs}g carbs`, `${meal.carbs}g كارب`)}
          </span>
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
            {t(locale, `${meal.fat}g fat`, `${meal.fat}g دهون`)}
          </span>
        </div>
        <span className="mt-2 text-center text-xs font-semibold text-lime-700 group-hover:underline">
          {t(locale, "View details", "عرض التفاصيل")} →
        </span>
      </div>
    </Link>
  )
}

function ProductCard({
  product, onAdd,
}: {
  product: Product
  onAdd: () => void
}) {
  const { locale } = useLocale()
  const { format } = useCurrency()
  const [justAdded, setJustAdded] = useState(false)
  const name = locale === "ar" ? product.nameAr : product.nameEn

  function handleAdd(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()
    onAdd()
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white transition hover:border-emerald-300 hover:shadow-md focus-within:border-emerald-300 focus-within:shadow-md">
      <Link
        href={`/dashboard/products/${product.id}`}
        className="relative block h-44 overflow-hidden bg-gradient-to-br from-emerald-50 to-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
        aria-label={name}
      >
        <Image
          src={product.imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 backdrop-blur">
          {product.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/dashboard/products/${product.id}`} className="block focus:outline-none">
          <h3 className="font-semibold text-neutral-900 transition-colors group-hover:text-emerald-700">
            {name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
            {locale === "ar" ? product.descriptionAr : product.descriptionEn}
          </p>
        </Link>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-xl font-bold text-neutral-900">{format(product.price)}</span>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.inStock || justAdded}
            aria-label={t(locale, `Add ${name} to cart`, `أضف ${name} إلى السلة`)}
            className={cn(
              "inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-emerald-200",
              !product.inStock
                ? "cursor-not-allowed bg-neutral-100 text-neutral-400"
                : justAdded
                  ? "bg-emerald-600 text-white"
                  : "bg-gradient-to-b from-emerald-400 to-emerald-500 text-emerald-950 shadow-sm hover:-translate-y-0.5",
            )}
          >
            {justAdded ? (
              <>
                <Check className="size-3.5" />
                {t(locale, "Added", "تمت الإضافة")}
              </>
            ) : (
              <>
                <ShoppingCart className="size-3.5" />
                {product.inStock ? t(locale, "Buy Now", "اشترِ الآن") : t(locale, "Sold out", "نفد المخزون")}
              </>
            )}
          </button>
        </div>
        <Link
          href={`/dashboard/products/${product.id}`}
          className="mt-2 text-center text-xs font-semibold text-emerald-700 hover:underline focus:outline-none focus:underline"
        >
          {t(locale, "View details", "عرض التفاصيل")} →
        </Link>
      </div>
    </div>
  )
}
