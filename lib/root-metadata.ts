import type { Metadata, Viewport } from 'next'
import { SITE_URL, OG_IMAGE } from '@/lib/seo'

// Shared by both root layouts. Route-level metadata still overrides individual
// fields; this only supplies the defaults and the title template.
//
// NOTE: do not redeclare `openGraph` in a route without also redeclaring
// `images` — Next merges the object shallowly, so a partial override silently
// drops og:image from the rendered HTML.
export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'LoverDiet',
    statusBarStyle: 'default',
  },
  title: {
    default: 'Lover Diet Center — Science-Based Nutrition in UAE',
    template: '%s | Lover Diet Center',
  },
  description:
    'Personalized nutrition consultations, chef-prepared healthy meals, healthy snacks, body sculpting sessions, and training courses. 150+ certified nutritionists. 3,000+ members.',
  keywords: [
    'nutritionist UAE',
    'healthy meals Dubai',
    'weight loss program',
    'body sculpting',
    'personalized meal plan',
    'healthy snacks',
    'online nutrition consultation',
    'Lover Diet Center',
    'dietitian Abu Dhabi',
    'healthy food delivery UAE',
    'weight loss clinic',
  ],
  openGraph: {
    title: 'Lover Diet Center — Transform Your Health',
    description:
      'Expert nutrition consultations, healthy meal delivery, and body sculpting in the UAE. Join 3,000+ members.',
    url: SITE_URL,
    siteName: 'Lover Diet Center',
    locale: 'en_AE',
    type: 'website',
    images: [OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lover Diet Center — Science-Based Nutrition',
    description:
      'Personalized nutrition, chef-prepared meals, and certified experts. Book your free discovery call.',
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const rootViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f5f8f7',
}
