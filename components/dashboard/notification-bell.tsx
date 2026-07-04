"use client"

import Link from "next/link"
import { Bell } from "lucide-react"
import { useApp } from "@/lib/store"
import { cn } from "@/lib/utils"

/**
 * Small bell button used by the dashboard shell. Reads unread count from the
 * store (populated by refreshNotifications) and links to /dashboard/notifications.
 *
 * The bell only shows a badge when there is at least one unread notification.
 * Rendering an empty badge would create constant visual noise on a fresh
 * account and would look broken when the server-side unread count is 0.
 */
export function NotificationBell({ className }: { className?: string }) {
  const { state } = useApp()
  const unread = state.notifications.reduce((n, x) => (x.readAt ? n : n + 1), 0)
  return (
    <Link
      href="/dashboard/notifications"
      aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
      className={cn(
        "relative inline-flex size-9 items-center justify-center rounded-xl text-neutral-500 transition hover:bg-neutral-100 hover:text-lime-700",
        className,
      )}
    >
      <Bell className="size-4" />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-4 text-white shadow rtl:-left-0.5 rtl:right-auto">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  )
}
