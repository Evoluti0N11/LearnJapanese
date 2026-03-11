/* ===== sw.js — Service Worker for Sara Korean App ===== */
const CACHE_NAME = 'sara-korean-v6';
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

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      const localAssets = STATIC_ASSETS.filter(a => a.startsWith('.') || a.startsWith('/'));
      const externalAssets = STATIC_ASSETS.filter(a => a.startsWith('http'));
      return cache.addAll(localAssets).then(() => {
        return Promise.allSettled(externalAssets.map(url => cache.add(url)));
      });
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== CACHE_NAME + '-tiles').map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.hostname.includes('translate.googleapis') || url.hostname.includes('youtube')) return;
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
      if (e.request.destination === 'document') return caches.match('./index.html');
    })
  );
});

self.addEventListener('push', (e) => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || '🌸 Annyeong Sara!';
  const options = {
    body: data.body || 'È ora di studiare il coreano! 화이팅!',
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    tag: 'study-reminder',
    requireInteraction: false,
    data: { url: './' }
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      if (cs.length > 0) return cs[0].focus();
      return clients.openWindow('./');
    })
  );
});

self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-progress') {
    console.log('Background sync: progress in localStorage');
  }
});
