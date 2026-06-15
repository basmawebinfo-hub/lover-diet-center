import Link from 'next/link'
import Image from 'next/image'
import { WHATSAPP_DIRECT } from '@/lib/site'
import { ArrowRight, GraduationCap, Check } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Training Courses',
  description: 'Online and in-person nutrition, fitness, and healthy-lifestyle courses with certificates from Lover Diet Center.',
}

const courses = [
  {
    nameEn: 'Nutrition Fundamentals',
    nameAr: 'أساسيات التغذية',
    descEn: 'Learn how macros, calories, and meal timing actually work — build plans with confidence.',
    descAr: 'تعلّم كيف تعمل الماكروز والسعرات وتوقيت الوجبات، وابنِ خططك بثقة.',
    level: 'Beginner', duration: '4 weeks', price: 499,
    image: '/course-nutrition.png',
  },
  {
    nameEn: 'Fitness & Body Coaching',
    nameAr: 'اللياقة وتدريب الجسم',
    descEn: 'Training programming, progressive overload, and recovery for real, lasting results.',
    descAr: 'برمجة التمارين والحِمل التدريجي والاستشفاء لنتائج حقيقية ودائمة.',
    level: 'Intermediate', duration: '6 weeks', price: 699,
    image: '/course-fitness.png',
  },
  {
    nameEn: 'Healthy Lifestyle Mastery',
    nameAr: 'إتقان نمط الحياة الصحي',
    descEn: 'Habits, sleep, stress, and sustainable eating — change your lifestyle for good.',
    descAr: 'العادات والنوم والتوتر والأكل المستدام، غيّر نمط حياتك للأبد.',
    level: 'All levels', duration: '8 weeks', price: 899,
    image: '/course-lifestyle.png',
  },
]

const PERKS = [
  'Certificate of completion',
  'Lifetime access to materials',
  'Live Q&A with certified experts',
  'Arabic & English support',
]

export default function TrainingCoursesPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#f3fae6] to-white py-20 px-4 pt-28">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-lime-100 text-lime-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <GraduationCap className="w-4 h-4" />
            Training Courses
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-neutral-900">
            Learn from <span className="text-lime-600">certified experts</span>
          </h1>
          <p className="font-arabic text-xl font-bold text-lime-700 mt-3" dir="rtl">تعلّم من خبراء معتمدين</p>
          <p className="mt-5 max-w-2xl mx-auto text-neutral-500 leading-relaxed">
            Specialized online and in-person programs — from beginner to advanced — to master nutrition,
            fitness, and a healthy lifestyle. Every course ends with a certificate.
          </p>
        </div>
      </section>

      {/* Courses */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c, i) => (
            <div key={i} className="group flex flex-col bg-white border border-neutral-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg hover:border-lime-300 transition-all">
              <div className="relative h-48 overflow-hidden bg-[#f3fae6]">
                <Image src={c.image} alt={c.nameEn} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute left-3 top-3 text-xs font-bold text-lime-700 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full">{c.level}</span>
                <span className="absolute right-3 top-3 text-xs font-bold text-neutral-700 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full">{c.duration}</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-bold text-neutral-900 text-lg">{c.nameEn}</h3>
                <p className="font-arabic text-sm text-neutral-500" dir="rtl">{c.nameAr}</p>
                <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{c.descEn}</p>
                <p className="font-arabic mt-1 text-sm text-neutral-500 leading-relaxed" dir="rtl">{c.descAr}</p>
                <div className="mt-auto flex items-center justify-between pt-5">
                  <span className="text-2xl font-extrabold text-neutral-900">{c.price}<span className="text-sm font-normal text-neutral-500"> AED</span></span>
                  <a
                    href={WHATSAPP_DIRECT}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-lime-400 to-lime-500 px-4 py-2.5 text-sm font-bold text-lime-950 shadow-sm transition hover:-translate-y-0.5"
                  >
                    Enroll now <ArrowRight className="size-4" />
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
          <h2 className="text-3xl font-bold text-white">Ready to start learning?</h2>
          <p className="font-arabic text-lime-100 mt-2 text-lg" dir="rtl">جاهز تبدأ التعلّم؟</p>
          <a
            href={WHATSAPP_DIRECT}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-base font-bold text-lime-800 shadow-lg transition hover:-translate-y-0.5"
          >
            Talk to an advisor <ArrowRight className="size-5" />
          </a>
        </div>
      </section>
    </main>
  )
}
