'use client'

import Link from 'next/link'
import {
  Stethoscope,
  UtensilsCrossed,
  Cookie,
  Activity,
  GraduationCap,
  ArrowRight,
  Star,
  Sparkles,
} from 'lucide-react'

const iconMap = {
  Stethoscope,
  UtensilsCrossed,
  Cookie,
  Activity,
  GraduationCap,
} as const

export function Services() {
  const services = [
    {
      icon: 'Stethoscope' as keyof typeof iconMap,
      title: 'Nutrition Consultations',
      desc: 'One-on-one sessions with certified nutrition experts for personalized dietary plans.',
      redirect: '/onboarding',
      tag: 'Most popular',
    },
    {
      icon: 'UtensilsCrossed' as keyof typeof iconMap,
      title: 'Healthy Meals',
      desc: 'Chef-prepared, macro-balanced meals delivered to your door. Fresh and tasty.',
      redirect: '/healthy-meals',
      tag: 'From 85 AED',
    },
    {
      icon: 'Cookie' as keyof typeof iconMap,
      title: 'Healthy Snacks',
      desc: 'Curated protein bars, dried fruits, nuts, and organic treats.',
      redirect: '/healthy-snacks',
      tag: '50+ products',
    },
    {
      icon: 'Activity' as keyof typeof iconMap,
      title: 'Body Sculpting',
      desc: 'Non-invasive fat reduction and body toning sessions under expert supervision.',
      redirect: '/body-sculpting',
      tag: 'Results in 4 weeks',
    },
    {
      icon: 'GraduationCap' as keyof typeof iconMap,
      title: 'Training Courses',
      desc: 'Online and in-person nutrition and fitness programs with completion certificates.',
      redirect: '/training-courses',
      tag: 'Certified',
    },
  ]

  const featured = services[0]
  const rest = services.slice(1)

  return (
    <section id="services" className="relative overflow-hidden bg-black py-20 sm:py-28">
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
      </div>
      <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 size-[40rem] rounded-full bg-pink-600/5 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Everything We{' '}
            <span className="text-pink-500">Offer</span>
          </h2>
          <p className="mt-4 text-pretty text-white/50">
            Five services designed to take you from where you are to where you want to be.
          </p>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {/* Featured large card */}
          <Link
            href={`/sign-in?redirect=${featured.redirect}`}
            className="group relative flex flex-col justify-between rounded-3xl border border-pink-500/20 bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-pink-500/50 hover:bg-white/10 lg:col-span-2 lg:row-span-2"
          >
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-pink-500/30 bg-pink-600/10 px-3 py-1 text-xs font-medium text-pink-400">
                <Sparkles className="size-3" />
                {featured.tag}
              </span>
              <span className="mt-4 flex size-14 items-center justify-center rounded-2xl bg-pink-600/20 text-pink-500">
                <Sparkles className="size-7 text-2xl" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-xl font-semibold text-white sm:text-2xl">{featured.title}</h3>
              <p className="mt-3 max-w-md leading-relaxed text-white/50">
                {featured.desc}
              </p>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-white/40">
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-4 fill-pink-400 text-pink-400" />
                150+ nutritionists
              </span>
              <span className="inline-flex items-center gap-1.5">
                96% success rate
              </span>
            </div>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-pink-500">
              Learn More
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
            </span>
          </Link>

          {rest.map((service) => {
            const Icon = iconMap[service.icon]
            return (
              <Link
                key={service.title}
                href={`/sign-in?redirect=${service.redirect}`}
                className="group rounded-3xl border border-white/10 bg-white/5 p-6 text-start backdrop-blur-sm transition-all hover:border-pink-500/30 hover:bg-white/10"
              >
                <div className="flex items-start justify-between">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-pink-600/20 text-pink-500 transition-colors group-hover:bg-pink-600 group-hover:text-white">
                    <Icon className="size-6" />
                  </span>
                  <span className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/50">
                    {service.tag}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {service.desc}
                </p>
                <div className="mt-4 flex items-center justify-end">
                  <ArrowRight className="size-4 text-white/30 transition-all group-hover:translate-x-1 group-hover:text-pink-500 rtl:rotate-180" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}