import Image from 'next/image'
import { CheckCircle, Stethoscope, Star, Users, Award, Clock } from 'lucide-react'
import type { Metadata } from 'next'
import { BookConsultationButton } from '@/components/book-consultation-button'

export const metadata: Metadata = {
  title: 'Nutrition Consultations',
  description: 'One-on-one personalized nutrition consultations with certified dietitians at Lover Diet Center UAE. Book online inside your account.',
}

const features = [
  { en: 'Personalized meal plan tailored to your goals', ar: 'خطة وجبات مخصصة حسب أهدافك' },
  { en: 'BMI & body composition analysis', ar: 'تحليل مؤشر كتلة الجسم والتركيب الجسدي' },
  { en: 'Weekly follow-up sessions', ar: 'جلسات متابعة أسبوعية' },
  { en: 'Supplement & lifestyle guidance', ar: 'إرشادات المكملات الغذائية ونمط الحياة' },
  { en: '150+ certified nutritionists', ar: 'أكثر من 150 خبير تغذية معتمد' },
  { en: 'Online & in-clinic options', ar: 'خيارات عبر الإنترنت وفي العيادة' },
]

const STEPS = [
  { n: '1', en: 'Create your free account', ar: 'أنشئ حسابك المجاني', icon: Users },
  { n: '2', en: 'Pick a date & time that suits you', ar: 'اختر الموعد المناسب لك', icon: Clock },
  { n: '3', en: 'Meet your nutritionist & get your plan', ar: 'قابل أخصائي التغذية واحصل على خطتك', icon: Award },
]

const STATS = [
  { value: '3,000+', label: 'Happy Clients', labelAr: 'عميل سعيد' },
  { value: '150+', label: 'Certified Experts', labelAr: 'خبير معتمد' },
  { value: '96%', label: 'Success Rate', labelAr: 'معدل النجاح' },
  { value: '4.9', label: 'Rating', labelAr: 'تقييم', star: true },
]

export default function NutritionConsultationsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f3fae6] to-white px-4 pt-28 pb-20">
        <div className="absolute -top-24 right-10 -z-0 size-[420px] rounded-full bg-[radial-gradient(circle,rgba(168,219,46,0.35),rgba(234,255,176,0)_70%)] blur-md" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-4 py-2 text-sm font-semibold text-lime-700">
              <Stethoscope className="size-4" />
              Nutrition Consultations
            </div>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-neutral-900 md:text-5xl">
              Your Personal Nutrition Expert,{' '}
              <span className="text-lime-600">On Your Side</span>
            </h1>
            <p className="font-arabic mt-3 text-xl font-bold text-lime-700" dir="rtl">خبير التغذية الخاص بك، دائمًا بجانبك</p>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-neutral-600">
              Get a science-backed, personalized nutrition plan from certified dietitians.
              Book your session online — right inside your account, in a few clicks.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <BookConsultationButton type="consultation" label="Book a Consultation" />
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm text-neutral-500">
              <div className="flex">
                {[1,2,3,4,5].map((i) => <Star key={i} className="size-4 fill-amber-400 text-amber-400" />)}
              </div>
              <span><strong className="text-neutral-700">4.9</strong> from 2,000+ reviews</span>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] bg-lime-50 shadow-2xl shadow-lime-900/15 mx-auto">
              <Image src="/dr-wael.png" alt="Lead nutritionist at Lover Diet Center" fill priority sizes="(min-width:1024px) 420px, 100vw" className="object-cover object-top" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-neutral-100 bg-white py-10 px-4">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl font-extrabold text-lime-600 sm:text-3xl">{s.value}</span>
                {s.star && <Star className="size-5 fill-amber-400 text-amber-400" />}
              </div>
              <p className="mt-1 text-sm font-medium text-neutral-500">{s.label}</p>
              <p className="font-arabic text-xs text-neutral-400" dir="rtl">{s.labelAr}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-neutral-900 sm:text-3xl">How booking works</h2>
          <p className="font-arabic mt-2 text-center text-neutral-500" dir="rtl">كيف يتم الحجز</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.n} className="relative rounded-3xl border border-neutral-100 bg-white p-6 text-center shadow-sm">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-lime-100 text-lime-700">
                    <Icon className="size-6" />
                  </div>
                  <span className="absolute right-5 top-5 text-3xl font-extrabold text-lime-100">{s.n}</span>
                  <p className="mt-4 font-semibold text-neutral-800">{s.en}</p>
                  <p className="font-arabic mt-1 text-sm text-neutral-500" dir="rtl">{s.ar}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#f9fcef] py-16 px-4">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold text-neutral-900 sm:text-3xl">
            What&apos;s included in every consultation
          </h2>
          <p className="font-arabic mt-2 text-center text-neutral-500" dir="rtl">ما الذي تتضمنه كل استشارة</p>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
                <CheckCircle className="mt-0.5 size-5 shrink-0 text-lime-600" />
                <div>
                  <p className="font-semibold text-neutral-800">{f.en}</p>
                  <p className="font-arabic mt-0.5 text-sm text-neutral-500" dir="rtl">{f.ar}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-lime-700 to-lime-900 py-16 px-4 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-white">Ready to start your journey?</h2>
          <p className="font-arabic mt-2 text-lg text-lime-100" dir="rtl">جاهز تبدأ رحلتك؟</p>
          <p className="mt-2 text-white/80">Join 3,000+ members who transformed their health with Lover Diet Center.</p>
          <div className="mt-8 flex justify-center">
            <BookConsultationButton type="consultation" variant="light" label="Book Your Session Now" />
          </div>
        </div>
      </section>
    </main>
  )
}
