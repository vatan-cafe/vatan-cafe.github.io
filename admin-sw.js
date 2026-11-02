// Vatan admin app: keeps the admin screen available even on a weak connection.
// Always tries the network first, so updates on GitHub show up immediately.
// Never stores menu data or logins (requests to Supabase are not touched).
const CACHE = 'vatan-admin-v2';
const SHELL = ['admin.html', 'config.js', 'admin.webmanifest', 'admin-icon-192.png', 'admin-icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;   // Supabase etc: untouched
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('admin.html')))
  );
});
