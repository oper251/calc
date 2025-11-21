const version = new URL(self.location.href).searchParams.get('v') || '191125';
const CACHE_NAME = `calc-oma-${version}`;

// Кэшируем по мере использования
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.match(event.request)
          .then(response => {
            if (response) return response;
            
            return fetch(event.request).then(response => {
              if (response.status === 200) {
                cache.put(event.request, response.clone());
              }
              return response;
            });
          });
      })
  );
});

// Очищаем старые версии кэша
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Удаляем старый кэш:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});