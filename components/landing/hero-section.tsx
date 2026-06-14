import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles, Star, Shield, BadgeCheck } from 'lucide-react'
import { WHATSAPP_NUMBER } from '@/lib/site'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white md:min-h-[85svh]">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-teal-50/60 via-white to-orange-50/30" aria-hidden="true" />
      <div className="absolute -top-32 end-[-10%] -z-10 size-[40rem] rounded-full bg-teal-100/40 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-32 start-[-10%] -z-10 size-[35rem] rounded-full bg-orange-100/30 blur-3xl" aria-hidden="true" />

      <div className="mx-auto grid max-w-7xl items-center px-4 pt-16 pb-16 md:grid-cols-[55fr_45fr] md:gap-8 md:pt-20 md:pb-20 lg:gap-12 lg:pt-24 lg:pb-24">
        {/* Copy column */}
        <div className="flex flex-col">
          <span className="animate-hero-badge inline-flex w-fit items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-teal-700 shadow-sm backdrop-blur-sm">
            <Sparkles className="size-4 text-orange-500" />
            #1 Nutrition Center in UAE
          </span>

          <h1 className="animate-hero-title mt-5 text-balance font-bold leading-[1.05] tracking-tight text-neutral-900"
            style={{ fontSize: 'clamp(2.25rem, 5.5vw, 4.5rem)' }}>
            Transform Your Health{' '}
            <span className="relative inline-block text-teal-600">
              With Science-Based Nutrition
              <svg className="absolute -bottom-2 start-0 h-3 w-full text-orange-300" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 9c40-7 80-7 120-2 16 2 30 3 56 1" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="animate-hero-desc mt-4 max-w-lg text-pretty leading-relaxed text-neutral-600"
            style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>
            Personalized meal plans, expert consultations, and chef-prepared healthy
            food delivered to your door. Backed by 150+ certified nutritionists and
            thousands of measurable results.
          </p>

          <div className="animate-hero-cta mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/sign-in?redirect=/onboarding"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 active:translate-y-0 sm:px-7 sm:py-3.5 sm:text-base"
            >
              Book a Consultation
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white px-5 py-3 text-sm font-medium text-teal-700 shadow-sm transition-all hover:border-teal-300 hover:bg-teal-50 sm:px-6 sm:py-3.5 sm:text-base"
            >
              <svg className="size-5 text-teal-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>

          <div className="animate-hero-stats mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 sm:gap-x-8">
            <div>
              <div className="text-xl font-bold text-teal-600 sm:text-2xl">25K+</div>
              <div className="text-xs text-neutral-500">Happy Clients</div>
            </div>
            <div className="h-8 w-px bg-teal-100" aria-hidden="true" />
            <div>
              <div className="text-xl font-bold text-teal-600 sm:text-2xl">96%</div>
              <div className="text-xs text-neutral-500">Success Rate</div>
            </div>
            <div className="h-8 w-px bg-teal-100" aria-hidden="true" />
            <div>
              <div className="text-xl font-bold text-teal-600 sm:text-2xl">150+</div>
              <div className="text-xs text-neutral-500">Experts</div>
            </div>
            <div className="h-8 w-px bg-teal-100" aria-hidden="true" />
            <div>
              <div className="flex items-center gap-1 text-xl font-bold text-teal-600 sm:text-2xl">
                4.9<Star className="size-4 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-xs text-neutral-500">Avg. Rating</div>
            </div>
          </div>
        </div>

        {/* Visual column */}
        <div className="animate-hero-image relative mt-8 md:mt-0">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] bg-teal-50 shadow-lg shadow-teal-900/5 md:max-w-md">
            {/* Animated gradient border */}
            <div className="pointer-events-none absolute -inset-[3px] -z-10 rounded-[calc(2rem+3px)] bg-gradient-to-br from-teal-400 via-emerald-300 to-teal-500 opacity-60 blur-sm" aria-hidden="true" />
            <div className="pointer-events-none absolute -inset-[6px] -z-20 rounded-[calc(2rem+6px)] bg-gradient-to-br from-teal-300/30 via-transparent to-orange-300/30 opacity-40 blur-xl" aria-hidden="true" />

            <Image
              src="/dr-wael.png"
              alt="Dr. Wael — Lead Nutritionist at Lover Diet Center"
              fill
              priority
              sizes="(min-width: 768px) 28rem, 100vw"
              className="object-cover object-top transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-teal-900/30 via-transparent to-transparent" aria-hidden="true" />

            {/* Floating trust badge */}
            <div className="animate-float absolute end-3 top-3 flex items-center gap-2 rounded-xl border border-white/40 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-sm">
              <BadgeCheck className="size-5 text-teal-500" />
              <span className="whitespace-nowrap text-[11px] font-semibold text-neutral-800">Certified Expert</span>
            </div>

            {/* Floating fresh meals badge */}
            <div className="animate-float absolute bottom-4 start-4 flex items-center gap-2 rounded-xl border border-white/40 bg-white/90 px-3 py-2 shadow-lg backdrop-blur-sm"
              style={{ animationDelay: '-1.5s' }}>
              <span className="relative flex size-3">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-teal-500" />
              </span>
              <span className="whitespace-nowrap text-[11px] font-semibold text-neutral-800">Personalized Plans</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
