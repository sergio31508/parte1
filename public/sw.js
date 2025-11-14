const CACHE_NAME = 'pwa-catalogo-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/Login.jsx',
  '/src/Registro.jsx',
  '/src/Admin.jsx',
  '/src/Catalogo.jsx',
  '/img/cat1-1.jpg',
  '/img/cat1-2.jpg',
  '/img/cat1-3.jpg',
  '/img/cat2-1.jpg',
  '/img/cat2-2.jpg',
  '/img/cat2-3.jpg',
  '/img/cat3-1.jpg',
  '/img/cat3-2.jpg',
  '/img/cat3-3.jpg'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estrategia: Network First, luego Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clonar la respuesta
        const responseToCache = response.clone();
        
        // Guardar en cache si es una petición GET
        if (event.request.method === 'GET') {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // Si falla la red, buscar en cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // Si no está en cache y es una página, devolver index.html
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  const options = event.data ? event.data.json() : {
    title: 'Nueva notificación',
    body: 'Tienes una nueva notificación',
    icon: '/img/icons/icon-192x192.png',
    badge: '/img/icons/icon-144x144.png',
    vibrate: [200, 100, 200],
    tag: 'notification',
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

