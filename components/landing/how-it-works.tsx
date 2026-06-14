import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    title: 'Tell us your goal',
    titleAr: 'أخبرنا بهدفك',
    desc: 'Complete a quick 3-minute assessment — your weight, height, lifestyle, and what you want to achieve. No guesswork.',
    color: 'teal',
  },
  {
    number: '02',
    title: 'Get your personalized plan',
    titleAr: 'احصل على خطتك',
    desc: 'A certified nutritionist reviews your profile and builds a plan around your real life — not a generic template.',
    color: 'orange',
  },
  {
    number: '03',
    title: 'Track & transform',
    titleAr: 'تابع وتحول',
    desc: 'Log your weight daily, watch your body avatar change, and get weekly check-ins from your nutritionist.',
    color: 'teal',
  },
]

export function HowItWorks() {
  return (
    <section className="bg-neutral-950 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-400">
            How It Works
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            From sign-up to results{' '}
            <span className="text-teal-400">in 3 steps</span>
          </h2>
          <p className="mt-4 text-pretty text-neutral-400">
            No complicated onboarding. No waiting weeks to start. You get a real plan within 24 hours.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className="group relative flex flex-col rounded-3xl border border-white/8 bg-white/4 p-8 transition-all hover:border-teal-500/30 hover:bg-white/6"
            >
              {/* Connector line (desktop) */}
              {i < STEPS.length - 1 && (
                <div className="absolute -right-3 top-12 hidden h-px w-6 bg-gradient-to-r from-white/20 to-transparent sm:block" />
              )}

              {/* Step number */}
              <div className="mb-6 flex items-center gap-4">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-teal-500/10 text-xl font-black text-teal-400 ring-1 ring-teal-500/20">
                  {step.number}
                </span>
                <div className="h-px flex-1 bg-white/8" />
              </div>

              <h3 className="text-xl font-bold text-white">{step.title}</h3>
              <p className="mt-1 text-sm font-medium text-teal-400/70">{step.titleAr}</p>
              <p className="mt-3 leading-relaxed text-neutral-400">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-2xl bg-teal-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-teal-500/25 transition-all hover:-translate-y-0.5 hover:bg-teal-400"
          >
            Start My Plan Now
            <ArrowRight className="size-4" />
          </Link>
          <p className="mt-3 text-sm text-neutral-500">Free to start · No credit card needed</p>
        </div>
      </div>
    </section>
  )
}
