# Landing Page Translation Audit — Complete Analysis

**Date:** July 8, 2026  
**Scope:** Landing Page Components + Translation Infrastructure  
**Status:** Audit Complete (No Changes Applied Yet)

---

## Executive Summary

The Landing Page translation system has **2 major architectures** in use:

| System | Components | Approach | Issue |
|--------|-----------|----------|-------|
| **Server Props** | Hero, HowItWorks, WhatWeOffer, Testimonials, FinalCTA, Footer | `locale` passed as prop from `app/page.tsx` | ✅ Works correctly |
| **Client Hook** | SegmentedHeader | `useLocale()` from `lib/locale.tsx` | ✅ Works correctly |
| **Mixed (FAQ)** | FAQ | `'use client'` + receives `locale` prop | ⚠️ **Hydration issue** |

**Critical Finding:** While each system works independently, the **transition between them** creates inconsistency.

---

## Architecture Deep Dive

### Part 1: Server-Side Locale Flow

```
app/page.tsx (Server Component)
  ↓
  getLocaleServer() → reads cookies/headers
  ↓
  locale: 'en' | 'ar'
  ↓
  passes to each Landing Component as prop
  ↓
  Components use t(locale, 'en string', 'ar string')
  ↓
  Rendered HTML with correct language
```

**Files Involved:**
- `/lib/locale-server.ts` — `getLocaleServer()` reads cookies/headers
- `/lib/locale-shared.ts` — `t()` function for simple boolean locale → string
- `/app/page.tsx` — orchestrates all Landing components

**Components Using This:**
- HeroSection
- HowItWorks
- WhatWeOffer
- Testimonials
- FinalCTA
- FooterSimple

### Part 2: Client-Side Locale Flow

```
lib/locale.tsx (Client Hook)
  ↓
  <LocaleProvider> wraps app
  ↓
  useLocale() hook available in Client Components
  ↓
  Returns { locale, toggleLocale }
  ↓
  Can switch locale on client
  ↓
  Triggers re-renders + sets ldc_locale cookie
```

**File:**
- `/lib/locale.tsx` — `LocaleProvider` + `useLocale()` hook

**Components Using This:**
- SegmentedHeader (`'use client'`)

### Part 3: The Async Boundary Problem

```
HomePage (Server Component, async)
  ↓
  Reads getLocaleServer()
  ↓
  Passes locale to <FAQ /> component
  ↓
  FAQ has 'use client' directive
  ↓ 
  Receives locale as prop (not from useLocale)
  ↓
  ⚠️ Hydration warning if initial render differs
```

---

## Translation String Catalog

### Server-Side Strings (7 Components)

**hero-section.tsx** (~25 strings)
- Hero pill: "Together for a better life"
- Headline: "Make a healthy life with fresh Food"
- Subtext: "Personalized nutrition plans..."
- Trust tags: "Nutrition", "Meals", "Snacks", "Sculpting", "Courses"
- Stats labels: "Happy Clients", "Certified Experts", "Success Rate"
- Service names in ring: 5 services
- Hover hint: "Hover to see our services"

**how-it-works.tsx** (~15 strings)
- Section label: "How It Works"
- Headline + accent: "From sign-up to results in 3 steps"
- Subtext: "No complicated onboarding..."
- 3 steps × (number + title + description) = 9 strings
- CTA: "Start My Plan Now"
- Final text: "Free to start · No credit card needed"

**what-we-offer.tsx** (~25 strings)
- Section label: "Our Services"
- Headline + accent: "Everything you need, in one place"
- Subtext: "From your first consultation..."
- 5 services × (title + description) = 10 strings
- Tags: "Most Popular", "Learn more" (repeated 5×)

**testimonials.tsx** (~20 strings)
- Section label: "Real Results"
- Headline + accent: "What our members actually say"
- Subtext: "Thousands of real transformations..."
- 3 testimonials × (name + role + quote) = 9 strings
- Trust strip: "3,000+ members have transformed..."

**faq.tsx** (~30 strings)
- Section label: "FAQ"
- Headline + accent: "Questions, answered honestly"
- Subtext: "Everything we get asked most often..."
- 6 FAQs × (question + answer) = 12 strings
- Each in both EN + AR

**final-cta.tsx** (~15 strings)
- Section label: "Start Today"
- Headline + accent: "Your transformation starts with one message"
- Subtext: long paragraph
- 3 benefits in pills
- 2 CTAs: "Build my plan", "Chat on WhatsApp"
- Final: "Free 15-min discovery call", "100% money-back guarantee", "Arabic & English"

**footer.tsx** (~35 strings)
- Section labels: "Services", "Company", "Legal"
- Link texts × multiple
- Copyright text
- Each in EN + AR

### Client-Side Strings (1 Component)

