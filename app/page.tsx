import type { Metadata } from 'next'
import { canonical } from '@/lib/seo'
import { LandingPage } from '@/components/landing/landing-page'

// NOTE: do NOT redeclare `openGraph` here. The root layout already ships a
// full openGraph object with images. If we override it here without redeclaring
// images, Next merges shallowly and og:image disappears from the rendered HTML.
export const metadata: Metadata = {
  title: 'Lover Diet Center — Science-Based Nutrition in UAE | مركز التغذية',
  description:
    'Personalized nutrition plans, chef-prepared healthy meals, healthy snacks, body sculpting and training courses in the UAE. خطط تغذية مخصصة ووجبات صحية في الإمارات.',
  alternates: { canonical: canonical('/') },
}

// LandingPage is a Client Component that reads `locale` from LocaleProvider
// context, so all sections update instantly when the language toggle is clicked
// — no page reload required.
export default function HomePage() {
  return <LandingPage />
}
