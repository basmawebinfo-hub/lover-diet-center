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
} from "lucide-react"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", labelAr: "الرئيسية", icon: Home },
  { href: "/dashboard/settings", label: "Profile & Goal", labelAr: "الملف والهدف", icon: UserIcon },
  { href: "/dashboard/weight", label: "Daily Weight", labelAr: "الوزن اليومي", icon: Scale },
  { href: "/dashboard/plan", label: "My Plan", labelAr: "الخطة", icon: Apple },
  { href: "/dashboard/products", label: "Products", labelAr: "المنتجات", icon: ShoppingBag },
  { href: "/dashboard/sessions", label: "Sessions", labelAr: "الجلسات", icon: Calendar },
  { href: "/dashboard/cart", label: "Cart", labelAr: "السلة", icon: ShoppingCart },
  { href: "/dashboard/orders", label: "My Orders", labelAr: "طلباتي", icon: Package },
] as const

async function signOut(_router: ReturnType<typeof useRouter>) {
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

  // While we confirm role (and during redirect), don't flash client UI to an admin.
  if (user?.role === "admin" || !adminChecked) return null

  return (
    <div className="min-h-screen bg-[#f6faf8] lg:grid lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:border-r lg:border-neutral-100 lg:bg-white">
        <div className="flex items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <Image
              src="/ldc-logo.png"
              alt="Lover Diet Center logo"
              width={36}
              height={36}
              className="size-9 rounded-full object-cover"
            />
            <span className="text-xl font-bold text-emerald-700 tracking-tight">
              lovers<span className="text-emerald-500">dc</span>
            </span>
          </Link>
          <NotificationBell />
        </div>

        {user && (
          <div className="mx-4 mb-4 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4">
            <p className="text-xs font-semibold text-emerald-700">{t(locale, "Welcome back", "مرحباً بعودتك")}</p>
            <p className="mt-0.5 truncate text-base font-bold text-neutral-900">
              {user.nameEn}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {user.currentWeightKg.toFixed(1)} {t(locale,"kg","كجم")} · {t(locale,"Target","الهدف")} {user.targetWeightKg.toFixed(1)} {t(locale,"kg","كجم")}
            </p>
            <button
              type="button"
              onClick={() => {
                if (confirm(t(locale, "Sign out of your account?", "تسجيل الخروج من حسابك؟"))) {
                  signOut(router)
                }
              }}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
            >
              <LogOut className="size-3.5" aria-hidden="true" />
              {t(locale, "Sign out", "تسجيل الخروج")}
            </button>
          </div>
        )}

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300",
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                )}
              >
                <Icon
                  className={cn(
                    "size-4.5",
                    active ? "text-emerald-600" : "text-neutral-400 group-hover:text-neutral-600"
                  )}
                />
                <span className="flex-1">{locale === "ar" ? item.labelAr : item.label}</span>
                {item.href === "/dashboard/cart" && cartCount > 0 && (
                  <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-semibold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-100 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/" className="text-lg font-bold text-emerald-700 tracking-tight">
          lovers<span className="text-emerald-500">dc</span>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button
            type="button"
            onClick={() => {
              if (confirm(t(locale, "Sign out?", "تسجيل الخروج؟"))) signOut(router)
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
          >
            <LogOut className="size-3.5" aria-hidden="true" />
            {t(locale, "Sign out", "خروج")}
          </button>
          <Link
            href="/dashboard/cart"
            className="relative flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white"
          >
            <ShoppingCart className="size-3.5" />
            {cartCount > 0 && <span>{cartCount}</span>}
          </Link>
        </div>
      </div>

      {/* Main */}
      <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  )
}

// Mobile bottom nav (small screens)
export function MobileNav() {
  const pathname = usePathname()
  const { locale } = useLocale()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-4 gap-1 border-t border-neutral-100 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
      {NAV_ITEMS.slice(0, 4).map((item) => {
        const Icon = item.icon
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300",
              active ? "text-emerald-700" : "text-neutral-500"
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span>{locale === "ar" ? item.labelAr : item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