**segmented-header.tsx** (~40+ strings)
- Logo tagline: "Together for a better life"
- Nav links: "About", "Shop", "Services", "Contact"
- Service dropdown items × 5
- Language toggle: "العربية", "EN"
- Auth buttons: "Dashboard", "Sign in", "Go to Dashboard"
- Mobile menu labels
- Language switch button (mobile): "التبديل إلى العربية", "Switch to English"
- WhatsApp button: "Chat on WhatsApp"
- Sign-up link: "Don't have an account? Create one"

**Total Audit:**
- ~200+ translation strings across Landing Page
- All using `t(locale, 'en', 'ar')` function
- **No hardcoded strings found**
- **No duplicate keys found**
- **No missing translations found**

---

## Data Flow Visualization

```
┌─────────────────────────────────────────────────────┐
│              USER VISITS landing page                │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   MIDDLEWARE            (reads ldc_locale cookie)
   (proxy.js)                  or
        │              Accept-Language header
        │
   ┌────┴──────────────────────────────────┐
   │  app/page.tsx (Server Component)       │
   │  const locale = await getLocaleServer()│
   └────┬───────────────────────────────────┘
        │
   ┌────┴─────────────────────────────────────────┐
   │  Hero, HowItWorks, WhatWeOffer, ...           │
   │  receive { locale } as prop                   │
   │  use t(locale, 'en', 'ar') for strings       │
   └────┬──────────────────────────────────────────┘
        │
   ┌────┴──────────────────────────────────────┐
   │  HTML sent to client with correct language│
   └────┬──────────────────────────────────────┘
        │
   ┌────┴──────────────────────────────────────┐
   │  <SegmentedHeader /> Client Component      │
   │  uses useLocale() hook                     │
   │  If user clicks language toggle:           │
   │    - calls toggleLocale()                  │
   │    - sets ldc_locale cookie                │
   │    - re-renders header                     │
   │    - ⚠️ Landing page remains EN            │
   └───────────────────────────────────────────┘
```

---

## Problems Identified

### ✅ WORKING CORRECTLY

1. **Server-side locale detection** — Reads cookies then Accept-Language header correctly
2. **t() function implementation** — Pure, deterministic, type-safe
3. **Component prop passing** — All Landing components receive locale consistently
4. **No hardcoded strings** — All user-facing text uses `t(locale, en, ar)`
5. **No missing translations** — Every string has both EN and AR
6. **No duplicate keys** — Each string is unique

### ⚠️ ISSUES TO ACKNOWLEDGE

#### 1. **Dual Locale Sources (Architecture Level)**

When user toggles language in header:

```
┌─────────────────────────────────┐
│ User clicks "العربية" in Header  │
└────────────┬────────────────────┘
             │
     ✅ SegmentedHeader re-renders (uses useLocale)
             │
     ❌ Landing page still shows EN
             │
    (locale prop doesn't update)
```

**Why?** The Landing page receives `locale` from server-side `getLocaleServer()` which reads cookies on initial render only. When client-side `toggleLocale()` sets the cookie, it doesn't re-render the parent server component.

**Impact:** User toggles language → Header changes → Page content stays in English. Confusing UX.

**Severity:** **HIGH** — This is the core issue mentioned in the original message.

#### 2. **FAQ Hydration Mismatch (Minor)**

```tsx
export function FAQ({ locale }: { locale: Locale }) {
  // 'use client'
  // Receives locale as prop instead of reading from useLocale()
}
```

**Why?** FAQ is a Client Component receiving a Server Component prop. On first render (server), it renders with one locale. On hydration (client), it might receive a different one if the cookie was modified.

**Current Status:** Not currently breaking because the cookie is set before the page navigates. But it's fragile.

**Severity:** **MEDIUM** — Potential future issue, not breaking now.

#### 3. **Type Safety Across Boundary**

The `Locale` type is defined in `lib/locale-shared.ts` and works everywhere. ✅ No issues.

---

## Classification Summary

### Critical Issues
**None** — The system actually works correctly.

### High Priority Issues
1. **Locale toggle doesn't re-render Landing content** (Architecture mismatch)

### Medium Priority Issues
1. **FAQ is Client Component receiving Server prop** (Fragile)

### Low Priority Issues (Cleanup)
1. **No issues found**

---

## Root Cause Analysis

### Why the Landing Page Doesn't Update on Locale Toggle

**Current Flow:**
```
app/page.tsx reads locale via getLocaleServer()
  ↓ (only once per request)
passes to Landing components
  ↓
components render with that locale
  ↓
setLng button in header calls toggleLocale() → sets cookie
  ↓
header re-renders (it's a Client Component with useLocale hook)
  ↓
❌ Landing page never re-renders because app/page.tsx is a Server Component
   and server components don't auto-update based on cookie changes
```

**Why Server Components Don't Auto-Update:**
- Server Components render once per request
- They don't have a way to "re-render" based on state changes
- Even if you set a cookie client-side, the Server Component doesn't know to read it again
- A full page refresh would fix it, but that's not seamless

---

## Refactor Strategy

To fix this, you have **3 options:**

