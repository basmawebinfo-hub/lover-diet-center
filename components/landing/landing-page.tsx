'use client'

import { useLocale } from '@/lib/locale'
import { HeroSection }   from '@/components/landing/hero-section'
import { HowItWorks }    from '@/components/landing/how-it-works'
import { WhatWeOffer }   from '@/components/landing/what-we-offer'
import { Testimonials }  from '@/components/landing/testimonials'
import { FAQ }           from '@/components/landing/faq'
import { FinalCTA }      from '@/components/landing/final-cta'
import { FooterSimple }  from '@/components/ui/footer'
import { Reveal }        from '@/components/ui/reveal'

/**
 * Client wrapper that reads `locale` from the LocaleProvider context and
 * passes it down to every landing section. This means the moment the user
 * clicks the language toggle in the header, `locale` updates in context and
 * React immediately re-renders all sections — no page reload, no flash, no
 * stale Server Component HTML.
 *
 * The individual section components (HeroSection, HowItWorks, etc.) are kept
 * as-is: they are pure render functions that accept `locale` as a prop, so
 * they work correctly whether the prop comes from a Server Component or here.
 */
export function LandingPage() {
  const { locale } = useLocale()

  return (
    <>
      <HeroSection locale={locale} />
      <Reveal><HowItWorks locale={locale} /></Reveal>
      <Reveal><WhatWeOffer locale={locale} /></Reveal>
      <Reveal><Testimonials locale={locale} /></Reveal>
      <Reveal><FAQ locale={locale} /></Reveal>
      <Reveal><FinalCTA locale={locale} /></Reveal>
      <FooterSimple locale={locale} />
    </>
  )
}
