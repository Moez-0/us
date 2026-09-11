import {precacheAndRoute} from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = {title: 'Us.', body: event.data.text()};
    }
  }

  event.waitUntil(self.registration.showNotification(data.title || 'Us.', {
    body: data.body || 'A new moment from your love.',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    data: data.data || {url: '/'},
    vibrate: [200, 100, 200],
    tag: data.tag || 'us-notification',
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(self.clients.matchAll({type: 'window', includeUncontrolled: true}).then((clientList) => {
    for (const client of clientList) {
      if (client.url && 'focus' in client) return client.focus();
    }
    return self.clients.openWindow?.(targetUrl);
  }));
});