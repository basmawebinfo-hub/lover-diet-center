'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

const services = [
  {
    title: 'Nutritional Consultations',
    description: 'One-on-one sessions with certified experts for personalized meal plans.',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80',
    redirect: '/onboarding',
    tag: '★ Most Popular',
  },
  {
    title: 'Healthy Meals',
    description: 'Chef-prepared macro-balanced meals delivered fresh to your door.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
    redirect: '/healthy-meals',
  },
  {
    title: 'Healthy Snack Products',
    description: 'Curated protein bars, nuts, and organic snacks with clear nutrition info.',
    image: 'https://images.unsplash.com/photo-1604480132736-44c188fe4d20?w=400&q=80',
    redirect: '/healthy-snacks',
  },
  {
    title: 'Fat Burning & Body Sculpting',
    description: 'Non-invasive specialist sessions with visible results in weeks.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80',
    redirect: '/body-sculpting',
  },
  {
    title: 'Training Courses',
    description: 'Online and in-person programs from beginner to advanced with certificates.',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80',
    redirect: '/training-courses',
  },
]

export function WhatWeOffer() {
  const router = useRouter()

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <h2 className="text-balance text-3xl font-semibold text-neutral-900">
            What We Offer
          </h2>
          <p className="mt-2 text-neutral-500">
            Everything you need to reach your health goals — all in one place
          </p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:overflow-visible sm:pb-0">
          {services.map((service) => (
            <div
              key={service.title}
              onClick={() => router.push(`/sign-in?redirect=${service.redirect}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  router.push(`/sign-in?redirect=${service.redirect}`)
                }
              }}
              tabIndex={0}
              role="button"
              className="group flex w-[260px] shrink-0 snap-start cursor-pointer flex-col rounded-xl border border-neutral-200/60 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md sm:w-auto"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(max-width: 640px) 260px, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {service.tag && (
                <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-orange-500 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  {service.tag}
                </span>
              )}

              <h3 className="mt-2 text-base font-semibold text-neutral-900">
                {service.title}
              </h3>

              <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                {service.description}
              </p>

              <Link
                href={`/sign-in?redirect=${service.redirect}`}
                onClick={(e) => e.stopPropagation()}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal-600 transition-colors hover:text-teal-700"
              >
                {service.tag ? 'Book →' : 'View →'}
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}