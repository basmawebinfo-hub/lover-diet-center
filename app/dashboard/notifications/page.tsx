"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Bell, CheckCheck, RefreshCw, Loader2, AlertCircle, Package, ClipboardList, Calendar, CreditCard, Activity, Info, Check,
} from "lucide-react"
import { DashboardShell, MobileNav } from "@/components/dashboard/dashboard-shell"
import { useApp } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"
import { useToast } from "@/components/ui/toast"
import type { NotificationKind, UserNotification } from "@/lib/types"

const KIND_META: Record<NotificationKind, { icon: React.ReactNode; toneCls: string }> = {
  order:    { icon: <Package className="size-4" />,       toneCls: "bg-sky-50 text-sky-700" },
  plan:     { icon: <ClipboardList className="size-4" />, toneCls: "bg-violet-50 text-violet-700" },
  session:  { icon: <Calendar className="size-4" />,      toneCls: "bg-emerald-50 text-emerald-700" },
  payment:  { icon: <CreditCard className="size-4" />,    toneCls: "bg-amber-50 text-amber-700" },
  reminder: { icon: <Activity className="size-4" />,      toneCls: "bg-lime-50 text-lime-700" },
  system:   { icon: <Info className="size-4" />,          toneCls: "bg-neutral-100 text-neutral-700" },
}

function timeAgo(iso: string, locale: "en" | "ar"): string {
  const t0 = new Date(iso).getTime()
  const diff = Date.now() - t0
  const mins = Math.round(diff / 60000)
  if (mins < 1) return locale === "ar" ? "الآن" : "just now"
  if (mins < 60) return locale === "ar" ? `منذ ${mins} د` : `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return locale === "ar" ? `منذ ${hrs} س` : `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 30) return locale === "ar" ? `منذ ${days} ي` : `${days}d ago`
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-GB", { day: "numeric", month: "short", year: "numeric" })
}

type Filter = "all" | "unread"

