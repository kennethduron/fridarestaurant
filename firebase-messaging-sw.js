self.FRIDA_SW_VERSION = "20260418f";

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
  const link = resolveNotificationLink(data, payload);
  const notificationData = Object.assign({}, data, { link });
  const actionTitle = data.type === "new_order" || data.type === "new_reservation" ? "Abrir CRM" : "Ver pedido";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/assets/icon.jpg",
      badge: "/assets/icon.jpg",
      tag: data.orderId ? `frida-order-${data.orderId}` : "frida-restaurant",
      renotify: true,
      actions: [
        {
          action: "open-crm",
          title: actionTitle
        }
      ],
      data: notificationData
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = markNotificationUrl(normalizeUrl((event.notification.data && event.notification.data.link) || "/"));
  event.waitUntil(openNotificationTarget(targetUrl));
});

function resolveNotificationLink(data, payload) {
  const directLink = data.link ||
    data.click_action ||
    data.clickAction ||
    (payload.fcmOptions && payload.fcmOptions.link) ||
    (payload.webpush && payload.webpush.fcmOptions && payload.webpush.fcmOptions.link) ||
    (payload.fcm_options && payload.fcm_options.link);

  if (directLink) return normalizeUrl(directLink);

  if (data.type === "new_order" && data.orderId) {
    return normalizeUrl(`/crm.html?order=${encodeURIComponent(data.orderId)}`);
  }

  if (data.type === "new_reservation" && data.reservationId) {
    return normalizeUrl(`/crm.html?reservation=${encodeURIComponent(data.reservationId)}`);
  }

  return normalizeUrl("/");
}

function normalizeUrl(value) {
  try {
    return new URL(value || "/", self.location.origin).href;
  } catch (_error) {
    return new URL("/", self.location.origin).href;
  }
}

function markNotificationUrl(value) {
  try {
    const url = new URL(value || "/", self.location.origin);
    url.searchParams.set("notificationOpen", String(Date.now()));
    return url.href;
  } catch (_error) {
    return new URL(`/?notificationOpen=${Date.now()}`, self.location.origin).href;
  }
}

async function openNotificationTarget(targetUrl) {
  const target = new URL(targetUrl);

  try {
    const openedClient = await self.clients.openWindow(target.href);
    if (openedClient && "focus" in openedClient) return openedClient.focus();
    if (openedClient) return openedClient;
  } catch (_error) {
    // Android Chrome can reject openWindow while Chrome is already foregrounded.
  }

  return openOrFocusWindow(target.href);
}

async function openOrFocusWindow(targetUrl) {
  const target = new URL(targetUrl);
  const windowClients = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true
  });

  for (const client of windowClients) {
    const clientUrl = new URL(client.url);
    if (clientUrl.origin !== target.origin || clientUrl.pathname !== target.pathname) continue;
    if ("navigate" in client) {
      await client.navigate(target.href);
    }
    return client.focus();
  }

  return self.clients.openWindow(target.href);
}

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
