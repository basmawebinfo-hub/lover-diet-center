"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"

type Locale = "en" | "ar"

type LocaleContextValue = {
  locale: Locale
  dir: "ltr" | "rtl"
  setLocale: (l: Locale) => void
  toggleLocale: () => void
}

const LocaleContext = createContext<LocaleContextValue | null>(null)
const STORAGE_KEY = "loversdc:locale"

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en")

  // Load saved locale on mount
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as Locale | null
      if (saved === "ar" || saved === "en") setLocaleState(saved)
    } catch {}
  }, [])

  // Reflect locale on <html> (lang + dir) so the whole page flips to RTL
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute("lang", locale)
    html.setAttribute("dir", locale === "ar" ? "rtl" : "ltr")
    try { window.localStorage.setItem(STORAGE_KEY, locale) } catch {}
  }, [locale])

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

/** Pick the right string for the current locale */
export function t(locale: Locale, en: string, ar: string) {
  return locale === "ar" ? ar : en
}
