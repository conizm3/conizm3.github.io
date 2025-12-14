importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCqoqNq7N-x5Wr6TsJkyCU0J6o-Mj1Ir8g",
  authDomain: "conizm-01.firebaseapp.com",
  projectId: "conizm-01",
  storageBucket: "conizm-01.firebasestorage.app",
  messagingSenderId: "180210157068",
  appId: "1:180210157068:web:e03a373dd3f818cdee1029",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: './images/wordrobe-icon.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);

  if (navigator.setAppBadge) {
      navigator.setAppBadge(1).catch((error) => {
          console.error('Badge error:', error);
      });
  }
});

const CACHE_NAME = 'wordrobe-v2-offline-ready';

const urlsToCache = [
  './'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.hostname.includes('firebase') || 
      url.hostname.includes('googleapis') || 
      url.hostname.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
