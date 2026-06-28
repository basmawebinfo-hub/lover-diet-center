"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Bell, Scale, Calendar, ClipboardList, Truck, CheckCircle2 } from "lucide-react"
import { useApp } from "@/lib/store"
import { useLocale, t } from "@/lib/locale"

type Note = { id: string; icon: React.ReactNode; tone: string; text: string; href: string; cta: string }

/** Real, data-driven notifications for the client dashboard. */
export function ClientNotifications() {
  const { locale } = useLocale()
  const { state } = useApp()

  const notes = useMemo<Note[]>(() => {
    const out: Note[] = []
    const today = new Date().toISOString().slice(0, 10)

    // 1) Weight not logged today
    const loggedToday = state.weightLogs.some((w) => w.date === today)
    if (!loggedToday) {
      out.push({
        id: "weight", tone: "amber", icon: <Scale className="size-4" />,
        text: t(locale, "You haven't logged your weight today.", "لم تسجّل وزنك اليوم."),
        href: "/dashboard/weight", cta: t(locale, "Log now", "سجّل الآن"),
      })
    }

    // 2) Upcoming session within 3 days
    const soon = state.sessions.find((s) => {
      if (s.status !== "scheduled") return false
      const d = new Date(s.date).getTime()
      const diff = (d - Date.now()) / (1000 * 3600 * 24)
      return diff >= -0.5 && diff <= 3
    })
    if (soon) {
      out.push({
        id: "session", tone: "emerald", icon: <Calendar className="size-4" />,
        text: t(locale, `Upcoming session on ${soon.date}${soon.time ? " at " + soon.time : ""}.`, `لديك جلسة قادمة يوم ${soon.date}${soon.time ? " الساعة " + soon.time : ""}.`),
        href: "/dashboard/sessions", cta: t(locale, "View", "عرض"),
      })
    }

    // 3) New plan available
    if (state.doctorPlan) {
      out.push({
        id: "plan", tone: "violet", icon: <ClipboardList className="size-4" />,
        text: t(locale, "Your personalized plan is ready.", "خطتك المخصصة جاهزة."),
        href: "/dashboard/plan", cta: t(locale, "Open plan", "افتح الخطة"),
      })
    }

    // 4) Order in transit
    const inTransit = state.orders.find((o) => o.status === "shipped" || o.status === "processing")
    if (inTransit) {
      out.push({
        id: "order", tone: "sky", icon: <Truck className="size-4" />,
        text: t(locale, `Order #${inTransit.id.slice(-4)} is on the way.`, `طلبك #${inTransit.id.slice(-4)} في الطريق.`),
        href: "/dashboard/orders", cta: t(locale, "Track", "تتبّع"),
      })
    }

    return out
  }, [state.weightLogs, state.sessions, state.doctorPlan, state.orders, locale])

  const toneCls: Record<string, { wrap: string; ic: string; cta: string }> = {
    amber:   { wrap: "border-amber-200 bg-amber-50",     ic: "bg-amber-100 text-amber-600",     cta: "bg-amber-500 hover:bg-amber-600" },
    emerald: { wrap: "border-emerald-200 bg-emerald-50", ic: "bg-emerald-100 text-emerald-600", cta: "bg-emerald-600 hover:bg-emerald-700" },
    violet:  { wrap: "border-violet-200 bg-violet-50",   ic: "bg-violet-100 text-violet-600",   cta: "bg-violet-500 hover:bg-violet-600" },
    sky:     { wrap: "border-sky-200 bg-sky-50",         ic: "bg-sky-100 text-sky-600",         cta: "bg-sky-500 hover:bg-sky-600" },
  }

  if (notes.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="size-4" /></span>
        <p className="text-sm font-medium text-emerald-800">{t(locale, "You're all caught up!", "كل شيء على ما يرام!")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {notes.map((n) => {
        const c = toneCls[n.tone]
        return (
          <div key={n.id} className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${c.wrap}`}>
            <div className="flex items-center gap-3">
              <span className={`flex size-9 items-center justify-center rounded-full ${c.ic}`}>{n.icon}</span>
              <p className="text-sm font-medium text-neutral-800">{n.text}</p>
            </div>
            <Link href={n.href} className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold text-white ${c.cta}`}>{n.cta}</Link>
          </div>
        )
      })}
    </div>
  )
}
