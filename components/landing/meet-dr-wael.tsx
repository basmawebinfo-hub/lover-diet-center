import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, GraduationCap, Medal } from 'lucide-react'
import { t, type Locale } from '@/lib/locale'

export function MeetDrWael({ locale }: { locale: Locale }) {
  const highlights = [
    { icon: BadgeCheck, en: 'DHA & MOH Licensed', ar: 'مرخّص من DHA وMOH' },
    { icon: GraduationCap, en: '30+ Years of Experience', ar: 'خبرة تتجاوز 30 عاماً' },
    { icon: Medal, en: 'Gold Medal — COVID-19 Front Lines', ar: 'ميدالية ذهبية — جائحة كورونا' },
  ]

  return (
    <section className="py-20 px-4 bg-[#f0faf7]">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Photo */}
        <div className="relative mx-auto aspect-square w-full max-w-sm order-1 md:order-none">
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <div className="size-[86%] rounded-full bg-gradient-to-br from-[#4d7c0f] to-[#3f6212]" />
            <div className="absolute size-[86%] rounded-full ring-4 ring-lime-300/40" />
          </div>
          <div className="absolute inset-0 flex items-end justify-center">
            <Image
              src="/dr-wael.png"
              alt={t(locale, 'Dr. Wael Mousa — Medical Nutrition Specialist', 'د. وائل موسى — أخصائي التغذية العلاجية')}
              width={796}
              height={1173}
              sizes="(max-width: 768px) 80vw, 384px"
              className="h-[96%] w-auto object-contain object-bottom drop-shadow-xl"
            />
          </div>
        </div>

        {/* Copy */}
        <div>
          <p className="text-sm font-bold text-[#4d7c0f] mb-2">
            {t(locale, 'Meet the Founder', 'تعرّف على المؤسس')}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4 text-balance">
            {t(locale, 'Meet Dr. Wael Mousa', 'د. وائل موسى')}
          </h2>
          <p className="text-neutral-600 leading-relaxed mb-6">
            {t(
              locale,
              'A DHA & MOH licensed medical nutrition specialist with over 30 years of experience in therapeutic nutrition — every program at Lovers Diet Center is designed and supervised by Dr. Wael personally.',
              'أخصائي تغذية علاجية مرخّص من هيئة الصحة بدبي ووزارة الصحة بخبرة تتجاوز 30 عاماً — كل برنامج في Lovers Diet Center مصمم وبإشراف د. وائل شخصياً.'
            )}
          </p>
          <ul className="space-y-3 mb-8">
            {highlights.map((item, i) => {
              const Icon = item.icon
              return (
                <li key={i} className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#4d7c0f]/10 text-[#4d7c0f]">
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-neutral-800">{t(locale, item.en, item.ar)}</span>
                </li>
              )
            })}
          </ul>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 bg-[#4d7c0f] text-white font-bold px-7 py-3.5 rounded-2xl hover:bg-[#155f56] transition-colors"
          >
            {t(locale, 'Learn More', 'اعرف أكثر')}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  )
}
