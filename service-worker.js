// sw.js
// 既存のキャッシュをすべて削除して、Service Workerを無効化する処理

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 通信には一切介入しない（ブラウザ標準の動きに戻す）
self.addEventListener('fetch', () => {
  return;
});
