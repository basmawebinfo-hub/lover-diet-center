import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.loversdc.com'

// Only public marketing routes belong in the sitemap.
// Auth pages, dashboard, admin, onboarding are intentionally excluded.
const routes = [
  '',
  '/about',
  '/contact',
  '/nutrition-consultations',
  '/healthy-meals',
  '/healthy-snacks',
  '/body-sculpting',
  '/training-courses',
  '/shop',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.8,
    alternates: {
      languages: {
        en: `${siteUrl}${route}`,
        ar: `${siteUrl}${route}`,
      },
    },
  }))
}
