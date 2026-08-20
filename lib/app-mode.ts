'use client'

import { useSyncExternalStore } from 'react'

/**
 * Is this the installed Android app rather than a browser tab?
 *
 * Two signals, because neither is reliable alone:
 *  - display-mode: standalone covers an installed PWA.
 *  - document.referrer starting with android-app:// is what a Trusted Web
 *    Activity reports, and some TWA configurations do not report standalone.
 *
 * Read through useSyncExternalStore so the server snapshot is a definite
 * `false`. Anything gated on this therefore renders its browser form in the
 * HTML and switches after hydration — never the other way round, so a browser
 * visitor can never be shown app-only UI even for a frame.
 *
 * Purely visual differences belong in the `(display-mode: standalone)` media
 * query in globals.css instead, which needs no JavaScript and cannot flicker.
 * Use this hook only when behaviour differs, not styling.
 */

function subscribe(onChange: () => void): () => void {
  const mql = window.matchMedia('(display-mode: standalone)')
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function getSnapshot(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS: Safari exposes this instead, and only supported the display-mode
    // query from 16.4 onward.
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    document.referrer.startsWith('android-app://')
  )
}

function getServerSnapshot(): boolean {
  return false
}

export function useIsApp(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
