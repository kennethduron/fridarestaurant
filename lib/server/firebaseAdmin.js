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

async function sendToTokens(tokens, payload) {
  const cleanTokens = Array.from(new Set((tokens || []).filter(Boolean)));
  if (!cleanTokens.length) return { successCount: 0, failureCount: 0, responses: [] };

  try {
    const messaging = firebaseApp().messaging();
    return await messaging.sendEachForMulticast({
      tokens: cleanTokens,
      notification: {
        title: payload.title || "Frida Restaurant",
        body: payload.body || ""
      },
      data: stringifyData(payload.data || {}),
      webpush: {
        fcmOptions: {
          link: payload.link || "https://fridarestauranthn.web.app/"
        },
        notification: {
          icon: "/assets/icon.jpg",
          badge: "/assets/icon.jpg"
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
