"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useApp } from "@/lib/store"
import { useEffect, useState } from "react"
import { isAdmin } from "@/lib/supabase/db"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"
import { NotificationBell } from "@/components/dashboard/notification-bell"
import { Sheet, ConfirmSheet } from "@/components/ui/sheet"
import {
  Home,
  Scale,
  Apple,
  Calendar,
  ShoppingBag,
  User as UserIcon,
  ShoppingCart,
  Package,
  LogOut,
  MoreHorizontal,
  Camera,
} from "lucide-react"

type NavItem = {
  href: string
  label: string
  labelAr: string
  icon: typeof Home
}

/** Every destination in the client dashboard. Order drives the sidebar. */
const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", labelAr: "الرئيسية", icon: Home },
  { href: "/dashboard/plan", label: "My Plan", labelAr: "خطتي", icon: Apple },
  { href: "/dashboard/weight", label: "Daily Weight", labelAr: "وزني اليومي", icon: Scale },
  { href: "/dashboard/products", label: "Products", labelAr: "المنتجات", icon: ShoppingBag },
  { href: "/dashboard/sessions", label: "Sessions", labelAr: "الجلسات", icon: Calendar },
  { href: "/dashboard/orders", label: "My Orders", labelAr: "طلباتي", icon: Package },
  { href: "/dashboard/cart", label: "Cart", labelAr: "السلة", icon: ShoppingCart },
  { href: "/dashboard/settings", label: "Profile & Goal", labelAr: "الملف والهدف", icon: UserIcon },
]

/**
 * The four destinations that get a permanent slot on the phone. The fifth slot
 * is "More", which opens a sheet with everything else — so no destination is
 * unreachable from a phone.
 *
 * The previous bar rendered `NAV_ITEMS.slice(0, 4)`, which silently stranded
 * Products, Sessions and Orders: there was no path to them on mobile at all.
 */
const BOTTOM_BAR = ["/dashboard", "/dashboard/plan", "/dashboard/weight"] as const

