import type { Metadata } from 'next'
import { HeroSection } from '@/components/landing/hero-section'
import { HowItWorks } from '@/components/landing/how-it-works'
import { WhatWeOffer } from '@/components/landing/what-we-offer'
import { Testimonials } from '@/components/landing/testimonials'
import { FAQ } from '@/components/landing/faq'
import { FinalCTA } from '@/components/landing/final-cta'
import { FooterSimple } from '@/components/ui/footer'
import { Reveal } from '@/components/ui/reveal'
import { canonical, localeAlternates } from '@/lib/seo'
import { isLocale, type Locale } from '@/lib/locale-shared'

const COPY = {
  en: {
    title: 'Lover Diet Center — Science-Based Nutrition in UAE',
    description:
      'Personalized nutrition consultations, chef-prepared healthy meals, healthy snacks, body sculpting sessions, and training courses in the UAE.',
  },
  ar: {
    title: 'مركز التغذية — تغذية مبنية على العلم في الإمارات',
    description:
      'استشارات تغذية مخصصة، ووجبات صحية من إعداد الشيف، وسناكس صحية، وجلسات نحت القوام، ودورات تدريبية في الإمارات.',
  },
} satisfies Record<Locale, { title: string; description: string }>

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const l: Locale = isLocale(locale) ? locale : 'en'
  return {
    ...COPY[l],
    alternates: {
      canonical: canonical(`/${l}`),
      languages: localeAlternates(''),
    },
  }
}

// One homepage for both languages. The locale comes from the path, so this is
// a Server Component with no cookie read — which is what lets Next prerender
// /en and /ar as static HTML.
export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const l: Locale = isLocale(locale) ? locale : 'en'

  return (
    <>
      <HeroSection locale={l} />
      <Reveal><HowItWorks locale={l} /></Reveal>
      <Reveal><WhatWeOffer locale={l} /></Reveal>
      <Reveal><Testimonials locale={l} /></Reveal>
      <Reveal><FAQ locale={l} /></Reveal>
      <Reveal><FinalCTA locale={l} /></Reveal>
      <FooterSimple locale={l} />
    </>
  )
}
