import { cn } from "@/lib/utils"

/**
 * Shared dashboard primitives.
 *
 * Every dashboard page currently hand-rolls its own cards, headings and empty
 * states, so fourteen screens each look slightly different — different radii,
 * different padding, different heading sizes. That inconsistency is most of
 * what reads as "not professional"; it is not a colour or a font problem.
 *
 * These are deliberately plain: no variants nobody uses, no config objects.
 * They exist so a page can be written without re-deciding what a card is.
 */

/* ---------------------------------------------------------------- Card --- */

export function Card({
  className,
  children,
  padded = true,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { padded?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-neutral-100 bg-white shadow-sm",
        padded && "p-5",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  action,
  className,
}: {
  title: React.ReactNode
  /** Usually a "View all" link or a small button. */
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("mb-4 flex items-center justify-between gap-3", className)}>
      <h2 className="text-sm font-bold text-neutral-900">{title}</h2>
      {action}
    </div>
  )
}

/* ---------------------------------------------------------- PageHeader --- */

export function PageHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}

/* ------------------------------------------------------------ StatTile --- */

const TONES = {
  emerald: "bg-emerald-50 text-emerald-600",
  violet: "bg-violet-50 text-violet-600",
  amber: "bg-amber-50 text-amber-600",
  sky: "bg-sky-50 text-sky-600",
  neutral: "bg-neutral-100 text-neutral-500",
} as const

export type StatTone = keyof typeof TONES

export function StatTile({
  icon,
  label,
  value,
  hint,
  tone = "neutral",
  className,
}: {
  icon?: React.ReactNode
  label: string
  value: React.ReactNode
  /** Secondary line — progress, delta, target. */
  hint?: React.ReactNode
  tone?: StatTone
  className?: string
}) {
  return (
    <div className={cn("rounded-3xl border border-neutral-100 bg-white p-4 shadow-sm", className)}>
      <div className="flex items-center gap-2.5">
        {icon && (
          <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-2xl", TONES[tone])}>
            {icon}
          </span>
        )}
        <p className="min-w-0 truncate text-xs font-semibold text-neutral-500">{label}</p>
      </div>
      {/* tabular-nums keeps these from jittering as values change, and keeps a
          row of tiles optically aligned. */}
      <p className="mt-3 text-2xl font-extrabold tabular-nums tracking-tight text-neutral-900">
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-neutral-400">{hint}</p>}
    </div>
  )
}

/* ----------------------------------------------------------- EmptyState -- */

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-200 bg-white px-6 py-12 text-center",
        className,
      )}
    >
      {icon && (
        <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          {icon}
        </span>
      )}
      <p className="font-bold text-neutral-900">{title}</p>
      {/* An empty state should say what to do next, not just that there is
          nothing here — most of these screens are empty because the client
          has not started yet, not because something failed. */}
      {description && <p className="mt-1.5 max-w-sm text-sm text-neutral-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* -------------------------------------------------------------- Skeleton -- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-neutral-100", className)} />
}
