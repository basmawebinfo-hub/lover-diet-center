"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, Filter } from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { useApp } from "@/lib/store"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"
import { useCurrency } from "@/lib/currency"

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
  const user = state.user
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("all")

  useEffect(() => {
    if (!user) router.replace("/onboarding")
  }, [user, router])

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

  if (!user) return null

  return (
    <DashboardShell>
      <MobileNav />
      <div className="mx-auto max-w-5xl space-y-6 pb-24 lg:pb-0">
        <header>
          <h1 className="text-3xl font-bold text-neutral-900">{t(locale, "Healthy Products", "المنتجات الصحية")}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {t(locale, "Curated by our nutritionists. Add to cart and we'll deliver to your door.", "مختارة من أخصائيي التغذية لدينا. أضف إلى السلة وسنوصلها إلى بابك.")}
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
              className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 ps-10 pe-4 text-sm text-neutral-900 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="size-4 shrink-0 text-neutral-400" />
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  category === c.id
                    ? "bg-emerald-700 text-white"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:border-emerald-300"
                )}
              >
                {locale === "ar" ? c.labelAr : c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAdd={() => addToCart(p.id)}
            />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
              {t(locale, "No products match your search.", "لا توجد منتجات تطابق بحثك.")}
            </p>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}

function ProductCard({
  product,
  onAdd,
}: {
  product: Product
  onAdd: () => void
}) {
  const { locale } = useLocale()
  const { format } = useCurrency()
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white transition hover:border-emerald-300 hover:shadow-md">
      {/* Clickable image -> details */}
      <Link href={`/dashboard/products/${product.id}`} className="relative block h-44 overflow-hidden bg-gradient-to-br from-emerald-50 to-white">
        <Image
          src={product.imageUrl}
          alt={product.nameEn}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 backdrop-blur">
          {product.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/dashboard/products/${product.id}`} className="block">
          <h3 className="font-semibold text-neutral-900 transition-colors group-hover:text-emerald-700">{locale === "ar" ? product.nameAr : product.nameEn}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{locale === "ar" ? product.descriptionAr : product.descriptionEn}</p>
        </Link>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-xl font-bold text-neutral-900">{format(product.price)}</span>
          <button
            type="button"
            onClick={onAdd}
            disabled={!product.inStock}
            className={cn(
              "inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition",
              product.inStock
                ? "bg-gradient-to-b from-emerald-400 to-emerald-500 text-emerald-950 hover:-translate-y-0.5 shadow-sm"
                : "cursor-not-allowed bg-neutral-100 text-neutral-400"
            )}
          >
            <ShoppingCart className="size-3.5" />
            {product.inStock ? t(locale,"Buy Now","اشترِ الآن") : t(locale,"Sold out","نفد المخزون")}
          </button>
        </div>
        <Link
          href={`/dashboard/products/${product.id}`}
          className="mt-2 text-center text-xs font-semibold text-emerald-700 hover:underline"
        >
          {t(locale,"View details","عرض التفاصيل")} →
        </Link>
      </div>
    </div>
  )
}
