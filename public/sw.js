/**
 * LamboReads Service Worker
 * Strategy:
 *  - App shell (HTML pages) → Network-first, fallback to cache
 *  - Static assets (images, fonts, icons) → Cache-first
 *  - /_next/ chunks/static → Never cache (CDN immutable, changes every build)
 *  - API calls → Network-only (never cache)
 *  - Offline → serve /offline page
 */

const CACHE_NAME = 'lamboreads-v2';
const OFFLINE_URL = '/offline';

const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
];

// ─── Install ───────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// ─── Activate ──────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch ─────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Never cache API routes or Supabase calls
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) return;

  // CRITICAL: Never cache Next.js build chunks — these change every deploy.
  // The CDN serves them with immutable cache headers; SW interference breaks the app.
  if (url.pathname.startsWith('/_next/')) return;

  // Static assets (images, fonts, icons) → Cache-first
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|woff2?|ico)$/)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
      )
    );
    return;
  }

  // App shell (HTML pages) → Network-first, cache fallback, offline page last resort
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() =>
        caches
          .match(request)
          .then((cached) => cached || caches.match(OFFLINE_URL))
      )
  );
});
