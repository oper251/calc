const version = new URL(self.location.href).searchParams.get('v') || '010125';
const CACHE_NAME = `calc-oma-${version}`;

const urlsToCache = [
  '/',                          // главная страница
  './index.html',               // добавляем ./
  './style.css',                // относительные пути
  './script.js',
  './apple.png',
  './pwa.js'                    // добавил pwa.js
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(error => console.log('Ошибка кэширования:', error)) // добавил обработку ошибок
  );
});

// Активация - удаляем старый кэш
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch - сначала сеть, потом кэш
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Обновляем кэш
        caches.open(CACHE_NAME)
          .then(cache => cache.put(event.request, response.clone()));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});