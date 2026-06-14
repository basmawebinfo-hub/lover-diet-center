"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useApp } from "@/lib/store"
import { cn } from "@/lib/utils"
import {
  Home,
  Scale,
  Apple,
  Calendar,
  ShoppingBag,
  User as UserIcon,
  ShoppingCart,
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
] as const

function signOut(router: ReturnType<typeof useRouter>) {
  // Clear auth cookie
  document.cookie = "ldc_auth_token=; path=/; max-age=0; SameSite=Lax"
  // Clear local storage auth data
  localStorage.removeItem("ldc_auth_email")
  // Redirect to sign-in
  router.push("/sign-in")
  router.refresh()
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { state } = useApp()
  const user = state.user
  const cartCount = state.cart.reduce((s, c) => s + c.quantity, 0)

  return (
    <div className="min-h-screen bg-[#F0FAF8] lg:grid lg:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:border-r lg:border-neutral-100 lg:bg-white">
        <div className="flex items-center gap-2 px-6 py-6">
          <Link href="/" className="text-xl font-bold text-teal-700 tracking-tight hover:opacity-80 transition-opacity">
            lovers<span className="text-teal-500">dc</span>
          </Link>
        </div>

        {user && (
          <div className="mx-4 mb-4 rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-4">
            <p className="text-xs font-semibold text-teal-700">Welcome back</p>
            <p className="mt-0.5 truncate text-base font-bold text-neutral-900">
              {user.nameEn}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {user.currentWeightKg.toFixed(1)} kg · Target {user.targetWeightKg.toFixed(1)} kg
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
                    ? "bg-teal-50 text-teal-700"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                )}
              >
                <Icon
                  className={cn(
                    "size-4.5",
                    active ? "text-teal-600" : "text-neutral-400 group-hover:text-neutral-600"
                  )}
                />
                <span className="flex-1">{item.label}</span>
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
              if (confirm("Sign out of your account?")) {
                signOut(router)
              }
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="size-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-100 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/" className="text-lg font-bold text-teal-700 tracking-tight">
          lovers<span className="text-teal-500">dc</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (confirm("Sign out?")) signOut(router)
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
              active ? "text-teal-700" : "text-neutral-500"
            )}
          >
            <Icon className="size-4" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
