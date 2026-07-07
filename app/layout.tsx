import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Host_Grotesk, Rubik } from 'next/font/google'
// Cairo is imported via Rubik (both support Arabic subsets); the variable name
// --font-cairo is preserved so globals.css Arabic rules work without changes.
import { ConditionalShell } from '@/components/conditional-shell'
import { AppProvider } from '@/lib/store'
import { LocaleProvider } from '@/lib/locale'
import { getLocaleServer, localeDir } from '@/lib/locale-server'
import { CurrencyProvider } from '@/lib/currency'
import { ToastProvider } from '@/components/ui/toast'
import { JsonLd } from '@/components/seo/json-ld'
import {
  SITE_URL,
  OG_IMAGE,
  organizationJsonLd,
  websiteJsonLd,
  localBusinessJsonLd,
} from '@/lib/seo'
import './globals.css'

const hostGrotesk = Host_Grotesk({
  subsets: ['latin'],
  variable: '--font-host-grotesk',
  display: 'swap',
})

// Modern Arabic font with full support for diacritics, proper kerning, and
// multiple weights. Used for all Arabic content across the entire site.
const cairo = Rubik({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata: Metadata = {
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
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f5f8f7',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Server-side locale detection (Phase 5 · Arabic SSR). Reads the
  // `ldc_locale` cookie first, falls back to Accept-Language, defaults
  // to English. The <html lang>/<dir> attributes are set from this
  // value so the initial paint is in the correct language — no flash
  // of English before hydration for Arabic-first visitors.
  const locale = await getLocaleServer()
  return (
    <html
      lang={locale}
      dir={localeDir(locale)}
      suppressHydrationWarning
      className={`light-mode ${hostGrotesk.variable} ${cairo.variable}`}
    >
      <head>
        <JsonLd id="ld-organization" data={organizationJsonLd} />
        <JsonLd id="ld-website" data={websiteJsonLd} />
        <JsonLd id="ld-business" data={localBusinessJsonLd} />
      </head>
      <body className="font-sans antialiased text-neutral-900">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-full focus:bg-lime-600 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <LocaleProvider initialLocale={locale}>
          <AppProvider>
            <CurrencyProvider>
              <ToastProvider>
                <ConditionalShell>{children}</ConditionalShell>
              </ToastProvider>
            </CurrencyProvider>
          </AppProvider>
        </LocaleProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
