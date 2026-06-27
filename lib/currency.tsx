"use client"

// Currency context — all prices are stored in USD (base). The user picks a
// display currency; we fetch live rates (free, no key) and convert on the fly.

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react"

export type CurrencyCode = "USD" | "AED" | "SAR" | "EGP" | "KWD" | "QAR" | "JOD" | "EUR" | "GBP"

export const CURRENCIES: { code: CurrencyCode; en: string; ar: string; symbol: string }[] = [
  { code: "USD", en: "US Dollar", ar: "دولار أمريكي", symbol: "$" },
  { code: "AED", en: "UAE Dirham", ar: "درهم إماراتي", symbol: "د.إ" },
  { code: "SAR", en: "Saudi Riyal", ar: "ريال سعودي", symbol: "ر.س" },
  { code: "EGP", en: "Egyptian Pound", ar: "جنيه مصري", symbol: "ج.م" },
  { code: "KWD", en: "Kuwaiti Dinar", ar: "دينار كويتي", symbol: "د.ك" },
  { code: "QAR", en: "Qatari Riyal", ar: "ريال قطري", symbol: "ر.ق" },
  { code: "JOD", en: "Jordanian Dinar", ar: "دينار أردني", symbol: "د.أ" },
  { code: "EUR", en: "Euro", ar: "يورو", symbol: "€" },
  { code: "GBP", en: "British Pound", ar: "جنيه إسترليني", symbol: "£" },
]

// Static fallback rates (USD base) used until live rates load / if the API fails.
const FALLBACK: Record<CurrencyCode, number> = {
  USD: 1, AED: 3.67, SAR: 3.75, EGP: 48, KWD: 0.31, QAR: 3.64, JOD: 0.71, EUR: 0.92, GBP: 0.79,
}

type CurrencyValue = {
  currency: CurrencyCode
  setCurrency: (c: CurrencyCode) => void
  rate: number // USD -> currency
  convert: (usd: number) => number
  format: (usd: number) => string
  symbol: string
}

const Ctx = createContext<CurrencyValue | null>(null)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD")
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK)

  // restore saved choice
  useEffect(() => {
    if (typeof window === "undefined") return
    const saved = window.localStorage.getItem("ldc_currency") as CurrencyCode | null
    if (saved && CURRENCIES.some((c) => c.code === saved)) setCurrencyState(saved)
  }, [])

  // fetch live rates (USD base), cached 1h
  useEffect(() => {
    let active = true
    const cacheRaw = typeof window !== "undefined" ? window.localStorage.getItem("ldc_rates") : null
    if (cacheRaw) {
      try {
        const cached = JSON.parse(cacheRaw) as { at: number; rates: Record<string, number> }
        if (Date.now() - cached.at < 3600_000) { setRates({ ...FALLBACK, ...cached.rates }); return }
      } catch { /* ignore */ }
    }
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((r) => r.json())
      .then((d) => {
        if (!active || !d?.rates) return
        setRates({ ...FALLBACK, ...d.rates })
        try { window.localStorage.setItem("ldc_rates", JSON.stringify({ at: Date.now(), rates: d.rates })) } catch { /* ignore */ }
      })
      .catch(() => { /* keep fallback */ })
    return () => { active = false }
  }, [])

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c)
    if (typeof window !== "undefined") window.localStorage.setItem("ldc_currency", c)
  }, [])

  const rate = rates[currency] ?? FALLBACK[currency] ?? 1
  const meta = CURRENCIES.find((c) => c.code === currency)!

  const convert = useCallback((usd: number) => usd * rate, [rate])
  const format = useCallback((usd: number) => {
    const v = usd * rate
    // KWD/JOD use 3 decimals, others 2 (or 0 for large round numbers)
    const decimals = currency === "KWD" || currency === "JOD" ? 3 : v >= 100 ? 0 : 2
    const num = v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    return `${num} ${meta.symbol}`
  }, [rate, currency, meta.symbol])

  const value = useMemo<CurrencyValue>(() => ({ currency, setCurrency, rate, convert, format, symbol: meta.symbol }), [currency, setCurrency, rate, convert, format, meta.symbol])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCurrency() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useCurrency must be used inside <CurrencyProvider>")
  return ctx
}
