const CACHE_NAME = 'wordrobe-v1';
const urlsToCache = [
  './',
  './index.html',
  './wordrobe.html',
  './manifest.json',
  'https://conizm3.github.io/wordrobe/images/wordrobe-icon.png',
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
  if (event.request.url.includes('api.dictionaryapi.dev') || 
      event.request.url.includes('script.google.com') ||
      event.request.url.includes('generativelanguage.googleapis.com') ||
      event.request.url.includes('jisho.org')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
