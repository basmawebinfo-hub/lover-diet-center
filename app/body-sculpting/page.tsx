import Link from 'next/link'
import { InAppActionButton } from '@/components/in-app-action-button'
import { ArrowRight, Activity, CheckCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Body Sculpting Sessions',
  description: 'Advanced fat-breaking and body sculpting sessions at Lover Diet Center UAE.',
}

const benefits = [
  { en: 'Non-invasive fat reduction technology', ar: 'تقنية تكسير الدهون غير الجراحية' },
  { en: 'Visible results from the first session', ar: 'نتائج مرئية من الجلسة الأولى' },
  { en: 'Reshape body measurements', ar: 'إعادة تشكيل قياسات الجسم' },
  { en: 'Certified body sculpting specialists', ar: 'متخصصون معتمدون في نحت الجسم' },
  { en: 'Customized session plans', ar: 'خطط جلسات مخصصة' },
  { en: 'Combines with nutrition plan for best results', ar: 'تتكامل مع خطة التغذية لأفضل النتائج' },
]

const sessions = [
  { nameEn: 'Starter Pack', nameAr: 'باقة البداية', sessions: 4, price: 799 },
  { nameEn: 'Transformation Pack', nameAr: 'باقة التحول', sessions: 8, price: 1399, popular: true },
  { nameEn: 'Elite Pack', nameAr: 'الباقة المميزة', sessions: 16, price: 2499 },
]

export default function BodySculptingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f0faf7] to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#4d7c0f]/10 text-[#4d7c0f] text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Activity className="w-4 h-4" />
            Body Sculpting Sessions
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
            Reshape Your Body,{' '}
            <span className="text-[#4d7c0f]">Without Surgery</span>
          </h1>
          <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
            Advanced non-invasive fat-breaking technology combined with expert nutrition guidance. See real changes in your body measurements from the very first session.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <InAppActionButton mode="session" sessionType="body_sculpting" label="Book a Session" />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-10">Why Choose Our Sessions?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-[#f0faf7] rounded-2xl">
                <CheckCircle className="w-5 h-5 text-[#4d7c0f] mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-neutral-800">{b.en}</p>
                  <p className="text-sm text-neutral-500 mt-0.5">{b.ar}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4 bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-10">Session Packages</h2>
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
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-neutral-900">{pkg.nameEn}</h3>
                <p className="text-sm text-neutral-500 mb-4">{pkg.nameAr}</p>
                <p className="text-3xl font-bold text-[#4d7c0f] mb-1">{pkg.price} <span className="text-base font-normal">AED</span></p>
                <p className="text-sm text-neutral-500 mb-6">{pkg.sessions} sessions</p>
                <div className="mt-2"><InAppActionButton mode="session" sessionType="body_sculpting" label="Book Now" className="w-full px-4 py-3 text-sm" /></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
