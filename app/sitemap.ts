import type { MetadataRoute } from 'next'
import { LOCALES } from '@/lib/locale-shared'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.loversdc.com'

// Public marketing routes, without the locale prefix. Every entry is emitted
// once per language, so /about produces both /en/about and /ar/about.
//
// Auth pages, dashboard, admin and onboarding are intentionally excluded —
// they are private, and listing a sign-in wall only earns soft-404s.
const ROUTES = [
  '', // homepage
  '/about',
  '/contact',
  '/nutrition-consultations',
  '/healthy-meals',
  '/healthy-snacks',
  '/body-sculpting',
  '/training-courses',
  '/shop',
  '/privacy',
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return ROUTES.flatMap((route) =>
    LOCALES.map((locale) => ({
      url: `${siteUrl}/${locale}${route}`,
      lastModified: now,
      changeFrequency: (route === '' ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
      priority: route === '' ? 1 : 0.8,
      // Each URL declares the full cluster it belongs to, including itself —
      // that is what Google expects, and a cluster whose members disagree is
      // discarded wholesale. x-default points at the bare root, which
      // redirects each visitor to their language.
      alternates: {
        languages: {
          en: `${siteUrl}/en${route}`,
          ar: `${siteUrl}/ar${route}`,
          'x-default': `${siteUrl}${route || '/'}`,
        },
      },
    })),
  )
}
