import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://loversdc.com'

const routes = [
  '',
  '/about',
  '/contact',
  '/sign-in',
  '/sign-up',
  '/nutrition-consultations',
  '/healthy-meals',
  '/healthy-snacks',
  '/body-sculpting',
  '/training-courses',
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }))
}
