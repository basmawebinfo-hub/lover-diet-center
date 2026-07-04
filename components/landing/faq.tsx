'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { t, type Locale } from '@/lib/locale-shared'

export function FAQ({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState<number | null>(0)

  const faqs = [
    {
      q: t(locale, 'Do I need to come to the center, or can I do everything online?', 'هل يجب أن أحضر إلى المركز، أم يمكنني فعل كل شيء عبر الإنترنت؟'),
      a: t(
        locale,
        'Both work. Most of our members do the full program online via WhatsApp and video calls. If you are in the UAE you can also book in-person sessions at our center — we will help you choose what fits your schedule.',
        'الخياران متاحان. معظم أعضائنا ينجزون البرنامج كاملاً عبر الإنترنت من خلال واتساب ومكالمات الفيديو. وإن كنت في الإمارات، يمكنك أيضاً حجز جلسات حضورية في مركزنا — وسنساعدك على اختيار ما يناسب جدولك.'
      ),
    },
    {
      q: t(locale, 'How quickly will I see results?', 'ما السرعة التي سأرى بها النتائج؟'),
      a: t(
        locale,
        'Most members see measurable changes in the first 2-3 weeks: more energy, better sleep, reduced bloating. Visible body composition changes typically show by week 4. We track progress with photos, measurements, and weekly check-ins so the results are visible to you in real time.',
        'يلاحظ معظم الأعضاء تغيّرات ملموسة خلال أول 2-3 أسابيع: طاقة أكبر، ونوم أفضل، وانتفاخ أقل. وتظهر تغيّرات تكوين الجسم عادةً بحلول الأسبوع الرابع. نتابع تقدّمك بالصور والقياسات والمتابعات الأسبوعية لتكون النتائج واضحة أمامك لحظة بلحظة.'
      ),
    },
    {
      q: t(locale, 'Are the meal plans customized to my dietary needs?', 'هل خطط الوجبات مخصصة لاحتياجاتي الغذائية؟'),
      a: t(
        locale,
        'Yes — every plan is built from your assessment. We cover balanced, keto, vegetarian, vegan, low-carb, high-protein, halal, and common allergy restrictions. Tell us what you do not eat and we will design around it.',
        'نعم — كل خطة تُبنى من تقييمك. نغطّي الأنظمة المتوازنة والكيتو والنباتي والنباتي الصرف وقليل الكربوهيدرات وعالي البروتين والحلال، ومعظم قيود الحساسية الشائعة. أخبرنا بما لا تأكله وسنصمّم الخطة حوله.'
      ),
    },
    {
      q: t(locale, 'How is LoverDiet different from a diet app?', 'كيف يختلف LoverDiet عن تطبيقات الحِمية؟'),
      a: t(
        locale,
        'An app gives you a template. We give you a certified human nutritionist who knows your name, your goals, and your weak spots. They adjust your plan weekly based on what is actually happening in your body, not what a generic algorithm assumes.',
        'التطبيق يعطيك قالباً جاهزاً. أما نحن فنمنحك أخصائي تغذية بشرياً معتمداً يعرف اسمك وأهدافك ونقاط ضعفك، ويعدّل خطتك أسبوعياً بناءً على ما يحدث فعلاً في جسمك، لا على افتراضات خوارزمية عامة.'
      ),
    },
    {
      q: t(locale, 'What does the body sculpting program include?', 'ماذا يتضمّن برنامج نحت الجسم؟'),
      a: t(
        locale,
        'Non-invasive fat reduction sessions combined with a tailored nutrition plan and measurement tracking. Each program is customized after an initial assessment — most members see visible changes in measurements within 4 weeks.',
        'جلسات تكسير دهون غير جراحية مع خطة تغذية مخصّصة ومتابعة للقياسات. يُصمَّم كل برنامج بعد تقييم مبدئي — ويرى معظم الأعضاء تغيّرات ملموسة في القياسات خلال 4 أسابيع.'
      ),
    },
    {
      q: t(locale, 'Is there a refund policy?', 'هل توجد سياسة لاسترداد المبلغ؟'),
      a: t(
        locale,
        'Yes. If you are not satisfied after your first consultation, we refund 100% of what you paid. We want you to commit because the program works — not because you are locked in.',
        'نعم. إن لم تكن راضياً بعد استشارتك الأولى، نعيد لك 100% مما دفعته. نريدك أن تلتزم لأن البرنامج ينجح — لا لأنك مقيّد.'
      ),
    },
  ]

  return (
    <section
      id="faq"
      className="scroll-mt-24 bg-white py-20 sm:py-28"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-200 bg-lime-50/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-lime-700">
            {t(locale, 'FAQ', 'الأسئلة الشائعة')}
          </span>
          <h2
            id="faq-heading"
            className="mt-4 text-balance text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl"
          >
            {locale === 'ar' ? (
              <>أسئلة،{' '}<span className="text-lime-600">بإجابات صادقة</span></>
            ) : (
              <>Questions,{' '}<span className="text-lime-600">answered honestly</span></>
            )}
          </h2>
          <p className="mt-4 text-pretty text-neutral-600">
            {t(
              locale,
              'Everything we get asked most often. If yours is not here, message us on WhatsApp — we read every one.',
              'أكثر ما يُسأل عنه. وإن لم يكن سؤالك هنا، راسلنا على واتساب — نقرأ كل رسالة.'
            )}
          </p>
        </div>

        <ul className="mt-12 space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i
            return (
              <li
                key={i}
                className="overflow-hidden rounded-2xl border border-lime-100/60 bg-white shadow-sm transition-colors hover:border-lime-200"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start sm:px-6 sm:py-5"
                >
                  <span className="text-base font-semibold text-neutral-900 sm:text-lg">
                    {item.q}
                  </span>
                  <span
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors',
                      isOpen
                        ? 'border-lime-200 bg-lime-50 text-lime-700'
                        : 'border-neutral-200 text-neutral-500',
                    )}
                    aria-hidden="true"
                  >
                    {isOpen ? (
                      <Minus className="size-4" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                  </span>
                </button>
                <div
                  id={`faq-panel-${i}`}
                  className={cn(
                    'grid transition-all duration-300 ease-out',
                    isOpen
                      ? 'grid-rows-[1fr] opacity-100'
                      : 'grid-rows-[0fr] opacity-0',
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-pretty leading-relaxed text-neutral-600 sm:px-6 sm:pb-6">
                      {item.a}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
