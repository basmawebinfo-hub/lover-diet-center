# Implementation Plan: Landing Page v1

**Branch**: `landing-page-v1` | **Date**: 2026-06-10

## Summary

Redesign `/en` route as a pure marketing landing page for Lover Diet Center with 5 core services (Consultations, Meals, Snacks, Body Sculpting, Courses) in a segmented navigation and anchored content panels. Visual identity: white/teal/orange with yellow accent detail. Font: Host Grotesk.

## Phases

### Phase 1: Foundation
- [x] Verify spec-kit initialized (`.specify/` exists)
- [x] Verify PRODUCT.md + DESIGN.md exist
- [ ] Install Host Grotesk font (Google Fonts via next/font)
- [ ] Add yellow accent OKLCH token to globals.css
- [ ] Create `/en` route with English-only layout

### Phase 2: Navigation
- [ ] Build segmented tab nav: Consultations | Meals | Snacks | Body Sculpting | Courses
- [ ] Remove extra nav items (Home, Diet Plans, Supplements, Store, About)
- [ ] Sticky header on scroll, white bg, teal active state

### Phase 3: Hero Section
- [ ] Full-width white hero
- [ ] Text left (h1, subtitle, CTAs)
- [ ] Visual right (food/body image)
- [ ] CTA: "Book a consultation" (orange) → `/onboarding`
- [ ] CTA: WhatsApp (teal outline) → `wa.me/971529033110`

### Phase 4: Service Panels
- [ ] 5 anchored sections, each with `id="service-{slug}"`
- [ ] Tab click smooth-scrolls to section
- [ ] Each panel: icon/emoji, title, description, features list, CTA
- [ ] Varied layouts (not identical cards)
- [ ] Yellow accent dot/line as decorative detail

### Phase 5: Polish
- [ ] Responsive: 375px, 768px, 1440px
- [ ] Accessibility: keyboard nav, focus states, reduced motion
- [ ] Build passes with no errors

## Design Tokens (add globals.css)

```css
--color-yellow-400: oklch(0.75 0.18 85);
--color-yellow-500: oklch(0.68 0.2 85);
--font-host-grotesk: 'Host Grotesk', system-ui, sans-serif;
```

## Route Structure

```
app/en/
├── layout.tsx        # English-only layout with segmented nav
└── page.tsx          # Landing page hero + 5 service panels
```

## Key Constraints
- English only (Arabic/RTL deferred)
- No external nav items beyond the 5 services
- No dark/lime identity, no gradient text, no glassmorphism
- All colors in OKLCH
- WCAG 2.1 AA contrast
