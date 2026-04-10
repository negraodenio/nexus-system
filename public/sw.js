const CACHE_NAME = 'nexus-edge-v2';
const urlsToCache = [
    '/',
    '/telecom/field',
    '/dashboard/marketplace',
    '/manifest.json',
    // MediaPipe Assets (CDN)
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm/hand_landmarker.wasm',
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm/hand_landmarker_solution_simd_wasm_bin.wasm',
    'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    // MediaPipe models are served from storage.googleapis and cdn.jsdelivr
    // We want to intercept these even if they are cross-origin
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) return response;
            return fetch(event.request).then((res) => {
                if (!res || res.status !== 200) return res;
                const resToCache = res.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    if (event.request.method === 'GET') {
                        cache.put(event.request, resToCache);
                    }
                });
                return res;
            });
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) => Promise.all(
            names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
        ))
    );
});
