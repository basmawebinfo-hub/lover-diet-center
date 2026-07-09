# Landing Page i18n Translation Audit — lover-diet-center

**Audit Date:** 2026-07-08  
**Project:** lover-diet-center  
**Scope:** Landing Page + Public Pages Translation Architecture  
**Status:** Complete Analysis (NO FIXES APPLIED)

---

## Executive Summary

The i18n architecture in lover-diet-center is **well-designed and mostly correct**, but there are **critical architectural inconsistencies** that cause translation bugs:

✅ **Root Cause Identified:**  
The Landing Page uses **two different locale sources**:
1. **Server-Side (getLocaleServer)** — Server layout + Landing components → locale passed as prop
2. **Client-Side (useLocale hook)** — About page + Dashboard + Navigation → reads from LocaleProvider context

This **dual-source approach** causes:
- Hydration mismatches on initial page load (About page)
- Language not syncing when user toggles locale (About page flashes wrong language)
- Footer + Header using different methods
- SEO metadata stuck in English (root layout metadata is static, not locale-aware)

---

# PHASE 1: Architecture Audit

## System Overview

### Locale Detection Flow

```
User Request
    ↓
[middleware.ts] → Next.js Server
    ↓
getLocaleServer() reads:
    1. ldc_locale cookie (priority)
    2. Accept-Language header (fallback)
    3. "en" (default)
    ↓
Root Layout (app/layout.tsx)
    ├─ Sets <html lang={locale} dir={...}>
    ├─ Passes locale → LocaleProvider initialLocale
    └─ Wraps app in LocaleProvider
    ↓
LocaleProvider (lib/locale.tsx)
    ├─ Seeds state from initialLocale (Server value)
    ├─ useEffect checks localStorage (legacy migration)
    ├─ Writes cookie on locale change
    ├─ Sets document.documentElement.lang/dir
    └─ Provides useLocale() hook to Client Components
    ↓
Pages & Components
    ├─ Server Pages: getLocaleServer() → pass as prop
    ├─ Client Pages: useLocale() hook
    └─ Mixed approach = **INCONSISTENCY**
```

### Two Translation Methods

#### Method 1: Server-Side (Landing Pages)
- **Used by:** Hero, WhatWeOffer, HowItWorks, Testimonials, FAQ, FinalCTA, Footer
- **Pattern:**
  ```tsx
  // app/page.tsx
  export default async function HomePage() {
    const locale = await getLocaleServer()
    return <HeroSection locale={locale} /> // Pass as prop
  }
  
  // components/landing/hero-section.tsx
  export function HeroSection({ locale }: { locale: Locale }) {
    return <h1>{t(locale, 'English', 'العربية')}</h1>
  }
  ```
- **Advantage:** 0 hydration mismatch, initial render matches SSR perfectly
- **Disadvantage:** When user toggles locale, **NO re-render** — server value never updates on client

#### Method 2: Client-Side (About + Dashboard Pages)
- **Used by:** AboutContent, all Dashboard pages, Admin pages
- **Pattern:**
  ```tsx
  'use client'
  
  export function AboutContent() {
    const { locale } = useLocale()
    return <h1>{t(locale, 'English', 'العربية')}</h1>
  }
  ```
- **Advantage:** Locale changes instantly when user toggles (context subscription works)
- **Disadvantage:** On first hydration, browser renders with **undefined locale** until context provider injects value → **flash of English**

---

## PHASE 2: Landing Components Audit

| Component | File | Method | Locale Prop | useLocale | Status |
|-----------|------|--------|-------------|-----------|--------|
| **SegmentedHeader** | `components/landing/segmented-header.tsx` | Client + useLocale | ✗ | ✅ | ✅ Correct |
| **HeroSection** | `components/landing/hero-section.tsx` | Server Prop | ✅ | ✗ | ✅ Correct |
| **HowItWorks** | `components/landing/how-it-works.tsx` | Server Prop | ✅ | ✗ | ✅ Correct |
| **WhatWeOffer** | `components/landing/what-we-offer.tsx` | Server Prop | ✅ | ✗ | ✅ Correct |
| **Testimonials** | `components/landing/testimonials.tsx` | Server Prop | ✅ | ✗ | ✅ Correct |
| **FAQ** | `components/landing/faq.tsx` | Server Prop (via Client) | ✅ | ✗ | ⚠️ **Async issue** |
| **FinalCTA** | `components/landing/final-cta.tsx` | Server Prop | ✅ | ✗ | ✅ Correct |
| **FooterSimple** | `components/ui/footer.tsx` | Server Prop | ✅ | ✗ | ✅ Correct |

