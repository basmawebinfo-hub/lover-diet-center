import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.loversdc.com'

// Only public marketing routes belong in the sitemap.
// Auth pages, dashboard, admin, onboarding are intentionally excluded.
type SitemapRoute = { path: string; localized?: boolean }

const routes: SitemapRoute[] = [
  // Root is the cookie-driven entry point (x-default). The two language
  // mirrors are /en and /ar — both route-locked in their page components and
  // pinned by the middleware, so each URL serves exactly one language.
  { path: '', localized: true },
  { path: '/en' },
  { path: '/ar' },
  { path: '/about' },
  { path: '/contact' },
  { path: '/nutrition-consultations' },
  { path: '/healthy-meals' },
  { path: '/healthy-snacks' },
  { path: '/body-sculpting' },
  { path: '/training-courses' },
  { path: '/shop' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return routes.map(({ path, localized }) => {
    const url = `${siteUrl}${path}`
    // Only advertise hreflang alternates when we have a genuine per-language URL.
    // Pointing both en and ar at the same URL is a known SEO anti-pattern that
    // causes Google to ignore the hreflang cluster entirely.
    const languages: Record<string, string> = localized
      ? {
          en: `${siteUrl}/en`,
          ar: `${siteUrl}/ar`,
          'x-default': url,
        }
      : {}
    return {
      url,
      lastModified: now,
      changeFrequency: path === '' ? 'weekly' : 'monthly',
      priority: path === '' ? 1 : 0.8,
      ...(Object.keys(languages).length > 0 ? { alternates: { languages } } : {}),
    }
  })
}
