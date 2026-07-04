import { HeroSection } from '@/components/landing/hero-section'
import { WhatWeOffer } from '@/components/landing/what-we-offer'
import { Testimonials } from '@/components/landing/testimonials'
import { FAQ } from '@/components/landing/faq'
import { FinalCTA } from '@/components/landing/final-cta'
import { FooterSimple } from '@/components/ui/footer'
import type { Metadata } from 'next'
import { canonical } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Lover Diet Center — Science-Based Nutrition in UAE',
  description: 'Personalized nutrition consultations, chef-prepared healthy meals, healthy snacks, body sculpting sessions, and training courses.',
  alternates: {
    canonical: canonical('/en'),
  },
}

// /en is the Arabic-first mirror. Route-locked to `ar` regardless of the
// user's saved cookie — the URL contract itself signals the language choice.
// Server Component: no client JS beyond the widgets that need it (FAQ, header).
export default function EnHomePage() {
  const locale = 'ar' as const
  return (
    <>
      <HeroSection locale={locale} />
      <WhatWeOffer locale={locale} />
      <Testimonials locale={locale} />
      <FAQ locale={locale} />
      <FinalCTA locale={locale} />
      <FooterSimple locale={locale} />
    </>
  )
}
