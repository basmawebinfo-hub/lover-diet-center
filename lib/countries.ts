// Country list for phone input (dial codes + flags). Gulf & Arab first, then common.
export type Country = { code: string; dial: string; en: string; ar: string; flag: string }

export const COUNTRIES: Country[] = [
  { code: "AE", dial: "+971", en: "United Arab Emirates", ar: "الإمارات", flag: "🇦🇪" },
  { code: "SA", dial: "+966", en: "Saudi Arabia", ar: "السعودية", flag: "🇸🇦" },
  { code: "KW", dial: "+965", en: "Kuwait", ar: "الكويت", flag: "🇰🇼" },
  { code: "QA", dial: "+974", en: "Qatar", ar: "قطر", flag: "🇶🇦" },
  { code: "BH", dial: "+973", en: "Bahrain", ar: "البحرين", flag: "🇧🇭" },
  { code: "OM", dial: "+968", en: "Oman", ar: "عُمان", flag: "🇴🇲" },
  { code: "EG", dial: "+20", en: "Egypt", ar: "مصر", flag: "🇪🇬" },
  { code: "JO", dial: "+962", en: "Jordan", ar: "الأردن", flag: "🇯🇴" },
  { code: "LB", dial: "+961", en: "Lebanon", ar: "لبنان", flag: "🇱🇧" },
  { code: "IQ", dial: "+964", en: "Iraq", ar: "العراق", flag: "🇮🇶" },
  { code: "SY", dial: "+963", en: "Syria", ar: "سوريا", flag: "🇸🇾" },
  { code: "PS", dial: "+970", en: "Palestine", ar: "فلسطين", flag: "🇵🇸" },
  { code: "YE", dial: "+967", en: "Yemen", ar: "اليمن", flag: "🇾🇪" },
  { code: "SD", dial: "+249", en: "Sudan", ar: "السودان", flag: "🇸🇩" },
  { code: "LY", dial: "+218", en: "Libya", ar: "ليبيا", flag: "🇱🇾" },
  { code: "MA", dial: "+212", en: "Morocco", ar: "المغرب", flag: "🇲🇦" },
  { code: "DZ", dial: "+213", en: "Algeria", ar: "الجزائر", flag: "🇩🇿" },
  { code: "TN", dial: "+216", en: "Tunisia", ar: "تونس", flag: "🇹🇳" },
  { code: "US", dial: "+1", en: "United States", ar: "الولايات المتحدة", flag: "🇺🇸" },
  { code: "GB", dial: "+44", en: "United Kingdom", ar: "بريطانيا", flag: "🇬🇧" },
  { code: "TR", dial: "+90", en: "Turkey", ar: "تركيا", flag: "🇹🇷" },
  { code: "IN", dial: "+91", en: "India", ar: "الهند", flag: "🇮🇳" },
  { code: "PK", dial: "+92", en: "Pakistan", ar: "باكستان", flag: "🇵🇰" },
]

export const DEFAULT_COUNTRY = COUNTRIES[0] // UAE
