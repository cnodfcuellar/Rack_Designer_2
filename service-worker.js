const CACHE_NAME = 'rack-designer-next-cache-v22';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './css/variables.css',
  './css/layout.css',
  './css/mobile-drag-drop.css',
  './css/components/panels.css',
  './css/components/rack.css',
  './css/components/faceplates.css',
  './css/components/modals.css',
  './css/components/misc.css',
  './js/utils.js',
  './js/icons.js',
  './js/store.js',
  './js/demoData.js',
  './js/xlsx.full.min.js',
  './js/html2canvas.min.js',
  './js/mobile-drag-drop.min.js',
  './js/mobile-drag-drop-scroll.min.js',
  './js/auth/roles.js',
  './js/ui/catalog.js',
  './js/ui/faceplates.js',
  './js/ui/fileManager.js',
  './js/ui/inspector.js',
  './js/ui/modals.js',
  './js/ui/outliner.js',
  './js/ui/rack.js',
  './js/ui/tables.js',
  './js/ui/modals/CableModal.js',
  './js/ui/modals/DeviceModal.js',
  './js/ui/modals/ExportModal.js',
  './js/ui/modals/Globals.js',
  './js/ui/modals/PlacementModal.js',
  './js/ui/modals/RackModal.js',
  './js/ui/modals/RoomModal.js',
  './js/ui/topology/TopologyEvents.js',
  './js/ui/topology/TopologyLayout.js',
  './js/ui/topology/TopologyOrchestrator.js',
  './js/ui/topology/TopologyRenderer.js',
  './js/ui/topology/TopologyState.js',
  './js/main.js',
  './json/manifest.json',
  './assets/icons/icon.svg',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-512x512.png',
  './assets/svg/default/server_1u.svg',
  './assets/svg/default/server_2u.svg',
  './assets/svg/default/server_4u.svg',
  './assets/svg/default/switch_24p.svg',
  './assets/svg/default/router.svg',
  './assets/svg/default/firewall.svg',
  './assets/svg/default/ups.svg',
  './assets/svg/default/ups_2u.svg',
  './assets/svg/default/pdu.svg',
  './assets/svg/default/storage.svg',
  './assets/svg/default/patchpanel.svg',
  './assets/svg/default/organizer.svg',
  './assets/svg/default/kvm.svg',
  './assets/svg/default/tray.svg',
  './assets/svg/default/floor_pc.svg',
  './assets/svg/default/floor_camera.svg',
  './assets/svg/default/floor_ap.svg',
  './assets/svg/default/floor_printer.svg',
  './assets/default/server_1u.svg',
  './assets/default/server_2u.svg',
  './assets/default/server_4u.svg',
  './assets/default/switch_24p.svg',
  './assets/default/router.svg',
  './assets/default/firewall.svg',
  './assets/default/ups.svg',
  './assets/default/ups_2u.svg',
  './assets/default/pdu.svg',
  './assets/default/storage.svg',
  './assets/default/patchpanel.svg',
  './assets/default/organizer.svg',
  './assets/default/kvm.svg',
  './assets/default/tray.svg',
  './assets/default/floor_pc.svg',
  './assets/default/floor_camera.svg',
  './assets/default/floor_ap.svg',
  './assets/default/floor_printer.svg',
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
