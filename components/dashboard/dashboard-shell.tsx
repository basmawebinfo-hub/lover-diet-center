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

async function signOut(router: ReturnType<typeof useRouter>) {
  const { createClient } = await import("@/lib/supabase/client")
  const supabase = createClient()
  await supabase.auth.signOut()
  router.push("/sign-in")
  router.refresh()
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { locale } = useLocale()
  const { state } = useApp()
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

  // While we confirm role (and during redirect), don't flash client UI to an admin.
  if (user?.role === "admin" || !adminChecked) return null

  return (
    <div className="min-h-screen bg-[#f6faf8] lg:grid lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:border-r lg:border-neutral-100 lg:bg-white">
        <div className="flex items-center gap-2.5 px-6 py-6">
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
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
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

        <div className="border-t border-neutral-100 p-3 space-y-1">
          <button
            type="button"
            onClick={() => {
              if (confirm(t(locale, "Sign out of your account?", "تسجيل الخروج من حسابك؟"))) {
                signOut(router)
              }
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="size-4.5" />
            <span>{t(locale, "Sign Out", "تسجيل الخروج")}</span>
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-100 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/" className="text-lg font-bold text-emerald-700 tracking-tight">
          lovers<span className="text-emerald-500">dc</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (confirm(t(locale, "Sign out?", "تسجيل الخروج؟"))) signOut(router)
            }}
            className="p-2 rounded-xl text-neutral-500 hover:bg-neutral-100"
          >
            <LogOut className="size-4" />
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
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-semibold",
              active ? "text-emerald-700" : "text-neutral-500"
            )}
          >
            <Icon className="size-4" />
            <span>{locale === "ar" ? item.labelAr : item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
