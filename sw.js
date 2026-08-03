/* Offline cache for 数独 Sudoku.
   On install, the browser downloads these files once and keeps
   them on the device. Every launch after that is served from
   the cache first — airplane mode, no signal, doesn't matter.
   If we ever update the game, bump the version name below so
   phones fetch the fresh copy. */

const CACHE = 'sudoku-v1';
const FILES = ['./', './index.html', './icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // clear out caches from older versions
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
