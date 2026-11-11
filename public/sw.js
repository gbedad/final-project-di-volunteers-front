// MyCogniverse service worker: makes the site installable and shows a
// page when there is no network. It caches nothing else on purpose: the
// application is always loaded fresh (no old version after an update).
const OFFLINE = '/offline.html';
const CACHE = 'mycogniverse-offline-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add(OFFLINE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Pages: the network; without network, the offline page. Everything else
// (scripts, API, images) goes to the network untouched.
self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE)));
});
