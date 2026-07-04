import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.loversdc.com'

// Only public marketing routes belong in the sitemap.
// Auth pages, dashboard, admin, onboarding are intentionally excluded.
type SitemapRoute = { path: string; arMirror?: string }

const routes: SitemapRoute[] = [
  // Root has an explicit Arabic-first mirror at /en (middleware sets ldc_locale=ar).
  { path: '', arMirror: '/en' },
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
  return routes.map(({ path, arMirror }) => {
    const url = `${siteUrl}${path}`
    // Only advertise hreflang alternates when we have a genuine per-language URL.
    // Pointing both en and ar at the same URL is a known SEO anti-pattern that
    // causes Google to ignore the hreflang cluster entirely.
    const languages: Record<string, string> = arMirror
      ? {
          en: url,
          ar: `${siteUrl}${arMirror}`,
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
