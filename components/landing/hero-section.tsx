import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, BadgeCheck, Users, TrendingDown } from 'lucide-react'
import { WHATSAPP_NUMBER } from '@/lib/site'

const STATS = [
  { value: '25,000+', label: 'Happy Clients',  labelAr: 'عميل سعيد' },
  { value: '96%',     label: 'Success Rate',   labelAr: 'معدل النجاح' },
  { value: '150+',    label: 'Certified Experts', labelAr: 'خبير معتمد' },
  { value: '4.9',     label: 'Rating',         labelAr: 'تقييم', star: true },
]

// Recent member results — shown as floating cards on the image
const RESULTS = [
  { name: 'Sara M.',  result: '-18 kg',  weeks: '16 weeks' },
  { name: 'Ahmed K.', result: '+8 kg',   weeks: '12 weeks', gain: true },
  { name: 'Nour A.',  result: '-12 kg',  weeks: '10 weeks' },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white pt-16">
      {/* Subtle background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(20,184,166,0.08),transparent)]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid min-h-[calc(100svh-4rem)] grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">

          {/* ── LEFT: Copy ── */}
          <div className="flex flex-col">

            {/* Badge */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-700">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-teal-500" />
              </span>
              #1 Nutrition Center in UAE
            </div>

            {/* Headline */}
            <h1 className="mt-5 text-[clamp(2.4rem,5vw,4rem)] font-extrabold leading-[1.08] tracking-tight text-neutral-900">
              Transform Your Body{' '}
              <span className="relative whitespace-nowrap text-teal-600">
                With Science
                <svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 300 10"
                  fill="none"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M2 7 Q75 2 150 6 Q225 10 298 5" stroke="#f97316" strokeWidth="3" strokeLinecap="round" fill="none"/>
                </svg>
              </span>
              <br />Not Willpower
            </h1>

            {/* Sub */}
            <p className="mt-5 max-w-lg text-[clamp(1rem,1.8vw,1.2rem)] leading-relaxed text-neutral-500">
              Personalized nutrition plans, chef-prepared meals, and certified experts — all working together to get you real, measurable results.
            </p>

            {/* Social proof row */}
            <div className="mt-5 flex items-center gap-3">
              <div className="flex -space-x-2">
                {['M','S','A','N','R'].map((l, i) => (
                  <div
                    key={i}
                    className="flex size-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: ['#0d9488','#0f766e','#14b8a6','#0d9488','#0f766e'][i] }}
                  >
                    {l}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  <span className="font-semibold text-neutral-700">4.9/5</span> from 2,000+ reviews
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/sign-up"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-7 py-4 text-base font-bold text-white shadow-lg shadow-teal-600/25 transition-all hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-600/30 active:translate-y-0"
              >
                Start Free Today
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C+I%27d+like+to+book+a+free+consultation`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-neutral-200 bg-white px-6 py-4 text-base font-semibold text-neutral-700 transition-all hover:border-teal-300 hover:text-teal-700"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-5 text-green-500" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Free Consultation
              </a>
            </div>

            {/* Trust line */}
            <p className="mt-4 flex items-center gap-1.5 text-xs text-neutral-400">
              <BadgeCheck className="size-4 text-teal-500" />
              No credit card required · Cancel anytime · Arabic & English support
            </p>
          </div>

          {/* ── RIGHT: Visual ── */}
          <div className="relative flex justify-center lg:justify-end">

            {/* Main image frame */}
            <div className="relative w-full max-w-[420px]">
              {/* Decorative ring */}
              <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-br from-teal-400/20 via-teal-200/10 to-orange-300/20 blur-xl" />

              <div className="relative overflow-hidden rounded-[2rem] bg-teal-50 shadow-2xl shadow-teal-900/15">
                <div className="aspect-[3/4] w-full">
                  <Image
                    src="/dr-wael.png"
                    alt="Dr. Wael — Lead Nutritionist at Lover Diet Center"
                    fill
                    priority
                    sizes="(min-width: 1024px) 420px, 100vw"
                    className="object-cover object-top"
                  />
                  {/* Bottom gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-900/40 via-transparent to-transparent" />
                </div>

                {/* Name card at bottom */}
                <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/20 bg-white/90 px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-teal-600 text-white text-sm font-bold">W</div>
                    <div>
                      <p className="text-sm font-bold text-neutral-900">Dr. Wael Mostafa</p>
                      <p className="text-xs text-neutral-500">Lead Nutritionist · Founder</p>
                    </div>
                    <BadgeCheck className="ml-auto size-5 text-teal-500" />
                  </div>
                </div>
              </div>

              {/* Floating result cards */}
              <div className="absolute -left-4 top-12 flex items-center gap-2 rounded-2xl border border-white bg-white px-3 py-2.5 shadow-lg shadow-neutral-900/10 sm:-left-8">
                <div className="flex size-8 items-center justify-center rounded-full bg-teal-100">
                  <TrendingDown className="size-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">Sara M. lost</p>
                  <p className="text-lg font-extrabold leading-none text-teal-600">-18 kg</p>
                  <p className="text-[10px] text-neutral-400">in 16 weeks</p>
                </div>
              </div>

              <div className="absolute -right-4 top-1/3 flex items-center gap-2 rounded-2xl border border-white bg-white px-3 py-2.5 shadow-lg shadow-neutral-900/10 sm:-right-8">
                <div className="flex size-8 items-center justify-center rounded-full bg-orange-100">
                  <Users className="size-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">This month</p>
                  <p className="text-lg font-extrabold leading-none text-orange-500">+340</p>
                  <p className="text-[10px] text-neutral-400">new members</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="border-t border-neutral-100 py-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-extrabold text-teal-600 sm:text-3xl">{stat.value}</span>
                  {stat.star && <Star className="size-5 fill-amber-400 text-amber-400" />}
                </div>
                <p className="mt-1 text-sm font-medium text-neutral-500">{stat.label}</p>
                <p className="text-xs text-neutral-300">{stat.labelAr}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
