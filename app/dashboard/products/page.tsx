"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, Filter, Check } from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { useApp } from "@/lib/store"
import type { Product } from "@/lib/types"
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

export default function ProductsPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const { state, addToCart } = useApp()
  const { notify } = useToast()
  const user = state.user
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("all")

  useEffect(() => {
    if (state.authChecked && !user) router.replace("/onboarding")
  }, [state.authChecked, user, router])

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
                onClick={() => setCategory(c.id)}
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

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            [0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-neutral-100" />
            ))
          ) : filtered.length === 0 ? (
            <div className="col-span-full rounded-2xl border-2 border-dashed border-neutral-200 bg-white p-10 text-center">
              <p className="text-sm font-semibold text-neutral-500">
                {search
                  ? t(locale, "No products match your search.", "لا توجد منتجات تطابق بحثك.")
                  : t(locale, "No products in this category.", "لا توجد منتجات في هذه الفئة.")}
              </p>
              {(search || category !== "all") && (
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
            filtered.map((p) => (
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
            ))
          )}
        </div>
      </div>
    </DashboardShell>
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
