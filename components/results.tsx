'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Star, Users, TrendingUp } from 'lucide-react'

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setInView(true),
      { threshold: 0.4 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, inView }
}

function useCountUp(target: number, start: boolean, duration = 1800) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(eased * target)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, start, duration])
  return value
}

export function Results() {
  const { ref, inView } = useInView<HTMLDivElement>()
  const members = useCountUp(3565, inView)

  return (
    <section className="relative overflow-hidden bg-black py-20 sm:py-28">
      {/* Mid-page nav bar */}
      <div className="mx-auto mb-12 max-w-5xl px-4">
        <nav className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl">
          <span className="flex items-center gap-2 text-lg font-bold text-white">
            LoverDiet
          </span>
          <div className="hidden items-center gap-1 sm:flex">
            {['Home', 'Diet Plans', 'Meals', 'Services', 'About'].map((item) => (
              <span key={item} className="rounded-full px-3 py-2 text-sm text-white/50 hover:text-white">
                {item}
              </span>
            ))}
          </div>
          <Link
            href="/sign-in?redirect=/onboarding"
            className="rounded-full bg-pink-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-pink-700"
          >
            Get Started
          </Link>
        </nav>
      </div>

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Real{' '}
            <span className="text-pink-500">Results</span>
          </h2>
          <p className="mt-4 text-pretty text-white/50">
            Measurable outcomes that speak louder than promises.
          </p>
        </div>

        <div ref={ref} className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Circle progress 1 */}
          <div className="flex flex-col items-center rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="relative size-32">
              <svg className="size-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="oklch(0.20 0.01 250)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="#ff4d6d" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="326.7"
                  strokeDashoffset={inView ? 13.1 : 326.7}
                  className="transition-all duration-[1800ms] ease-out"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">96%</span>
            </div>
            <p className="mt-4 text-sm text-white/50">Client Satisfaction</p>
          </div>

          {/* Circle progress 2 */}
          <div className="flex flex-col items-center rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <div className="relative size-32">
              <svg className="size-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="oklch(0.20 0.01 250)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="#ff4d6d" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="326.7"
                  strokeDashoffset={inView ? 26.1 : 326.7}
                  className="transition-all duration-[1800ms] ease-out"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">92%</span>
            </div>
            <p className="mt-4 text-sm text-white/50">Goal Achievement</p>
          </div>

          {/* Members count */}
          <div className="flex flex-col justify-center rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <span className="flex size-10 items-center justify-center rounded-xl bg-pink-600/20 text-pink-500">
              <Users className="size-5" />
            </span>
            <div className="mt-4 text-4xl font-bold text-pink-500">
              {Math.round(members).toLocaleString()}+
            </div>
            <p className="mt-1 text-sm text-white/50">Active Members</p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-pink-600 transition-all duration-1000"
                style={{ width: inView ? '85%' : '0%' }}
              />
            </div>
          </div>

          {/* Rating */}
          <div className="flex flex-col justify-center rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            <span className="flex size-10 items-center justify-center rounded-xl bg-pink-600/20 text-pink-500">
              <TrendingUp className="size-5" />
            </span>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">4.9</span>
              <span className="text-lg text-white/40">/5</span>
            </div>
            <p className="mt-1 text-sm text-white/50">Average Rating</p>
            <div className="mt-5 flex gap-1 text-pink-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-5 fill-current" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

