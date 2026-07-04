"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LayoutDashboard, Users, ShoppingBag, Package, Apple, Calendar,
  BarChart3, LogOut, ShieldAlert, Menu, X, ChevronLeft, Home, ClipboardList,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"
import { useApp } from "@/lib/store"
import { createClient } from "@/lib/supabase/client"
import { isAdmin } from "@/lib/supabase/db"

type NavItem = { href: string; en: string; ar: string; icon: typeof Home }
const NAV_GROUPS: { titleEn: string; titleAr: string; items: NavItem[] }[] = [
  {
    titleEn: "Main", titleAr: "الرئيسي",
    items: [
      { href: "/admin", en: "Overview", ar: "نظرة عامة", icon: LayoutDashboard },
    ],
  },
  {
    titleEn: "Management", titleAr: "الإدارة",
    items: [
      { href: "/admin/clients", en: "Clients", ar: "العملاء", icon: Users },
      { href: "/admin/orders", en: "Orders", ar: "الطلبات", icon: ShoppingBag },
      { href: "/admin/products", en: "Products", ar: "المنتجات", icon: Package },
      { href: "/admin/plans", en: "Meals & Plans", ar: "الوجبات والخطط", icon: Apple },
      { href: "/admin/sessions", en: "Sessions", ar: "الجلسات", icon: Calendar },
    ],
  },
  {
    titleEn: "Insights", titleAr: "التحليل",
    items: [
      { href: "/admin/analytics", en: "Analytics", ar: "التحليلات", icon: BarChart3 },
      { href: "/admin/audit", en: "Audit Log", ar: "سجل التدقيق", icon: ClipboardList },
    ],
  },
]
const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items)

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { locale } = useLocale()
  const { state } = useApp()
  const [checked, setChecked] = useState(false)
  const [allowed, setAllowed] = useState(false)
  const [open, setOpen] = useState(false)

  // Real role check (Supabase profile.role)
  useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return
      if (!data.user) { setAllowed(state.user?.role === "admin"); setChecked(true); return }
      if (state.user?.role) { setAllowed(state.user.role === "admin"); setChecked(true); return }
      const admin = await isAdmin(data.user.id)
      if (!active) return
      setAllowed(admin); setChecked(true)
    }).catch(() => {
      // Network/auth error — finish the check so we don't hang on a blank screen.
      if (active) { setAllowed(state.user?.role === "admin"); setChecked(true) }
    })
    return () => { active = false }
  }, [state.user])

  // close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // active matcher: exact for /admin, prefix for the rest (so detail pages stay highlighted)
  const isActive = (href: string) => href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)
  const currentItem = [...ALL_ITEMS].sort((a, b) => b.href.length - a.href.length).find((i) => isActive(i.href))

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
    <nav className="flex-1 space-y-5 px-3 py-2">
      {NAV_GROUPS.map((group) => (
        <div key={group.titleEn}>
          <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-300">
            {locale === "ar" ? group.titleAr : group.titleEn}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    active ? "bg-emerald-50 text-emerald-700" : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  )}
                >
                  {/* active indicator bar */}
                  <span className={cn(
                    "absolute inset-y-1.5 start-0 w-1 rounded-full bg-emerald-500 transition-all duration-200",
                    active ? "opacity-100" : "opacity-0"
                  )} />
                  <span className={cn(
                    "flex size-8 items-center justify-center rounded-lg transition-colors",
                    active ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-400 group-hover:bg-neutral-200 group-hover:text-neutral-600"
                  )}>
                    <Icon className="size-4" />
                  </span>
                  <span className="flex-1">{locale === "ar" ? item.ar : item.en}</span>
                  {active && <ChevronLeft className="size-4 text-emerald-400 rtl:rotate-0 rotate-180" />}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-[#f6faf8] lg:grid lg:grid-cols-[264px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen lg:flex lg:flex-col lg:border-e lg:border-neutral-100 lg:bg-white">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <Image src="/ldc-logo.png" alt="Lover Diet Center" width={40} height={40} className="size-10 rounded-full object-cover" />
          <div>
            <p className="text-base font-extrabold leading-none text-neutral-900">{t(locale, "Admin", "الإدارة")}</p>
            <p className="text-[11px] font-semibold text-emerald-600">loversdc</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto"><NavList /></div>
        <div className="border-t border-neutral-100 p-3">
          <Link href="/" className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900">
            <span className="flex size-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400"><Home className="size-4" /></span>
            {t(locale, "View site", "عرض الموقع")}
          </Link>
          <button
            onClick={() => { if (typeof window !== "undefined") localStorage.removeItem("ldc_admin"); router.push("/") }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-500 hover:bg-red-50 hover:text-red-600"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400"><LogOut className="size-4" /></span>
            {t(locale, "Exit admin", "خروج")}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-100 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <Image src="/ldc-logo.png" alt="Lover Diet Center" width={32} height={32} className="size-8 rounded-full object-cover" />
          <span className="font-extrabold text-neutral-900">{currentItem ? (locale === "ar" ? currentItem.ar : currentItem.en) : t(locale, "Admin", "الإدارة")}</span>
        </div>
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-50"><Menu className="size-5" /></button>
      </div>

      {/* Mobile drawer */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")}>
        <div className={cn("absolute inset-0 bg-black/30 transition-opacity duration-300", open ? "opacity-100" : "opacity-0")} onClick={() => setOpen(false)} />
        <div className={cn(
          "absolute inset-y-0 start-0 flex w-72 flex-col bg-white shadow-xl transition-transform duration-300",
          open ? "translate-x-0" : "rtl:translate-x-full ltr:-translate-x-full"
        )}>
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2">
              <Image src="/ldc-logo.png" alt="" width={30} height={30} className="size-7 rounded-full object-cover" />
              <span className="font-extrabold text-neutral-900">{t(locale, "Admin", "الإدارة")}</span>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-50"><X className="size-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto"><NavList /></div>
        </div>
      </div>

      <main className="px-4 py-6 lg:px-8 lg:py-8">
        {/* Breadcrumb */}
        <div className="mb-5 flex items-center gap-1.5 text-xs font-medium text-neutral-400">
          <Link href="/admin" className="hover:text-emerald-600">{t(locale, "Admin", "الإدارة")}</Link>
          {currentItem && currentItem.href !== "/admin" && (
            <>
              <ChevronLeft className="size-3.5 rtl:rotate-0 rotate-180" />
              <span className="text-neutral-700">{locale === "ar" ? currentItem.ar : currentItem.en}</span>
            </>
          )}
        </div>
        <div key={pathname} className="animate-fade-in">{children}</div>
      </main>
    </div>
  )
}
