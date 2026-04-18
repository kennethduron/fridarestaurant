const API_BASE_URL = (
  window.FRIDA_API_BASE_URL ||
  localStorage.getItem("frida_api_base_url") ||
  "https://fridarestaurant-git-main-kennethduronpaz-7247s-projects.vercel.app"
).replace(/\/$/, "");

const SESSION_KEY = "frida_staff_session_v1";
const POLL_INTERVAL_MS = 5000;
const STAFF_EMAIL_DOMAIN = "frida.local";
const FCM_VAPID_KEY = "BNmfp8tu6f6EWUwnX4grqCsQxPBR35s1Qr9XF1R3JzIN-s1k8ySArkSStrFlQbjcPgTv2h3y-7bspsmmpxej2xM";
const FIREBASE_PUBLIC_CONFIG = {
  apiKey: "AIzaSyAkoY3Disr5BnZWorJaAKxP4HHQ4UcHKc4",
  authDomain: "fridarestaurant-768ab.firebaseapp.com",
  projectId: "fridarestaurant-768ab",
  storageBucket: "fridarestaurant-768ab.firebasestorage.app",
  messagingSenderId: "133167188727",
  appId: "1:133167188727:web:d0233adab39ff54ce5a1f2"
};

let currentSession = readSession();
const authListeners = new Set();
let messagingSetupPromise = null;

const app = null;
const db = null;
const auth = null;

function normalizeUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");
}

function staffEmailForUsername(username) {
  return `${normalizeUsername(username)}@${STAFF_EMAIL_DOMAIN}`;
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch (_error) {
    return null;
  }
}

function writeSession(session) {
  currentSession = session || null;
  if (currentSession) localStorage.setItem(SESSION_KEY, JSON.stringify(currentSession));
  else localStorage.removeItem(SESSION_KEY);
  notifyAuthListeners();
}

function sessionUser(session = currentSession) {
  if (!session || !session.user) return null;
  return {
    uid: session.user.id,
    id: session.user.id,
    email: session.user.email || staffEmailForUsername(session.user.username),
    username: session.user.username,
    role: session.user.role,
    accessToken: session.access_token
  };
}

function authHeaders() {
  const token = currentSession && currentSession.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {})
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  const text = await response.text();
  const payload = text ? safeJson(text) : null;
  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || response.statusText || "Request failed";
    const error = new Error(message);
    error.code = payload?.error?.code || `http/${response.status}`;
    error.details = payload?.error?.details;
    throw error;
  }
  return payload;
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch (_error) {
    return text;
  }
}

function normalizeOrderInput(order) {
  const paymentMethod = (order.payment && order.payment.method) || "cash_on_pickup";
  const paymentStatus = (order.payment && order.payment.status) || (paymentMethod === "online" ? "pending" : "unpaid");
  const customerPickup = Boolean(order.customer && order.customer.pickup);
  const explicitType = String(order.order_type || order.orderType || "").trim();
  const orderType = explicitType || (customerPickup ? "takeaway" : "dine_in");
  const invoice = order && order.invoice && typeof order.invoice === "object"
    ? {
        billingName: String(order.invoice.billingName || "").trim(),
        billingRTN: String(order.invoice.billingRTN || "").trim(),
        invoiceNumber: String(order.invoice.invoiceNumber || "").trim(),
        notes: String(order.invoice.notes || "").trim(),
        hasExoneration: Boolean(order.invoice.hasExoneration),
        exemptionRegister: String(order.invoice.exemptionRegister || "").trim(),
        exemptOrderNumber: String(order.invoice.exemptOrderNumber || "").trim(),
        sagRegister: String(order.invoice.sagRegister || "").trim()
      }
    : null;

  return {
    order_type: orderType,
    customer_name: (order.customer && order.customer.name) || "",
    customer_phone: (order.customer && order.customer.phone) || "",
    customer_email: (order.customer && order.customer.email) || "",
    table_label: (order.customer && order.customer.table) || "",
    delivery_address: (order.customer && order.customer.deliveryAddress) || "",
    notes: (order.customer && order.customer.comments) || "",
    items: Array.isArray(order.items) ? order.items.map((item) => ({
      id: item.id || item.menu_item_id || "",
      name: item.name || item.title || "",
      quantity: Number(item.qty || item.quantity || 1),
      unit_price: Number(item.price || item.unit_price || 0),
      total: Number(item.total || Number(item.qty || item.quantity || 1) * Number(item.price || item.unit_price || 0)),
      notes: item.notes || ""
    })) : [],
    subtotal: Number(order.subtotal || order.total || 0),
    tax: Number(order.tax || 0),
    delivery_fee: Number(order.deliveryFee || order.delivery_fee || 0),
    total: Number(order.total || 0),
    payment_method: paymentMethod,
    payment_status: paymentStatus,
    invoice,
    language: order.language || "es"
  };
}

async function addOrder(order) {
  const payload = normalizeOrderInput(order);
  const result = await apiRequest("/api/orders", {
    method: "POST",
    body: payload
  });
  return result.order.id;
}

