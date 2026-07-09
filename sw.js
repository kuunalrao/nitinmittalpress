/* ── Nitin Mittal Press — Service Worker v1.0 ── */

var CACHE = 'nm-press-v1';
var SHELL = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-brands-400.woff2'
];

/* Install — cache app shell */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(SHELL.filter(function(u) {
        // Don't fail install if CDN fails
        return !u.includes('cloudflare');
      })).then(function() {
        // Try to cache CDN assets too, but don't block install
        return c.addAll(SHELL.filter(function(u) {
          return u.includes('cloudflare');
        })).catch(function() {});
      });
    })
  );
  self.skipWaiting();
});

/* Activate — clean old caches */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

/* Fetch — serve from cache, fallback to network */
self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  // Pass through GAS/Google API calls — never intercept
  if (url.indexOf('script.google.com') >= 0 ||
      url.indexOf('googleapis.com') >= 0 ||
      url.indexOf('wa.me') >= 0) return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        // Cache successful responses for static assets
        if (response && response.status === 200 && response.type === 'basic') {
          var clone = response.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        }
        return response;
      }).catch(function() {
        // Offline fallback — return cached index.html
        return caches.match('./index.html');
      });
    })
  );
});
