/* Offline cache for 数独 Sudoku.
   On install, the browser downloads these files once and keeps
   them on the device. Every launch after that is served from
   the cache first — airplane mode, no signal, doesn't matter.
   If we ever update the game, bump the version name below so
   phones fetch the fresh copy. */

const CACHE = 'sudoku-v5';
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
  const req = e.request;
  // The game page itself is NETWORK-FIRST: when online, always
  // fetch the freshest copy and re-save it; when offline, fall
  // back to the saved one. That way updates arrive on their own
  // and airplane mode still works.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  // everything else (the icon): cached copy first
  e.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
});
