"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Package, ShoppingBag, RefreshCw, Loader2, RotateCcw, ChevronDown, ChevronUp, AlertCircle, Check, XCircle,
} from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { useApp } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"
import { useCurrency } from "@/lib/currency"
import { useToast } from "@/components/ui/toast"
import type { Order } from "@/lib/types"

const STATUS: Record<Order["status"], { en: string; ar: string; cls: string; dotCls: string }> = {
  pending:    { en: "Pending",    ar: "قيد الانتظار", cls: "bg-amber-50 text-amber-700",   dotCls: "bg-amber-500" },
  processing: { en: "Processing", ar: "قيد التجهيز",  cls: "bg-blue-50 text-blue-700",     dotCls: "bg-blue-500" },
  shipped:    { en: "Shipped",    ar: "تم الشحن",     cls: "bg-indigo-50 text-indigo-700", dotCls: "bg-indigo-500" },
  delivered:  { en: "Delivered",  ar: "تم التوصيل",   cls: "bg-emerald-50 text-emerald-700", dotCls: "bg-emerald-500" },
  cancelled:  { en: "Cancelled",  ar: "ملغي",         cls: "bg-red-50 text-red-600",       dotCls: "bg-red-500" },
}

type Filter = "all" | Order["status"]

export default function OrdersPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const { format } = useCurrency()
  const { state, refreshOrders, addToCart } = useApp()
  const { notify } = useToast()
  const user = state.user

  const [initialLoad, setInitialLoad] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [reorderingId, setReorderingId] = useState<string | null>(null)

  useEffect(() => {
    if (state.authChecked && !user) router.replace("/onboarding")
  }, [state.authChecked, user, router])

  const refresh = useCallback(async (isInitial: boolean) => {
    if (!user) return
    if (isInitial) setInitialLoad(true)
    else setRefreshing(true)
    setError(null)
    try {
      await refreshOrders()
    } catch {
      setError(t(locale, "Could not load your orders. Please try again.", "تعذّر تحميل طلباتك. يرجى المحاولة مرة أخرى."))
    } finally {
      setInitialLoad(false)
      setRefreshing(false)
    }
  }, [user, refreshOrders, locale])

  useEffect(() => {
    if (state.authChecked && user) refresh(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.authChecked, user?.id])

  const orders = state.orders
  const filtered = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  )

  async function onManualRefresh() {
    await refresh(false)
    notify(t(locale, "Orders refreshed", "تم تحديث الطلبات"), "success")
  }

  function reorder(order: Order) {
    // Business rule: adding back to cart is always OK — the cart is user-owned
    // and the CartPage is the source of truth for stock enforcement. But we
    // still filter out items that are known to be out of stock at fetch time
    // AND items that no longer have a productId (product row deleted), and
    // surface a summary so the user knows what got added.
    setReorderingId(order.id)
    const eligible = order.items.filter((it) => it.productId && it.inStock !== false)
    const skipped = order.items.length - eligible.length
    if (eligible.length === 0) {
      setReorderingId(null)
      notify(
        t(locale, "None of these items are available anymore.", "لم تعد أي من هذه المنتجات متاحة."),
        "error",
      )
      return
    }
    for (const it of eligible) {
      addToCart(it.productId, it.quantity)
    }
    setReorderingId(null)
    if (skipped > 0) {
      notify(
        t(
          locale,
          `Added ${eligible.length} item(s) to cart. ${skipped} unavailable.`,
          `تمت إضافة ${eligible.length} منتج(ات) للسلة. ${skipped} غير متاح.`,
        ),
        "success",
      )
    } else {
      notify(
        t(
          locale,
          `Added ${eligible.length} item(s) to your cart.`,
          `تمت إضافة ${eligible.length} منتج(ات) لسلتك.`,
        ),
        "success",
      )
    }
    router.push("/dashboard/cart")
  }

  if (!state.authChecked && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6faf8]">
        <div className="size-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-600" />
      </div>
    )
  }
  if (!user) return null

  // ==== Loading ====
  if (initialLoad && orders.length === 0) {
    return (
      <DashboardShell>
        <MobileNav />
        <div className="mx-auto max-w-4xl space-y-6 pb-28 lg:pb-0">
          <header>
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t(locale, "My Orders", "طلباتي")}</h1>
            <p className="mt-1 text-sm text-neutral-500">{t(locale, "Loading your latest orders...", "جارٍ تحميل آخر الطلبات...")}</p>
          </header>
          <SkeletonOrders />
        </div>
      </DashboardShell>
    )
  }

  // ==== Error ====
  if (error && orders.length === 0) {
    return (
      <DashboardShell>
        <MobileNav />
        <div className="mx-auto max-w-2xl pb-28 lg:pb-0">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t(locale, "My Orders", "طلباتي")}</h1>
          </header>
          <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle className="size-6" />
            </div>
            <h2 className="text-lg font-bold text-red-700">{t(locale, "Could not load your orders", "تعذّر تحميل الطلبات")}</h2>
            <p className="mt-2 text-sm text-neutral-600">{error}</p>
            <button
              type="button"
              onClick={() => refresh(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-lime-700 px-5 py-3 text-sm font-bold text-white hover:bg-lime-800"
            >
              <RefreshCw className="size-4" /> {t(locale, "Try again", "إعادة المحاولة")}
            </button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <MobileNav />
      <div className="mx-auto max-w-4xl space-y-6 pb-28 lg:pb-0">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t(locale, "My Orders", "طلباتي")}</h1>
            <p className="mt-1 text-sm text-neutral-500">{t(locale, "Track your purchases and delivery status.", "تابع مشترياتك وحالة التوصيل.")}</p>
          </div>
          <button
            type="button"
            onClick={onManualRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-600 hover:border-lime-300 hover:text-lime-700 disabled:opacity-60"
          >
            {refreshing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            {refreshing ? t(locale, "Refreshing...", "جارٍ التحديث...") : t(locale, "Refresh", "تحديث")}
          </button>
        </header>

        {/* Filter chips */}
        {orders.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label={t(locale, "All", "الكل")} count={orders.length} />
            {(Object.keys(STATUS) as Order["status"][]).map((s) => {
              const count = orders.filter((o) => o.status === s).length
              if (count === 0) return null
              return (
                <FilterChip
                  key={s}
                  active={filter === s}
                  onClick={() => setFilter(s)}
                  label={locale === "ar" ? STATUS[s].ar : STATUS[s].en}
                  count={count}
                  dotCls={STATUS[s].dotCls}
                />
              )
            })}
          </div>
        )}

        {/* Empty (no orders at all) */}
        {orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-neutral-100">
              <Package className="size-7 text-neutral-400" />
            </div>
            <h2 className="text-lg font-bold text-neutral-900">{t(locale, "No orders yet", "لا توجد طلبات بعد")}</h2>
            <p className="mt-1 text-sm text-neutral-500">{t(locale, "When you place an order, it will show up here.", "عند إتمام طلب، سيظهر هنا.")}</p>
            <Link href="/dashboard/products" className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
              <ShoppingBag className="size-4" /> {t(locale, "Browse products", "تصفّح المنتجات")}
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-neutral-200 py-10 text-center">
            <p className="text-sm font-semibold text-neutral-500">{t(locale, "No orders match this filter.", "لا توجد طلبات مطابقة للتصفية.")}</p>
            <button onClick={() => setFilter("all")} className="mt-2 text-xs font-semibold text-lime-700 hover:underline">
              {t(locale, "Show all", "عرض الكل")}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                locale={locale}
                format={format}
                expanded={expandedId === order.id}
                onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
                onReorder={() => reorder(order)}
                reordering={reorderingId === order.id}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

// ============================================================================
// OrderCard
// ============================================================================
function OrderCard({
  order, locale, format, expanded, onToggle, onReorder, reordering,
}: {
  order: Order
  locale: "en" | "ar"
  format: (usd: number) => string
  expanded: boolean
  onToggle: () => void
  onReorder: () => void
  reordering: boolean
}) {
  const st = STATUS[order.status] ?? STATUS.pending
  const itemsCount = order.items.reduce((n, it) => n + it.quantity, 0)
  const canReorder = order.items.some((it) => it.productId && it.inStock !== false)
  const isCancelled = order.status === "cancelled"

  return (
    <div className={cn(
      "rounded-3xl border bg-white shadow-sm transition",
      expanded ? "border-lime-200" : "border-neutral-100",
    )}>
      {/* Header row */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-start"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-2xl", isCancelled ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700")}>
            {isCancelled ? <XCircle className="size-5" /> : <Package className="size-5" />}
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-900">#{order.id.slice(-6).toUpperCase()}</p>
            <p className="text-xs text-neutral-400">
              {new Date(order.date).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}
              {" · "}
              {itemsCount} {t(locale, itemsCount === 1 ? "item" : "items", "منتج")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold", st.cls)}>
            <span className={cn("size-1.5 rounded-full", st.dotCls)} />
            {locale === "ar" ? st.ar : st.en}
          </span>
          <span className="text-base font-black text-neutral-900">{format(order.total)}</span>
          {expanded ? <ChevronUp className="size-4 text-neutral-400" /> : <ChevronDown className="size-4 text-neutral-400" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-neutral-50 p-5 pt-4">
          {/* Item list */}
          <div className="space-y-3">
            {order.items.map((it, idx) => {
              const name = locale === "ar" ? it.nameAr : it.nameEn
              const gone = !it.productId
              const outOfStock = it.inStock === false
              return (
                <div key={`${order.id}-${idx}`} className="flex items-center gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50">
                    {it.imageUrl ? (
                      <Image src={it.imageUrl} alt={name} fill sizes="56px" className="object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xl">🥗</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-neutral-900">{name || t(locale, "Unnamed product", "منتج بلا اسم")}</p>
                    <p className="text-xs text-neutral-500">
                      {format(it.price)} · × {it.quantity}
                    </p>
                    {(gone || outOfStock) && (
                      <p className="mt-0.5 text-[11px] font-semibold text-amber-600">
                        {gone
                          ? t(locale, "No longer available", "لم يعد متاحاً")
                          : t(locale, "Out of stock", "غير متوفر حالياً")}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-neutral-900">{format(it.price * it.quantity)}</span>
                </div>
              )
            })}
          </div>

          {/* Totals breakdown */}
          <div className="mt-5 space-y-1.5 border-t border-neutral-50 pt-4 text-sm">
            <Line label={t(locale, "Subtotal", "المجموع الفرعي")} value={format(order.subtotal)} />
            {order.shipping > 0 && <Line label={t(locale, "Shipping", "الشحن")} value={format(order.shipping)} />}
            <div className="flex items-center justify-between border-t border-neutral-100 pt-2">
              <span className="text-sm font-semibold text-neutral-700">{t(locale, "Total", "الإجمالي")}</span>
              <span className="text-lg font-black text-emerald-700">{format(order.total)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onReorder}
              disabled={!canReorder || reordering}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition",
                canReorder && !reordering
                  ? "bg-lime-700 text-white shadow-sm hover:bg-lime-800"
                  : "cursor-not-allowed bg-neutral-100 text-neutral-400",
              )}
            >
              {reordering ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
              {reordering
                ? t(locale, "Adding...", "جارٍ الإضافة...")
                : canReorder
                  ? t(locale, "Reorder", "إعادة الطلب")
                  : t(locale, "Not available", "غير متاح")}
            </button>
            {!canReorder && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-400">
                <AlertCircle className="size-3.5" />
                {t(locale, "None of these items are buyable now.", "لا يمكن شراء أيّ من هذه المنتجات الآن.")}
              </span>
            )}
            {order.status === "delivered" && (
              <span className="ms-auto inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <Check className="size-3.5" /> {t(locale, "Delivered", "تم التوصيل")}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Small helpers
// ============================================================================
function FilterChip({
  active, onClick, label, count, dotCls,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
  dotCls?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
        active
          ? "bg-lime-700 text-white shadow-sm"
          : "border border-neutral-200 bg-white text-neutral-600 hover:border-lime-300 hover:text-lime-700",
      )}
    >
      {dotCls && <span className={cn("size-1.5 rounded-full", dotCls)} />}
      {label}
      <span className={cn("rounded-full px-1.5 text-[10px] font-bold", active ? "bg-white/25 text-white" : "bg-neutral-100 text-neutral-500")}>{count}</span>
    </button>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-neutral-500">
      <span>{label}</span>
      <span className="text-neutral-700">{value}</span>
    </div>
  )
}

function SkeletonOrders() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-3xl bg-neutral-100" />
      ))}
    </div>
  )
}
