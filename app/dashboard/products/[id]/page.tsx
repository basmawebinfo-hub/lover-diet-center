"use client"

import { use, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, ShoppingCart, Minus, Plus, Check, ShieldCheck, Truck } from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { useApp } from "@/lib/store"
import type { Product } from "@/lib/types"
import { useLocale, t } from "@/lib/locale"

const CATEGORY_AR: Record<Product["category"], string> = {
  snack: "سناك",
  supplement: "مكمل غذائي",
  meal: "وجبة",
  drink: "مشروب",
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { locale } = useLocale()
  const { state, addToCart } = useApp()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const product = state.products.find((p) => p.id === id)

  if (!state.hydrated) return null

  if (!product) {
    return (
      <DashboardShell>
        <MobileNav />
        <div className="mx-auto max-w-3xl py-20 text-center">
          <p className="text-lg font-semibold text-neutral-700">{t(locale, "Product not found.", "المنتج غير موجود.")}</p>
          <Link href="/dashboard/products" className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:underline">
            {t(locale, "Back to products", "العودة إلى المنتجات")}
          </Link>
        </div>
      </DashboardShell>
    )
  }

  const related = state.products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)

  const handleAdd = () => {
    addToCart(product.id, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <DashboardShell>
      <MobileNav />
      <div className="mx-auto max-w-4xl space-y-6 pb-24 lg:pb-0">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-neutral-500">
          <Link href="/dashboard" className="hover:text-emerald-700">{t(locale,"Dashboard","لوحة التحكم")}</Link>
          <span>/</span>
          <Link href="/dashboard/products" className="hover:text-emerald-700">{t(locale,"Products","المنتجات")}</Link>
          <span>/</span>
          <span className="font-semibold text-neutral-800">{locale === "ar" ? product.nameAr : product.nameEn}</span>
        </nav>

        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-emerald-700"
        >
          <ArrowLeft className="size-4 rtl:rotate-180" /> {t(locale,"Back","رجوع")}
        </button>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-emerald-50 shadow-sm">
            <Image src={product.imageUrl} alt={product.nameEn} fill className="object-cover" sizes="(min-width:1024px) 50vw, 100vw" priority />
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 backdrop-blur">
              {locale === "ar" ? CATEGORY_AR[product.category] : product.category}
            </span>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">{locale === "ar" ? product.nameAr : product.nameEn}</h1>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-neutral-900">{product.price}</span>
              <span className="text-lg font-semibold text-neutral-400">{t(locale,"AED","درهم")}</span>
            </div>

            <p className="mt-4 leading-relaxed text-neutral-600">{locale === "ar" ? product.descriptionAr : product.descriptionEn}</p>

            {/* Stock */}
            <div className="mt-4">
              {product.inStock ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                  <Check className="size-4" /> {t(locale,"In stock","متوفّر")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-sm font-semibold text-neutral-400">
                  {t(locale,"Sold out","نفد المخزون")}
                </span>
              )}
            </div>

            {/* Quantity + Buy */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="inline-flex items-center rounded-2xl border border-neutral-200 bg-white">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex size-12 items-center justify-center text-neutral-600 hover:text-emerald-700" aria-label={t(locale,"Decrease quantity","إنقاص الكمية")}>
                  <Minus className="size-4" />
                </button>
                <span className="w-10 text-center text-lg font-bold text-neutral-900">{qty}</span>
                <button type="button" onClick={() => setQty((q) => q + 1)} className="flex size-12 items-center justify-center text-neutral-600 hover:text-emerald-700" aria-label={t(locale,"Increase quantity","زيادة الكمية")}>
                  <Plus className="size-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!product.inStock}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-500 px-6 py-4 text-base font-bold text-emerald-950 shadow-lg shadow-emerald-500/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:from-neutral-200 disabled:to-neutral-200 disabled:text-neutral-400 disabled:shadow-none"
              >
                {added ? (<><Check className="size-5" /> {t(locale,"Added!","تمت الإضافة!")}</>) : (<><ShoppingCart className="size-5" /> {t(locale,"Buy Now","اشترِ الآن")} · {product.price * qty} {t(locale,"AED","درهم")}</>)}
              </button>
            </div>

            <Link href="/dashboard/cart" className="mt-3 text-center text-sm font-semibold text-emerald-700 hover:underline sm:text-left">
              {t(locale,"Go to cart","الذهاب إلى السلة")} →
            </Link>

            {/* Trust */}
            <div className="mt-6 flex flex-wrap gap-4 border-t border-neutral-100 pt-5 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-emerald-600" /> {t(locale,"Nutritionist-approved","معتمد من أخصائي تغذية")}</span>
              <span className="inline-flex items-center gap-1.5"><Truck className="size-4 text-emerald-600" /> {t(locale,"Fast UAE delivery","توصيل سريع في الإمارات")}</span>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="pt-6">
            <h2 className="text-lg font-bold text-neutral-900">{t(locale,"Related products","منتجات ذات صلة")}</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {related.map((p) => (
                <Link key={p.id} href={`/dashboard/products/${p.id}`} className="group overflow-hidden rounded-2xl border border-neutral-100 bg-white transition hover:border-emerald-300 hover:shadow-md">
                  <div className="relative h-28 bg-emerald-50">
                    <Image src={p.imageUrl} alt={p.nameEn} fill className="object-cover transition group-hover:scale-105" sizes="25vw" />
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold text-neutral-900">{locale === "ar" ? p.nameAr : p.nameEn}</p>
                    <p className="text-xs text-neutral-400">{p.price} {t(locale,"AED","درهم")}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