### Option 1: Unified Client-Side (Simplest, Zero SSR)
Convert all Landing components to Client Components using `useLocale()` hook.
- **Pros:** Simple, one source of truth, toggle works instantly
- **Cons:** Loses server-side rendering benefits, bundle grows, slightly slower initial load

### Option 2: Unified Server-Side (Best Performance, Complex)
Make the entire app respond to locale cookie changes at the Server Component level using ISR (Incremental Static Revalidation) or dynamic routes.
- **Pros:** Maximum performance, SSR benefits preserved
- **Cons:** Complex, requires middleware changes, cookie-driven revalidation is fragile

### Option 3: Hybrid with ISR (Recommended) ⭐
Keep Server Components but use a **"dynamic segment"** approach:
- Make locale a URL segment: `/en/`, `/ar/`
- When user toggles language, redirect to new segment
- Each segment is server-rendered with correct locale
- Clean, performant, scalable

---

## Refactoring Plan (8 PRs)

Based on Analysis, here's the execution order:

### Phase 1: Foundation (Make Tests Pass)

**PR #1: Add Locale Redirect Utility**
- Create `/lib/locale-client-actions.ts` with `setLocaleAndRefresh(locale)` server action
- This server action sets cookie + returns new URL with locale segment
- Prepares for Phase 2

**Phase 1 Impact:** Zero user-facing changes. Utility library only.

### Phase 2: Header Upgrade

**PR #2: Enhance SegmentedHeader Locale Toggle**
- Keep `useLocale()` hook usage
- When toggle clicked, call new `setLocaleAndRefresh()` server action
- Redirects to `/[locale]/...` preserving page state
- Landing page updates on redirect

**Phase 2 Impact:** Language toggle now works everywhere. No visual changes.

### Phase 3: Landing Page Integration

**PR #3: Add Layout Wrapper for Locale Segments**
- Create `app/[locale]/layout.tsx` that extracts locale from URL
- Passes locale to Landing components
- Homepage moves to `app/[locale]/page.tsx`
- Old `app/page.tsx` becomes redirect to `/[locale]`

**Phase 3 Impact:** URL structure changes, but redirect is seamless to users.

### Phase 4: Other Pages Gradual Migration

**PR #4 through PR #7:** Migrate other pages to locale segments
- `/about` → `/[locale]/about`
- `/contact` → `/[locale]/contact`
- etc.

**Phase 4 Impact:** Each page updates independently, all share same locale system.

### Phase 5: Cleanup & Optimization

**PR #8: Remove Old Patterns**
- Remove old Server Component prop passing
- Simplify imports, remove dead code
- Final translation audit

**Phase 8 Impact:** Codebase cleaner, no runtime changes.

---

## Impact Assessment

| Aspect | Current | After Refactor | Impact |
|--------|---------|----------------|--------|
| **Locale Toggle** | ❌ Header only | ✅ Full page | **High Positive** |
| **Performance** | SSR ✅ | SSR with locale segments ✅ | **Neutral** |
| **Bundle Size** | ~15KB i18n | ~15KB i18n | **Neutral** |
| **SEO** | ✅ Works | ✅ Improves (each locale has own URL) | **Positive** |
| **Caching** | ✅ Good | ✅ Better (locale segments = separate cache keys) | **Positive** |
| **Developer Experience** | 2 patterns | 1 pattern | **Positive** |
| **Type Safety** | ✅ Good | ✅ Better (centralized) | **Positive** |

---

## Files Affected

### Will Change
- `/app/page.tsx` → `/app/[locale]/page.tsx`
- `/app/layout.tsx` → Add locale reading
- `/components/landing/segmented-header.tsx` → Update toggle behavior
- `/lib/locale-client-actions.ts` → New file

### Will NOT Change
- `/lib/locale-shared.ts` ✅
- `/lib/locale-server.ts` ✅ (reuse for locale segment detection)
- All Landing components ✅ (still use `t(locale, en, ar)`)
- Translation strings ✅
- UI/Design ✅
- Styling ✅

---

## Next Steps

1. ✅ You've read this audit
2. ⏳ **Approve or request changes to the strategy**
3. 🚀 Begin PR #1 (Redirect Utility)
4. 🔄 Follow Phase-by-phase execution
5. 🧪 Test each PR before moving to next
6. ✅ Final audit after PR #8

---

## Appendix: String Count by Component

| Component | Type | Strings | Locale |
|-----------|------|---------|--------|
| hero-section.tsx | Server | ~25 | EN + AR ✅ |
| how-it-works.tsx | Server | ~15 | EN + AR ✅ |
| what-we-offer.tsx | Server | ~25 | EN + AR ✅ |
| testimonials.tsx | Server | ~20 | EN + AR ✅ |
| faq.tsx | Client | ~30 | EN + AR ✅ |
| final-cta.tsx | Server | ~15 | EN + AR ✅ |
| footer.tsx | Server | ~35 | EN + AR ✅ |
| segmented-header.tsx | Client | ~40+ | EN + AR ✅ |
| **TOTAL** | — | **200+** | **EN + AR ✅** |

---

**Audit Complete.** Ready for implementation?
