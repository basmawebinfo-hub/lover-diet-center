import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Mariam A.',
    role: 'Lost 14kg in 5 months',
    body: 'I tried three diet apps before LoverDiet and quit every time. The difference here is my nutritionist actually messages me back. The meal plan is realistic, the WhatsApp support is real, and the results showed up by week three.',
    rating: 5,
  },
  {
    name: 'Ahmed K.',
    role: 'Gained 6kg lean mass',
    body: 'As a regular at the gym I thought I knew nutrition. Dr. Omar broke down what I was getting wrong about protein timing and showed me the data. Six months in I am bigger, leaner, and recovering faster.',
    rating: 5,
  },
  {
    name: 'Sara H.',
    role: 'Resolved PCOS symptoms',
    body: 'I came in for weight loss and left with a plan that fixed my sleep, my skin, and my cycle. The team looks at the whole body, not just the number on the scale. That is the difference.',
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="scroll-mt-24 bg-white py-20 sm:py-28"
      aria-labelledby="testimonials-heading"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-200 bg-lime-50/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-lime-700">
            Real Results
          </span>
          <h2
            id="testimonials-heading"
            className="mt-4 text-balance text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl"
          >
            What our members{' '}
            <span className="text-lime-600">actually say</span>
          </h2>
          <p className="mt-4 text-pretty text-neutral-600">
            Thousands of real transformations, not stock photos. Every review
            below is from a verified LoverDiet member.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="group flex flex-col rounded-3xl border border-lime-100/60 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <Quote
                className="size-8 text-lime-200 transition-colors group-hover:text-lime-300"
                aria-hidden="true"
              />
              <div
                className="mt-3 flex gap-0.5"
                aria-label={`${t.rating} out of 5 stars`}
              >
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <blockquote className="mt-4 grow text-pretty leading-relaxed text-neutral-700">
                {t.body}
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-lime-50 pt-5">
                <div
                  className="flex size-10 items-center justify-center rounded-full bg-lime-100 text-sm font-semibold text-lime-700"
                  aria-hidden="true"
                >
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    {t.name}
                  </p>
                  <p className="text-xs text-neutral-500">{t.role}</p>
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
            <span className="font-semibold text-neutral-900">25,000+ members</span>{' '}
            have transformed with LoverDiet — join the next chapter.
          </p>
        </div>
      </div>
    </section>
  )
}
