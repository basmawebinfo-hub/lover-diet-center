"use client"

import { InAppActionButton } from '@/components/in-app-action-button'
import { Activity, CheckCircle } from 'lucide-react'
import { useLocale, t } from '@/lib/locale'

export function BodySculptingContent() {
  const { locale } = useLocale()

  const benefits = [
    t(locale, 'Non-invasive fat reduction technology', 'تقنية تكسير دهون غير جراحية'),
    t(locale, 'Visible results from the first session', 'نتائج مرئية من الجلسة الأولى'),
    t(locale, 'Reshape body measurements', 'إعادة تشكيل قياسات الجسم'),
    t(locale, 'Certified body sculpting specialists', 'متخصصون معتمدون في نحت الجسم'),
    t(locale, 'Customized session plans', 'خطط جلسات مخصصة'),
    t(locale, 'Combines with nutrition plan for best results', 'تتكامل مع خطة التغذية لأفضل النتائج'),
  ]

  const sessions = [
    { name: t(locale, 'Starter Pack', 'باقة البداية'), sessions: 4, price: 799 },
    { name: t(locale, 'Transformation Pack', 'باقة التحوّل'), sessions: 8, price: 1399, popular: true },
    { name: t(locale, 'Elite Pack', 'الباقة المميزة'), sessions: 16, price: 2499 },
  ]

  const aed = t(locale, 'AED', 'درهم')
  const sessionsLabel = (n: number) => locale === 'ar' ? `${n} جلسات` : `${n} sessions`

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f0faf7] to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#4d7c0f]/10 text-[#4d7c0f] text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Activity className="w-4 h-4" />
            {t(locale, 'Body Sculpting Sessions', 'جلسات نحت الجسم')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
            {locale === 'ar' ? (
              <>أعد تشكيل جسمك،{' '}<span className="text-[#4d7c0f]">بدون جراحة</span></>
            ) : (
              <>Reshape Your Body,{' '}<span className="text-[#4d7c0f]">Without Surgery</span></>
            )}
          </h1>
          <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            {t(
              locale,
              'Advanced non-invasive fat-breaking technology combined with expert nutrition guidance. See real changes in your body measurements from the very first session.',
              'تقنية متقدّمة لتكسير الدهون غير الجراحية مع إرشاد غذائي متخصص. شاهد تغيّرات حقيقية في قياسات جسمك من الجلسة الأولى.'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <InAppActionButton mode="session" sessionType="body_sculpting" label={t(locale, 'Book a Session', 'احجز جلسة')} />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-10">{t(locale, 'Why Choose Our Sessions?', 'لماذا تختار جلساتنا؟')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-[#f0faf7] rounded-2xl">
                <CheckCircle className="w-5 h-5 text-[#4d7c0f] mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-neutral-800">{b}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-10">{t(locale, 'Session Packages', 'باقات الجلسات')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sessions.map((pkg, i) => (
              <div
                key={i}
                className={`relative bg-white rounded-3xl p-6 shadow-sm border-2 transition-shadow hover:shadow-md ${
                  pkg.popular ? 'border-[#4d7c0f]' : 'border-neutral-100'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4d7c0f] text-white text-xs font-bold px-4 py-1 rounded-full">
                    {t(locale, 'Most Popular', 'الأكثر طلباً')}
                  </div>
                )}
                <h3 className="text-xl font-bold text-neutral-900">{pkg.name}</h3>
                <p className="text-3xl font-bold text-[#4d7c0f] mb-1 mt-3">{pkg.price} <span className="text-base font-normal">{aed}</span></p>
                <p className="text-sm text-neutral-500 mb-6">{sessionsLabel(pkg.sessions)}</p>
                <div className="mt-2"><InAppActionButton mode="session" sessionType="body_sculpting" label={t(locale, 'Book Now', 'احجز الآن')} className="w-full px-4 py-3 text-sm" /></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
