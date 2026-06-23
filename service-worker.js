const CACHE_NAME = 'rack-designer-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './css/variables.css',
  './css/layout.css',
  './css/components/panels.css',
  './css/components/rack.css',
  './css/components/faceplates.css',
  './css/components/modals.css',
  './css/components/misc.css',
  './js/core/store.js',
  './js/core/RackAuth.js',
  './js/ui/faceplates.js',
  './js/ui/TopologyRenderer.js',
  './js/ui/catalog.js',
  './js/ui/canvas.js',
  './js/ui/modals/PlacementModal.js',
  './js/main.js',
  './json/manifest.json',
  './assets/icons/icon.svg',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // No cacheamos extensiones que no nos interesen o peticiones raras
          if (event.request.url.startsWith('http')) {
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Fallback a index.html si no hay red y no está en caché (SPA approach)
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
