"use client"

import { cn } from "@/lib/utils"

/** Lightweight shimmer skeleton block for loading states. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-neutral-200/70",
        className
      )}
    />
  )
}

/** Full dashboard-card skeleton used while data hydrates. */
export function CardSkeleton() {
  return (
    <div className="rounded-3xl border border-neutral-100 bg-white p-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-9 w-40" />
      <Skeleton className="mt-3 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-2/3" />
    </div>
  )
}
