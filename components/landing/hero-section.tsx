import Link from 'next/link'
import Image from 'next/image'
import { Play, Stethoscope, UtensilsCrossed, Cookie, Activity, GraduationCap } from 'lucide-react'
import { WHATSAPP_NUMBER } from '@/lib/site'
import { t, type Locale } from '@/lib/locale'

// Real Lover Diet Center stats
const STATS = [
  { value: '3,000+', label: 'Happy Clients',     labelAr: 'عميل سعيد' },
  { value: '150+',    label: 'Certified Experts',  labelAr: 'خبير معتمد' },
  { value: '96%',     label: 'Success Rate',       labelAr: 'معدل النجاح' },
]

const TRUST_TAGS = ['Nutrition', 'Meals', 'Snacks', 'Sculpting', 'Courses']

const SERVICES = [
  { icon: Stethoscope,     en: 'Consultations', ar: 'استشارات',    href: '/nutrition-consultations' },
  { icon: UtensilsCrossed, en: 'Healthy Meals', ar: 'وجبات صحية',  href: '/healthy-meals' },
  { icon: Cookie,          en: 'Snacks',        ar: 'سناكس',       href: '/healthy-snacks' },
  { icon: Activity,        en: 'Sculpting',     ar: 'نحت الجسم',   href: '/body-sculpting' },
  { icon: GraduationCap,   en: 'Courses',       ar: 'دورات',       href: '/training-courses' },
]

export function HeroSection({ locale }: { locale: Locale }) {
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
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-1.5 text-sm font-semibold text-neutral-600 animate-fade-up">
              <span className="size-2 rounded-full bg-lime-500" />
              {t(locale, 'Together for a better life', 'معًا من أجل حياة أفضل')}
            </div>

            {/* Headline */}
            <h1 className="mt-5 text-[clamp(2.5rem,5.2vw,3.6rem)] font-extrabold leading-[1.06] tracking-tight text-neutral-900 animate-fade-up delay-100">
              {locale === 'ar' ? (
                <>اصنع حياة <span className="text-lime-500">صحية</span><br />مع طعام <span className="text-lime-500">طازج</span></>
              ) : (
                <>Make a <span className="text-lime-500">healthy</span> life<br />with fresh <span className="text-lime-500">Food</span></>
              )}
            </h1>

            {/* Sub */}
            <p className="mt-5 max-w-md text-[clamp(0.95rem,1.6vw,1.05rem)] leading-relaxed text-neutral-500 animate-fade-up delay-200">
              {t(locale, 'Personalized nutrition plans, chef-prepared balanced meals, and certified experts — delivered to your door.', 'خطط تغذية مخصصة، ووجبات متوازنة محضّرة على يد الطهاة، وخبراء معتمدون — تصلك حتى باب منزلك.')}
            </p>

            {/* CTAs */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-lime-400 to-lime-500 px-8 py-4 text-base font-bold text-lime-950 shadow-lg shadow-lime-500/40 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-lime-500/50 active:translate-y-0"
              >
                {t(locale, 'Get Started Free', 'ابدأ مجانًا')}
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
                {t(locale, 'Watch Demo', 'شاهد العرض')}
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
            <div className="group relative aspect-square w-full max-w-[540px]">
              {/* Professional backdrop circle */}
              <div className="absolute inset-0 -z-10 flex items-center justify-center" aria-hidden="true">
                <div className="size-[88%] rounded-full bg-gradient-to-br from-lime-100 via-lime-50 to-white" />
                <div className="absolute size-[88%] rounded-full ring-1 ring-lime-200/70" />
                <div className="absolute size-[100%] rounded-full border border-dashed border-lime-300/50" />
              </div>

              {/* Meal image */}
              <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-[0.92]">
                <Image
                  src="/hero-meal.png"
                  alt="Fresh healthy meal from Lover Diet Center"
                  width={1024}
                  height={980}
                  priority
                  sizes="(min-width: 1024px) 540px, 100vw"
                  className="h-auto w-[86%] drop-shadow-[0_24px_40px_rgba(60,80,20,0.22)]"
                />
              </div>

              {/* Services that pop out on hover, arranged in a ring */}
              {SERVICES.map((s, i) => {
                const Icon = s.icon
                const angle = (i / SERVICES.length) * 2 * Math.PI - Math.PI / 2
                const radius = 46 // % from center
                const left = 50 + radius * Math.cos(angle)
                const top = 50 + radius * Math.sin(angle)
                return (
                  <Link
                    key={s.href}
                    href={s.href}
                    style={{ left: `${left}%`, top: `${top}%`, transitionDelay: `${i * 60}ms` }}
                    className="absolute z-20 flex -translate-x-1/2 -translate-y-1/2 scale-50 flex-col items-center gap-1 opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100"
                  >
                    <span className="flex size-14 items-center justify-center rounded-2xl border border-lime-100 bg-white text-lime-600 shadow-lg shadow-lime-900/10 transition-colors hover:bg-lime-600 hover:text-white sm:size-16">
                      <Icon className="size-6 sm:size-7" />
                    </span>
                    <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-neutral-700 shadow-sm backdrop-blur">
                      {locale === 'ar' ? s.ar : s.en}
                    </span>
                  </Link>
                )
              })}

              {/* Hint shown before hover */}
              <span className="pointer-events-none absolute bottom-1 left-1/2 z-20 -translate-x-1/2 rounded-full bg-lime-600/90 px-3 py-1 text-[11px] font-bold text-white shadow-md backdrop-blur transition-opacity duration-300 group-hover:opacity-0">
                {t(locale, 'Hover to see our services', 'مرّر لرؤية خدماتنا')}
              </span>
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
