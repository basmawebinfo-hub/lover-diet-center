'use client'

import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'

export function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden bg-black pt-28 pb-16 sm:pt-40 sm:pb-24"
    >
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-10" aria-hidden="true"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
      />
      {/* Ambient glow blobs */}
      <div className="absolute -top-40 -start-20 size-[30rem] rounded-full bg-pink-600/10 blur-3xl" aria-hidden="true" />
      <div className="absolute top-1/2 -end-20 size-[25rem] rounded-full bg-pink-600/8 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Copy */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-600/10 px-4 py-1.5 text-sm font-medium text-pink-400">
              <Star className="size-4 fill-pink-400 text-pink-400" />
              #1 Nutrition Center in UAE
            </span>

            <h1 className="mt-6 text-pretty text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Transform Your{' '}
              <span className="italic text-pink-500">
                Health & Body
              </span>{' '}
              With Science-Based Nutrition
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/60 sm:text-lg">
              Personalized meal plans, expert consultations, and chef-prepared healthy food delivered to your door. Backed by 150+ certified nutritionists.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
              <Link
                href="/sign-in?redirect=/onboarding"
                className="inline-flex items-center gap-2 rounded-full bg-pink-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-pink-600/25 transition-all hover:bg-pink-700 hover:shadow-pink-700/30 sm:w-auto"
              >
                Get Started
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
              <Link
                href="#services"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10 sm:w-auto"
              >
                Explore Services
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-pink-500">25K+</div>
                <p className="mt-0.5 text-xs text-white/50">Happy Clients</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-pink-500">96%</div>
                <p className="mt-0.5 text-xs text-white/50">Success Rate</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-pink-500">150+</div>
                <p className="mt-0.5 text-xs text-white/50">Certified Experts</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center backdrop-blur-sm">
                <div className="text-2xl font-bold text-pink-500">50K+</div>
                <p className="mt-0.5 text-xs text-white/50">Meals Delivered</p>
              </div>
            </div>
          </div>

          {/* Visual — 3 quick value pillars */}
          <div className="flex flex-col gap-4">
            {[
              {
                title: 'Nutrition Consultations',
                desc: 'One-on-one sessions with certified experts — personalized plans for your goals.',
                icon: '🩺',
                href: '/sign-in?redirect=/onboarding',
              },
              {
                title: 'Healthy Meals',
                desc: 'Chef-prepared, macro-balanced meals delivered to your door. Fresh & tasty.',
                icon: '🥗',
                href: '/sign-in?redirect=/healthy-meals',
              },
              {
                title: 'Healthy Snacks',
                desc: 'Protein bars, dried fruits, nuts & organic treats — guilt-free snacking.',
                icon: '🍪',
                href: '/sign-in?redirect=/healthy-snacks',
              },
            ].map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 text-start backdrop-blur-sm transition-all hover:border-pink-500/30 hover:bg-white/10"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl" role="img" aria-hidden="true">{card.icon}</span>
                  <div>
                    <h3 className="text-base font-semibold text-white">{card.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-white/50">{card.desc}</p>
                  </div>
                  <ArrowRight className="ms-auto mt-1 size-4 shrink-0 text-white/30 transition-all group-hover:translate-x-1 group-hover:text-pink-500 rtl:rotate-180" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