### FAQ Component — Special Case

```tsx
// components/landing/faq.tsx
'use client'
export function FAQ({ locale }: { locale: Locale }) {
  // ✅ Receives locale as prop
  // ⚠️ BUT marked as 'use client'
  // When parent changes locale, FAQ doesn't re-render
  // (parent is async server component, child is client)
}
```

**Issue:** FAQ is marked `'use client'` but receives static locale prop. When user toggles language, the parent (HomePage, which is Server Component) **cannot** re-render, so FAQ never updates.

---

## PHASE 3: String Usage Search Results

### Translation Function Usage
**Total `t(locale, ...)` calls:** ~120+ across project  
**Landing Page only:** ~40 calls

### Hardcoded Strings in Landing (Critical Scan)

✅ **NO PURE HARDCODED ENGLISH FOUND** in landing components (hero, how-it-works, what-we-offer, testimonials, faq, final-cta)

All user-facing text uses either:
- `t(locale, en, ar)` function
- `locale === 'ar' ? arString : enString` ternary

**Exception:** SegmentedHeader has pure hardcoded strings:
- `'Together for a better life'` → Only in subtitle (minor)
- Navigation labels in NAV_LINKS array use manual `en`/`ar` properties (not t() — but intentional for object structure)

---

## PHASE 4: Translation Flow Diagram

### Current Flow (Problematic)

```
┌─────────────────────────────────────────────────────────────┐
│ Request (locale=ar or locale=en from cookie/header)         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ app/layout.tsx (Server)     │
        │ getLocaleServer() → "ar"    │
        └────────────┬────────────────┘
                     │
                     ▼
        ┌─────────────────────────────────────┐
        │ <html lang="ar" dir="rtl">          │
        │ <LocaleProvider initialLocale="ar"> │
        └─────────────┬───────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
    ┌─────────────┐      ┌──────────────────────┐
    │ Landing     │      │ Client Components    │
    │ (SSR Props) │      │ (useLocale Context)  │
    │ locale="ar" │      │ locale="ar" (hydrate)│
    │             │      │                      │
    │ ✅ Correct  │      │ ✅ Correct           │
    │ render      │      │ hydration            │
    └──────┬──────┘      └──────────┬───────────┘
           │                        │
           └────────────┬───────────┘
                        │
                   ▼ USER TOGGLES LANGUAGE ▼
                        │
        ┌───────────────────────────────────────┐
        │ useLocale().toggleLocale()             │
        │ Sets cookie: ldc_locale=en             │
        │ Updates HTML: lang="en" dir="ltr"      │
        │ Updates Context: locale="en"           │
        └──────┬────────────────────────────────┘
               │
     ┌─────────┴──────────┐
     │                    │
     ▼                    ▼
  ┌─────────┐        ┌─────────────────────┐
  │ Landing │        │ Client Components   │
  │         │        │                     │
  │ ❌ STUCK│        │ ✅ Updates (context │
  │ on ar   │        │    subscription)    │
  │         │        │                     │
  └─────────┘        │ Shows: English ✅   │
  Shows: Arabic ❌   └─────────────────────┘
```

**Key Problem:** Landing pages receive `locale` as **static prop** on first render. When LocaleProvider updates context, the server-component-provided prop **never changes** — components are frozen at initial locale.

---

## PHASE 5: Problem Classification

### CRITICAL (Breaks Core Functionality)

| Problem | Location | Symptom | Root Cause |
|---------|----------|---------|-----------|
| **Language toggle doesn't work on landing** | Landing pages (Hero, How-it-works, etc.) | Click "العربية" button → page stays English | Server props don't re-evaluate when context changes |
| **About page flashes English on load** | `/about` page (AboutContent) | Brief English text before switching to Arabic | `useLocale()` starts undefined, context resolves after hydration |
| **SEO metadata always English** | Root layout (openGraph, title, description) | og:title is always English regardless of locale | Static metadata in layout, never reads locale context |

### HIGH (Breaks some pages)

| Problem | Location | Symptom | Root Cause |
|---------|----------|---------|-----------|
| **FAQ doesn't update on language toggle** | `/` landing FAQ section | User clicks "العربية" → FAQ stays English | FAQ is `'use client'` but parent (HomePage) is async Server Component, can't re-render on context change |
| **Dashboard locale doesn't sync with landing** | Dashboard pages | Switch language on landing → go to dashboard → still old language | Each uses different locale source (context vs prop), cookie not always read |
| **Navbar language doesn't match page** | Header + Landing | Header shows "العربية" but page content is English | SegmentedHeader uses `useLocale()` (updates) but Landing uses static props (doesn't) |

