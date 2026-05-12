// Bump version any time you change game files — this forces
// all players' browsers to discard the old cache and re-download.
const CACHE = 'crisismode-v4';

// Everything here is downloaded and cached on the very first page
// load, so the game runs fully offline from that point onwards.
// jsQR is the QR-code scanning library used during gameplay.
const PRECACHE = [
  './',
  './index.html',
  './qrcodes.html',
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first strategy: serve from cache if available,
// otherwise fetch from network and cache for next time.
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(resp => {
        if(!resp || resp.status !== 200 || resp.type === 'opaque') return resp;
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return resp;
      }).catch(() => cached);
    })
  );
});
