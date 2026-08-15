'use client'

import { useCallback, useSyncExternalStore } from 'react'

/**
 * Track a CSS media query.
 *
 * Built on useSyncExternalStore, which is the API React provides for exactly
 * this shape of problem: reading a value that lives outside React and can
 * change on its own. The previous version seeded `false`, then wrote the real
 * value with setState inside an effect — so every mount rendered once with the
 * wrong answer and immediately re-rendered, and any layout branching on this
 * hook visibly flipped on load.
 *
 * The server snapshot stays `false`: there is no viewport during SSR, and
 * React requires a defined server value to render markup at all.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])
  const getServerSnapshot = useCallback(() => false, [])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
