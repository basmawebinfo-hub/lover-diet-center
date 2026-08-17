'use client'

import { ShieldCheck, HeartPulse } from 'lucide-react'
import { useLocale, t } from '@/lib/locale'
import { PRIVACY_SECTIONS, PRIVACY_LAST_UPDATED } from '@/lib/legal'

export function PrivacyContent() {
  const { locale } = useLocale()
  const ar = locale === 'ar'

  const updated = new Date(PRIVACY_LAST_UPDATED).toLocaleDateString(
    ar ? 'ar-AE' : 'en-GB',
    { year: 'numeric', month: 'long', day: 'numeric' },
  )

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-[#f0faf7] to-white px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#4d7c0f]/10 px-4 py-2 text-sm font-semibold text-[#4d7c0f]">
            <ShieldCheck className="size-4" aria-hidden="true" />
            {t(locale, 'Privacy Policy', 'سياسة الخصوصية')}
          </div>
          <h1 className="text-3xl font-bold leading-tight text-neutral-900 md:text-4xl">
            {t(locale, 'How we handle your data', 'كيف نتعامل مع بياناتك')}
          </h1>
          <p className="mt-4 text-neutral-600">
            {t(
              locale,
              'We hold health information about you. This page says exactly what we collect, why, who else sees it, and what you can ask us to do with it — in plain language.',
              'نحتفظ بمعلومات صحية عنك. هذه الصفحة تقول بالضبط ما الذي نجمعه ولماذا ومن غيرنا يطّلع عليه وما الذي يمكنك مطالبتنا بفعله — بلغة واضحة.',
            )}
          </p>
          <p className="mt-4 text-sm text-neutral-500">
            {t(locale, 'Last updated', 'آخر تحديث')}: <time dateTime={PRIVACY_LAST_UPDATED}>{updated}</time>
          </p>
        </div>
      </section>

      {/* The health-data section is the one that actually matters here, so it
          gets pulled out of the flow rather than buried at number two. */}
      <section className="px-4 pt-12">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#4d7c0f]/20 bg-[#f7fcef] p-6">
          <p className="flex items-center gap-2 font-bold text-[#3f6a0c]">
            <HeartPulse className="size-5" aria-hidden="true" />
            {t(locale, 'In short', 'باختصار')}
          </p>
          <p className="mt-2 text-neutral-700">
            {t(
              locale,
              'Your weight, measurements and any conditions or allergies you share are used to build your plan and for nothing else. We never sell them, never use them for advertising, and never share them outside the providers listed below.',
              'وزنك وقياساتك وأي حالات أو حساسية تشاركها تُستخدم لبناء خطتك ولا شيء غير ذلك. لا نبيعها أبدًا، ولا نستخدمها في الإعلانات، ولا نشاركها خارج المزوّدين المذكورين أدناه.',
            )}
          </p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-3xl">
          {/* Contents */}
          <nav aria-label={t(locale, 'Contents', 'المحتويات')} className="mb-10 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
              {t(locale, 'Contents', 'المحتويات')}
            </p>
            <ol className="grid gap-1.5 sm:grid-cols-2">
              {PRIVACY_SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="flex gap-2 text-sm text-neutral-600 transition-colors hover:text-[#4d7c0f] focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
                  >
                    <span className="tabular-nums text-neutral-400">{i + 1}.</span>
                    {ar ? s.titleAr : s.titleEn}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="space-y-12">
            {PRIVACY_SECTIONS.map((s) => {
              const rows = ar ? s.rowsAr : s.rowsEn
              return (
                <article key={s.id} id={s.id} className="scroll-mt-24">
                  <h2 className="mb-3 text-xl font-bold text-neutral-900">
                    {ar ? s.titleAr : s.titleEn}
                  </h2>
                  <div className="space-y-3">
                    {(ar ? s.bodyAr : s.bodyEn).map((p, i) => (
                      <p key={i} className="leading-relaxed text-neutral-600">{p}</p>
                    ))}
                  </div>

                  {rows && (
                    <dl className="mt-5 divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-100">
                      {rows.map(([term, def]) => (
                        <div key={term} className="grid gap-1 p-4 sm:grid-cols-[10rem_1fr] sm:gap-4">
                          <dt className="text-sm font-bold text-neutral-900">{term}</dt>
                          <dd className="text-sm leading-relaxed text-neutral-600">{def}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}
