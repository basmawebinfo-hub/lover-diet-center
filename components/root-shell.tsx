import { Analytics } from '@vercel/analytics/next'
import { ConditionalShell } from '@/components/conditional-shell'
import { AppProvider } from '@/lib/store'
import { LocaleProvider } from '@/lib/locale'
import { CurrencyProvider } from '@/lib/currency'
import { ToastProvider } from '@/components/ui/toast'
import { JsonLd } from '@/components/seo/json-ld'
import {
  organizationJsonLd,
  websiteJsonLd,
  localBusinessJsonLd,
} from '@/lib/seo'
import type { Locale } from '@/lib/locale-shared'

/**
 * Everything that goes inside <html> — shared by both root layouts.
 *
 * The site has two roots on purpose:
 *   app/(site)/[locale]/layout.tsx  reads the locale from the URL, so its
 *                                   pages can be prerendered as static HTML.
 *   app/(app)/layout.tsx            reads it from the cookie, which is fine
 *                                   because every route under it is already
 *                                   dynamic (auth, cart, dashboard data).
 *
 * Keeping the shared body here means the provider stack, structured data and
 * skip link cannot drift apart between the two.
 */
export function RootShell({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  return (
    <>
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
        {/*
          Lives here so both root layouts get it. It was on the single root
          layout before that layout was split in two, and the split dropped
          it — analytics silently stopped recording.
        */}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </>
  )
}
