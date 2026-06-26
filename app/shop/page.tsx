"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ArrowLeft } from "lucide-react"
import { mockProducts } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"

const CATEGORIES = [
  { id: "all", label: "All", labelAr: "الكل" },
  { id: "snack", label: "Snacks", labelAr: "سناكس" },
  { id: "drink", label: "Drinks", labelAr: "مشروبات" },
  { id: "supplement", label: "Supplements", labelAr: "مكمّلات" },
  { id: "meal", label: "Meals", labelAr: "وجبات" },
] as const

export default function ShopPage() {
  const { locale } = useLocale()
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("all")

  const filtered = useMemo(() => {
    return mockProducts.filter((p) => {
      if (category !== "all" && p.category !== category) return false
      if (search) {
        const q = search.toLowerCase()
        return p.nameEn.toLowerCase().includes(q) || p.nameAr.includes(search) || p.descriptionEn.toLowerCase().includes(q)
      }
      return true
    })
  }, [search, category])

  const aed = t(locale, "AED", "درهم")

  return (
    <main className="min-h-screen bg-[#f6faf8]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0D4F4A] via-[#15604f] to-[#10b981] px-4 pt-28 pb-16 text-center text-white">
        <h1 className="text-4xl font-extrabold sm:text-5xl">{t(locale, "Our Shop", "متجرنا")}</h1>
        <p className="mx-auto mt-3 max-w-xl text-white/80">
          {t(locale, "Healthy snacks, drinks and supplements — handpicked by our nutrition team.", "سناكس صحية، مشروبات، ومكمّلات — مختارة بعناية من فريق التغذية لدينا.")}
        </p>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Search + categories */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2.5 sm:w-72">
            <Search className="size-4 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(locale, "Search products…", "ابحث عن منتج…")}
              className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  category === c.id ? "bg-emerald-600 text-white" : "bg-white text-neutral-600 hover:bg-emerald-50"
                )}
              >
                {locale === "ar" ? c.labelAr : c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-neutral-400">{t(locale, "No products found.", "لا توجد منتجات.")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {filtered.map((p) => (
              <Link
                key={p.id}
                href={`/shop/${p.id}`}
                className="group overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-44 overflow-hidden bg-emerald-50">
                  <Image src={p.imageUrl} alt={locale === "ar" ? p.nameAr : p.nameEn} fill sizes="(max-width:640px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  {!p.inStock && (
                    <span className="absolute right-3 top-3 rounded-full bg-neutral-900/70 px-2.5 py-1 text-xs font-bold text-white">{t(locale, "Out of stock", "نفد")}</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-neutral-900">{locale === "ar" ? p.nameAr : p.nameEn}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-neutral-400">{locale === "ar" ? p.descriptionAr : p.descriptionEn}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-extrabold text-emerald-700">{p.price} {aed}</span>
                    <span className="text-xs font-semibold text-emerald-600 group-hover:underline">{t(locale, "View", "عرض")}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-emerald-700">
            <ArrowLeft className="size-4 rtl:rotate-180" /> {t(locale, "Back to home", "العودة للرئيسية")}
          </Link>
        </div>
      </div>
    </main>
  )
}
