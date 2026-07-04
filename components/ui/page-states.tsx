"use client"

import type { ReactNode } from "react"
import { AlertTriangle } from "lucide-react"

// ============================================================================
// Shared page-state primitives (Phase 4 · L-08)
//
// Every dashboard + admin page has hand-rolled loading / error / empty states.
// These three primitives standardise the visual language, cut ~800 lines of
// duplicated JSX across the app, and give screen readers a consistent shape.
//
// Usage:
//   if (loading) return <PageLoading rows={6} />
//   if (error)   return <PageError message={error} onRetry={load} />
//   if (empty)   return <PageEmpty title="No entries yet" hint="..." />
//
// The old inline versions still work and don't need to be migrated in one go
// — the primitives are additive.
// ============================================================================

export function PageLoading({
  rows = 4,
  className = "",
}: {
  /** Number of skeleton bars to render. Defaults to 4. */
  rows?: number
  className?: string
}) {
  return (
    <div className={`rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm ${className}`} aria-busy="true" aria-live="polite">
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-neutral-100" />
        ))}
      </div>
      <span className="sr-only">Loading</span>
    </div>
  )
}

export function PageError({
  title = "Something went wrong",
  message,
  retryLabel = "Try again",
  onRetry,
}: {
  title?: string
  message: string
  retryLabel?: string
  onRetry?: () => void
}) {
  return (
    <div className="rounded-3xl border border-rose-100 bg-rose-50 p-6 text-center" role="alert">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <AlertTriangle className="size-6" />
      </div>
      <h2 className="text-lg font-bold text-rose-900">{title}</h2>
      <p className="mt-1 text-sm text-rose-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
        >
          {retryLabel}
        </button>
      )}
    </div>
  )
}

export function PageEmpty({
  icon,
  title,
  hint,
  action,
}: {
  /** Optional icon element. If omitted, no icon is shown. */
  icon?: ReactNode
  title: string
  hint?: string
  /** Optional call-to-action rendered below the hint. */
  action?: ReactNode
}) {
  return (
    <div className="rounded-3xl border border-neutral-100 bg-white p-10 text-center shadow-sm">
      {icon && (
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
          {icon}
        </div>
      )}
      <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
      {hint && <p className="mt-1 text-sm text-neutral-500">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
