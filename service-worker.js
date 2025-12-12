const CACHE_NAME = 'wordloop-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './wordloop-icon.svg',
  // External libraries (Caching these is optional but good for performance)
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://unpkg.com/dexie@3.2.4/dist/dexie.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  // For API calls (search), go to network first, don't cache
  if (event.request.url.includes('api.dictionaryapi.dev') || 
      event.request.url.includes('lingva.ml') || 
      event.request.url.includes('jisho.org') ||
      event.request.url.includes('mymemory.translated.net')) {
    return; 
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