async function signOut() {
  // Full sign-out: revokes the Supabase session, clears the persisted user
  // from localStorage, and hard-navigates to /sign-in so no stale in-memory
  // state can resurrect the session on the next click/refresh.
  const { signOutCompletely } = await import("@/lib/sign-out")
  await signOutCompletely()
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { locale } = useLocale()
  const { state, refreshNotifications } = useApp()
  const user = state.user
  const cartCount = state.cart.reduce((s, c) => s + c.quantity, 0)

  const [moreOpen, setMoreOpen] = useState(false)
  const [confirmSignOut, setConfirmSignOut] = useState(false)

  // Admins do not belong in the client dashboard — send them to /admin.
  const [adminChecked, setAdminChecked] = useState(false)
  useEffect(() => {
    let active = true
    if (user?.role === "admin") { router.replace("/admin"); return }
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return
      if (!data.user) { setAdminChecked(true); return }
      if (user?.role) { setAdminChecked(true); return }
      const admin = await isAdmin(data.user.id)
      if (!active) return
      if (admin) { router.replace("/admin"); return }
      setAdminChecked(true)
    })
    return () => { active = false }
  }, [user, router])

  // Pull the user's notifications on mount + whenever the auth user changes.
  // Errors are silent (bell just stays at 0 unread) — this is a background
  // freshness pull, not an interactive action.
  useEffect(() => {
    if (!user || user.role === "admin") return
    refreshNotifications().catch(() => {
      /* non-fatal */
    })
  }, [user, refreshNotifications])

  // Close the More sheet when the route changes, otherwise it stays open on
  // top of the page the visitor just navigated to.
  useEffect(() => { setMoreOpen(false) }, [pathname])

  // While we confirm role (and during redirect), don't flash client UI to an admin.
  if (user?.role === "admin" || !adminChecked) return null

  const label = (item: NavItem) => (locale === "ar" ? item.labelAr : item.label)
  const isActive = (href: string) => pathname === href
  const barItems = BOTTOM_BAR.map((href) => NAV_ITEMS.find((i) => i.href === href)!).filter(Boolean)
  const moreItems = NAV_ITEMS.filter((i) => !BOTTOM_BAR.includes(i.href as typeof BOTTOM_BAR[number]))
  const moreHasActive = moreItems.some((i) => isActive(i.href))

  return (
    <div className="min-h-screen bg-[#f6faf8] lg:grid lg:grid-cols-[280px_1fr]">
      {/* ---------------------------------------------------- Sidebar --- */}
      <aside className="hidden lg:flex lg:flex-col lg:border-r lg:border-neutral-100 lg:bg-white">
        <div className="flex items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <Image
              src="/ldc-logo.png"
              alt="Lover Diet Center logo"
              width={36}
              height={36}
              className="size-9 rounded-full object-cover"
            />
            <span className="text-xl font-bold tracking-tight text-emerald-700">
              lovers<span className="text-emerald-500">dc</span>
            </span>
          </Link>
          <NotificationBell />
        </div>

        {user && (
          <div className="mx-4 mb-4 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4">
            <p className="text-xs font-semibold text-emerald-700">{t(locale, "Welcome back", "مرحباً بعودتك")}</p>
            <p className="mt-0.5 truncate text-base font-bold text-neutral-900">{user.nameEn}</p>
            <p className="mt-1 text-xs text-neutral-500">
              {user.currentWeightKg.toFixed(1)} {t(locale, "kg", "كجم")} · {t(locale, "Target", "الهدف")}{" "}
              {user.targetWeightKg.toFixed(1)} {t(locale, "kg", "كجم")}
            </p>
          </div>
        )}

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300",
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900",
                )}
              >
                <Icon
                  className={cn(
                    "size-4.5",
                    active ? "text-emerald-600" : "text-neutral-400 group-hover:text-neutral-600",
                  )}
                />
                <span className="flex-1">{label(item)}</span>
                {item.href === "/dashboard/cart" && cartCount > 0 && (
                  <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-semibold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="space-y-1 border-t border-neutral-100 p-3">
          <button
            type="button"
            onClick={() => setConfirmSignOut(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
          >
            <LogOut className="size-4.5" />
            <span>{t(locale, "Sign Out", "تسجيل الخروج")}</span>
          </button>
        </div>
      </aside>

      {/* -------------------------------------------------- Mobile bar --- */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-100 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/" className="text-lg font-bold tracking-tight text-emerald-700">
          lovers<span className="text-emerald-500">dc</span>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Link
            href="/dashboard/cart"
            aria-label={t(locale, "Cart", "السلة")}
            className="relative flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white"
          >
            <ShoppingCart className="size-3.5" aria-hidden="true" />
            {cartCount > 0 && <span>{cartCount}</span>}
          </Link>
        </div>
      </div>

      {/* -------------------------------------------------------- Main --- */}
      {/*
        The bottom padding lives here, once. It used to be each page's job to
        remember `pb-28`, and /dashboard/intro had forgotten — its last rows sat
        underneath the fixed bar. env(safe-area-inset-bottom) clears the gesture
        bar on phones that have one.
      */}
      <main className="px-4 py-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-10 lg:py-10 lg:pb-10">
        {children}
      </main>

      {/* --------------------------------------------------- Bottom nav -- */}
      {/*
        Rendered once by the shell. It used to be exported and hand-placed by
        every page — 30+ call sites, four of them in a single checkout file,
        one per early-return branch. Any branch that forgot it left the visitor
        with no way out of the page.
      */}
      <nav
        aria-label={t(locale, "Dashboard", "لوحة التحكم")}
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 items-end gap-1 border-t border-neutral-100 bg-white/95 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
      >
        {barItems.slice(0, 2).map((item) => (
          <BarLink key={item.href} item={item} active={isActive(item.href)} label={label(item)} />
        ))}

        {/*
          Centre slot, reserved for the daily action. Food logging is not built
          yet, so it points at weight logging — the one thing a client is meant
          to do every day today. When photo logging ships it takes this slot
          without the bar needing to be redesigned.
        */}
        <Link
          href="/dashboard/weight"
          aria-label={t(locale, "Log today", "سجّل اليوم")}
          className="flex flex-col items-center gap-1 focus:outline-none"
        >
          <span className="flex size-12 -translate-y-3 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 transition-transform active:scale-95">
            <Camera className="size-5" aria-hidden="true" />
          </span>
          <span className="-mt-2 text-[10px] font-semibold text-neutral-500">
            {t(locale, "Log", "سجّل")}
          </span>
        </Link>

        {barItems.slice(2).map((item) => (
          <BarLink key={item.href} item={item} active={isActive(item.href)} label={label(item)} />
        ))}

        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
          className={cn(
            "flex min-h-11 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300",
            moreHasActive ? "text-emerald-700" : "text-neutral-500",
          )}
        >
          <span className="relative">
            <MoreHorizontal className="size-5" aria-hidden="true" />
            {cartCount > 0 && (
              <span className="absolute -end-1.5 -top-1 size-2 rounded-full bg-orange-500" />
            )}
          </span>
          <span>{t(locale, "More", "المزيد")}</span>
        </button>
      </nav>

      {/* --------------------------------------------------- More sheet -- */}
      <Sheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title={t(locale, "All sections", "كل الأقسام")}
      >
        <ul className="grid grid-cols-2 gap-2">
          {moreItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-16 flex-col justify-center gap-1.5 rounded-2xl border p-3.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300",
                    active
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-neutral-100 bg-white text-neutral-700 hover:bg-neutral-50",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="size-4.5 shrink-0" aria-hidden="true" />
                    {item.href === "/dashboard/cart" && cartCount > 0 && (
                      <span className="rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {cartCount}
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-semibold">{label(item)}</span>
                </Link>
              </li>
            )
          })}
        </ul>

        <button
          type="button"
          onClick={() => {
            setMoreOpen(false)
            setConfirmSignOut(true)
          }}
          className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
        >
          <LogOut className="size-4" aria-hidden="true" />
          {t(locale, "Sign Out", "تسجيل الخروج")}
        </button>
      </Sheet>

      <ConfirmSheet
        open={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
        onConfirm={() => void signOut()}
        title={t(locale, "Sign out?", "تسجيل الخروج؟")}
        description={t(
          locale,
          "You'll need to sign in again to see your plan and progress.",
          "هتحتاج تسجّل دخول تاني عشان تشوف خطتك وتقدّمك.",
        )}
        confirmLabel={t(locale, "Sign out", "تسجيل الخروج")}
      />
    </div>
  )
}

function BarLink({ item, active, label }: { item: NavItem; active: boolean; label: string }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        // min-h-11 keeps the tap target at the 44px floor even though the
        // label is tiny.
        "flex min-h-11 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300",
        active ? "text-emerald-700" : "text-neutral-500",
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
      <span className="max-w-full truncate">{label}</span>
    </Link>
  )
}
