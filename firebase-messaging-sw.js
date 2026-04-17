self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  const payload = readPushPayload(event);
  const notification = payload.notification || {};
  const data = payload.data || {};
  const title = notification.title || data.title || "Frida Restaurant";
  const body = notification.body || data.body || "Tu pedido tiene una actualizacion.";
  const link = data.link ||
    (payload.fcmOptions && payload.fcmOptions.link) ||
    (payload.webpush && payload.webpush.fcmOptions && payload.webpush.fcmOptions.link) ||
    "/";
  const notificationData = Object.assign({}, data, { link });

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/assets/icon.jpg",
      badge: "/assets/icon.jpg",
      data: notificationData
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.link) || "/";
  event.waitUntil(self.clients.openWindow(targetUrl));
});

function readPushPayload(event) {
  if (!event.data) return {};
  try {
    return event.data.json();
  } catch (_error) {
    return {
      notification: {
        title: "Frida Restaurant",
        body: event.data.text()
      }
    };
  }
}
