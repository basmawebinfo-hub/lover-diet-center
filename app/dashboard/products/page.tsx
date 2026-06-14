"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ShoppingCart, Filter } from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { useApp } from "@/lib/store"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "snack", label: "Snacks" },
  { id: "drink", label: "Drinks" },
  { id: "supplement", label: "Supplements" },
  { id: "meal", label: "Meals" },
] as const

export default function ProductsPage() {
  const router = useRouter()
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
          <h1 className="text-3xl font-bold text-neutral-900">Healthy Products</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Curated by our nutritionists. Add to cart and we'll deliver to your door.
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
              placeholder="Search products…"
              className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 ps-10 pe-4 text-sm text-neutral-900 outline-none focus:border-lime-400 focus:ring-2 focus:ring-lime-100"
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
                    ? "bg-lime-700 text-white"
                    : "border border-neutral-200 bg-white text-neutral-600 hover:border-lime-300"
                )}
              >
                {c.label}
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
              No products match your search.
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
  const emoji = emojiForCategory(product.category)
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white transition hover:border-lime-300 hover:shadow-md">
      <div className="flex h-40 items-center justify-center bg-gradient-to-br from-lime-50 to-white text-5xl">
        {emoji}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-neutral-900">{product.nameEn}</h3>
          <span className="rounded-full bg-lime-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-lime-700">
            {product.category}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-neutral-500">{product.nameAr}</p>
        <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
          {product.descriptionEn}
        </p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-xl font-bold text-neutral-900">
            {product.price}{" "}
            <span className="text-xs font-normal text-neutral-500">AED</span>
          </span>
          <button
            type="button"
            onClick={onAdd}
            disabled={!product.inStock}
            className={cn(
              "inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition",
              product.inStock
                ? "bg-lime-700 text-white hover:bg-lime-800"
                : "cursor-not-allowed bg-neutral-100 text-neutral-400"
            )}
          >
            <ShoppingCart className="size-3.5" />
            {product.inStock ? "Add" : "Sold out"}
          </button>
        </div>
      </div>
    </div>
  )
}

function emojiForCategory(c: Product["category"]): string {
  switch (c) {
    case "snack":
      return "🥨"
    case "drink":
      return "🍵"
    case "supplement":
      return "💊"
    case "meal":
      return "🥗"
  }
}
