// Isomorphic locale helpers — safe for both Server Components and Client
// Components. Kept in a separate file (no "use client" directive, no
// next/headers import) so it can cross the RSC boundary without triggering
// Next 16's client-file-in-server-tree error.
//
// The client-side LocaleProvider + useLocale hook live in lib/locale.tsx.
// The server-side getLocaleServer() helper lives in lib/locale-server.ts.

export type Locale = 'en' | 'ar'

/** Every locale the site is published in. Drives generateStaticParams and
 *  the sitemap, so adding a language starts here. */
export const LOCALES = ['en', 'ar'] as const

/** Narrowing guard for untrusted values — route params, cookies, headers. */
export function isLocale(value: string): value is Locale {
  return value === 'en' || value === 'ar'
}

/** Text direction for a locale. */
export function dirFor(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr'
}

/** Pick the right string for the current locale. Pure function. */
export function t(locale: Locale, en: string, ar: string): string {
  return locale === 'ar' ? ar : en
}
