'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    q: 'Do I need to come to the center, or can I do everything online?',
    a: 'Both work. Most of our members do the full program online via WhatsApp and video calls. If you are in the UAE you can also book in-person sessions at our center — we will help you choose what fits your schedule.',
  },
  {
    q: 'How quickly will I see results?',
    a: 'Most members see measurable changes in the first 2-3 weeks: more energy, better sleep, reduced bloating. Visible body composition changes typically show by week 4. We track progress with photos, measurements, and weekly check-ins so the results are visible to you in real time.',
  },
  {
    q: 'Are the meal plans customized to my dietary needs?',
    a: 'Yes — every plan is built from your assessment. We cover balanced, keto, vegetarian, vegan, low-carb, high-protein, halal, and common allergy restrictions. Tell us what you do not eat and we will design around it.',
  },
  {
    q: 'How is LoverDiet different from a diet app?',
    a: 'An app gives you a template. We give you a certified human nutritionist who knows your name, your goals, and your weak spots. They adjust your plan weekly based on what is actually happening in your body, not what a generic algorithm assumes.',
  },
  {
    q: 'What does the body sculpting program include?',
    a: 'Non-invasive fat reduction sessions combined with a tailored nutrition plan and measurement tracking. Each program is customized after an initial assessment — most members see visible changes in measurements within 4 weeks.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'Yes. If you are not satisfied after your first consultation, we refund 100% of what you paid. We want you to commit because the program works — not because you are locked in.',
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section
      id="faq"
      className="scroll-mt-24 bg-white py-20 sm:py-28"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-700">
            FAQ
          </span>
          <h2
            id="faq-heading"
            className="mt-4 text-balance text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl"
          >
            Questions,{' '}
            <span className="text-teal-600">answered honestly</span>
          </h2>
          <p className="mt-4 text-pretty text-neutral-600">
            Everything we get asked most often. If yours is not here, message
            us on WhatsApp — we read every one.
          </p>
        </div>

        <ul className="mt-12 space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i
            return (
              <li
                key={item.q}
                className="overflow-hidden rounded-2xl border border-teal-100/60 bg-white shadow-sm transition-colors hover:border-teal-200"
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
                        ? 'border-teal-200 bg-teal-50 text-teal-700'
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
