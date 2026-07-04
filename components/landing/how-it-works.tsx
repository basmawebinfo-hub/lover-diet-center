import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { t, type Locale } from '@/lib/locale'

export function HowItWorks({ locale }: { locale: Locale }) {

  const STEPS = [
    {
      number: '01',
      title: t(locale, 'Tell us your goal', 'أخبرنا بهدفك'),
      desc: t(
        locale,
        'Complete a quick 3-minute assessment — your weight, height, lifestyle, and what you want to achieve. No guesswork.',
        'أكمل تقييماً سريعاً خلال 3 دقائق — وزنك، طولك، نمط حياتك، وما تريد تحقيقه. بلا تخمين.'
      ),
    },
    {
      number: '02',
      title: t(locale, 'Get your personalized plan', 'احصل على خطتك المخصصة'),
      desc: t(
        locale,
        'A certified nutritionist reviews your profile and builds a plan around your real life — not a generic template.',
        'يراجع أخصائي تغذية معتمد ملفك ويبني خطة تناسب حياتك الواقعية — لا قالباً جاهزاً للجميع.'
      ),
    },
    {
      number: '03',
      title: t(locale, 'Track & transform', 'تابع وتحوّل'),
      desc: t(
        locale,
        'Log your weight daily, watch your body avatar change, and get weekly check-ins from your nutritionist.',
        'سجّل وزنك يومياً، وشاهد مجسّم جسمك يتغيّر، واحصل على متابعة أسبوعية من أخصائي التغذية.'
      ),
    },
  ]

  return (
    <section className="bg-neutral-950 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-lime-400">
            {t(locale, 'How It Works', 'كيف نعمل')}
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {locale === 'ar' ? (
              <>من التسجيل إلى النتائج{' '}<span className="text-lime-400">في 3 خطوات</span></>
            ) : (
              <>From sign-up to results{' '}<span className="text-lime-400">in 3 steps</span></>
            )}
          </h2>
          <p className="mt-4 text-pretty text-neutral-400">
            {t(
              locale,
              'No complicated onboarding. No waiting weeks to start. You get a real plan within 24 hours.',
              'لا إجراءات معقّدة للبدء. ولا انتظار أسابيع. تحصل على خطة حقيقية خلال 24 ساعة.'
            )}
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className="group relative flex flex-col rounded-3xl border border-white/8 bg-white/4 p-8 transition-all hover:border-lime-500/30 hover:bg-white/6"
            >
              {/* Connector line (desktop) */}
              {i < STEPS.length - 1 && (
                <div className="absolute -right-3 top-12 hidden h-px w-6 bg-gradient-to-r from-white/20 to-transparent sm:block rtl:-left-3 rtl:right-auto rtl:bg-gradient-to-l" />
              )}

              {/* Step number */}
              <div className="mb-6 flex items-center gap-4">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-lime-500/10 text-xl font-black text-lime-400 ring-1 ring-lime-500/20">
                  {step.number}
                </span>
                <div className="h-px flex-1 bg-white/8" />
              </div>

              <h3 className="text-xl font-bold text-white">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-neutral-400">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-2xl bg-lime-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-lime-500/25 transition-all hover:-translate-y-0.5 hover:bg-lime-400"
          >
            {t(locale, 'Start My Plan Now', 'ابدأ خطتي الآن')}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
          <p className="mt-3 text-sm text-neutral-500">
            {t(locale, 'Free to start · No credit card needed', 'البدء مجاني · لا حاجة لبطاقة ائتمان')}
          </p>
        </div>
      </div>
    </section>
  )
}
