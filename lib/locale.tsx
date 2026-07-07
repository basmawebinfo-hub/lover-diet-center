"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { Locale } from "@/lib/locale-shared"

// Re-export the isomorphic helpers so existing callers of
//   `import { t } from '@/lib/locale'`
// keep working unchanged.
export { t, type Locale } from "@/lib/locale-shared"

type LocaleContextValue = {
  locale: Locale
  dir: "ltr" | "rtl"
  setLocale: (l: Locale) => void
  toggleLocale: () => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)
const STORAGE_KEY = "loversdc:locale"
const COOKIE_NAME = "ldc_locale"

// One-year cookie so the user's choice sticks across sessions.
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60

function writeCookie(v: Locale) {
  if (typeof document === "undefined") return
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${COOKIE_NAME}=${v}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`
}

export function LocaleProvider({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode
  initialLocale?: Locale
}) {
  // Seed state from the server-provided value so the first client render
  // matches the SSR-rendered HTML exactly (no hydration mismatch, no flash).
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  // Re-hydrate from client-side storage if it disagrees with the server
  // value. This only fires on the very first mount and only if the user
  // has an older localStorage value from before the cookie migration.
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null
      if ((saved === "ar" || saved === "en") && saved !== initialLocale) {
        setLocaleState(saved)
        writeCookie(saved)
      }
    } catch { /* quota/disabled */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Mirror the locale onto the DOM + storage whenever it changes.
  useEffect(() => {
    if (typeof document === "undefined") return
    const html = document.documentElement
    html.setAttribute("lang", locale)
    html.setAttribute("dir", locale === "ar" ? "rtl" : "ltr")
    try { window.localStorage.setItem(STORAGE_KEY, locale) } catch { /* quota */ }
    writeCookie(locale)
  }, [locale])

  // Sync Server Components (HomePage, landing pages) with client-side locale changes.
  // When the user toggles the language, the cookie updates but Server Components
  // don't automatically re-fetch. This listener detects the cookie change and
  // reloads the page so getLocaleServer() runs with the new locale.
  //
  // This fires after hydration is complete and locale has been set from localStorage/cookie.
  useEffect(() => {
    let lastCookie = locale
    let checkCount = 0
    const maxChecks = 50 // Stop after ~5 seconds (50 × 100ms)

    const checkCookieSync = () => {
      if (typeof document === "undefined") return

      // Parse the ldc_locale cookie value
      const cookieValue = document.cookie
        .split(";")
        .find((c) => c.trim().startsWith(COOKIE_NAME + "="))
        ?.split("=")[1]

      if (cookieValue && cookieValue !== lastCookie) {
        // Cookie changed (user toggled language or another tab did)
        // Reload page so Server Components see the new cookie value
        console.log("[v0] Locale cookie changed, reloading page...")
        window.location.reload()
        return
      }

      checkCount++
      if (checkCount < maxChecks) {
        setTimeout(checkCookieSync, 100)
      }
    }

    // Start polling after hydration settles (~500ms)
    const timeoutId = setTimeout(checkCookieSync, 500)
    return () => clearTimeout(timeoutId)
  }, [])

  const setLocale = useCallback((l: Locale) => setLocaleState(l), [])
  const toggleLocale = useCallback(() => setLocaleState((p) => (p === "en" ? "ar" : "en")), [])

  return (
    <LocaleContext.Provider value={{ locale, dir: locale === "ar" ? "rtl" : "ltr", setLocale, toggleLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error("useLocale must be used inside <LocaleProvider>")
  return ctx
}
