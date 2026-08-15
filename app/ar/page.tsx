import { HeroSection } from '@/components/landing/hero-section'
import { HowItWorks } from '@/components/landing/how-it-works'
import { WhatWeOffer } from '@/components/landing/what-we-offer'
import { Testimonials } from '@/components/landing/testimonials'
import { FAQ } from '@/components/landing/faq'
import { FinalCTA } from '@/components/landing/final-cta'
import { FooterSimple } from '@/components/ui/footer'
import type { Metadata } from 'next'
import { canonical } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'مركز التغذية — تغذية مبنية على العلم في الإمارات',
  description:
    'استشارات تغذية مخصصة، ووجبات صحية من إعداد الشيف، وسناكس صحية، وجلسات نحت القوام، ودورات تدريبية.',
  alternates: {
    canonical: canonical('/ar'),
    languages: {
      en: canonical('/en'),
      ar: canonical('/ar'),
      'x-default': canonical('/'),
    },
  },
}

// /ar is the Arabic mirror, route-locked to `ar` regardless of the visitor's
// saved cookie — the twin of /en. The middleware persists ldc_locale to match
// the path, so the root layout renders <html lang="ar" dir="rtl"> here.
//
// Server Component: no client JS beyond the widgets that need it (FAQ, header).
export default function ArHomePage() {
  const locale = 'ar' as const
  return (
    <>
      <HeroSection locale={locale} />
      <HowItWorks locale={locale} />
      <WhatWeOffer locale={locale} />
      <Testimonials locale={locale} />
      <FAQ locale={locale} />
      <FinalCTA locale={locale} />
      <FooterSimple locale={locale} />
    </>
  )
}
