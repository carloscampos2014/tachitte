const CACHE_NAME = 'tachitte-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/images/tradicional.png',
    '/images/bacon.png',
    '/images/pepperone.png',
    '/images/salsicha.png',
    '/images/queijo.png',
    '/images/vegano.png',
    '/images/romeu-e-julieta.png',
    '/images/chocolate.png',
    '/images/caramelo.png',
    '/images/customizado.png',
    '/images/suco-laranja.png',
    '/images/suco-limao.png',
    '/images/suco-tangerina.png',
    '/images/suco-morango.png',
    '/images/suco-maca.png',
    '/images/suco-uva.png',
    '/images/refri-lata.png',
    '/images/refri-600ml.png',
    '/images/refri-2l.png',
    '/icons/192x192.png',
    '/icons/512x512.png',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/lucide@latest'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
