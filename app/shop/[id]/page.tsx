"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Minus, Plus, ShoppingCart, Check, ShieldCheck, Truck, Leaf } from "lucide-react"
import { mockProducts } from "@/lib/mock-data"
import { useApp } from "@/lib/store"
import { cn } from "@/lib/utils"
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
  const product = useMemo(() => mockProducts.find((p) => p.id === id), [id])
  const related = useMemo(() => mockProducts.filter((p) => p.id !== id && p.category === product?.category).slice(0, 4), [id, product])
  const [qty, setQty] = useState(1)

  const isSignedIn = () => {
    if (state.user) return true
    if (typeof window !== "undefined" && window.localStorage.getItem("loverDietUser")) return true
    return false
  }

  if (!product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#f6faf8] px-4 text-center">
        <p className="text-lg font-bold text-neutral-900">{t(locale, "Product not found", "المنتج غير موجود")}</p>
        <Link href="/shop" className="mt-4 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white">{t(locale, "Back to shop", "العودة للمتجر")}</Link>
      </main>
    )
  }

  const name = locale === "ar" ? product.nameAr : product.nameEn
  const desc = locale === "ar" ? product.descriptionAr : product.descriptionEn

  function buyNow() {
    if (!isSignedIn()) {
      // Guest -> send to sign-up, remembering intent
      if (typeof window !== "undefined") {
        window.localStorage.setItem("pendingCart", JSON.stringify({ productId: product!.id, quantity: qty }))
      }
      router.push("/sign-up?redirect=/dashboard/cart")
      return
    }
    addToCart(product!.id, qty)
    notify(t(locale, "Added to cart", "تمت الإضافة للسلة"), "success")
    router.push("/dashboard/cart")
  }

  function addOnly() {
    if (!isSignedIn()) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("pendingCart", JSON.stringify({ productId: product!.id, quantity: qty }))
      }
      router.push("/sign-up?redirect=/dashboard/products")
      return
    }
    addToCart(product!.id, qty)
    notify(t(locale, "Added to cart", "تمت الإضافة للسلة"), "success")
  }

  return (
    <main className="min-h-screen bg-[#f6faf8] pt-24">
      <div className="mx-auto max-w-5xl px-4 pb-16">
        <Link href="/shop" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-emerald-700">
          <ArrowLeft className="size-4 rtl:rotate-180" /> {t(locale, "Back to shop", "العودة للمتجر")}
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-neutral-100 bg-emerald-50">
            <Image src={product.imageUrl} alt={name} fill sizes="(max-width:1024px) 100vw, 480px" className="object-cover" priority />
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600">
              {product.category}
            </span>
            <h1 className="mt-3 text-3xl font-extrabold text-neutral-900">{name}</h1>
            <p className="mt-3 leading-relaxed text-neutral-500">{desc}</p>
            <p className="mt-5 text-4xl font-black text-emerald-700">{format(product.price)}</p>

            <div className="mt-3">
              <select value={currency} onChange={(e)=>setCurrency(e.target.value as typeof currency)} className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 focus:border-emerald-400 focus:outline-none" aria-label={t(locale,"Currency","العملة")}>
                {CURRENCIES.map((c)=><option key={c.code} value={c.code}>{c.code} — {locale==="ar"?c.ar:c.en}</option>)}
              </select>
            </div>

            {/* Qty */}
            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm font-semibold text-neutral-700">{t(locale, "Quantity", "الكمية")}</span>
              <div className="flex items-center gap-3 rounded-full border border-neutral-200 bg-white px-2 py-1.5">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex size-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-50"><Minus className="size-4" /></button>
                <span className="min-w-8 text-center font-bold text-neutral-900">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="flex size-8 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-50"><Plus className="size-4" /></button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={buyNow}
                disabled={!product.inStock}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart className="size-4" /> {t(locale, "Buy Now", "اشترِ الآن")}
              </button>
              <button
                onClick={addOnly}
                disabled={!product.inStock}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-6 py-3.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="size-4" /> {t(locale, "Add to cart", "أضف للسلة")}
              </button>
            </div>
            {!isSignedIn() && (
              <p className="mt-3 text-center text-xs text-neutral-400 sm:text-start">
                {t(locale, "You'll be asked to create an account to complete your order.", "سيُطلب منك إنشاء حساب لإتمام طلبك.")}
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
                    <span className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Icon className="size-4" /></span>
                    <span className="text-xs font-medium text-neutral-500">{locale === "ar" ? b.ar : b.en}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-5 text-xl font-bold text-neutral-900">{t(locale, "You may also like", "قد يعجبك أيضاً")}</h2>
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              {related.map((p) => (
                <Link key={p.id} href={`/shop/${p.id}`} className="group overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="relative h-36 overflow-hidden bg-emerald-50">
                    <Image src={p.imageUrl} alt={locale === "ar" ? p.nameAr : p.nameEn} fill sizes="25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-3">
                    <h3 className="truncate text-sm font-bold text-neutral-900">{locale === "ar" ? p.nameAr : p.nameEn}</h3>
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