export default function NotificationsPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const { state, refreshNotifications, markNotificationRead, markAllNotificationsRead } = useApp()
  const { notify } = useToast()
  const user = state.user

  const [initialLoad, setInitialLoad] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("all")
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    if (state.authChecked && !user) router.replace("/onboarding")
  }, [state.authChecked, user, router])

  const refresh = useCallback(async (isInitial: boolean) => {
    if (!user) return
    if (isInitial) setInitialLoad(true)
    else setRefreshing(true)
    setError(null)
    try {
      await refreshNotifications()
    } catch {
      setError(t(locale, "Could not load your notifications. Please try again.", "تعذّر تحميل الإشعارات. يرجى المحاولة مرة أخرى."))
    } finally {
      setInitialLoad(false)
      setRefreshing(false)
    }
  }, [user, refreshNotifications, locale])

  useEffect(() => {
    if (state.authChecked && user) refresh(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.authChecked, user?.id])

  const notifications = state.notifications
  const unreadCount = notifications.reduce((n, x) => (x.readAt ? n : n + 1), 0)
  const shown = useMemo(
    () => (filter === "unread" ? notifications.filter((n) => !n.readAt) : notifications),
    [notifications, filter],
  )

  async function onMarkAll() {
    if (unreadCount === 0) return
    setMarkingAll(true)
    await markAllNotificationsRead()
    setMarkingAll(false)
    notify(t(locale, "All marked as read", "تم تعليم الكل كمقروء"), "success")
  }

  async function onOpen(n: UserNotification) {
    // Mark as read (optimistic), then follow the href if present.
    if (!n.readAt) await markNotificationRead(n.id)
    if (n.href) router.push(n.href)
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
  if (initialLoad && notifications.length === 0) {
    return (
      <DashboardShell>
        <MobileNav />
        <div className="mx-auto max-w-3xl space-y-6 pb-28 lg:pb-0">
          <header>
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t(locale, "Notifications", "الإشعارات")}</h1>
            <p className="mt-1 text-sm text-neutral-500">{t(locale, "Loading your latest updates...", "جارٍ تحميل آخر التحديثات...")}</p>
          </header>
          <SkeletonList />
        </div>
      </DashboardShell>
    )
  }

  // ==== Error ====
  if (error && notifications.length === 0) {
    return (
      <DashboardShell>
        <MobileNav />
        <div className="mx-auto max-w-2xl pb-28 lg:pb-0">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t(locale, "Notifications", "الإشعارات")}</h1>
          </header>
          <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle className="size-6" />
            </div>
            <h2 className="text-lg font-bold text-red-700">{t(locale, "Could not load your notifications", "تعذّر تحميل الإشعارات")}</h2>
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
      <div className="mx-auto max-w-3xl space-y-6 pb-28 lg:pb-0">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">{t(locale, "Notifications", "الإشعارات")}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {unreadCount > 0
                ? t(locale, `${unreadCount} unread of ${notifications.length}`, `${unreadCount} غير مقروء من ${notifications.length}`)
                : t(locale, "You're all caught up.", "كل شيء على ما يرام.")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refresh(false)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-600 hover:border-lime-300 hover:text-lime-700 disabled:opacity-60"
            >
              {refreshing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
              {refreshing ? t(locale, "Refreshing...", "جارٍ التحديث...") : t(locale, "Refresh", "تحديث")}
            </button>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAll}
                disabled={markingAll}
                className="inline-flex items-center gap-1.5 rounded-xl bg-lime-700 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-lime-800 disabled:opacity-60"
              >
                {markingAll ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCheck className="size-3.5" />}
                {markingAll ? t(locale, "Marking...", "جارٍ التعليم...") : t(locale, "Mark all as read", "تعليم الكل كمقروء")}
              </button>
            )}
          </div>
        </header>

        {/* Filter chips */}
        {notifications.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label={t(locale, "All", "الكل")} count={notifications.length} />
            <FilterChip active={filter === "unread"} onClick={() => setFilter("unread")} label={t(locale, "Unread", "غير مقروء")} count={unreadCount} />
          </div>
        )}

        {/* Empty (no notifications at all) */}
        {notifications.length === 0 ? (
          <EmptyBox locale={locale} />
        ) : shown.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-neutral-200 py-10 text-center">
            <p className="text-sm font-semibold text-neutral-500">{t(locale, "Nothing unread.", "لا يوجد إشعار غير مقروء.")}</p>
            <button onClick={() => setFilter("all")} className="mt-2 text-xs font-semibold text-lime-700 hover:underline">
              {t(locale, "Show all", "عرض الكل")}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {shown.map((n) => (
              <NotificationRow key={n.id} note={n} locale={locale} onOpen={() => onOpen(n)} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

// ============================================================================
// NotificationRow
// ============================================================================
function NotificationRow({
  note, locale, onOpen,
}: {
  note: UserNotification
  locale: "en" | "ar"
  onOpen: () => void
}) {
  const meta = KIND_META[note.kind] ?? KIND_META.system
  const isUnread = !note.readAt
  const title = locale === "ar" ? note.titleAr || note.titleEn : note.titleEn || note.titleAr
  const body = locale === "ar" ? note.bodyAr || note.bodyEn : note.bodyEn || note.bodyAr
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border p-4 text-start transition hover:border-lime-200 hover:shadow-sm",
        isUnread ? "border-lime-200 bg-white" : "border-neutral-100 bg-white/70",
      )}
    >
      <span className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl", meta.toneCls)}>
        {meta.icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={cn("text-sm", isUnread ? "font-bold text-neutral-900" : "font-semibold text-neutral-700")}>
            {title || `(${note.kind})`}
          </p>
          {isUnread && <span className="size-1.5 rounded-full bg-lime-500" aria-label="unread" />}
        </div>
        {body && (
          <p className={cn("mt-0.5 line-clamp-2 text-xs", isUnread ? "text-neutral-600" : "text-neutral-500")}>
            {body}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-400">
          <span>{timeAgo(note.createdAt, locale)}</span>
          {note.href && (
            <span className="inline-flex items-center gap-0.5 font-semibold text-lime-700">
              · {t(locale, "Open", "افتح")} →
            </span>
          )}
        </div>
      </div>
      {!isUnread && <Check className="size-3.5 shrink-0 text-neutral-300" />}
    </button>
  )
}

// ============================================================================
// Presentational bits
// ============================================================================
function FilterChip({
  active, onClick, label, count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
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
      {label}
      <span className={cn("rounded-full px-1.5 text-[10px] font-bold", active ? "bg-white/25 text-white" : "bg-neutral-100 text-neutral-500")}>{count}</span>
    </button>
  )
}

function EmptyBox({ locale }: { locale: "en" | "ar" }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-neutral-200 bg-white p-12 text-center">
      <span className="mb-4 flex size-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
        <Bell className="size-7" />
      </span>
      <h2 className="text-lg font-bold text-neutral-900">{t(locale, "No notifications yet", "لا توجد إشعارات بعد")}</h2>
      <p className="mt-1 max-w-md text-sm text-neutral-500">
        {t(
          locale,
          "You'll see plan updates, session reminders, order status changes, and messages from your nutritionist here.",
          "ستظهر هنا تحديثات خطتك وتذكيرات الجلسات وحالة الطلبات والرسائل من أخصائي التغذية.",
        )}
      </p>
      <Link
        href="/dashboard"
        className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
      >
        {t(locale, "Back to dashboard", "العودة إلى لوحة القيادة")}
      </Link>
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="space-y-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl bg-neutral-100" />
      ))}
    </div>
  )
}
