// service-worker.js
const CACHE_NAME = 'pacman-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/game.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se il file è in cache, lo restituisci
        if (response) {
          return response;
        }
        // Altrimenti effettua il fetch dalla rete
        return fetch(event.request);
      })
  );
});
