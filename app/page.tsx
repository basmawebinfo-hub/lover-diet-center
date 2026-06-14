import { HeroSection } from '@/components/landing/hero-section'
import { WhatWeOffer } from '@/components/landing/what-we-offer'
import { Testimonials } from '@/components/landing/testimonials'
import { FAQ } from '@/components/landing/faq'
import { FinalCTA } from '@/components/landing/final-cta'
import { FooterSimple } from '@/components/ui/footer'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhatWeOffer />
      <div className="animate-on-scroll" style={{ animationDelay: '0.3s' }}><Testimonials /></div>
      <div className="animate-on-scroll" style={{ animationDelay: '0.4s' }}><FAQ /></div>
      <FinalCTA />
      <FooterSimple />
    </>
  )
}
