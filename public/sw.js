// public/sw.js
const APP_SHELL = 'app-shell-v2';
const DYNAMIC_CACHE = 'dynamic-v2';
const OFFLINE_URL = '/offline.html';

// Lista de rutas fijas (APP SHELL).
// Antes de publicar, añade aquí los assets finales de /dist (los js/css con hash), o usa un plugin para generarlo.
const APP_SHELL_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/vite.svg',
  '/favicon.ico',
  '/src/index.css', // en dev; en build puede no existir así
  // '/assets/index-Bc0rJuos.js', // <-- añade tus assets build aquí
];

// Helpers
function isSameOrigin(request) {
  return new URL(request.url).origin === self.location.origin;
}

self.addEventListener('install', (event) => {
  // Para activar inmediatamente la nueva versión
  self.skipWaiting();
  event.waitUntil(
    caches.open(APP_SHELL).then((cache) => {
      return cache.addAll(APP_SHELL_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== APP_SHELL && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Permite que la página envíe mensaje para forzar skipWaiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Límite simple para cache dinámico (elimina el más antiguo si supera limite)
function trimCache(cacheName, maxItems) {
  caches.open(cacheName).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(() => trimCache(cacheName, maxItems));
      }
    });
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;

  if (req.method !== 'GET') return;

  // 1) Navigation requests (SPA navigation) -> servir index.html desde cache, fallback offline.html
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cached) => {
        return (
          cached ||
          fetch(req)
            .then((res) => {
              // también cacheamos la navegación si queremos
              return res;
            })
            .catch(() => caches.match(OFFLINE_URL))
        );
      })
    );
    return;
  }

  // 2) Misma-origen: cache first, si no existe -> network -> cache dinámico
  if (isSameOrigin(req)) {
    event.respondWith(
      caches.match(req).then((cachedResp) => {
        if (cachedResp) return cachedResp;
        return fetch(req)
          .then((networkResp) => {
            // sólo cachear respuestas válidas
            if (!networkResp || networkResp.status !== 200 || networkResp.type === 'opaque') {
              return networkResp;
            }
            return caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(req, networkResp.clone());
              trimCache(DYNAMIC_CACHE, 50);
              return networkResp;
            });
          })
          .catch(() => caches.match(OFFLINE_URL));
      })
    );
    return;
  }

  // 3) Cross-origin: intentar red; si falla, servir desde cache si existe
  event.respondWith(
    fetch(req)
      .then((networkResp) => networkResp)
      .catch(() => caches.match(req))
  );
});
