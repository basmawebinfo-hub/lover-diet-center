"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

/**
 * Reveal — animates children into view on scroll using IntersectionObserver.
 * Respects prefers-reduced-motion (CSS handles that). Usage:
 *   <Reveal><Section/></Reveal>
 *   <Reveal delay={150} variant="left">...</Reveal>
 *   <Reveal variant="stagger"><Card/><Card/><Card/></Reveal>
 */
const VARIANT_CLASS = {
  up: "reveal",
  left: "reveal-left",
  right: "reveal-right",
  scale: "reveal-scale",
  stagger: "reveal-stagger",
} as const

export function Reveal({
  children,
  className,
  delay = 0,
  variant = "up",
  as: Tag = "div",
  ...rest
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  variant?: keyof typeof VARIANT_CLASS
  as?: keyof React.JSX.IntrinsicElements
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true)
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const Comp = Tag as React.ElementType
  return (
    <Comp
      ref={ref}
      className={cn(VARIANT_CLASS[variant], visible && "is-visible", className)}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      {...rest}
    >
      {children}
    </Comp>
  )
}
