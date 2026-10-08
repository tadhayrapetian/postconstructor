/* Конверт Студия: offline cache. Bump VERSION on every release so devices pick up the new build. */
const VERSION = 'konvert-v14';
const EXT = 'konvert-ext';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png'];
const LIBS = [
  'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.5/JsBarcode.all.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];
const EXT_HOSTS = /^(cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/;

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(SHELL);
    const x = await caches.open(EXT);
    await Promise.allSettled(LIBS.map(async u => { if (await x.match(u)) return; const r = await fetch(u, { mode: 'cors' }); if (r.ok) await x.put(u, r); }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('konvert-') && k !== VERSION && k !== EXT) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    // The app page: network first so updates arrive, cache when offline.
    if (r.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('.html')) {
      e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(VERSION).then(c => c.put('./index.html', cp)); } return res; })
        .catch(() => caches.match('./index.html').then(m => m || caches.match('./'))));
      return;
    }
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(VERSION).then(c => c.put(r, cp)); } return res; })));
    return;
  }
  if (EXT_HOSTS.test(u.hostname)) {
    // Libraries and fonts: serve from cache, refresh in the background.
    e.respondWith(caches.open(EXT).then(async c => {
      const hit = await c.match(r);
      const net = fetch(r).then(res => { if (res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
  }
});
