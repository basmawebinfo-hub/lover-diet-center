import { HeroSection } from '@/components/landing/hero-section'
import { Testimonials } from '@/components/landing/testimonials'
import { FAQ } from '@/components/landing/faq'
import { FinalCTA } from '@/components/landing/final-cta'
import { FooterSimple } from '@/components/ui/footer'

export default function EnHomePage() {
  return (
    <>
      <HeroSection />
      <div className="animate-on-scroll" style={{ animationDelay: '0.3s' }}><Testimonials /></div>
      <div className="animate-on-scroll" style={{ animationDelay: '0.4s' }}><FAQ /></div>
      <FinalCTA />
      <FooterSimple />
    </>
  )
}