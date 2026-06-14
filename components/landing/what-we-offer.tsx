import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Stethoscope, UtensilsCrossed, Cookie, Activity, GraduationCap } from 'lucide-react'

const SERVICES = [
  {
    icon: Stethoscope,
    title: 'Nutrition Consultations',
    titleAr: 'الاستشارات الغذائية',
    desc: 'One-on-one sessions with certified nutritionists. Get a plan built around your body, goals, and lifestyle.',
    href: '/nutrition-consultations',
    tag: 'Most Popular',
    image: '/course-nutrition.png',
    color: 'teal',
  },
  {
    icon: UtensilsCrossed,
    title: 'Healthy Meals',
    titleAr: 'الوجبات الصحية',
    desc: 'Chef-prepared, macro-balanced meals delivered fresh to your door across the UAE.',
    href: '/healthy-meals',
    image: '/meal-bowl.png',
    color: 'orange',
  },
  {
    icon: Cookie,
    title: 'Healthy Snacks',
    titleAr: 'منتجات صحية',
    desc: 'Protein bars, nuts, dried fruits, and certified supplements — all curated by our nutrition team.',
    href: '/healthy-snacks',
    image: '/snack-nuts.png',
    color: 'teal',
  },
  {
    icon: Activity,
    title: 'Body Sculpting',
    titleAr: 'نحت الجسم',
    desc: 'Non-invasive fat reduction sessions with visible results in measurements from the first session.',
    href: '/body-sculpting',
    image: '/body-sculpting.png',
    color: 'orange',
  },
  {
    icon: GraduationCap,
    title: 'Training Courses',
    titleAr: 'دورات تدريبية',
    desc: 'Online and in-person programs from beginner to advanced — with certificates.',
    href: '/contact',
    image: '/course-fitness.png',
    color: 'teal',
  },
]

export function WhatWeOffer() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-200 bg-lime-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-lime-700">
            Our Services
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Everything you need,{' '}
            <span className="text-lime-600">in one place</span>
          </h2>
          <p className="mt-4 text-pretty text-neutral-500">
            From your first consultation to your daily meals — we cover every part of your health journey.
          </p>
        </div>

        {/* Services grid */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => {
            const Icon = service.icon
            return (
              <Link
                key={service.title}
                href={service.href}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-lime-200 hover:shadow-xl hover:shadow-lime-900/8"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-lime-50">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                  {/* Tag */}
                  {service.tag && (
                    <span className="absolute left-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      {service.tag}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-lime-50 text-lime-600 transition-colors group-hover:bg-lime-100">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900">{service.title}</h3>
                      <p className="text-xs text-neutral-400">{service.titleAr}</p>
                    </div>
                  </div>

                  <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-500">
                    {service.desc}
                  </p>

                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-lime-600 transition-colors group-hover:text-lime-700">
                    Learn more
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
