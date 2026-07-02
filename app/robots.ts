import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.loversdc.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Block private / non-marketing surfaces from crawlers.
        disallow: ['/api/', '/auth/', '/dashboard/', '/admin/', '/onboarding/', '/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/blocked'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
