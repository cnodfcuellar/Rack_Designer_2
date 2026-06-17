// ============================================================
//  RACK Designer — Service Worker (PWA Offline Support)
//  Versión: 1.0.0
// ============================================================

const CACHE_NAME = 'rack-designer-v1.1';

// Lista de archivos a cachear para funcionamiento offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './json/manifest.json',
  './css/style.css',
  './js/utils.js',
  './js/store.js',
  './js/demoData.js',
  './js/main.js',
  './js/ui/catalog.js',
  './js/ui/faceplates.js',
  './js/ui/modals.js',
  './js/ui/rack.js',
  './js/ui/topology.js',
  './js/ui/tables.js',
  './js/ui/fileManager.js',
  './js/service/service-worker.js',
  './js/xlsx.full.min.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  // Fuentes de Google (se cachean en la primera visita)
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Orbitron:wght@400;700;900&display=swap',
  // Librería mobile-drag-drop
  'https://cdn.jsdelivr.net/npm/mobile-drag-drop@2.3.0-rc.2/index.min.js',
  'https://cdn.jsdelivr.net/npm/mobile-drag-drop@2.3.0-rc.2/scroll-behaviour.min.js',
  'https://cdn.jsdelivr.net/npm/mobile-drag-drop@2.3.0-rc.2/default.css'
];

// ── INSTALL: cachear todos los archivos al instalar el SW ──
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando y cacheando archivos...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Intentamos cachear de a uno para que un fallo no cancele todo
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] No se pudo cachear:', url, err);
          })
        )
      );
    }).then(() => {
      console.log('[SW] Instalación completa.');
      return self.skipWaiting(); // Activar inmediatamente sin esperar
    })
  );
});

// ── ACTIVATE: eliminar cachés viejos ──
self.addEventListener('activate', (event) => {
  console.log('[SW] Activado. Limpiando cachés anteriores...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Borrando caché viejo:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim()) // Tomar control de todas las pestañas
  );
});

// ── FETCH: estrategia "Cache First, Network Fallback" ──
// Sirve desde caché si está disponible; si no, va a la red.
self.addEventListener('fetch', (event) => {
  // Solo interceptar peticiones GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Encontrado en caché: responder inmediatamente
        return cachedResponse;
      }

      // No está en caché: ir a la red y cachear la respuesta
      return fetch(event.request)
        .then((networkResponse) => {
          // Solo cachear respuestas válidas (200 OK)
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // Si la red falla y no hay caché, mostrar una página de error offline
          if (event.request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
