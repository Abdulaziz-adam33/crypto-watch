const CACHE_NAME = 'volume-watch-v1';
const SHELL_FILES = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache Binance API calls — always go live so data stays real-time.
  if (url.hostname.includes('binance.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // App shell: cache-first so the app can still open when offline.
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
