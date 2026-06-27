"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LayoutDashboard, Users, ShoppingBag, Package, Apple, Calendar,
  BarChart3, LogOut, ShieldAlert, Menu, X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"
import { useApp } from "@/lib/store"
import { createClient } from "@/lib/supabase/client"
import { isAdmin } from "@/lib/supabase/db"

const NAV = [
  { href: "/admin", en: "Overview", ar: "نظرة عامة", icon: LayoutDashboard },
  { href: "/admin/clients", en: "Clients", ar: "العملاء", icon: Users },
  { href: "/admin/orders", en: "Orders", ar: "الطلبات", icon: ShoppingBag },
  { href: "/admin/products", en: "Products", ar: "المنتجات", icon: Package },
  { href: "/admin/plans", en: "Meals & Plans", ar: "الوجبات والخطط", icon: Apple },
  { href: "/admin/sessions", en: "Sessions", ar: "الجلسات", icon: Calendar },
  { href: "/admin/analytics", en: "Analytics", ar: "التحليلات", icon: BarChart3 },
] as const

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { locale } = useLocale()
  const { state } = useApp()
  const [checked, setChecked] = useState(false)
  const [allowed, setAllowed] = useState(false)
  const [open, setOpen] = useState(false)

  // Real role check: the store loads the signed-in user's profile (incl. role) from Supabase.
  useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return
      if (!data.user) {
        // not signed in -> allow only if a known admin role is already in state (none) 
        setAllowed(state.user?.role === "admin")
        setChecked(true)
        return
      }
      // Prefer role already in state; otherwise query it directly
      if (state.user?.role) {
        setAllowed(state.user.role === "admin")
        setChecked(true)
        return
      }
      const admin = await isAdmin(data.user.id)
      if (!active) return
      setAllowed(admin)
      setChecked(true)
    })
    return () => { active = false }
  }, [state.user])

  if (!checked) return null

  if (!allowed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f6faf8] px-4 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-red-50 text-red-500"><ShieldAlert className="size-8" /></span>
        <h1 className="mt-5 text-2xl font-extrabold text-neutral-900">{t(locale, "Admins only", "للمسؤولين فقط")}</h1>
        <p className="mt-2 max-w-sm text-sm text-neutral-500">{t(locale, "You need an administrator account to access this area.", "تحتاج حساب مسؤول للوصول لهذه المنطقة.")}</p>
        <Link href="/sign-in" className="mt-5 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700">{t(locale, "Sign in", "تسجيل الدخول")}</Link>
      </div>
    )
  }

  const NavList = () => (
    <nav className="flex-1 space-y-1 px-3">
      {NAV.map((item) => {
        const Icon = item.icon
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-emerald-50 text-emerald-700" : "text-neutral-600 hover:bg-neutral-50"
            )}
          >
            <Icon className={cn("size-4.5", active ? "text-emerald-600" : "text-neutral-400 group-hover:text-neutral-600")} />
            <span>{locale === "ar" ? item.ar : item.en}</span>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <div className="min-h-screen bg-[#f6faf8] lg:grid lg:grid-cols-[260px_1fr]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:border-e lg:border-neutral-100 lg:bg-white">
        <div className="flex items-center gap-2 px-6 py-6">
          <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-black text-white">A</span>
          <div>
            <p className="text-base font-extrabold leading-none text-neutral-900">{t(locale, "Admin", "الإدارة")}</p>
            <p className="text-[11px] text-neutral-400">loversdc</p>
          </div>
        </div>
        <NavList />
        <div className="border-t border-neutral-100 p-3">
          <button
            onClick={() => { if (typeof window!=="undefined") localStorage.removeItem("ldc_admin"); router.push("/") }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-500 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="size-4.5" /> {t(locale, "Exit admin", "خروج")}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-neutral-100 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-xs font-black text-white">A</span>
          <span className="font-extrabold text-neutral-900">{t(locale, "Admin", "الإدارة")}</span>
        </div>
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-neutral-600"><Menu className="size-5" /></button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 start-0 flex w-64 flex-col bg-white">
            <div className="flex items-center justify-between px-5 py-4">
              <span className="font-extrabold text-neutral-900">{t(locale, "Admin", "الإدارة")}</span>
              <button onClick={() => setOpen(false)} className="p-1 text-neutral-500"><X className="size-5" /></button>
            </div>
            <NavList />
          </div>
        </div>
      )}

      <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  )
}