### MEDIUM (Causes flashing/flicker)

| Problem | Location | Symptom | Root Cause |
|---------|----------|---------|-----------|
| **Flash of wrong language** | Pages using `useLocale()` (About, Dashboard) | Entire page loads in English → switches to Arabic instantly | Browser hydrates with undefined locale, context injects after |
| **Direction flashing (LTR → RTL)** | Any page on load when `lang` is Arabic | Layout shift as content reflows from LTR to RTL | `suppressHydrationWarning` on html tag masks the warning, but direction changes after hydration |
| **Locale cookie not synced on refresh** | After user toggles locale | Hard refresh → locale reverts to browser default | Cookie written correctly, but Accept-Language header has priority in some cases |

### LOW (Visual/Polish)

| Problem | Location | Impact |
|---------|----------|---------|
| Mobile nav language toggle text changes | SegmentedHeader mobile menu | "التبديل إلى العربية" ↔ "Switch to English" updates instantly (correct, but jarring) |
| RTL attribute on nested elements | Footer, Nav dropdowns | Some text alignment might be inconsistent in dropdowns |
| Icon rotation on RTL | All pages | Some icons use `rtl:rotate-180` correctly, but not all (e.g., arrows in buttons) |

---

## PHASE 6: Translation Status Matrix

### Landing Pages

| Page | Metadata | Component | Locale Control | Issues |
|------|----------|-----------|-----------------|--------|
| **Home** | Static English | Server Props | ❌ No Toggle | Metadata always English; Landing doesn't update on language change |
| **About** | Mixed (en + ar) | useLocale Client | ✅ Toggles | Flash of English on first load |
| **Services** | Dedicated pages | Server Props | ❌ No Toggle | Each service page frozen to initial locale |
| **Contact** | Static | useLocale Client | ✅ Toggles | Should work but not tested |
| **Shop** | Static | useLocale | ✅ Toggles | Shop locale works, but product metadata not locale-aware |

### Navigation

| Element | Method | Works | Notes |
|---------|--------|-------|-------|
| Header (SegmentedHeader) | useLocale | ✅ | Updates correctly |
| Footer | Server Prop | ❌ | Doesn't update when user toggles on landing |
| Mobile Menu | useLocale | ✅ | Language toggle works |
| Dropdown Menus | useLocale | ✅ | Descriptions update |

### Dashboard (Not Landing, but Related)

| Page | Method | Translation Quality |
|------|--------|-------------------|
| Weight Tracker | useLocale | ✅ Good |
| Meal Plans | useLocale | ✅ Good |
| Checkout | useLocale | ✅ Good |
| Notifications | useLocale | ✅ Good |
| Settings | useLocale | ✅ Good |
| Admin Pages | useLocale | ✅ Good |

✅ **Dashboard locale system is correct** — all use `useLocale()` consistently.  
❌ **Landing Page system is broken** — mixes Server Props + useLocale.

---

## PHASE 7: Root Cause Analysis

### Root Cause 1: Dual Locale Sources

**Problem:** Landing uses **server-side props**, Dashboard uses **client-side context**.

```tsx
// LANDING (Server Props) ← Frozen at SSR time
export default async function HomePage() {
  const locale = await getLocaleServer()
  return <HeroSection locale={locale} /> // Never updates
}

// DASHBOARD (Client Context) ← Updates with user
'use client'
export function Dashboard() {
  const { locale } = useLocale() // Subscribes to changes
  return <div>{locale}</div>
}
```

**Why This Breaks:**
- When user toggles language, the cookie updates
- But Server Components **don't re-render** when props don't change
- The `locale` prop passed to HeroSection stays the same
- React sees same props → skips re-render
- Landing page is frozen at initial locale

---

### Root Cause 2: Async Server Component → 'use client' Child Misalignment

**Problem:** FAQ is marked `'use client'` but receives locale as static prop from Server Component parent.

```tsx
// app/page.tsx (Server Component)
export default async function HomePage() {
  const locale = await getLocaleServer()
  return <FAQ locale={locale} /> // Static prop
}

// components/landing/faq.tsx ('use client')
'use client'
export function FAQ({ locale }: { locale: Locale }) {
  // This component doesn't subscribe to locale changes
  // Parent won't re-render because it's a Server Component
  // Result: FAQ frozen to initial locale
}
```

**Impact:** Even if we fix Root Cause 1, FAQ won't update because it's a "use client" component receiving props from a Server Component that doesn't watch for changes.

---

### Root Cause 3: SEO Metadata Not Locale-Aware

