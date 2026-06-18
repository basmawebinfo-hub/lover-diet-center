"use client"

import Image from 'next/image'
import { WHATSAPP_DIRECT } from '@/lib/site'
import { ArrowRight, GraduationCap, Check } from 'lucide-react'
import { useLocale, t } from '@/lib/locale'

export function TrainingCoursesContent() {
  const { locale } = useLocale()

  const courses = [
    {
      name: t(locale, 'Nutrition Fundamentals', 'أساسيات التغذية'),
      desc: t(locale, 'Learn how macros, calories, and meal timing actually work — build plans with confidence.', 'تعلّم كيف تعمل الماكروز والسعرات وتوقيت الوجبات، وابنِ خططك بثقة.'),
      level: t(locale, 'Beginner', 'مبتدئ'), duration: t(locale, '4 weeks', '4 أسابيع'), price: 499,
      image: '/course-nutrition.png',
    },
    {
      name: t(locale, 'Fitness & Body Coaching', 'اللياقة وتدريب الجسم'),
      desc: t(locale, 'Training programming, progressive overload, and recovery for real, lasting results.', 'برمجة التمارين والحِمل التدريجي والاستشفاء لنتائج حقيقية ودائمة.'),
      level: t(locale, 'Intermediate', 'متوسّط'), duration: t(locale, '6 weeks', '6 أسابيع'), price: 699,
      image: '/course-fitness.png',
    },
    {
      name: t(locale, 'Healthy Lifestyle Mastery', 'إتقان نمط الحياة الصحي'),
      desc: t(locale, 'Habits, sleep, stress, and sustainable eating — change your lifestyle for good.', 'العادات والنوم والتوتر والأكل المستدام، غيّر نمط حياتك للأبد.'),
      level: t(locale, 'All levels', 'كل المستويات'), duration: t(locale, '8 weeks', '8 أسابيع'), price: 899,
      image: '/course-lifestyle.png',
    },
  ]

  const PERKS = [
    t(locale, 'Certificate of completion', 'شهادة إتمام'),
    t(locale, 'Lifetime access to materials', 'وصول مدى الحياة للمواد'),
    t(locale, 'Live Q&A with certified experts', 'جلسات أسئلة مباشرة مع خبراء معتمدين'),
    t(locale, 'Arabic & English support', 'دعم بالعربية والإنجليزية'),
  ]

  const aed = t(locale, 'AED', 'درهم')

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f3fae6] to-white py-20 px-4 pt-28">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-lime-100 text-lime-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <GraduationCap className="w-4 h-4" />
            {t(locale, 'Training Courses', 'الدورات التدريبية')}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900">
            {locale === 'ar' ? (
              <>تعلّم من <span className="text-lime-600">خبراء معتمدين</span></>
            ) : (
              <>Learn from <span className="text-lime-600">certified experts</span></>
            )}
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-neutral-500 leading-relaxed">
            {t(
              locale,
              'Specialized online and in-person programs — from beginner to advanced — to master nutrition, fitness, and a healthy lifestyle. Every course ends with a certificate.',
              'برامج متخصّصة عبر الإنترنت وحضورياً — من المبتدئ إلى المتقدّم — لإتقان التغذية واللياقة ونمط الحياة الصحي. كل دورة تنتهي بشهادة.'
            )}
          </p>
        </div>
      </section>

      {/* Courses */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c, i) => (
            <div key={i} className="group flex flex-col bg-white border border-neutral-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg hover:border-lime-300 transition-all">
              <div className="relative h-48 overflow-hidden bg-[#f3fae6]">
                <Image src={c.image} alt={c.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute left-3 top-3 text-xs font-bold text-lime-700 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full rtl:left-auto rtl:right-3">{c.level}</span>
                <span className="absolute right-3 top-3 text-xs font-bold text-neutral-700 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full rtl:right-auto rtl:left-3">{c.duration}</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-bold text-neutral-900 text-lg">{c.name}</h3>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{c.desc}</p>
                <div className="mt-auto flex items-center justify-between pt-5">
                  <span className="text-2xl font-extrabold text-neutral-900">{c.price}<span className="text-sm font-normal text-neutral-500"> {aed}</span></span>
                  <a
                    href={WHATSAPP_DIRECT}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-lime-400 to-lime-500 px-4 py-2.5 text-sm font-bold text-lime-950 shadow-sm transition hover:-translate-y-0.5"
                  >
                    {t(locale, 'Enroll now', 'سجّل الآن')} <ArrowRight className="size-4 rtl:rotate-180" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Perks */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PERKS.map((p) => (
            <div key={p} className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
              <span className="flex size-8 items-center justify-center rounded-full bg-lime-100 text-lime-700"><Check className="size-4" /></span>
              <span className="text-sm font-medium text-neutral-700">{p}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-lime-700 to-lime-900 py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white">{t(locale, 'Ready to start learning?', 'جاهز لتبدأ التعلّم؟')}</h2>
          <a
            href={WHATSAPP_DIRECT}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-base font-bold text-lime-800 shadow-lg transition hover:-translate-y-0.5"
          >
            {t(locale, 'Talk to an advisor', 'تحدّث إلى مستشار')} <ArrowRight className="size-5 rtl:rotate-180" />
          </a>
        </div>
      </section>
    </main>
  )
}
