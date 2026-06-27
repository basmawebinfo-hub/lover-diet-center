import type { Metadata } from 'next'
import { HeroSection }   from '@/components/landing/hero-section'
import { HowItWorks }    from '@/components/landing/how-it-works'
import { WhatWeOffer }   from '@/components/landing/what-we-offer'
import { Testimonials }  from '@/components/landing/testimonials'
import { FAQ }           from '@/components/landing/faq'
import { FinalCTA }      from '@/components/landing/final-cta'
import { FooterSimple }  from '@/components/ui/footer'
import { Reveal }        from '@/components/ui/reveal'

export const metadata: Metadata = {
  title: 'Lover Diet Center — Science-Based Nutrition in UAE | مركز التغذية',
  description:
    'Personalized nutrition plans, chef-prepared healthy meals, healthy snacks, body sculpting and training courses in the UAE. خطط تغذية مخصصة ووجبات صحية في الإمارات.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Lover Diet Center — Science-Based Nutrition in UAE',
    description:
      'Personalized nutrition, healthy meals, body sculpting & more — delivered across the UAE.',
    url: '/',
    siteName: 'Lover Diet Center',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Reveal><HowItWorks /></Reveal>
      <Reveal><WhatWeOffer /></Reveal>
      <Reveal><Testimonials /></Reveal>
      <Reveal><FAQ /></Reveal>
      <Reveal><FinalCTA /></Reveal>
      <FooterSimple />
    </>
  )
}
