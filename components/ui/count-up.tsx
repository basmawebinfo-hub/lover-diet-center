"use client"

import { useEffect, useRef, useState } from "react"

/**
 * CountUp — animates a number from 0 to its target when it scrolls into view.
 * Accepts formatted strings like "3,000+", "150+", "96%" and preserves the
 * prefix/suffix while animating only the numeric part.
 * Respects prefers-reduced-motion by jumping straight to the final value.
 */
export function CountUp({
  value,
  duration = 1600,
  className,
}: {
  value: string
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const [display, setDisplay] = useState(value)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Parse "3,000+" → target 3000, suffix "+", grouping true
    const match = value.match(/^([^\d]*)([\d,.]+)(.*)$/)
    if (!match) return
    const prefix = match[1] ?? ""
    const numeric = Number.parseFloat(match[2].replace(/,/g, ""))
    const suffix = match[3] ?? ""
    const useGrouping = match[2].includes(",")
    if (Number.isNaN(numeric)) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) {
      setDisplay(value)
      return
    }

    // Start hidden at 0 until visible
    setDisplay(`${prefix}0${suffix}`)

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || started.current) return
          started.current = true
          obs.unobserve(e.target)

          const t0 = performance.now()
          const tick = (now: number) => {
            const p = Math.min((now - t0) / duration, 1)
            // ease-out cubic
            const eased = 1 - Math.pow(1 - p, 3)
            const current = Math.round(numeric * eased)
            const formatted = useGrouping
              ? current.toLocaleString("en-US")
              : String(current)
            setDisplay(`${prefix}${formatted}${suffix}`)
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        })
      },
      { threshold: 0.4 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [value, duration])

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  )
}
