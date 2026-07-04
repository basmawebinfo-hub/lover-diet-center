import { cookies, headers } from 'next/headers'

// Server-side locale detection (Phase 5 · Arabic SSR).
//
// Priority order:
//   1. `ldc_locale` cookie — set by the LocaleProvider client-side toggle
//   2. Accept-Language header — first non-wildcard match
//   3. Fallback: "en"
//
// The client and server both read the SAME cookie, so once a user toggles
// locale the choice is honored on every subsequent server render — no
// hydration flash.

export type Locale = 'en' | 'ar'
export const LOCALE_COOKIE = 'ldc_locale'
export const DEFAULT_LOCALE: Locale = 'en'

/** True locale for the current request. Async — reads cookies() / headers(). */
export async function getLocaleServer(): Promise<Locale> {
  try {
    const cookieStore = await cookies()
    const raw = cookieStore.get(LOCALE_COOKIE)?.value
    if (raw === 'ar' || raw === 'en') return raw
  } catch {
    // cookies() throws outside a request scope. Safe fallback below.
  }

  try {
    const h = await headers()
    const accept = h.get('accept-language') ?? ''
    // Match Arabic (any region) BEFORE English if the browser lists ar first.
    const parts = accept.split(',').map((s) => s.trim().split(';')[0])
    for (const p of parts) {
      if (p.startsWith('ar')) return 'ar'
      if (p.startsWith('en')) return 'en'
    }
  } catch { /* ignore */ }

  return DEFAULT_LOCALE
}

/** Direction attribute for <html dir="..."> */
export function localeDir(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr'
}
