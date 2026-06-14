import { HeroSection } from '@/components/landing/hero-section'
import { WhatWeOffer } from '@/components/landing/what-we-offer'
import { Testimonials } from '@/components/landing/testimonials'
import { FAQ } from '@/components/landing/faq'
import { FinalCTA } from '@/components/landing/final-cta'
import { FooterSimple } from '@/components/ui/footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lover Diet Center — Science-Based Nutrition in UAE',
  description: 'Personalized nutrition consultations, chef-prepared healthy meals, healthy snacks, body sculpting sessions, and training courses.',
  alternates: {
    canonical: 'https://loversdc.com/en',
  },
}

export default function EnHomePage() {
  return (
    <>
      <HeroSection />
      <WhatWeOffer />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <FooterSimple />
    </>
  )
}
