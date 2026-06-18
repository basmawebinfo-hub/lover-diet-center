"use client"

import Image from 'next/image'
import { CheckCircle, Stethoscope, Star, Users, Award, Clock, MessageCircle } from 'lucide-react'
import { BookConsultationButton } from '@/components/book-consultation-button'
import { WHATSAPP_SUPPORT } from '@/lib/site'
import { useLocale, t } from '@/lib/locale'

export function NutritionConsultationsContent() {
  const { locale } = useLocale()

  const features = [
    t(locale, 'Personalized meal plan tailored to your goals', 'خطة وجبات مخصصة حسب أهدافك'),
    t(locale, 'BMI & body composition analysis', 'تحليل مؤشر كتلة الجسم والتركيب الجسدي'),
    t(locale, 'Weekly follow-up sessions', 'جلسات متابعة أسبوعية'),
    t(locale, 'Supplement & lifestyle guidance', 'إرشادات المكمّلات الغذائية ونمط الحياة'),
    t(locale, '150+ certified nutritionists', 'أكثر من 150 أخصائي تغذية معتمد'),
    t(locale, 'Online & in-clinic options', 'خيارات عبر الإنترنت وفي العيادة'),
  ]

  const STEPS = [
    { n: '1', label: t(locale, 'Create your free account', 'أنشئ حسابك المجاني'), icon: Users },
    { n: '2', label: t(locale, 'Pick a date & time that suits you', 'اختر الموعد المناسب لك'), icon: Clock },
    { n: '3', label: t(locale, 'Meet your nutritionist & get your plan', 'قابل أخصائي التغذية واحصل على خطتك'), icon: Award },
  ]

  const STATS = [
    { value: '3,000+', label: t(locale, 'Happy Clients', 'عميل سعيد') },
    { value: '150+',   label: t(locale, 'Certified Experts', 'خبير معتمد') },
    { value: '96%',    label: t(locale, 'Success Rate', 'معدل النجاح') },
    { value: '4.9',    label: t(locale, 'Rating', 'التقييم'), star: true },
  ]

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f3fae6] to-white px-4 pt-28 pb-20">
        <div className="absolute -top-24 right-10 -z-0 size-[420px] rounded-full bg-[radial-gradient(circle,rgba(168,219,46,0.35),rgba(234,255,176,0)_70%)] blur-md" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-4 py-2 text-sm font-semibold text-lime-700">
              <Stethoscope className="size-4" />
              {t(locale, 'Nutrition Consultations', 'الاستشارات الغذائية')}
            </div>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-neutral-900 md:text-5xl">
              {locale === 'ar' ? (
                <>خبير التغذية الخاص بك،{' '}<span className="text-lime-600">دائماً بجانبك</span></>
              ) : (
                <>Your Personal Nutrition Expert,{' '}<span className="text-lime-600">On Your Side</span></>
              )}
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-neutral-600">
              {t(
                locale,
                'Get a science-backed, personalized nutrition plan from certified dietitians. Book your session online — right inside your account, in a few clicks.',
                'احصل على خطة تغذية مخصّصة مدعومة علمياً من أخصائيي تغذية معتمدين. احجز جلستك عبر الإنترنت — من داخل حسابك مباشرة، بنقرات قليلة.'
              )}
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <BookConsultationButton type="consultation" label={t(locale, 'Book a Consultation', 'احجز استشارة')} />
              <a
                href={WHATSAPP_SUPPORT}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-6 py-4 text-base font-semibold text-neutral-700 transition hover:border-lime-300 hover:text-neutral-900"
              >
                <MessageCircle className="size-5 text-lime-600" />
                {t(locale, 'Have a question?', 'لديك سؤال؟')}
              </a>
            </div>
            <p className="mt-2 text-xs text-neutral-400">
              {t(locale, 'Booking happens inside your account. WhatsApp is for questions & support only.', 'يتم الحجز من داخل حسابك. واتساب للأسئلة والدعم فقط.')}
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm text-neutral-500">
              <div className="flex">
                {[1,2,3,4,5].map((i) => <Star key={i} className="size-4 fill-amber-400 text-amber-400" />)}
              </div>
              <span><strong className="text-neutral-700">4.9</strong> {t(locale, 'from 2,000+ reviews', 'من أكثر من 2,000 تقييم')}</span>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] bg-lime-50 shadow-2xl shadow-lime-900/15 mx-auto">
              <Image src="/dr-wael.png" alt={t(locale, 'Lead nutritionist at Lover Diet Center', 'كبير أخصائيي التغذية في Lover Diet Center')} fill priority sizes="(min-width:1024px) 420px, 100vw" className="object-cover object-top" />
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
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-neutral-900 sm:text-3xl">{t(locale, 'How booking works', 'كيف يتم الحجز')}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {STEPS.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.n} className="relative rounded-3xl border border-neutral-100 bg-white p-6 text-center shadow-sm">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-lime-100 text-lime-700">
                    <Icon className="size-6" />
                  </div>
                  <span className="absolute right-5 top-5 text-3xl font-extrabold text-lime-100 rtl:right-auto rtl:left-5">{s.n}</span>
                  <p className="mt-4 font-semibold text-neutral-800">{s.label}</p>
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
            {t(locale, "What's included in every consultation", 'ما الذي تتضمّنه كل استشارة')}
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
                <CheckCircle className="mt-0.5 size-5 shrink-0 text-lime-600" />
                <div>
                  <p className="font-semibold text-neutral-800">{f}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-lime-700 to-lime-900 py-16 px-4 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-white">{t(locale, 'Ready to start your journey?', 'جاهز لتبدأ رحلتك؟')}</h2>
          <p className="mt-2 text-white/80">{t(locale, 'Join 3,000+ members who transformed their health with Lover Diet Center.', 'انضم إلى أكثر من 3,000 عضو غيّروا صحتهم مع Lover Diet Center.')}</p>
          <div className="mt-8 flex justify-center">
            <BookConsultationButton type="consultation" variant="light" label={t(locale, 'Book Your Session Now', 'احجز جلستك الآن')} />
          </div>
        </div>
      </section>
    </main>
  )
}
