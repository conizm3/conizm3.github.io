const CACHE_NAME = 'wordrobe-v2-offline-ready';

// キャッシュするファイル（アプリを動かすのに必要なもの）
const urlsToCache = [
  './',
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



// 1. Firebaseのライブラリを読み込む（ServiceWorker用）
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// 2. Firebaseを初期化する
firebase.initializeApp({
  apiKey: "AIzaSyCqoqNq7N-x5Wr6TsJkyCU0J6o-Mj1Ir8g",
  authDomain: "conizm-01.firebaseapp.com",
  projectId: "conizm-01",
  storageBucket: "conizm-01.firebasestorage.app",
  messagingSenderId: "180210157068",
  appId: "1:180210157068:web:e03a373dd3f818cdee1029",
});

// 3. バックグラウンド通知の受け取り設定
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // 通知のタイトルと中身を取り出す
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: './images/wordrobe-icon.png', // アプリのアイコンを表示
  };

  // 実際にスマホに通知を出す命令
  self.registration.showNotification(notificationTitle, notificationOptions);
});

