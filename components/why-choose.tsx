'use client'

import { Users, FlaskConical, HeartHandshake, CheckCircle2 } from 'lucide-react'

export function WhyChoose() {
  const features = [
    {
      key: 'experts',
      title: 'Expert Nutritionists',
      desc: '150+ certified professionals specialized in weight management, sports nutrition, and disease prevention.',
      icon: Users,
      bullets: ['Certified nutritionists', 'Specialized in 12+ fields', 'Arabic & English'],
    },
    {
      key: 'science',
      title: 'Science-Based Approach',
      desc: 'Every protocol is rooted in peer-reviewed research and refined with real-world client data.',
      icon: FlaskConical,
      bullets: ['Research-backed protocols', 'Continuous data tracking', 'Refined with real results'],
    },
    {
      key: 'support',
      title: 'Ongoing Support',
      desc: 'You never go it alone — daily check-ins, direct messaging, and weekly reviews keep you on track.',
      icon: HeartHandshake,
      bullets: ['Ongoing coaching', 'WhatsApp direct line', 'Weekly check-ins'],
    },
  ]

  return (
    <section id="why" className="relative overflow-hidden bg-black py-20 sm:py-28">
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute bottom-0 end-0 size-[30rem] rounded-full bg-pink-600/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Why Choose{' '}
            <span className="text-pink-500">LoverDiet</span>
          </h2>
          <p className="mt-4 text-pretty text-white/50">
            Three reasons our members trust us with their health journey.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.key}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:border-pink-500/30 hover:bg-white/10"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-pink-600/20 text-pink-500">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 leading-relaxed text-white/50">
                  {feature.desc}
                </p>
                <ul className="mt-6 space-y-2">
                  {feature.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2 text-sm text-white/50">
                      <CheckCircle2 className="size-4 shrink-0 text-pink-500" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
