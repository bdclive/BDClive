// LiveCounters PWA Service Worker
const CACHE_NAME = 'livecounters-cache-v10.2.101';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './New.html',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => console.warn("PWA Cache addAll warning:", err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Allow real-time Firebase, APIs, and CDN changelog requests to bypass cache
  if (
    url.origin.includes('firebaseio.com') ||
    url.origin.includes('googleapis.com') ||
    url.origin.includes('api.github.com') ||
    url.origin.includes('raw.githubusercontent.com') ||
    url.searchParams.has('t')
  ) {
    return;
  }

  // Network-first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate') {
            return caches.match('./New.html') || caches.match('./index.html');
          }
        });
      })
  );
});
