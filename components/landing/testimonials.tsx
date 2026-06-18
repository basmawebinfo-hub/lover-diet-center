'use client'

import { Star, Quote } from 'lucide-react'
import { useLocale, t } from '@/lib/locale'

export function Testimonials() {
  const { locale } = useLocale()

  const testimonials = [
    {
      name: t(locale, 'Mariam A.', 'مريم ع.'),
      role: t(locale, 'Lost 14kg in 5 months', 'خسرت 14 كجم في 5 أشهر'),
      body: t(
        locale,
        'I tried three diet apps before LoverDiet and quit every time. The difference here is my nutritionist actually messages me back. The meal plan is realistic, the WhatsApp support is real, and the results showed up by week three.',
        'جرّبت ثلاثة تطبيقات حِمية قبل LoverDiet وتركتها كلها. الفرق هنا أن أخصائية التغذية ترد عليّ فعلاً. خطة الوجبات واقعية، والدعم عبر واتساب حقيقي، وظهرت النتائج بحلول الأسبوع الثالث.'
      ),
      rating: 5,
    },
    {
      name: t(locale, 'Ahmed K.', 'أحمد ك.'),
      role: t(locale, 'Gained 6kg lean mass', 'اكتسب 6 كجم كتلة صافية'),
      body: t(
        locale,
        'As a regular at the gym I thought I knew nutrition. Dr. Omar broke down what I was getting wrong about protein timing and showed me the data. Six months in I am bigger, leaner, and recovering faster.',
        'بصفتي مواظباً على الجيم، ظننت أنني أفهم التغذية. شرح لي د. عمر أخطائي في توقيت البروتين وأراني الأرقام. بعد ستة أشهر أصبحت أضخم وأنحف وأسرع في التعافي.'
      ),
      rating: 5,
    },
    {
      name: t(locale, 'Sara H.', 'سارة ح.'),
      role: t(locale, 'Resolved PCOS symptoms', 'تحسّنت أعراض تكيّس المبايض'),
      body: t(
        locale,
        'I came in for weight loss and left with a plan that fixed my sleep, my skin, and my cycle. The team looks at the whole body, not just the number on the scale. That is the difference.',
        'جئت لإنقاص الوزن وخرجت بخطة أصلحت نومي وبشرتي ودورتي الشهرية. الفريق ينظر إلى الجسم كاملاً، لا إلى رقم الميزان فقط. هذا هو الفرق.'
      ),
      rating: 5,
    },
  ]

  return (
    <section
      id="testimonials"
      className="scroll-mt-24 bg-white py-20 sm:py-28"
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-200 bg-lime-50/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-lime-700">
            {t(locale, 'Real Results', 'نتائج حقيقية')}
          </span>
          <h2
            id="testimonials-heading"
            className="mt-4 text-balance text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl"
          >
            {locale === 'ar' ? (
              <>ماذا يقول{' '}<span className="text-lime-600">أعضاؤنا فعلاً</span></>
            ) : (
              <>What our members{' '}<span className="text-lime-600">actually say</span></>
            )}
          </h2>
          <p className="mt-4 text-pretty text-neutral-600">
            {t(
              locale,
              'Thousands of real transformations, not stock photos. Every review below is from a verified LoverDiet member.',
              'آلاف التحوّلات الحقيقية، لا صوراً تجارية. كل رأي بالأسفل من عضو موثّق في LoverDiet.'
            )}
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure
              key={item.name}
              className="group flex flex-col rounded-3xl border border-lime-100/60 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <Quote
                className="size-8 text-lime-200 transition-colors group-hover:text-lime-300"
                aria-hidden="true"
              />
              <div
                className="mt-3 flex gap-0.5"
                aria-label={`${item.rating} / 5`}
              >
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <blockquote className="mt-4 grow text-pretty leading-relaxed text-neutral-700">
                {item.body}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-lime-50 pt-5">
                <div
                  className="flex size-10 items-center justify-center rounded-full bg-lime-100 text-sm font-semibold text-lime-700"
                  aria-hidden="true"
                >
                  {item.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {item.name}
                  </p>
                  <p className="text-xs text-neutral-500">{item.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Trust strip — single banner */}
        <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-3 rounded-2xl border border-lime-100 bg-white px-6 py-5 text-center shadow-sm sm:flex-row sm:gap-6 sm:text-start">
          <div className="flex -space-x-2 rtl:space-x-reverse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-lime-50 text-xs font-semibold text-lime-700"
                aria-hidden="true"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <p className="text-sm text-neutral-600">
            {locale === 'ar' ? (
              <><span className="font-semibold text-neutral-900">أكثر من 3,000 عضو</span>{' '}تحوّلوا مع LoverDiet — كن الفصل التالي.</>
            ) : (
              <><span className="font-semibold text-neutral-900">3,000+ members</span>{' '}have transformed with LoverDiet — join the next chapter.</>
            )}
          </p>
        </div>
      </div>
    </section>
  )
}
