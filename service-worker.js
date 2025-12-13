const CACHE_NAME = 'wordrobe-v2-offline-ready';

// キャッシュするファイル（アプリを動かすのに必要なもの）
const urlsToCache = [
  './',
  './wordrobe.html',
  './manifest.json',
  './images/wordrobe-icon.png',
  // 外部ライブラリもキャッシュしておくとオフラインで動きます
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://unpkg.com/dexie@3.2.4/dist/dexie.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap'
];

// 1. インストール時：ファイルをキャッシュに保存
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

// 2. 起動時：古いキャッシュを削除
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

// 3. 通信時：キャッシュがあればそれを使い、なければネットに取りに行く
self.addEventListener('fetch', (event) => {
  
  // 重要：FirebaseやGoogle APIへの通信はキャッシュせず、必ずネットへ繋ぐ
  // （これをしないと、また「オフラインです」エラーが出ることがあるため）
  const url = new URL(event.request.url);
  if (url.hostname.includes('firebase') || 
      url.hostname.includes('googleapis') || 
      url.hostname.includes('script.google.com')) {
    return; // 何もしない＝通常通りネット通信させる
  }

  // それ以外のファイル（HTMLや画像など）はキャッシュ優先
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュにあればそれを返す
        if (response) {
          return response;
        }
        // なければネットに取りに行く
        return fetch(event.request);
      })
  );
});
