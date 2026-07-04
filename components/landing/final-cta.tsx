import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { WHATSAPP_NUMBER } from '@/lib/site'
import { t, type Locale } from '@/lib/locale'

export function FinalCTA({ locale }: { locale: Locale }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-lime-800 via-lime-900 to-lime-950 py-20 sm:py-28">
      {/* Cross-hatch pattern */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.8' opacity='0.5'%3E%3Cpath d='M30 10v40M10 30h40'/%3E%3Ccircle cx='30' cy='30' r='2' fill='%23ffffff'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute -top-32 end-[-10%] size-[40rem] rounded-full bg-orange-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-4 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-sm">
          {t(locale, 'Start Today', 'ابدأ اليوم')}
        </span>
        <h2 className="mt-6 text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          {locale === 'ar' ? (
            <>تحوّلك يبدأ<br />برسالة{' '}<span className="text-orange-400">واحدة</span></>
          ) : (
            <>Your transformation<br />starts with{' '}<span className="text-orange-400">one message</span></>
          )}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-lime-100/70 sm:text-lg">
          {t(
            locale,
            'Book a free discovery call, get matched with a certified nutritionist in under 24 hours, and walk away with a clear plan — no commitment, no payment up front.',
            'احجز مكالمة تعريفية مجانية، ونوصّلك بأخصائي تغذية معتمد خلال أقل من 24 ساعة، لتخرج بخطة واضحة — بلا التزام، وبلا دفع مسبق.'
          )}
        </p>

        <ul className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-lime-50">
          <li className="flex items-center gap-2 rounded-full border border-white/8 bg-black/20 px-4 py-1.5 text-white/85 backdrop-blur-sm">
            <CheckCircle2 className="size-4 text-orange-400" />
            {t(locale, 'Free 15-min discovery call', 'مكالمة تعريفية مجانية 15 دقيقة')}
          </li>
          <li className="flex items-center gap-2 rounded-full border border-white/8 bg-black/20 px-4 py-1.5 text-white/85 backdrop-blur-sm">
            <CheckCircle2 className="size-4 text-orange-400" />
            {t(locale, '100% money-back guarantee', 'ضمان استرداد المبلغ 100%')}
          </li>
          <li className="flex items-center gap-2 rounded-full border border-white/8 bg-black/20 px-4 py-1.5 text-white/85 backdrop-blur-sm">
            <CheckCircle2 className="size-4 text-orange-400" />
            {t(locale, 'Arabic & English', 'بالعربية والإنجليزية')}
          </li>
        </ul>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/sign-in?redirect=/onboarding"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-orange-900/20 transition-all hover:bg-orange-400 sm:w-auto"
          >
            {t(locale, 'Build my plan', 'ابنِ خطتي')}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-lg sm:w-auto"
          >
            <img
              src="/icons/whatsapp.svg"
              alt=""
              className="size-5"
              aria-hidden="true"
            />
            {t(locale, 'Chat on WhatsApp', 'تواصل عبر واتساب')}
          </a>
        </div>
      </div>
    </section>
  )
}
