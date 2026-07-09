import { Star, Quote } from 'lucide-react'
import { t, type Locale } from '@/lib/locale-shared'

// Premium testimonials — real customer reviews.
// Mobile: horizontal snap slider. Desktop: 3-column grid.
// Arabic-first copy with English translations to preserve localization.

export function Testimonials({ locale }: { locale: Locale }) {
  const testimonials = [
    {
      name: t(locale, 'Eman', 'إيمان'),
      body: t(
        locale,
        'The healthy meals are wonderful, along with Dr. Wael\u2019s consultation. I managed to lose 4 kg in a single month. The team is very respectful and the follow-up was excellent.',
        'جميل جداً الوجبات الصحية بالإضافة إلى استشارة دكتور وائل. تمكنت من خسارة 4 كيلو خلال شهر واحد. الفريق محترم جداً والمتابعة كانت ممتازة.'
      ),
    },
    {
      name: t(locale, 'Ahmed', 'أحمد'),
      body: t(
        locale,
        'In five months I lost 25 kg. I started at 102 kg and reached 77. The structure and consistent follow-up were the reason for my success.',
        'خلال خمسة أشهر خسرت 25 كيلو. بدأت من 102 كيلو ووصلت إلى 77. التنظيم والمتابعة كانوا سبب النجاح.'
      ),
    },
    {
      name: t(locale, 'A center client', 'إحدى عميلات المركز'),
      body: t(
        locale,
        'The best nutrition center in Umm Al Quwain. High professionalism, excellent service, and genuine care for every client.',
        'أفضل مركز تغذية في أم القيوين. احترافية عالية، خدمة ممتازة، واهتمام حقيقي بكل عميل.'
      ),
    },
    {
      name: t(locale, 'Fatima Al Shehhi', 'فاطمة الشحي'),
      body: t(
        locale,
        'I thank the team for their honesty and kind treatment. I noticed a clear improvement in my weight and commitment throughout the program.',
        'أشكر الفريق على المصداقية وحسن التعامل. لاحظت تحسنًا واضحًا في الوزن والالتزام طوال البرنامج.'
      ),
    },
    {
      name: t(locale, 'Maha', 'مها'),
      body: t(
        locale,
        'My experience with Lovers Diet Center was wonderful from start to finish. The meals are delicious, precisely calculated, and the medical follow-up is continuous. I lost 15 kg, and I recommend anyone to start their health journey with them.',
        'تجربتي مع Lovers Diet Center كانت رائعة من البداية للنهاية. الوجبات لذيذة، محسوبة بدقة، والمتابعة الطبية مستمرة. استطعت خسارة 15 كيلو، وأنصح أي شخص يبدأ رحلته الصحية معهم.'
      ),
    },
    {
      name: t(locale, 'Aisha Al Shehhi', 'عائشة الشحي'),
      body: t(
        locale,
        'I thank the center for their care and continuous follow-up. The results were clear, and the experience is worth the trust.',
        'أشكر المركز على الاهتمام والمتابعة المستمرة. النتائج كانت واضحة، والتجربة تستحق الثقة.'
      ),
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
              <>ماذا يقول{' '}<span className="text-lime-600">عملاؤنا فعلاً</span></>
            ) : (
              <>What our clients{' '}<span className="text-lime-600">actually say</span></>
            )}
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-neutral-600">
            {t(
              locale,
              'Real transformations from real clients. Every review below is from a verified Lovers Diet Center customer.',
              'تحوّلات حقيقية من عملاء حقيقيين. كل رأي بالأسفل من عميل موثّق في Lovers Diet Center.'
            )}
          </p>
        </div>

        {/* Mobile: snap slider · Desktop: 3-col grid */}
        <div
          className="mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0 [-webkit-overflow-scrolling:touch]"
          role="list"
          aria-label={t(locale, 'Customer testimonials', 'آراء العملاء')}
        >
          {testimonials.map((item) => (
            <figure
              key={item.name}
              role="listitem"
              className="group relative flex w-[85%] shrink-0 snap-center flex-col rounded-3xl border border-lime-100/70 bg-gradient-to-b from-white to-lime-50/30 p-7 shadow-[0_2px_20px_-4px_rgba(132,204,22,0.12)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_36px_-8px_rgba(132,204,22,0.22)] sm:w-[60%] md:w-auto md:shrink"
            >
              {/* Large decorative quotation mark */}
              <Quote
                className="absolute top-6 size-14 -scale-x-100 text-lime-100 transition-colors duration-300 group-hover:text-lime-200 ltr:right-6 rtl:left-6 rtl:scale-x-100"
                aria-hidden="true"
              />

              {/* Five-star rating */}
              <div className="flex gap-1" role="img" aria-label={t(locale, '5 out of 5 stars', '5 من 5 نجوم')}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4.5 fill-amber-400 text-amber-400 transition-transform duration-300 group-hover:scale-110"
                    style={{ transitionDelay: `${i * 40}ms` }}
                    aria-hidden="true"
                  />
                ))}
              </div>

              <blockquote className="relative mt-5 grow text-pretty leading-relaxed text-neutral-700">
                {item.body}
              </blockquote>

              <figcaption className="mt-6 flex items-center gap-3 border-t border-lime-100/60 pt-5">
                {/* Avatar placeholder — initials */}
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lime-100 to-emerald-100 text-base font-bold text-lime-700 ring-2 ring-white shadow-sm"
                  aria-hidden="true"
                >
                  {item.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">{item.name}</p>
                  <p className="text-xs font-medium text-lime-600">
                    {t(locale, 'Verified client', 'عميل موثّق')}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Trust strip */}
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
              <><span className="font-semibold text-neutral-900">أكثر من 3,000 عميل</span>{' '}تحوّلوا مع Lovers Diet Center — كن الفصل التالي.</>
            ) : (
              <><span className="font-semibold text-neutral-900">3,000+ clients</span>{' '}have transformed with Lovers Diet Center — join the next chapter.</>
            )}
          </p>
        </div>
      </div>
    </section>
  )
}
