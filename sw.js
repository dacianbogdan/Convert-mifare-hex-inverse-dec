// Bump VERSION whenever any shell asset changes. Never cache user data.
const VERSION = 'v1';
const CACHE = `hikvision-card-converter-${self.registration.scope}-${VERSION}`;
const PREFIX = `hikvision-card-converter-${self.registration.scope}-`;
const ASSETS = ['./', './index.html', './styles.css', './app.js', './converter.js', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'];
const assetURLs = new Set(ASSETS.map(path => new URL(path, self.registration.scope).href));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Only application shell GETs are handled; no UID is ever part of a request.
  if (event.request.method !== 'GET' || !assetURLs.has(url.href)) return;
  event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(event.request)) || fetch(event.request)));
});
