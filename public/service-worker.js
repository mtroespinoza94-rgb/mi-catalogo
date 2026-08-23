const CACHE = 'mi-catalogo-v1';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { self.clients.claim(); });
// No cacheamos /api/*: los datos siempre deben venir frescos del servidor
self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('/api/')) return;
});
