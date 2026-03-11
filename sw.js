/* ===== sw.js — Service Worker for Sara Korean App ===== */
const CACHE_NAME = 'sara-korean-v4';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/data.js',
  './js/app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=Nunito:wght@400;600;700;900&display=swap',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js'
];

// Install
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache local assets reliably, external ones best-effort
      const localAssets = STATIC_ASSETS.filter(a => a.startsWith('.') || a.startsWith('/'));
      const externalAssets = STATIC_ASSETS.filter(a => a.startsWith('http'));
      return cache.addAll(localAssets).then(() => {
        return Promise.allSettled(externalAssets.map(url => cache.add(url)));
      });
    })
  );
});

// Activate - clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch - Cache First for assets, Network First for API
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Skip cross-origin non-CDN requests (like translation API)
  if (url.hostname.includes('translate.googleapis') || url.hostname.includes('youtube')) {
    return;
  }

  // For map tiles: network first with cache fallback
  if (url.hostname.includes('carto') || url.hostname.includes('openstreetmap')) {
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME + '-tiles').then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache first for everything else
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      });
    }).catch(() => {
      // Offline fallback
      if (e.request.destination === 'document') {
        return caches.match('./index.html');
      }
    })
  );
});

// Background sync for saving progress when offline
self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-progress') {
    // Progress is already saved in localStorage, nothing to do
    console.log('Background sync: progress already in localStorage');
  }
});
