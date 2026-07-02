import type { Metadata } from 'next'
import { HeroSection }   from '@/components/landing/hero-section'
import { HowItWorks }    from '@/components/landing/how-it-works'
import { WhatWeOffer }   from '@/components/landing/what-we-offer'
import { Testimonials }  from '@/components/landing/testimonials'
import { FAQ }           from '@/components/landing/faq'
import { FinalCTA }      from '@/components/landing/final-cta'
import { FooterSimple }  from '@/components/ui/footer'
import { Reveal }        from '@/components/ui/reveal'
import { canonical } from '@/lib/seo'

// NOTE: do NOT redeclare `openGraph` here. The root layout already ships a
// full openGraph object with images. If we override it here without redeclaring
// images, Next merges shallowly and og:image disappears from the rendered HTML.
export const metadata: Metadata = {
  title: 'Lover Diet Center — Science-Based Nutrition in UAE | مركز التغذية',
  description:
    'Personalized nutrition plans, chef-prepared healthy meals, healthy snacks, body sculpting and training courses in the UAE. خطط تغذية مخصصة ووجبات صحية في الإمارات.',
  alternates: { canonical: canonical('/') },
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
