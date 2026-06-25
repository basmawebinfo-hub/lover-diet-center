"use client"

import Image from 'next/image'
import Link from 'next/link'
import { WHATSAPP_DIRECT } from '@/lib/site'
import { ArrowRight, Award } from 'lucide-react'
import { useLocale, t } from '@/lib/locale'

export function AboutContent() {
  const { locale } = useLocale()

  const stats = [
    { value: '3,000+', label: t(locale, 'Happy Clients', 'عميل سعيد') },
    { value: '150+',   label: t(locale, 'Certified Experts', 'خبير معتمد') },
    { value: '96%',    label: t(locale, 'Success Rate', 'معدل النجاح') },
    { value: '4.9',    label: t(locale, 'Average Rating', 'متوسط التقييم') },
  ]

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f0faf7] to-white py-20 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#4d7c0f]/10 text-[#4d7c0f] text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Award className="w-4 h-4" />
              {t(locale, 'About Us', 'من نحن')}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
              {locale === 'ar' ? (
                <>تغذية قائمة على العلم،{' '}<span className="text-[#4d7c0f]">نتائج حقيقية</span></>
              ) : (
                <>Science-Based Nutrition,{' '}<span className="text-[#4d7c0f]">Real Results</span></>
              )}
            </h1>
            <p className="text-lg text-neutral-600 mb-6">
              {t(
                locale,
                'Lover Diet Center was founded with one mission: to make expert nutrition guidance accessible to everyone in the UAE. We combine cutting-edge science with personalized care to help you reach your health goals.',
                'تأسس Lover Diet Center برسالة واحدة: أن نجعل الإرشاد الغذائي المتخصص في متناول الجميع في الإمارات. نجمع بين أحدث ما توصل إليه العلم والرعاية الشخصية لمساعدتك على تحقيق أهدافك الصحية.'
              )}
            </p>
            <a
              href={WHATSAPP_DIRECT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#4d7c0f] text-white font-semibold px-8 py-4 rounded-2xl hover:bg-[#155f56] transition-colors"
            >
              {t(locale, 'Talk to Us', 'تحدّث إلينا')}
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </a>
          </div>
          {/* Founder photo with brand-colored circle backdrop */}
          <div className="relative mx-auto aspect-square w-full max-w-md">
            {/* Circle shape in brand colors */}
            <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
              <div className="size-[86%] rounded-full bg-gradient-to-br from-[#4d7c0f] to-[#3f6212]" />
              <div className="absolute size-[86%] rounded-full ring-4 ring-lime-300/40" />
              <div className="absolute size-[97%] rounded-full border border-dashed border-[#4d7c0f]/25" />
            </div>

            {/* Dr. Wael */}
            <div className="absolute inset-0 flex items-end justify-center">
              <Image
                src="/dr-wael.png"
                alt={t(locale, 'Dr. Wael Mostafa - Founder', 'د. وائل مصطفى - المؤسس')}
                width={796}
                height={1173}
                sizes="(max-width: 768px) 90vw, 440px"
                className="h-[98%] w-auto object-contain object-bottom drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 bg-[#4d7c0f]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <div key={i}>
              <p className="text-4xl font-bold text-white">{stat.value}</p>
              <p className="text-white/80 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            {t(locale, 'Our Story', 'قصتنا')}
          </h2>
          <p className="text-neutral-600 leading-relaxed mb-4">
            {t(
              locale,
              'Founded by Dr. Wael Mostafa, Lover Diet Center started as a small clinic in the UAE with a simple belief: that every person deserves a personalized approach to nutrition. No generic diets, no one-size-fits-all plans.',
              'أسّسه الدكتور وائل مصطفى، وبدأ Lover Diet Center كعيادة صغيرة في الإمارات بقناعة بسيطة: أن كل شخص يستحق نهجاً غذائياً مصمماً خصيصاً له. لا حميات عامة، ولا خطط جاهزة تناسب الجميع.'
            )}
          </p>
          <p className="text-neutral-600 leading-relaxed mb-4">
            {t(
              locale,
              'Today, we are proud to serve over 3,000 clients across the UAE with a team of 150+ certified nutritionists, dietitians, and wellness coaches. Our approach combines the latest nutritional science with cultural sensitivity and practical lifestyle guidance.',
              'واليوم، نفخر بخدمة أكثر من 3,000 عميل في مختلف أنحاء الإمارات، عبر فريق يضم أكثر من 150 أخصائي تغذية ومدرب صحة معتمد. يجمع نهجنا بين أحدث علوم التغذية والحس الثقافي والإرشاد العملي لنمط الحياة.'
            )}
          </p>
          <p className="text-neutral-600 leading-relaxed">
            {t(
              locale,
              'Whether you want to lose weight, build muscle, manage a health condition, or simply eat better — we are here to guide you every step of the way.',
              'سواء كنت تريد إنقاص وزنك، أو بناء عضلاتك، أو التعامل مع حالة صحية، أو ببساطة تناول طعام أفضل — نحن هنا لنرشدك في كل خطوة على الطريق.'
            )}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-neutral-50 py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            {t(locale, 'Start Your Journey Today', 'ابدأ رحلتك اليوم')}
          </h2>
          <p className="text-neutral-600 mb-8">
            {t(
              locale,
              'Join thousands of clients who have transformed their health with us.',
              'انضم إلى آلاف العملاء الذين غيّروا صحتهم معنا.'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-[#4d7c0f] text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#155f56] transition-colors"
            >
              {t(locale, 'Create Free Account', 'أنشئ حساباً مجانياً')}
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
            <a
              href={WHATSAPP_DIRECT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-2 border-[#4d7c0f] text-[#4d7c0f] font-bold px-8 py-4 rounded-2xl hover:bg-[#4d7c0f]/5 transition-colors"
            >
              {t(locale, 'Chat on WhatsApp', 'تواصل عبر واتساب')}
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
