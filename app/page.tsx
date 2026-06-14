import { HeroSection }   from '@/components/landing/hero-section'
import { HowItWorks }    from '@/components/landing/how-it-works'
import { WhatWeOffer }   from '@/components/landing/what-we-offer'
import { Testimonials }  from '@/components/landing/testimonials'
import { FAQ }           from '@/components/landing/faq'
import { FinalCTA }      from '@/components/landing/final-cta'
import { FooterSimple }  from '@/components/ui/footer'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <WhatWeOffer />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <FooterSimple />
    </>
  )
}
