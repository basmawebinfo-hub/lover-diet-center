import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://loverdiet.com'

const routes = [
  '',
  '/about',
  '/auth/login',
  '/auth/sign-up',
  '/body-sculpting',
  '/contact',
  '/healthy-meals',
  '/healthy-snacks',
  '/nutrition-consultations',
  '/onboarding',
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
