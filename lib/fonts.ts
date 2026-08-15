import { Host_Grotesk, Rubik } from 'next/font/google'

// Defined once and shared by both root layouts. next/font hashes by call site,
// so declaring these separately in each layout would ship two copies of the
// same font CSS and two different variable class names.

export const hostGrotesk = Host_Grotesk({
  subsets: ['latin'],
  variable: '--font-host-grotesk',
  display: 'swap',
})

// Modern Arabic face with full support for diacritics, proper kerning, and
// multiple weights. Used for all Arabic content across the entire site.
// Imported via Rubik (both support Arabic subsets); the variable name
// --font-cairo is preserved so globals.css Arabic rules work without changes.
export const cairo = Rubik({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
})

/** Class list every <html> element needs for the font variables to resolve. */
export const fontClassNames = `light-mode ${hostGrotesk.variable} ${cairo.variable}`
