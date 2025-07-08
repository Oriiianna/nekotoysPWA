const CACHE_NAME = 'nekotoys-v1';
const BASE_PATH = '/nekotoysPWA/';

const ASSETS = [
    BASE_PATH + 'index.html',
    BASE_PATH + 'v-producto/detalle.html',
    BASE_PATH + 'v-producto/checkout.html',
    BASE_PATH + 'v-producto/carrito.html',
    BASE_PATH + 'css/style.css',
    BASE_PATH + 'img/banner-1-mobile.svg',
    BASE_PATH + 'img/banner-1.svg',
    BASE_PATH + 'img/nekotoys-logo.png',
    BASE_PATH + 'img/kirby-offline.gif',
    BASE_PATH + 'img/kirby-compra.gif',
    BASE_PATH + 'js/catalogo.js',
    BASE_PATH + 'js/detalle.js',
    BASE_PATH + 'js/carrito.js',
    BASE_PATH + 'js/favoritos.js',
    BASE_PATH + 'js/main.js',
    BASE_PATH + 'offline.html',
    BASE_PATH + 'audio/click.mp3'
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
        fetch(event.request)
            .then(response => {
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseClone);
                        });
                }
                return response;
            })
            .catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match(BASE_PATH + 'offline.html');
                }
                return caches.match(event.request);
            })
    );
});