async function addReservation(reservation) {
  const result = await apiRequest("/api/reservations", {
    method: "POST",
    body: {
      name: reservation.name || "",
      phone: reservation.phone || "",
      email: reservation.email || "",
      date: reservation.date || "",
      time: reservation.time || "",
      party: Number(reservation.party || 1),
      occasion: reservation.occasion || "",
      allergies: reservation.allergies || "",
      notes: reservation.notes || "",
      language: reservation.language || "es"
    }
  });
  return result.reservation.id;
}

async function registerOrderNotificationToken(orderId, phone = "") {
  if (!orderId) return null;
  const setup = await setupFirebaseMessaging();
  if (!setup) {
    throw new Error("notifications_not_supported");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("notifications_permission_denied");
  }

  const token = await setup.getToken(setup.messaging, {
    vapidKey: FCM_VAPID_KEY,
    serviceWorkerRegistration: setup.registration
  });
  if (!token) {
    throw new Error("notifications_token_missing");
  }

  await apiRequest("/api/notifications/register-token", {
    method: "POST",
    body: {
      token,
      order_id: orderId,
      customer_phone: phone,
      platform: "web"
    }
  });
  return token;
}

async function registerStaffNotificationToken(platform = "web-crm") {
  const user = sessionUser();
  if (!user || !user.accessToken) {
    throw new Error("staff_session_required");
  }

  const setup = await setupFirebaseMessaging();
  if (!setup) {
    throw new Error("notifications_not_supported");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("notifications_permission_denied");
  }

  const token = await setup.getToken(setup.messaging, {
    vapidKey: FCM_VAPID_KEY,
    serviceWorkerRegistration: setup.registration
  });
  if (!token) {
    throw new Error("notifications_token_missing");
  }

  await apiRequest("/api/notifications/register-staff-token", {
    method: "POST",
    body: {
      token,
      platform
    }
  });
  return token;
}

async function setupFirebaseMessaging() {
  if (messagingSetupPromise) return messagingSetupPromise;
  messagingSetupPromise = (async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return null;

    const messagingModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging.js");
    const appModule = await import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js");
    if (messagingModule.isSupported && !(await messagingModule.isSupported())) return null;

    const firebaseApp = appModule.getApps().length
      ? appModule.getApps()[0]
      : appModule.initializeApp(FIREBASE_PUBLIC_CONFIG);
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const messaging = messagingModule.getMessaging(firebaseApp);

    messagingModule.onMessage(messaging, (payload) => {
      const title = payload.notification?.title || "Frida Restaurant";
      const body = payload.notification?.body || "Tu pedido tiene una actualizacion.";
      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/assets/icon.jpg",
          data: payload.data || {}
        });
      }
    });

    return {
      messaging,
      registration,
      getToken: messagingModule.getToken
    };
  })();
  return messagingSetupPromise;
}

