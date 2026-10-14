/* DeenBondhu BD service worker.
   - App shell: precached, served cache-first (updates arrive via a new CACHE version + visible "Reload" prompt).
   - Quran / prayer API responses: network-first with a bounded runtime cache so previously opened surahs read offline.
   - Audio and every other cross-origin request are NOT cached. Personal data lives in localStorage/IndexedDB, never here. */
const VERSION = 'v1.0.0';
const SHELL = 'dbbd-shell-' + VERSION;
const API = 'dbbd-api-' + VERSION;
const FONTS = 'dbbd-fonts-' + VERSION;
const SHELL_FILES = [
  './', 'index.html', 'offline.html', 'manifest.json', 'css/style.css',
  'js/i18n.js', 'js/data-duas.js', 'js/data-names.js', 'js/data-guide.js', 'js/core.js', 'js/quran.js',
  'js/duas-names.js', 'js/prayer.js', 'js/worship.js', 'js/family.js', 'js/home.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png'
];
const MAX_API_ENTRIES = 160;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)));
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keep = [SHELL, API, FONTS];
    (await caches.keys()).filter((k) => k.indexOf('dbbd-') === 0 && keep.indexOf(k) < 0).forEach((k) => caches.delete(k));
    await self.clients.claim();
  })());
});
self.addEventListener('message', (e) => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });

async function trim(cacheName, max) {
  const c = await caches.open(cacheName); const keys = await c.keys();
  for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    if (req.mode === 'navigate') {
      e.respondWith(caches.match('index.html').then((r) => r || fetch(req)).catch(() => caches.match('offline.html')));
      return;
    }
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).catch(() => caches.match('offline.html'))));
    return;
  }

  if (url.hostname === 'api.alquran.cloud' || url.hostname === 'api.aladhan.com') {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res.ok) { const c = await caches.open(API); await c.put(req, res.clone()); trim(API, MAX_API_ENTRIES); }
        return res;
      } catch (err) {
        const hit = await caches.match(req);
        if (hit) return hit;
        throw err;
      }
    })());
    return;
  }

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTS).then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req); if (res.ok) c.put(req, res.clone()); return res;
    }).catch(() => fetch(req)));
  }
  /* anything else (audio CDN etc.) goes straight to the network, uncached */
});
