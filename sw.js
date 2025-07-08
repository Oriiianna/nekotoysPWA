const CACHE_NAME = 'nekotoys-v1';
const ASSETS = [
    './index.html',
    './v-producto/detalle.html',
    './v-producto/checkout.html',
    './v-producto/carrito.html',
    './css/style.css',
    './img/banner-1-mobile.svg',
    './img/banner-1.svg',
    './img/nekotoys-logo.png',
    './img/kirby-offline.gif',
    './img/kirby-compra.gif',
    './js/catalogo.js',
    './js/detalle.js',
    './js/carrito.js',
    './js/favoritos.js',
    './js/main.js',
    './offline.html',
    './audio/click.mp3'
];

self.addEventListener('install', event => {
    console.log('[SW] Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    console.log('[SW] Activando...');
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) return cached;
                return fetch(event.request)
                    .then(response => {
                        const cloned = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(event.request, cloned));
                        return response;
                    })
                    .catch(() => {
                        if (event.request.mode === 'navigate') {
                            return caches.match('./offline.html');
                        }
                    });
            })
    );
});