function mapOrder(row) {
  if (!row) return null;
  const items = Array.isArray(row.order_items) ? row.order_items.map((item) => ({
    id: item.menu_item_id || item.id,
    name: item.name,
    title: {
      es: item.name,
      en: item.name
    },
    qty: Number(item.quantity || 0),
    quantity: Number(item.quantity || 0),
    price: Number(item.unit_price || 0),
    unit_price: Number(item.unit_price || 0),
    total: Number(item.total || 0),
    notes: item.notes || ""
  })) : [];
  return {
    id: row.id,
    displayId: row.display_id,
    orderType: row.order_type,
    order_type: row.order_type,
    status: normalizeIncomingStatus(row.status),
    customer: {
      name: row.customer_name || "",
      phone: row.customer_phone || "",
      email: row.customer_email || "",
      comments: row.notes || "",
      pickup: row.order_type === "takeaway",
      delivery: row.order_type === "delivery",
      deliveryAddress: row.delivery_address || "",
      table: row.table_label || ""
    },
    items,
    subtotal: Number(row.subtotal || 0),
    tax: Number(row.tax || 0),
    deliveryFee: Number(row.delivery_fee || 0),
    total: Number(row.total || 0),
    payment: {
      method: row.payment_method || "cash",
      status: row.payment_status || "unpaid"
    },
    invoice: row.invoice || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapReservation(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name || "",
    phone: row.phone || "",
    email: row.email || "",
    date: row.reservation_date || "",
    time: row.reservation_time || "",
    party: row.party_size || 1,
    occasion: row.occasion || "",
    allergies: row.allergies || "",
    notes: row.notes || "",
    status: row.status || "pending",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function normalizeIncomingStatus(status) {
  if (status === "in_progress") return "preparing";
  if (status === "accepted") return "accepted";
  return status || "pending";
}

function normalizeOutgoingStatus(status) {
  if (status === "in_progress") return "preparing";
  return status;
}

function startPolling(load, successCb, errorCb) {
  let active = true;
  let timeoutId = null;

  async function tick() {
    try {
      const rows = await load();
      if (active) successCb(rows);
    } catch (error) {
      if (active && typeof errorCb === "function") errorCb(error);
    } finally {
      if (active) timeoutId = window.setTimeout(tick, POLL_INTERVAL_MS);
    }
  }

  tick();
  return () => {
    active = false;
    if (timeoutId) window.clearTimeout(timeoutId);
  };
}

function listenOrders(successCb, errorCb) {
  return startPolling(async () => {
    const result = await apiRequest("/api/orders");
    return Array.isArray(result.orders) ? result.orders.map(mapOrder) : [];
  }, successCb, errorCb);
}

function listenReservations(successCb, errorCb) {
  return startPolling(async () => {
    const result = await apiRequest("/api/reservations");
    return Array.isArray(result.reservations) ? result.reservations.map(mapReservation) : [];
  }, successCb, errorCb);
}

function listenOrderById(orderId, successCb, errorCb) {
  return startPolling(async () => {
    const result = await apiRequest(`/api/orders/${encodeURIComponent(orderId)}`);
    return result.order ? mapOrder(result.order) : null;
  }, successCb, errorCb);
}

async function updateOrderStatus(id, status) {
  await apiRequest(`/api/orders/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: { status: normalizeOutgoingStatus(status) }
  });
}

async function updateOrderPaymentStatus(id, paymentStatus) {
  await apiRequest(`/api/orders/${encodeURIComponent(id)}/payment`, {
    method: "PATCH",
    body: { payment_status: paymentStatus }
  });
}

async function updateOrderPaymentMethod(id, paymentMethod) {
  await apiRequest(`/api/orders/${encodeURIComponent(id)}/payment`, {
    method: "PATCH",
    body: { payment_method: paymentMethod }
  });
}

async function updateOrderInvoiceData(id, invoiceData) {
  await apiRequest(`/api/orders/${encodeURIComponent(id)}/invoice`, {
    method: "PATCH",
    body: { invoice: invoiceData || {} }
  });
}

async function loadFiscalSettings() {
  const result = await apiRequest("/api/settings/fiscal");
  return result.settings || null;
}

async function loadMenuSettings() {
  const result = await apiRequest("/api/settings/menu");
  return result.settings || { items: {} };
}

async function saveFiscalSettings(settings) {
  const result = await apiRequest("/api/settings/fiscal", {
    method: "PATCH",
    body: { settings }
  });
  return result.settings;
}

async function saveMenuSettings(settings) {
  const result = await apiRequest("/api/settings/menu", {
    method: "PATCH",
    body: { settings }
  });
  return result.settings;
}

async function reserveNextFiscalInvoiceNumber() {
  const result = await apiRequest("/api/settings/fiscal/reserve-next", {
    method: "POST",
    body: {}
  });
  return result.invoiceNumber;
}

async function getStaffProfile(uid) {
  const user = sessionUser();
  if (!user || (uid && user.uid !== uid)) return null;
  return {
    uid: user.uid,
    username: user.username,
    role: user.role,
    active: true
  };
}

async function isStaffAuthorized(user) {
  if (!user) return { allowed: false, reason: "No user" };
  const role = String(user.role || "").toLowerCase();
  const active = Boolean(user.accessToken);
  const allowedRoles = ["admin", "agent", "representative", "kitchen", "cashier"];
  if (!active || !allowedRoles.includes(role)) {
    return { allowed: false, reason: "Inactive or invalid role" };
  }
  return {
    allowed: true,
    profile: {
      uid: user.uid,
      username: user.username,
      role,
      active: true
    }
  };
}

async function signInWithEmailPassword(usernameOrEmail, password) {
  const username = normalizeUsername(String(usernameOrEmail || "").split("@")[0]);
  const session = await apiRequest("/api/auth/login", {
    method: "POST",
    body: { username, password }
  });
  writeSession(session);
  return sessionUser(session);
}

async function getEmailByUsername(username) {
  const normalized = normalizeUsername(username);
  return normalized ? staffEmailForUsername(normalized) : null;
}

function onAuthChange(cb) {
  authListeners.add(cb);
  window.setTimeout(() => cb(sessionUser()), 0);
  return () => authListeners.delete(cb);
}

function notifyAuthListeners() {
  const user = sessionUser();
  authListeners.forEach((cb) => cb(user));
}

async function signOutUser() {
  writeSession(null);
}

export {
  app,
  db,
  auth,
  addOrder,
  addReservation,
  listenOrders,
  listenReservations,
  listenOrderById,
  updateOrderStatus,
  updateOrderPaymentStatus,
  updateOrderPaymentMethod,
  updateOrderInvoiceData,
  loadFiscalSettings,
  loadMenuSettings,
  saveFiscalSettings,
  saveMenuSettings,
  reserveNextFiscalInvoiceNumber,
  registerOrderNotificationToken,
  registerStaffNotificationToken,
  getStaffProfile,
  isStaffAuthorized,
  signInWithEmailPassword,
  getEmailByUsername,
  onAuthChange,
  signOutUser
};
