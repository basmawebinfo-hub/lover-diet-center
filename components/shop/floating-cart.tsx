"use client"

// Floating cart button + slide-in drawer for PUBLIC shop pages only.
// - Hidden entirely when the cart is empty.
// - Badge shows total item count.
// - Drawer supports qty updates, removals, and jumps to /shop/checkout.
// Dashboard pages are untouched (this is only mounted in app/shop/layout.tsx).

import { useEffect, useMemo, useState, useCallback, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, X, Minus, Plus, Trash2, ArrowRight } from "lucide-react"
import { useApp } from "@/lib/store"
import { useLocale, t } from "@/lib/locale"
import { useCurrency } from "@/lib/currency"
import { cn } from "@/lib/utils"

const SHIPPING_USD = 15

export function FloatingCart() {
  const router = useRouter()
  const pathname = usePathname()
  const { locale } = useLocale()
  const { format } = useCurrency()
  const { state, updateCartQty, removeFromCart } = useApp()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const cartItems = useMemo(
    () =>
      state.cart
        .map((c) => {
          const product = state.products.find((p) => p.id === c.productId)
          return product ? { ...c, product } : null
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    [state.cart, state.products],
  )
  const count = useMemo(() => cartItems.reduce((s, it) => s + it.quantity, 0), [cartItems])
  const subtotal = useMemo(
    () => cartItems.reduce((s, it) => s + it.product.price * it.quantity, 0),
    [cartItems],
  )

  const close = useCallback(() => setOpen(false), [])

  // Close drawer on navigation
  useEffect(() => { setOpen(false) }, [pathname])

  // Escape to close + basic focus handling
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close() }
    document.addEventListener("keydown", onKey)
    panelRef.current?.focus()
    return () => document.removeEventListener("keydown", onKey)
  }, [open, close])

  // Lock body scroll while the drawer is open
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [open])

  // Hide the button on the checkout page itself, and when the cart is empty
  const hideButton = count === 0 || pathname === "/shop/checkout"

  return (
    <>
      {/* Floating button */}
      {!hideButton && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t(locale, `Open cart, ${count} items`, `افتح السلة، ${count} منتج`)}
          className="fixed bottom-24 end-5 z-40 flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all duration-300 hover:scale-105 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 animate-fade-up"
        >
          <span className="relative">
            <ShoppingCart className="size-5" aria-hidden />
            <span
              className="absolute -top-2.5 flex size-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-black text-white ring-2 ring-emerald-600 ltr:-right-2.5 rtl:-left-2.5"
              aria-hidden
            >
              {count > 9 ? "9+" : count}
            </span>
          </span>
          <span className="hidden sm:inline">{format(subtotal)}</span>
        </button>
      )}

      {/* Overlay */}
      <div
        onClick={close}
        aria-hidden
        className={cn(
          "fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Drawer */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t(locale, "Shopping cart", "سلة التسوق")}
        tabIndex={-1}
        className={cn(
          "fixed inset-y-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl outline-none transition-transform duration-300 ease-out",
          "ltr:right-0 rtl:left-0",
          open
            ? "translate-x-0"
            : "ltr:translate-x-full rtl:-translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900">
            <ShoppingCart className="size-5 text-emerald-600" aria-hidden />
            {t(locale, "Your Cart", "سلتك")}
            {count > 0 && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                {count}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label={t(locale, "Close cart", "إغلاق السلة")}
            className="flex size-9 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-50 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-neutral-100">
                <ShoppingCart className="size-6 text-neutral-400" aria-hidden />
              </div>
              <p className="mt-3 text-sm font-semibold text-neutral-500">
                {t(locale, "Your cart is empty", "سلتك فارغة")}
              </p>
              <Link
                href="/shop"
                onClick={close}
                className="mt-4 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                {t(locale, "Browse shop", "تصفّح المتجر")}
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {cartItems.map((it) => {
                const name = locale === "ar" ? it.product.nameAr : it.product.nameEn
                return (
                  <li
                    key={it.productId}
                    className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm"
                  >
                    <Link
                      href={`/shop/${it.product.id}`}
                      onClick={close}
                      className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-emerald-50"
                      aria-label={name}
                    >
                      {it.product.imageUrl && (
                        <Image src={it.product.imageUrl} alt={name} fill sizes="56px" className="object-cover" />
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-neutral-900">{name}</p>
                      <p className="text-xs font-bold text-emerald-700">{format(it.product.price)}</p>
                    </div>
                    <div className="flex items-center gap-0.5 rounded-lg border border-neutral-200">
                      <button
                        type="button"
                        onClick={() => updateCartQty(it.productId, it.quantity - 1)}
                        disabled={it.quantity <= 1}
                        className="flex size-7 items-center justify-center text-neutral-500 transition hover:text-emerald-700 disabled:cursor-not-allowed disabled:text-neutral-300"
                        aria-label={t(locale, "Decrease quantity", "إنقاص الكمية")}
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-neutral-900" aria-live="polite">
                        {it.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(it.productId, it.quantity + 1)}
                        className="flex size-7 items-center justify-center text-neutral-500 transition hover:text-emerald-700"
                        aria-label={t(locale, "Increase quantity", "زيادة الكمية")}
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(it.productId)}
                      className="flex size-8 items-center justify-center rounded-lg text-neutral-300 transition hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                      aria-label={t(locale, "Remove item", "إزالة العنصر")}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t border-neutral-100 px-5 py-4">
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between text-neutral-500">
                <dt>{t(locale, "Subtotal", "المجموع الفرعي")}</dt>
                <dd className="tabular-nums">{format(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-neutral-500">
                <dt>{t(locale, "Shipping", "الشحن")}</dt>
                <dd className="tabular-nums">{format(SHIPPING_USD)}</dd>
              </div>
              <div className="flex justify-between pt-1 text-base font-bold text-neutral-900">
                <dt>{t(locale, "Total", "الإجمالي")}</dt>
                <dd className="tabular-nums">{format(subtotal + SHIPPING_USD)}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => { close(); router.push("/shop/checkout") }}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200"
            >
              {t(locale, "Checkout", "إتمام الشراء")}
              <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
            </button>
            <p className="mt-2 text-center text-xs text-neutral-400">
              {t(locale, "No account needed — checkout as a guest.", "لا حاجة لحساب — أتمم الشراء كضيف.")}
            </p>
          </div>
        )}
      </div>
    </>
  )
}