**Problem:** Root layout metadata is static, hardcoded in English.

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: 'Lover Diet Center — Science-Based Nutrition in UAE', // English only
  description: 'Personalized nutrition consultations...', // English only
  openGraph: {
    title: 'Lover Diet Center — Transform Your Health', // English only
    locale: 'en_AE', // Hardcoded
  },
}
```

**Impact:**
- og:title, og:description, og:locale never change
- When user switches to Arabic, social meta tags still say English
- Search engines index the page in one language only (English)
- Bilingual pages lose SEO value for Arabic queries

---

### Root Cause 4: Cookie vs Header Priority Inconsistency

**Problem:** getLocaleServer() has priority order, but not all code follows it.

```tsx
export async function getLocaleServer(): Promise<Locale> {
  // 1. Try cookie
  const cookieStore = await cookies()
  const raw = cookieStore.get(LOCALE_COOKIE)?.value
  if (raw === 'ar' || raw === 'en') return raw
  
  // 2. Try Accept-Language header
  const h = await headers()
  const accept = h.get('accept-language') ?? ''
  // ...
  
  // 3. Default
  return DEFAULT_LOCALE
}
```

**Issue:** After user toggles language:
- Cookie is set correctly: `ldc_locale=ar`
- BUT if browser's Accept-Language is `en-US`, on some pages it might read from header instead
- Creates inconsistency between page refreshes

---

## PHASE 8: Fix Strategy (By PR)

### PR 1: Unify Locale Source for Landing Pages
**Goal:** Landing pages should use `useLocale()` like Dashboard does.  
**Files:** Hero, HowItWorks, WhatWeOffer, Testimonials, FAQ, FinalCTA  
**Approach:** Convert from Server Props → Client Context  
**Risk:** ⚠️ Medium — All components need to become `'use client'`

### PR 2: Fix About Page Hydration Flash
**Goal:** No English flash on first load.  
**Files:** about-content.tsx  
**Approach:** Use `suppressHydrationWarning` + sync server locale with context seed  
**Risk:** ✅ Low — Mostly CSS/timing fixes

### PR 3: Make SEO Metadata Locale-Aware
**Goal:** og:title, og:description, og:locale change with user language.  
**Files:** app/layout.tsx, app/page.tsx  
**Approach:** Dynamic metadata from getLocaleServer()  
**Risk:** ⚠️ Medium — SEO is critical, need to test all pages

### PR 4: Remove Async Boundary in FAQ
**Goal:** FAQ updates when parent locale changes.  
**Files:** app/page.tsx, components/landing/faq.tsx  
**Approach:** Ensure FAQ is not 'use client' or parent watches for changes  
**Risk:** ✅ Low — Simple restructuring

### PR 5: RTL/LTR Consistency Fixes
**Goal:** All components respect RTL direction properly.  
**Files:** All components with flexbox/grid layouts  
**Approach:** Add `rtl:` modifiers where missing, ensure text-align changes  
**Risk:** ⚠️ Medium — Touch many files, easy to miss spacing

### PR 6: Regression Testing
**Goal:** Verify no locale selection or hydration bugs.  
**Approach:** Test all pages in both languages, refresh on each page, toggle language, check social meta  
**Risk:** ✅ Low — Manual testing

---

# PHASE 9: Detailed Findings

## Files Affected by Translation Issues

### Critical Fixes Needed

1. **components/landing/hero-section.tsx** — Doesn't update on locale toggle
2. **components/landing/what-we-offer.tsx** — Doesn't update on locale toggle
3. **components/landing/how-it-works.tsx** — Doesn't update on locale toggle
4. **components/landing/testimonials.tsx** — Doesn't update on locale toggle
5. **components/landing/faq.tsx** — Doesn't update; also marked 'use client' with static prop
6. **components/landing/final-cta.tsx** — Doesn't update on locale toggle
7. **components/ui/footer.tsx** — Doesn't update on landing page
8. **app/page.tsx** — Should pass locale as context provider, not prop
9. **app/layout.tsx** — SEO metadata should be dynamic, not static
10. **app/about/about-content.tsx** — Flashes English on first load

### Medium Priority

11. **components/landing/segmented-header.tsx** — Works but could be optimized
12. **app/service-pages/** (nutrition-consultations, healthy-meals, etc.) — Frozen to initial locale

### Low Priority (Minor)

13. Icon rotation on RTL needs review across all components
14. Navbar RTL text alignment in dropdowns

---

## Configuration Files

### lib/locale-server.ts
✅ **Correct** — Priority order is sensible (cookie > header > default)

### lib/locale-shared.ts
✅ **Correct** — Pure function, no issues

### lib/locale.tsx
✅ **Mostly Correct** — localStorage migration logic is good  
⚠️ **Minor:** Could add fallback if context is missing (currently throws error)

### middleware.ts
✅ **Correct** — Just delegates to Supabase middleware

### app/layout.tsx
❌ **Critical:** Metadata is static, should be dynamic  
❌ **Critical:** Doesn't re-render when server locale changes (by design, but needs workaround)

---

## Translation Coverage

### English ↔ Arabic Coverage

✅ **Full Coverage:** Hero, Navigation, Footer, FAQ, Testimonials, How-it-works, Services  
⚠️ **Partial Coverage:** Some admin labels, error messages  
❌ **Missing:** Error toast messages (some are English-only)

---

## Performance Impact

### Bundle Size
- `lib/locale.tsx` — ~2KB
- `lib/locale-shared.ts` — ~0.2KB
- Translation strings — ~50KB (hardcoded in components)

### Runtime Performance
✅ **No slowdown** — t() function is O(1), context updates are efficient

### SEO Impact
❌ **Negative** — Static English metadata means Arabic traffic gets wrong og:tags  
❌ **Crawl Efficiency** — Search engines might index the same URL twice (en + ar content) but with same metadata

---

---

# Summary Table

| Category | Status | Issues | Severity |
|----------|--------|--------|----------|
| **Architecture** | ⚠️ Mixed | Dual locale sources (Server Props + Client Context) | CRITICAL |
| **Landing Pages** | ⚠️ Broken | Language toggle doesn't work | CRITICAL |
| **Dashboard** | ✅ Good | All use Client Context consistently | — |
| **Hydration** | ⚠️ Issues | About page flashes English | HIGH |
| **SEO** | ❌ Missing | Metadata always English | HIGH |
| **Navigation** | ⚠️ Partial | Header works, Footer doesn't | MEDIUM |
| **String Coverage** | ✅ Complete | No hardcoded English found | — |
| **RTL/LTR** | ⚠️ Incomplete | Some icons/text not RTL-optimized | LOW |

---

# Recommended Execution Order

## Phase A: Foundation (Week 1)
1. **PR 1:** Unify Locale Source → Convert Landing pages to useLocale()
2. **PR 3:** Make SEO Metadata Dynamic

## Phase B: Polish (Week 2)
3. **PR 2:** Fix About Page Hydration
4. **PR 4:** Remove Async Boundary in FAQ

## Phase C: Quality (Week 3)
5. **PR 5:** RTL/LTR Consistency Fixes
6. **PR 6:** Regression Testing + Final Review

---

# Estimated Effort

| Task | Files | Effort | Risk |
|------|-------|--------|------|
| Unify Locale Source (PR 1) | 8 | **High** (convert Server Components) | Medium |
| Dynamic SEO (PR 3) | 2 | Medium | Medium |
| Hydration Flash (PR 2) | 1 | Low | Low |
| Async Boundary (PR 4) | 2 | Low | Low |
| RTL/LTR (PR 5) | 20+ | Medium | Medium |
| Testing (PR 6) | — | Medium | Low |

**Total Estimated Time:** 20-30 hours of work + testing

---

# Critical Blockers

❌ **Cannot fix landing language toggle without converting Server Components to 'use client'**

This is an architectural decision:
- **Option A (Recommended):** Convert Landing to Client Components, accept larger JS bundle (~20KB)
- **Option B:** Keep Server Components, use URL-based locale routing (/en/... and /ar/...), more complex
- **Option C:** Hybrid — Server renders, but wraps in Client Provider that can update

**Recommendation:** Option A — Client Components are simpler, Landing is already interactive (mobile menu, dropdowns), bundle impact is minimal.

---

# Actionable Recommendations

## Immediate (Do Before Shipping 1.0)

1. **Convert Landing Pages to useLocale()** — Fix the language toggle breaking issue
2. **Make SEO Metadata Dynamic** — Fix og:title not translating
3. **Test Language Toggle** — Verify all pages update in real-time

## Before Launch to Production

4. **Remove Async Boundary in FAQ** — Ensure FAQ updates with locale
5. **Test Hydration** — Verify no "flash of wrong language" on About page
6. **Browser Testing** — Test all pages in Safari, Chrome, Firefox (RTL is browser-specific)

## Post-Launch Optimization

7. RTL/LTR Icon + Text Alignment Review
8. Monitor analytics for locale switching patterns
9. A/B test metadata for Arabic SEO

---

**Report Completed:** 2026-07-08  
**No code changes applied** — Audit phase only, as requested.

Next step: Review this report, approve architectural decisions, then proceed with PRs in Recommended Order.
