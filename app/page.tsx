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
import { getLocaleServer } from '@/lib/locale-server'

// NOTE: do NOT redeclare `openGraph` here. The root layout already ships a
// full openGraph object with images. If we override it here without redeclaring
// images, Next merges shallowly and og:image disappears from the rendered HTML.
export const metadata: Metadata = {
  title: 'Lover Diet Center — Science-Based Nutrition in UAE | مركز التغذية',
  description:
    'Personalized nutrition plans, chef-prepared healthy meals, healthy snacks, body sculpting and training courses in the UAE. خطط تغذية مخصصة ووجبات صحية في الإمارات.',
  alternates: { canonical: canonical('/') },
}

// Server Component. Reads locale server-side and passes it down to each
// landing block, so every child (except Reveal, FAQ, and the header shell)
// stays a Server Component with zero client JS.
export default async function HomePage() {
  const locale = await getLocaleServer()
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
