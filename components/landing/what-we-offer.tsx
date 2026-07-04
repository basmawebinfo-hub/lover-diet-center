import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Stethoscope, UtensilsCrossed, Cookie, Activity, GraduationCap } from 'lucide-react'
import { t, type Locale } from '@/lib/locale'

export function WhatWeOffer({ locale }: { locale: Locale }) {

  const SERVICES = [
    {
      icon: Stethoscope,
      title: t(locale, 'Nutrition Consultations', 'الاستشارات الغذائية'),
      desc: t(
        locale,
        'One-on-one sessions with certified nutritionists. Get a plan built around your body, goals, and lifestyle.',
        'جلسات فردية مع أخصائيي تغذية معتمدين. احصل على خطة مبنية على جسمك وأهدافك ونمط حياتك.'
      ),
      href: '/nutrition-consultations',
      tag: t(locale, 'Most Popular', 'الأكثر طلباً'),
      image: '/course-nutrition.png',
    },
    {
      icon: UtensilsCrossed,
      title: t(locale, 'Healthy Meals', 'الوجبات الصحية'),
      desc: t(
        locale,
        'Chef-prepared, macro-balanced meals delivered fresh to your door across the UAE.',
        'وجبات يحضّرها الطهاة، متوازنة العناصر، وتصلك طازجة إلى باب منزلك في مختلف أنحاء الإمارات.'
      ),
      href: '/healthy-meals',
      image: '/meal-bowl.png',
    },
    {
      icon: Cookie,
      title: t(locale, 'Healthy Snacks', 'السناكس الصحية'),
      desc: t(
        locale,
        'Protein bars, nuts, dried fruits, and certified supplements — all curated by our nutrition team.',
        'ألواح بروتين، ومكسرات، وفواكه مجففة، ومكمّلات معتمدة — منتقاة بعناية من فريق التغذية لدينا.'
      ),
      href: '/healthy-snacks',
      image: '/snack-nuts.png',
    },
    {
      icon: Activity,
      title: t(locale, 'Body Sculpting', 'نحت الجسم'),
      desc: t(
        locale,
        'Non-invasive fat reduction sessions with visible results in measurements from the first session.',
        'جلسات تكسير دهون غير جراحية بنتائج ملموسة في القياسات من الجلسة الأولى.'
      ),
      href: '/body-sculpting',
      image: '/body-sculpting.png',
    },
    {
      icon: GraduationCap,
      title: t(locale, 'Training Courses', 'الدورات التدريبية'),
      desc: t(
        locale,
        'Online and in-person programs from beginner to advanced — with certificates.',
        'برامج عبر الإنترنت وحضورياً من المبتدئ إلى المتقدّم — مع شهادات معتمدة.'
      ),
      href: '/training-courses',
      image: '/course-fitness.png',
    },
  ]

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-200 bg-lime-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-lime-700">
            {t(locale, 'Our Services', 'خدماتنا')}
          </span>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            {locale === 'ar' ? (
              <>كل ما تحتاجه،{' '}<span className="text-lime-600">في مكان واحد</span></>
            ) : (
              <>Everything you need,{' '}<span className="text-lime-600">in one place</span></>
            )}
          </h2>
          <p className="mt-4 text-pretty text-neutral-500">
            {t(
              locale,
              'From your first consultation to your daily meals — we cover every part of your health journey.',
              'من استشارتك الأولى إلى وجباتك اليومية — نغطّي كل جزء من رحلتك الصحية.'
            )}
          </p>
        </div>

        {/* Services grid */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SERVICES.map((service) => {
            const Icon = service.icon
            return (
              <Link
                key={service.href}
                href={service.href}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-lime-200 hover:shadow-xl hover:shadow-lime-900/8"
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden bg-lime-50">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                  {/* Tag */}
                  {service.tag && (
                    <span className="absolute left-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-sm rtl:left-auto rtl:right-4">
                      {service.tag}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-lime-50 text-lime-600 transition-colors group-hover:bg-lime-100">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900">{service.title}</h3>
                    </div>
                  </div>

                  <p className="mt-3 flex-1 text-sm leading-relaxed text-neutral-500">
                    {service.desc}
                  </p>

                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-lime-600 transition-colors group-hover:text-lime-700">
                    {t(locale, 'Learn more', 'اعرف المزيد')}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
