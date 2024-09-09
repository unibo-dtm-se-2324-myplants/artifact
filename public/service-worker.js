const CACHE_NAME = 'plantai-cache-v2';
const urlsToCache = [
    '/public/',
    '/public/index.html',
    '/public/style.css',
    '/public/script.js',
    '/public/manifest.json',
    '/public/icons/icon.png',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return Promise.all(
                    urlsToCache.map(url => {
                        return fetch(url).then(response => {
                            if (!response.ok) {
                                throw new TypeError(`Bad response status for ${url}: ${response.status}`);
                            }
                            return cache.put(url, response);
                        }).catch(error => {
                            console.error('Failed to cache', url, error);
                        });
                    })
                );
            })
            .catch(error => {
                console.error('Failed to open cache', error);
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

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
