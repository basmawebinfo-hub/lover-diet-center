// Phone validation for the GCC region + Egypt/Arab-neighbours + a few globals.
// Rules are per-country to keep the UX helpful without pretending to be a full
// E.164 validator (that's Phase 5 payment-processor territory).
//
// The rules capture the national-significant-number (NSN) length per country
// after the dial code is stripped. Regex is deliberately conservative — we
// prefer false negatives (user re-enters) to false positives (bad number).

import { COUNTRIES, type Country, DEFAULT_COUNTRY } from "./countries"

type Rule = {
  // Length range of the NSN (digits AFTER the country code).
  minLen: number
  maxLen: number
  // Optional prefix the NSN must start with (still after country code).
  // For UAE mobiles this is "5", so a full number is +971 5X XXX XXXX.
  startsWith?: RegExp
  // Human-readable placeholder shown as a hint.
  example: string
}

// Curated set — every country in COUNTRIES gets a rule. Numbers taken from
// public E.164 tables (ITU-T). We keep this in one place so both onboarding
// and cart-notify surfaces share the same validator.
const RULES: Record<string, Rule> = {
  AE: { minLen: 8, maxLen: 9, startsWith: /^5/, example: "5X XXX XXXX" },
  SA: { minLen: 8, maxLen: 9, startsWith: /^5/, example: "5X XXX XXXX" },
  KW: { minLen: 7, maxLen: 8, example: "XXX XXXXX" },
  QA: { minLen: 7, maxLen: 8, example: "XXXX XXXX" },
  BH: { minLen: 7, maxLen: 8, example: "XXXX XXXX" },
  OM: { minLen: 7, maxLen: 8, example: "XXXX XXXX" },
  EG: { minLen: 9, maxLen: 10, startsWith: /^1/, example: "1X XXXX XXXX" },
  JO: { minLen: 8, maxLen: 9, example: "7X XXXX XXX" },
  LB: { minLen: 7, maxLen: 8, example: "XX XXX XXX" },
  IQ: { minLen: 9, maxLen: 10, example: "7XX XXX XXXX" },
  SY: { minLen: 8, maxLen: 9, example: "9XX XXX XXX" },
  PS: { minLen: 8, maxLen: 9, example: "5X XXX XXXX" },
  YE: { minLen: 8, maxLen: 9, example: "7XX XXX XXX" },
  SD: { minLen: 8, maxLen: 9, example: "9X XXX XXXX" },
  LY: { minLen: 8, maxLen: 9, example: "9X XXX XXXX" },
  MA: { minLen: 8, maxLen: 9, example: "6XX XXX XXX" },
  DZ: { minLen: 8, maxLen: 9, example: "5XX XX XX XX" },
  TN: { minLen: 7, maxLen: 8, example: "XX XXX XXX" },
  US: { minLen: 10, maxLen: 10, example: "XXX XXX XXXX" },
  GB: { minLen: 9, maxLen: 10, example: "XXXX XXX XXXX" },
  TR: { minLen: 10, maxLen: 10, example: "5XX XXX XX XX" },
  IN: { minLen: 10, maxLen: 10, example: "XXXXX XXXXX" },
  PK: { minLen: 9, maxLen: 10, example: "3XX XXX XXXX" },
}

// Given a raw human-entered phone string, strip everything that isn't a digit
// (keeping a leading + so we can preserve E.164 input if the user typed it).
function normalise(input: string): string {
  const trimmed = (input ?? "").trim()
  const startsWithPlus = trimmed.startsWith("+")
  const digitsOnly = trimmed.replace(/[^0-9]/g, "")
  return startsWithPlus ? `+${digitsOnly}` : digitsOnly
}

// Try to derive the (Country, NSN) pair from a normalised input.
// Rules:
//   - If input starts with "+", find the country whose dial-code prefixes the
//     rest; return the remaining digits as NSN.
//   - Otherwise, treat input as an NSN under `defaultCountry`.
// Falls back to the DEFAULT_COUNTRY if nothing matches.
function inferCountry(
  normalised: string,
  defaultCountry: Country,
): { country: Country; nsn: string } {
  if (normalised.startsWith("+")) {
    const digits = normalised.slice(1)
    // Longest-prefix match, so +971 beats +9.
    const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length)
    for (const c of sorted) {
      const cc = c.dial.replace("+", "")
      if (digits.startsWith(cc)) {
        return { country: c, nsn: digits.slice(cc.length) }
      }
    }
    return { country: defaultCountry, nsn: digits }
  }
  return { country: defaultCountry, nsn: normalised }
}

export type PhoneValidation = {
  valid: boolean
  reason?: "empty" | "too_short" | "too_long" | "bad_prefix" | "unknown_country"
  country: Country
  nsn: string
  e164: string // best-effort formatted E.164 (empty if truly invalid)
  example: string // hint for the user, in NSN form
}

/**
 * Validate a phone-number string against the country ruleset.
 *
 * @param input           Raw user input (may include spaces, dashes, +, digits).
 * @param defaultCountry  Country used when input is a plain NSN with no + prefix.
 */
export function validatePhone(
  input: string,
  defaultCountry: Country = DEFAULT_COUNTRY,
): PhoneValidation {
  const norm = normalise(input)
  if (!norm.replace("+", "")) {
    return {
      valid: false,
      reason: "empty",
      country: defaultCountry,
      nsn: "",
      e164: "",
      example: RULES[defaultCountry.code]?.example ?? "",
    }
  }
  const { country, nsn } = inferCountry(norm, defaultCountry)
  const rule = RULES[country.code]
  if (!rule) {
    return {
      valid: false,
      reason: "unknown_country",
      country,
      nsn,
      e164: "",
      example: "",
    }
  }
  const example = rule.example
  // Strip an accidental leading 0 (users sometimes write local trunk-prefix).
  const cleanNsn = nsn.replace(/^0+/, "")
  if (cleanNsn.length < rule.minLen) {
    return { valid: false, reason: "too_short", country, nsn: cleanNsn, e164: "", example }
  }
  if (cleanNsn.length > rule.maxLen) {
    return { valid: false, reason: "too_long", country, nsn: cleanNsn, e164: "", example }
  }
  if (rule.startsWith && !rule.startsWith.test(cleanNsn)) {
    return { valid: false, reason: "bad_prefix", country, nsn: cleanNsn, e164: "", example }
  }
  return {
    valid: true,
    country,
    nsn: cleanNsn,
    e164: `${country.dial}${cleanNsn}`,
    example,
  }
}

/** Localised, human-friendly failure message for a PhoneValidation result. */
export function phoneErrorMessage(
  res: PhoneValidation,
  locale: "en" | "ar",
): string | null {
  if (res.valid || !res.reason) return null
  const example = res.example ? ` (${res.country.dial} ${res.example})` : ""
  switch (res.reason) {
    case "empty":
      return locale === "ar" ? "أدخل رقم الهاتف." : "Enter a phone number."
    case "too_short":
      return locale === "ar"
        ? `الرقم قصير جدًا${example}`
        : `Number is too short${example}`
    case "too_long":
      return locale === "ar"
        ? `الرقم طويل جدًا${example}`
        : `Number is too long${example}`
    case "bad_prefix":
      return locale === "ar"
        ? `الرقم يبدأ بمقطع غير صحيح لهذا البلد${example}`
        : `Number does not start with the right digits for this country${example}`
    case "unknown_country":
      return locale === "ar"
        ? "لم نتعرّف على مقدمة الرقم الدولية."
        : "We could not recognise the country from that number."
    default:
      return null
  }
}
