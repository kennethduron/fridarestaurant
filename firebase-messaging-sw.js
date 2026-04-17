importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAkoY3Disr5BnZWorJaAKxP4HHQ4UcHKc4",
  authDomain: "fridarestaurant-768ab.firebaseapp.com",
  projectId: "fridarestaurant-768ab",
  storageBucket: "fridarestaurant-768ab.firebasestorage.app",
  messagingSenderId: "133167188727",
  appId: "1:133167188727:web:d0233adab39ff54ce5a1f2"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notification = payload.notification || {};
  const data = payload.data || {};
  self.registration.showNotification(notification.title || "Frida Restaurant", {
    body: notification.body || "Tu pedido tiene una actualizacion.",
    icon: "/assets/icon.jpg",
    badge: "/assets/icon.jpg",
    data
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.link || "/";
  event.waitUntil(clients.openWindow(targetUrl));
});
