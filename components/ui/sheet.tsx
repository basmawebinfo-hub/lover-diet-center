"use client"

import { useCallback, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocale, t } from "@/lib/locale"

/**
 * Bottom sheet for mobile, centred dialog from `sm` up.
 *
 * Replaces the browser `confirm()` calls the dashboard used for destructive
 * actions. A native dialog is styled by the OS, ignores the app's language
 * direction, and — inside a wrapped Android app — makes the product look like
 * a browser rather than an app.
 *
 * Keeps the accessibility contract a dialog needs: focus moves in on open and
 * returns to the trigger on close, Escape closes, focus is trapped while open,
 * and the page behind cannot scroll.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}) {
  const { locale } = useLocale()
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreFocusTo = useRef<HTMLElement | null>(null)

  // Remember what had focus so it can be handed back on close.
  useEffect(() => {
    if (open) restoreFocusTo.current = document.activeElement as HTMLElement | null
  }, [open])

  const close = useCallback(() => {
    onClose()
    restoreFocusTo.current?.focus?.()
  }, [onClose])

  useEffect(() => {
    if (!open) return

    const panel = panelRef.current
    panel?.focus()

    // Lock the page behind the sheet. Without this, scrolling on the overlay
    // scrolls the page underneath on touch.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        close()
        return
      }
      if (e.key !== "Tab" || !panel) return

      // Trap Tab inside the panel.
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, close])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label={t(locale, "Close", "إغلاق")}
        onClick={close}
        className="absolute inset-0 size-full cursor-default bg-neutral-900/40 backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "relative w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-2xl outline-none",
          "sm:rounded-3xl",
          // Never taller than the viewport, and scrollable inside if it is.
          "max-h-[85vh] overflow-y-auto",
          // Clear the phone's home indicator / gesture bar.
          "pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-5",
          className,
        )}
      >
        {/* Grab handle — the affordance people expect on a bottom sheet. */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-200 sm:hidden" />

        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
            {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={close}
            aria-label={t(locale, "Close", "إغلاق")}
            className="-me-1 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}

/**
 * Sheet preset for "are you sure?" — the shape every `confirm()` in the
 * dashboard was standing in for.
 */
export function ConfirmSheet({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  tone = "danger",
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel: string
  tone?: "danger" | "default"
}) {
  const { locale } = useLocale()

  return (
    <Sheet open={open} onClose={onClose} title={title} description={description}>
      <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-5 py-3 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 sm:py-2.5"
        >
          {t(locale, "Cancel", "إلغاء")}
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm()
            onClose()
          }}
          className={cn(
            "rounded-xl px-5 py-3 text-sm font-bold text-white transition-colors focus:outline-none focus-visible:ring-2 sm:py-2.5",
            tone === "danger"
              ? "bg-red-600 hover:bg-red-700 focus-visible:ring-red-300"
              : "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-300",
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </Sheet>
  )
}
