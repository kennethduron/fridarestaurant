"use strict";

const admin = require("firebase-admin");
const { httpError, requiredEnv } = require("./http");

function firebaseApp() {
  if (admin.apps.length) return admin.app();

  const privateKey = requiredEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");
  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: requiredEnv("FIREBASE_PROJECT_ID"),
      clientEmail: requiredEnv("FIREBASE_CLIENT_EMAIL"),
      privateKey
    })
  });
}

function notificationLink(payload) {
  return payload.link || "https://fridarestauranthn.web.app/";
}

function notificationTopic(payload) {
  const data = payload.data || {};
  const type = String(data.type || "frida").replace(/[^a-z0-9_-]/gi, "").slice(0, 12) || "frida";
  const id = String(data.orderId || data.reservationId || data.displayId || Date.now())
    .replace(/[^a-z0-9_-]/gi, "")
    .slice(0, 18);
  return `${type}-${id}`.slice(0, 32);
}

async function sendToTokens(tokens, payload) {
  const cleanTokens = Array.from(new Set((tokens || []).filter(Boolean)));
  if (!cleanTokens.length) return { successCount: 0, failureCount: 0, responses: [] };

  try {
    const messaging = firebaseApp().messaging();
    const link = notificationLink(payload);
    return await messaging.sendEachForMulticast({
      tokens: cleanTokens,
      data: stringifyData({
        ...(payload.data || {}),
        title: payload.title || "Frida Restaurant",
        body: payload.body || "",
        link,
        click_action: link
      }),
      webpush: {
        headers: {
          Urgency: "high",
          Topic: notificationTopic(payload)
        },
        fcmOptions: {
          link
        }
      }
    });
  } catch (error) {
    throw httpError(500, "fcm_send_failed", "Could not send Firebase notification.", error.message);
  }
}

function stringifyData(data) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, value == null ? "" : String(value)])
  );
}

module.exports = {
  sendToTokens
};
