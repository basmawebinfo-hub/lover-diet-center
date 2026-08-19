/*
 * Service worker for Lover Diet Center.
 *
 * Exists for two reasons:
 *  1. Chrome will not treat the site as installable without one, and a
 *     Trusted Web Activity (the Android wrapper) requires installability.
 *  2. It gives the app something to show when the phone is offline instead
 *     of Chrome's dinosaur, which looks broken inside a wrapped app.
 *
 * Deliberately conservative. This app serves per-user health data and a
 * checkout flow, so the cache never touches anything but static assets:
 *  - Only GET requests, only same-origin.
 *  - /api, /auth, /dashboard and /admin are never cached — a stale order or
 *    a stale weight reading is worse than no reading.
 *  - HTML uses network-first so a deploy is picked up immediately.
 */

const VERSION = 'ldc-v1'
const STATIC_CACHE = `${VERSION}-static`
const PAGE_CACHE = `${VERSION}-pages`
const OFFLINE_URL = '/offline.html'

// Never cache anything under these — they are per-user or transactional.
const NEVER_CACHE = ['/api/', '/auth/', '/dashboard', '/admin']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll([OFFLINE_URL, '/ldc-logo.png', '/icon-192.png']),
    ),
  )
  // Take over as soon as the new worker is ready rather than waiting for
  // every tab to close — otherwise a deploy can sit unused for days.
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (NEVER_CACHE.some((p) => url.pathname.startsWith(p))) return

  // Navigations: network first, fall back to the last good copy, then to the
  // offline page. Keeps deploys instant while still working on a dead train.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(PAGE_CACHE).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match(OFFLINE_URL)),
        ),
    )
    return
  }

  // Build output and images: cache first. Next fingerprints these filenames,
  // so a cached copy can never be the wrong version.
  if (
    url.pathname.startsWith('/_next/static/') ||
    /\.(?:png|jpe?g|svg|webp|avif|woff2?|ico)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone()
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy))
            }
            return response
          }),
      ),
    )
  }
})
