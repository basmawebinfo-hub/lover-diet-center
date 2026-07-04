// Isomorphic locale helpers — safe for both Server Components and Client
// Components. Kept in a separate file (no "use client" directive, no
// next/headers import) so it can cross the RSC boundary without triggering
// Next 16's client-file-in-server-tree error.
//
// The client-side LocaleProvider + useLocale hook live in lib/locale.tsx.
// The server-side getLocaleServer() helper lives in lib/locale-server.ts.

export type Locale = 'en' | 'ar'

/** Pick the right string for the current locale. Pure function. */
export function t(locale: Locale, en: string, ar: string): string {
  return locale === 'ar' ? ar : en
}
