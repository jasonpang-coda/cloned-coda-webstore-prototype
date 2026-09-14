// Minimal app-shell service worker — enough to satisfy PWA installability
// (a fetch handler + a controlled scope) without a full offline strategy.
// Copied verbatim into dist/sw.js by vite.config.js's `pwa-manifest` plugin,
// so it's served from `/sw.js` with full-origin scope. Store-locked builds
// only (see src/main.js's registration call) — never registered by the
// internal multi-store dev/review build, which shares one origin across
// every store's theme and must not have a service worker caching one
// store's shell over another's.

const CACHE = 'webstore-shell-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add('/')),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
    ),
  )
  self.clients.claim()
})

// Network-first, falling back to the cached shell — keeps the storefront
// fresh on every normal load, but still resolves (to the shell) if offline.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone()
        caches.open(CACHE).then((cache) => cache.put(event.request, copy))
        return response
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/'))),
  )
})
