'use client'

import { useEffect } from 'react'

/**
 * Registers the service worker.
 *
 * Chrome only offers to install a site — and a Trusted Web Activity only
 * counts as installed — when a service worker is controlling the page, so
 * this is what makes the Android wrapper possible at all.
 *
 * Registered after load rather than during hydration: the worker's install
 * step fetches and caches assets, and doing that while the page is still
 * painting competes with the page's own requests on a phone connection.
 *
 * Development is skipped on purpose. A worker that caches dev assets will
 * happily serve them after a rebuild and produce bugs that only reproduce
 * on one machine.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    const register = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((err) => {
        // Non-fatal: the site works fine unregistered, it just is not
        // installable. Worth surfacing because a failure here silently
        // breaks the Android build.
        console.error('[sw] registration failed', err)
      })
    }

    if (document.readyState === 'complete') {
      register()
    } else {
      window.addEventListener('load', register, { once: true })
      return () => window.removeEventListener('load', register)
    }
  }, [])

  return null
}
