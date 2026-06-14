# Design

## Theme

Light.

**Scene:** A 32-year-old professional in Cairo or Riyadh, sitting on their couch after dinner, scrolling on their phone. They've tried generic diet apps before and felt unseen. The room is well-lit, they're relaxed but skeptical. They need an interface that feels authoritative without being clinical — a place that respects their time and their body.

This scene forces light mode: health and nutrition content needs to feel fresh, appetizing, and trustworthy. Dark mode would fight the food photography and make the space feel like a terminal, not a consultation room.

## Color

### Strategy

**Committed.** Teal is the identity color, carrying 30–50% of structured surfaces (borders, dividers, secondary backgrounds, icon fills, section headings). Orange is the committed accent for primary CTAs and active states only. White is the canvas — the majority of backgrounds stay clean.

### Palette (OKLCH)

```css
--color-white: oklch(0.99 0.003 200);
--color-teal-50: oklch(0.95 0.02 200);
--color-teal-100: oklch(0.9 0.04 200);
--color-teal-200: oklch(0.85 0.06 200);
--color-teal-300: oklch(0.75 0.09 200);
--color-teal-400: oklch(0.65 0.11 200);
--color-teal-500: oklch(0.55 0.12 200);
--color-teal-600: oklch(0.45 0.1 200);
--color-teal-700: oklch(0.38 0.08 200);
--color-orange-50: oklch(0.95 0.03 55);
--color-orange-100: oklch(0.88 0.06 55);
--color-orange-200: oklch(0.8 0.1 55);
--color-orange-300: oklch(0.72 0.14 55);
--color-orange-400: oklch(0.65 0.16 55);
--color-orange-500: oklch(0.58 0.17 55);
--color-orange-600: oklch(0.5 0.15 55);
--color-orange-700: oklch(0.42 0.12 55);
--color-neutral-50: oklch(0.97 0.005 200);
--color-neutral-100: oklch(0.93 0.005 200);
--color-neutral-200: oklch(0.88 0.006 200);
--color-neutral-300: oklch(0.78 0.006 200);
--color-neutral-400: oklch(0.65 0.007 200);
--color-neutral-500: oklch(0.52 0.008 200);
--color-neutral-600: oklch(0.42 0.008 200);
--color-neutral-700: oklch(0.32 0.007 200);
--color-neutral-800: oklch(0.22 0.006 200);
--color-neutral-900: oklch(0.14 0.005 200);
```

All neutrals tinted toward the brand hue (chroma 0.003–0.008 at 200°). Never pure gray, never pure black or white.

### Role assignments

| Role | Token | Notes |
|---|---|---|
| Background (page) | `--color-white` | |
| Background (card) | `--color-neutral-50` | Subtle separation without a hard border |
| Text (primary) | `--color-neutral-900` | |
| Text (secondary) | `--color-neutral-500` | |
| Text (tertiary) | `--color-neutral-400` | |
| Border / divider | `--color-teal-100` | Teal-tinted, not gray |
| Accent (default) | `--color-teal-500` | Icons, links, secondary buttons |
| Accent (hover) | `--color-teal-600` | |
| CTA (primary) | `--color-orange-500` | "Start", "Order", "Book" buttons |
| CTA (hover) | `--color-orange-600` | |
| Success | `--color-teal-400` | |
| Error | `oklch(0.55 0.18 25)` | Reddish, but warm-toned |
| Focus ring | `--color-teal-400` | 2px solid + 2px offset |

### Surface tinting

Every surface should feel slightly warm via the teal-tinted neutrals. Cards use `--color-neutral-50` (chroma 0.005 at 200°). Elevated surfaces (modals, dropdowns) use `--color-white` with a subtle teal-tinged shadow: `0 4px 24px oklch(0.55 0.03 200 / 0.12)`.

## Typography

### Stack

```css
--font-heading: 'Tajawal', 'Montserrat', system-ui, sans-serif;
--font-body: 'Tajawal', 'Open Sans', system-ui, sans-serif;
```

Tajawal first for Arabic-native glyphs with geometric precision. Montserrat and Open Sans as the English fallbacks matching the same proportions.

### Scale

```css
--text-xs: 0.75rem;     /* 12px — captions, metadata */
--text-sm: 0.875rem;    /* 14px — body small */
--text-base: 1rem;      /* 16px — body */
--text-lg: 1.125rem;    /* 18px — intro text */
--text-xl: 1.25rem;     /* 20px — section subtitle */
--text-2xl: 1.5rem;     /* 24px — section heading */
--text-3xl: 1.875rem;   /* 30px — hero sub */
--text-4xl: 2.25rem;    /* 36px — hero heading */
--text-5xl: 3rem;       /* 48px — display */
```

Ratio between steps ≈ 1.25 (major third). Body line length capped at 70ch. Headings use `--font-heading` with weight 600–700; body uses `--font-body` with weight 400.

### Line height

```css
--leading-tight: 1.15;   /* headings */
--leading-normal: 1.5;   /* body */
--leading-relaxed: 1.7;  /* long-form content */
```

## Spacing

```css
--space-1: 0.25rem;
--space-2: 0.5rem;
--space-3: 0.75rem;
--space-4: 1rem;
--space-5: 1.25rem;
--space-6: 1.5rem;
--space-8: 2rem;
--space-10: 2.5rem;
--space-12: 3rem;
--space-16: 4rem;
--space-20: 5rem;
--space-24: 6rem;
```

Not a uniform grid. Vary padding between sections for rhythm. Section-to-section gaps use `--space-16` to `--space-24`. Internal card padding uses `--space-6`. Compressed at mobile by one step.

## Radius

```css
--radius-sm: 0.375rem;
--radius-md: 0.75rem;
--radius-lg: 1rem;
--radius-xl: 1.25rem;
--radius-full: 9999px;
```

## Components

### Buttons

- **Primary (CTA):** Solid `--color-orange-500`, white text, `--radius-md`, weight 600. Hover: `--color-orange-600`. Shadow on hover only: `0 4px 12px oklch(0.58 0.17 55 / 0.3)`.
- **Secondary:** Outlined `--color-teal-500`, teal text, same radius and weight.
- **Ghost:** No background, teal text. Hover: `--color-teal-50` background.

### Cards

Use sparingly. When used: background `--color-neutral-50`, no border (or `--color-teal-100` border if separation is critical), `--radius-lg`, padding `--space-6`. No nested cards.

### Forms

- Input background: `--color-white`. Border: `--color-teal-100` (1px). Focus: `--color-teal-400` ring.
- Label: `--text-sm`, `--color-neutral-500`, weight 500.
- Error text: `--text-xs`, error color, below input.

### Navigation

Top nav with teal text on white background. Active state: teal underline or teal fill. Mobile: hamburger with slide-in drawer, teal header bar.

## Motion

```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
```

Apply to hover states, page transitions, drawer slides. Never animate layout properties (width, height, top, left). Prefer opacity + transform.

## Shadows

```css
--shadow-sm: 0 1px 3px oklch(0.55 0.03 200 / 0.08);
--shadow-md: 0 4px 12px oklch(0.55 0.03 200 / 0.1);
--shadow-lg: 0 8px 24px oklch(0.55 0.03 200 / 0.12);
```

All shadows tinted teal, never neutral gray.
