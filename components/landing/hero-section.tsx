import Link from 'next/link'
import Image from 'next/image'
import { Play, Star } from 'lucide-react'
import { WHATSAPP_NUMBER } from '@/lib/site'

// Real Lover Diet Center stats
const STATS = [
  { value: '3,000+', label: 'Happy Clients',     labelAr: 'عميل سعيد' },
  { value: '150+',    label: 'Certified Experts',  labelAr: 'خبير معتمد' },
  { value: '96%',     label: 'Success Rate',       labelAr: 'معدل النجاح' },
]

const TRUST_TAGS = ['Nutrition', 'Meals', 'Snacks', 'Sculpting', 'Courses']

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-16">
      {/* Fresh lime → light gradient background (reference style) */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(160deg,#fbfcf7_0%,#f1f7e2_40%,#fdfdf8_72%)]" />
      <div className="absolute -top-24 right-16 -z-10 size-[620px] rounded-full bg-[radial-gradient(circle,rgba(168,219,46,0.45),rgba(234,255,176,0)_70%)] blur-md" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-16">

          {/* ── LEFT: Copy ── */}
          <div className="flex flex-col">
            {/* Pill */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-sm font-semibold text-neutral-600">
              <span className="size-2 rounded-full bg-lime-500" />
              Together for a better life
            </div>

            {/* Headline */}
            <h1 className="mt-5 text-[clamp(2.5rem,5.2vw,3.6rem)] font-extrabold leading-[1.06] tracking-tight text-neutral-900">
              Make a <span className="text-lime-500">healthy</span> life
              <br />with fresh <span className="text-lime-500">Food</span>
            </h1>

            {/* Sub */}
            <p className="mt-5 max-w-md text-[clamp(0.95rem,1.6vw,1.05rem)] leading-relaxed text-neutral-500">
              Personalized nutrition plans, chef-prepared balanced meals, and certified experts —
              delivered to your door. Designed for busy lifestyles to help you eat better and reach real results.
            </p>

            {/* CTAs */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-lime-400 to-lime-500 px-8 py-4 text-base font-bold text-lime-950 shadow-lg shadow-lime-500/40 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-lime-500/50 active:translate-y-0"
              >
                Get Started Free
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C+I%27d+like+to+book+a+free+consultation`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-neutral-200 bg-white px-6 py-3.5 text-base font-semibold text-neutral-800 shadow-sm transition-all hover:border-lime-300 hover:text-neutral-900"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-neutral-900 text-white">
                  <Play className="size-3.5 fill-white" />
                </span>
                Watch Demo
              </a>
            </div>

            {/* Stats */}
            <div className="mt-9 flex flex-wrap gap-10">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-[1.7rem]">{s.value}</div>
                  <div className="mt-0.5 text-sm text-neutral-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Hero meal with green accents ── */}
          <div className="relative flex items-center justify-center lg:justify-end">
            {/* Floating review card */}
            <div className="absolute -top-2 right-2 z-20 flex items-center gap-3 rounded-2xl bg-white px-3.5 py-2.5 shadow-xl shadow-neutral-900/15 sm:right-6">
              <div className="flex -space-x-2.5">
                {[['S','#0d9488'],['A','#c97a1f'],['N','#9bcf24']].map(([l,c],i) => (
                  <span
                    key={i}
                    className="flex size-8 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white"
                    style={{ backgroundColor: c as string, color: l === 'N' ? '#243b00' : '#fff' }}
                  >
                    {l}
                  </span>
                ))}
              </div>
              <div>
                <p className="text-xs font-bold text-neutral-900">Our Happy Customer</p>
                <p className="flex items-center gap-1 text-[11px] text-neutral-500">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-amber-500">4.9</span> (2,000+ Reviews)
                </p>
              </div>
            </div>

            <div className="relative w-full max-w-[540px]">
              <Image
                src="/hero-meal.png"
                alt="Fresh healthy meal from Lover Diet Center"
                width={1024}
                height={980}
                priority
                sizes="(min-width: 1024px) 540px, 100vw"
                className="h-auto w-full drop-shadow-[0_24px_40px_rgba(60,80,20,0.22)]"
              />
            </div>
          </div>
        </div>

        {/* ── Trust strip ── */}
        <div className="border-t border-neutral-100 py-7 text-center">
          <p className="text-sm text-neutral-500">
            Trusted by 3,000+ clients across the UAE for science-backed nutrition.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-bold text-neutral-400">
            {TRUST_TAGS.map((t, i) => (
              <span key={t} className="flex items-center gap-2">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-lime-300" />
                  {t}
                </span>
                {i < TRUST_TAGS.length - 1 && <span className="text-neutral-200">|</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
