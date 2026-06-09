const CACHE = 'toonimatics-v1'
const ASSETS = ['/', '/manifest.json', '/icons/icon-192.png']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)))
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  )
})
