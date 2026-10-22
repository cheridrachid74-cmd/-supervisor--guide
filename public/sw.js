// Service Worker for Algerian Unified Internal Regulations & Supervisor Guide PWA
// Bumped cache name to force-purge stale 12-card caches on all client devices
const CACHE_NAME = 'regulations-pwa-v2-20cards-rev3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/supervisor.html',
  '/manifest.json',
  '/icon.svg',
  '/supervisor-icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png'
];

// Install Event: Cache essential assets and immediately activate
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Pre-cache error (non-fatal):', err);
      });
    })
  );
  // Force active service worker to become the active one immediately
  self.skipWaiting();
});

// Activate Event: Delete old stale caches (such as 'regulations-pwa-v1')
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Purging old stale cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  // Claim all clients immediately so the updated page is served without requiring restart
  self.clients.claim();
});

// Fetch Event: Network-First for HTML/Navigation & API requests to guarantee fresh 20-card data
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Network-First strategy for HTML navigation, main page, and scripts
  if (
    event.request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.ts')
  ) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Stale-While-Revalidate for other static assets (images, fonts, hashed JS)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Listen for message to force skip waiting or clear cache
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) => {
      return Promise.all(keys.map((k) => caches.delete(k)));
    });
  }
});
