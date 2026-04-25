import {
  listenOrders,
  registerStaffNotificationToken,
  signInWithEmailPassword,
  getEmailByUsername,
  onAuthChange,
  signOutUser,
  isStaffAuthorized
} from "./firebase-config.js?v=20260424b";

const i18n = {
  es: {
    authTitle: "Acceso del personal de servicio",
    authText: "Ingresa con usuario y contraseña para revisar únicamente las órdenes del día.",
    authUserLabel: "Usuario",
    authPassLabel: "Contraseña",
    authButton: "Ingresar",
    authInvalid: "Usuario o contraseña inválidos.",
    authUserNotFound: "Usuario no encontrado.",
    authUserNeedsMapping: "Ese usuario no existe. Verifica el usuario asignado en Supabase.",
    authDenied: "Tu usuario no tiene permisos para este panel.",
    authChecking: "Validando acceso...",
    authProviderDisabled: "El acceso con usuario y contraseña no está habilitado. Revisa Supabase Auth.",
    authUnauthorizedDomain: "Este dominio no está autorizado para el backend. Revisa WEB_ORIGINS en Vercel.",
    authNetworkError: "No se pudo conectar con la API. Revisa tu conexión e intenta de nuevo.",
    authPermissionError: "La API bloqueó la validación del usuario. Revisa roles y variables privadas.",
    screenTitle: "Órdenes del día",
    screenSub: "Vista de solo lectura para que meseros consulten órdenes activas del día sin editar información sensible.",
    staffRole: "Rol",
    signOut: "Salir",
    signOutShort: "Salir",
    agentNotificationsAction: "Activar avisos",
    agentNotificationsActionText: "Activa avisos para recibir nuevas órdenes en este dispositivo.",
    agentNotificationsAppleTitle: "Aviso para iPhone y iPad",
    agentNotificationsAppleText: "En Android los avisos funcionan desde Chrome. En iPhone o iPad, abre este panel en Safari, agrégalo a pantalla de inicio y activa los avisos desde ese ícono.",
    agentNotificationsReady: "Avisos del panel de meseros activados.",
    agentNotificationsUnavailable: "Este dispositivo no pudo activar los avisos del panel de meseros.",
    searchLabel: "Buscar orden",
    searchPlaceholder: "Buscar por mesa, cliente o número de orden",
    filterAll: "Todas",
    filterPending: "Pendientes",
    filterAccepted: "Aceptadas",
    filterPreparing: "Preparando",
    filterReady: "Listas",
    filterDelivered: "Entregadas",
    filterRejected: "Rechazadas",
    summaryTotal: "Órdenes de hoy",
    summaryPending: "Pendientes",
    summaryReady: "Listas",
    summaryDelivered: "Entregadas",
    orderNumber: "Orden",
    orderTime: "Hora",
    customer: "Cliente",
    table: "Mesa o referencia",
    orderType: "Tipo de pedido",
    status: "Estado",
    items: "Productos",
    comments: "Comentarios del pedido",
    total: "Total",
    noComments: "Sin comentarios",
    emptyOrders: "No hay órdenes del día para este filtro.",
    details: "Ver detalle",
    dineIn: "En restaurante",
    takeaway: "Recoger",
    delivery: "Delivery",
    status_pending: "Pendiente",
    status_accepted: "Aceptada",
    status_preparing: "Preparando",
    status_ready: "Lista",
    status_delivered: "Entregada",
    status_rejected: "Rechazada"
  },
  en: {
    authTitle: "Service staff access",
    authText: "Sign in with username and password to review only today's orders.",
    authUserLabel: "Username",
    authPassLabel: "Password",
    authButton: "Sign in",
    authInvalid: "Invalid username or password.",
    authUserNotFound: "Username not found.",
    authUserNeedsMapping: "That username does not exist. Check the Supabase username mapping.",
    authDenied: "Your user does not have access to this panel.",
    authChecking: "Validating access...",
    authProviderDisabled: "Username and password access is not enabled. Check Supabase Auth.",
    authUnauthorizedDomain: "This domain is not authorized for the backend. Check WEB_ORIGINS in Vercel.",
    authNetworkError: "The API could not be reached. Check the connection and try again.",
    authPermissionError: "The API blocked user validation. Check roles and private variables.",
    screenTitle: "Today's orders",
    screenSub: "Read-only view so waitstaff can review today's active orders without editing sensitive data.",
    staffRole: "Role",
    signOut: "Sign out",
    signOutShort: "Out",
    agentNotificationsAction: "Enable alerts",
    agentNotificationsActionText: "Enable alerts to receive new orders on this device.",
    agentNotificationsAppleTitle: "iPhone and iPad notice",
    agentNotificationsAppleText: "On Android, alerts work from Chrome. On iPhone or iPad, open this panel in Safari, add it to the Home Screen, and enable alerts from that icon.",
    agentNotificationsReady: "Waitstaff panel alerts enabled.",
    agentNotificationsUnavailable: "This device could not enable waitstaff panel alerts.",
    searchLabel: "Search order",
    searchPlaceholder: "Search by table, customer or order number",
    filterAll: "All",
    filterPending: "Pending",
    filterAccepted: "Accepted",
    filterPreparing: "Preparing",
    filterReady: "Ready",
    filterDelivered: "Delivered",
    filterRejected: "Rejected",
    summaryTotal: "Today's orders",
    summaryPending: "Pending",
    summaryReady: "Ready",
    summaryDelivered: "Delivered",
    orderNumber: "Order",
    orderTime: "Time",
    customer: "Customer",
    table: "Table or reference",
    orderType: "Order type",
    status: "Status",
    items: "Items",
    comments: "Order comments",
    total: "Total",
    noComments: "No comments",
    emptyOrders: "There are no orders today for this filter.",
    details: "View details",
    dineIn: "Dine-in",
    takeaway: "Pickup",
    delivery: "Delivery",
    status_pending: "Pending",
    status_accepted: "Accepted",
    status_preparing: "Preparing",
    status_ready: "Ready",
    status_delivered: "Delivered",
    status_rejected: "Rejected"
  }
};

const authGate = document.getElementById("authGate");
const authMessage = document.getElementById("authMessage");
const authForm = document.getElementById("agentAuthForm");
const authUser = document.getElementById("agentUser");
const authPassword = document.getElementById("agentPassword");
const authSubmitBtn = authForm ? authForm.querySelector('button[type="submit"]') : null;
const signOutBtn = document.getElementById("agentSignOut");
const appSection = document.getElementById("agentApp");
const langToggle = document.getElementById("agentLangToggle");
const staffBadge = document.getElementById("staffBadge");
const searchInput = document.getElementById("agentSearch");
const enableAgentNotificationsBtn = document.getElementById("enableAgentNotifications");
const summaryGrid = document.getElementById("agentSummary");
const statusFilters = document.getElementById("agentStatusFilters");
const ordersList = document.getElementById("agentOrdersList");
const detailModal = document.getElementById("agentDetailModal");
const detailTitle = document.getElementById("agentDetailTitle");
const detailBody = document.getElementById("agentDetailBody");
const closeDetailBtn = document.getElementById("closeAgentDetail");
const toast = document.getElementById("toast");

let lang = "es";
let ordersCache = [];
let unsubscribeOrders = null;
let currentStaffUser = null;
let currentStaffProfile = null;
let agentPushNotificationsReady = false;
let statusFilter = "all";
let searchTerm = "";
let selectedOrderId = "";
let searchFocusRestoreTimer = 0;
let lastSummaryMarkup = "";
let lastOrdersMarkup = "";
let hasSeenInitialOrdersSnapshot = false;
let knownOrderIds = new Set();
let audioCtx = null;
let audioUnlocked = false;
let lastAgentPushRegisterAt = 0;
const compactSignOutQuery = window.matchMedia("(max-width: 560px)");
const AGENT_NOTIFICATIONS_ENABLED_KEY = "frida_agent_notifications_enabled_v1";
const agentUrlParams = new URLSearchParams(window.location.search);
let pendingLinkedOrderId = agentUrlParams.get("order") || agentUrlParams.get("orderId") || "";

function t(key) {
  return (i18n[lang] && i18n[lang][key]) || key;
}

function setAuthMessage(message, state = "info") {
  authMessage.textContent = message || "";
  if (message) authMessage.dataset.state = state;
  else delete authMessage.dataset.state;
}

function setAuthBusy(isBusy) {
  authUser.disabled = isBusy;
  authPassword.disabled = isBusy;
  if (authSubmitBtn) authSubmitBtn.disabled = isBusy;
}

function describeAuthError(error) {
  const code = error && error.code ? error.code : "unknown";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    return t("authInvalid");
  }
  if (code === "auth/operation-not-allowed") return t("authProviderDisabled");
  if (code === "auth/unauthorized-domain") return t("authUnauthorizedDomain");
  if (code === "auth/network-request-failed") return t("authNetworkError");
  if (code === "permission-denied" || code === "auth/internal-error") return t("authPermissionError");
  return `Sign-in failed (${code})`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1600);
}

function canUseBrowserNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

function canUseWebAudio() {
  return typeof window !== "undefined" && ("AudioContext" in window || "webkitAudioContext" in window);
}

function getAudioContext() {
  if (!canUseWebAudio()) return null;
  if (audioCtx) return audioCtx;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioCtx();
  } catch (_error) {
    audioCtx = null;
  }
  return audioCtx;
}

async function unlockNotificationSound() {
  const ctx = getAudioContext();
  if (!ctx) return false;
  try {
    if (ctx.state === "suspended") await ctx.resume();
    audioUnlocked = ctx.state === "running";
  } catch (_error) {
    audioUnlocked = false;
  }
  return audioUnlocked;
}

function playNewOrderSound() {
  if (!audioUnlocked) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  [0, 0.23].forEach((offset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now + offset);
    gain.gain.setValueAtTime(0.0001, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.18, now + offset + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + offset);
    osc.stop(now + offset + 0.2);
  });
}

async function ensureNotificationPermission() {
  if (!canUseBrowserNotifications()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    return await Notification.requestPermission();
  } catch (_error) {
    return "denied";
  }
}

function readAgentNotificationsEnabled() {
  return localStorage.getItem(AGENT_NOTIFICATIONS_ENABLED_KEY) === "true";
}

function writeAgentNotificationsEnabled(enabled) {
  if (enabled) localStorage.setItem(AGENT_NOTIFICATIONS_ENABLED_KEY, "true");
  else localStorage.removeItem(AGENT_NOTIFICATIONS_ENABLED_KEY);
}

function canUseLocalAgentNotification() {
  return !agentPushNotificationsReady && canUseBrowserNotifications() && Notification.permission === "granted";
}

function notifyNewOrder(order) {
  const title = lang === "es" ? "Nuevo pedido recibido" : "New order received";
  const body = `${orderRef(order)} | ${order?.customer?.name || "-"} | ${money(order.total || 0)}`;
  showToast(`${title}: ${orderRef(order)}`);
  playNewOrderSound();
  if (!canUseLocalAgentNotification()) return;
  try {
    new Notification(title, { body });
  } catch (_error) {
    // Keep toast and sound feedback even if the browser notification fails.
  }
}

function normalizeSearchValue(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function preserveSearchFocus(callback) {
  if (!searchInput) {
    callback();
    return;
  }
  const shouldRestoreFocus = document.activeElement === searchInput;
  const selectionStart = shouldRestoreFocus ? searchInput.selectionStart : null;
  const selectionEnd = shouldRestoreFocus ? searchInput.selectionEnd : null;
  callback();
  if (!shouldRestoreFocus) return;
  if (document.activeElement === searchInput) {
    if (typeof selectionStart === "number" && typeof selectionEnd === "number") {
      searchInput.setSelectionRange(selectionStart, selectionEnd);
    }
    return;
  }
  window.clearTimeout(searchFocusRestoreTimer);
  searchFocusRestoreTimer = window.setTimeout(() => {
    if (document.activeElement === searchInput) return;
    searchInput.focus({ preventScroll: true });
    if (typeof selectionStart === "number" && typeof selectionEnd === "number") {
      searchInput.setSelectionRange(selectionStart, selectionEnd);
    }
  }, 0);
}

function parseDate(value) {
  if (!value) return null;
  const date = value.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTime(value) {
  const date = parseDate(value);
  if (!date) return "-";
  return date.toLocaleTimeString(lang === "es" ? "es-HN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function money(value) {
  return new Intl.NumberFormat(lang === "es" ? "es-HN" : "en-US", {
    style: "currency",
    currency: "HNL",
    minimumFractionDigits: 2
  }).format(Number(value || 0));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function orderRef(order) {
  return `#${order.displayId || String(order.id || "").slice(0, 6)}`;
}

function orderStatusLabel(status) {
  return t(`status_${status || "pending"}`);
}

function orderTypeLabel(order) {
  if (order?.order_type === "delivery" || order?.orderType === "delivery" || order?.customer?.delivery) return t("delivery");
  if (order?.order_type === "takeaway" || order?.orderType === "takeaway" || order?.customer?.pickup) return t("takeaway");
  return t("dineIn");
}

function orderTableLabel(order) {
  return String(order?.customer?.table || "").trim() || "-";
}

function orderComments(order) {
  return String(order?.customer?.comments || "").trim() || t("noComments");
}

function shouldShowTotal(order) {
  return order?.status !== "delivered";
}

function routeForStaffRole(role) {
  if (role === "agent") return "/agent.html";
  if (role === "kitchen") return "/kitchen.html";
  return "/crm.html";
}

function redirectIfWrongPanel(profile) {
  const targetPath = routeForStaffRole(profile?.role || "");
  if (!targetPath || window.location.pathname.endsWith(targetPath)) return false;
  window.location.replace(`${targetPath}${window.location.search}${window.location.hash}`);
  return true;
}

function searchableOrderText(order) {
  const itemNames = Array.isArray(order?.items)
    ? order.items.map((item) => item?.name || "").join(" ")
    : "";
  return [
    orderRef(order),
    order?.customer?.name || "",
    order?.customer?.table || "",
    orderTypeLabel(order),
    orderComments(order),
    itemNames
  ].join(" ");
}

function filteredOrders() {
  const query = normalizeSearchValue(searchTerm);
  return ordersCache
    .filter((order) => statusFilter === "all" || order.status === statusFilter)
    .filter((order) => !query || normalizeSearchValue(searchableOrderText(order)).includes(query))
    .sort((left, right) => {
      const leftTime = parseDate(left.createdAt)?.getTime() || 0;
      const rightTime = parseDate(right.createdAt)?.getTime() || 0;
      return rightTime - leftTime;
    });
}

function summaryCounts() {
  return ordersCache.reduce((summary, order) => {
    summary.total += 1;
    if (order.status === "pending") summary.pending += 1;
    if (order.status === "ready") summary.ready += 1;
    if (order.status === "delivered") summary.delivered += 1;
    return summary;
  }, { total: 0, pending: 0, ready: 0, delivered: 0 });
}

function renderSummary() {
  if (!summaryGrid) return;
  const summary = summaryCounts();
  const markup = `
    <article class="agent-summary-card">
      <span>${t("summaryTotal")}</span>
      <strong>${summary.total}</strong>
    </article>
    <article class="agent-summary-card">
      <span>${t("summaryPending")}</span>
      <strong>${summary.pending}</strong>
    </article>
    <article class="agent-summary-card">
      <span>${t("summaryReady")}</span>
      <strong>${summary.ready}</strong>
    </article>
    <article class="agent-summary-card">
      <span>${t("summaryDelivered")}</span>
      <strong>${summary.delivered}</strong>
    </article>
  `;
  if (markup === lastSummaryMarkup) return;
  summaryGrid.innerHTML = markup;
  lastSummaryMarkup = markup;
}

function renderOrderItems(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  if (!items.length) return "<li>-</li>";
  return items.map((item) => `
    <li>
      <span>${escapeHtml(item.name || "Item")}</span>
      <strong>x${Number(item.qty || item.quantity || 0)}</strong>
    </li>
  `).join("");
}

function renderOrderCard(order) {
  return `
    <article class="agent-card">
      <div class="agent-card-head">
        <div>
          <p class="agent-order-ref">${escapeHtml(orderRef(order))}</p>
          <p class="agent-order-time">${escapeHtml(formatTime(order.createdAt))}</p>
        </div>
        <span class="agent-status-badge" data-status="${escapeHtml(order.status || "pending")}">${escapeHtml(orderStatusLabel(order.status))}</span>
      </div>
      <div class="agent-card-body">
        <p><strong>${t("customer")}:</strong> ${escapeHtml(order?.customer?.name || "-")}</p>
        <p><strong>${t("table")}:</strong> ${escapeHtml(orderTableLabel(order))}</p>
        <p><strong>${t("orderType")}:</strong> ${escapeHtml(orderTypeLabel(order))}</p>
        ${shouldShowTotal(order) ? `<p class="agent-total"><strong>${t("total")}:</strong> ${escapeHtml(money(order.total || 0))}</p>` : ""}
      </div>
      <div class="agent-card-actions">
        <button type="button" class="btn btn-outline agent-detail-btn" data-agent-detail="${escapeHtml(order.id)}">${t("details")}</button>
      </div>
    </article>
  `;
}

function renderOrders() {
  if (!ordersList) return;
  const rows = filteredOrders();
  const markup = !rows.length
    ? `<p class="agent-empty">${t("emptyOrders")}</p>`
    : rows.map(renderOrderCard).join("");
  if (markup === lastOrdersMarkup) return;
  ordersList.innerHTML = markup;
  lastOrdersMarkup = markup;
}

function renderDetail(order) {
  if (!detailBody || !detailTitle) return;
  detailTitle.textContent = orderRef(order);
  detailBody.innerHTML = `
    <div class="agent-detail-grid">
      <p><strong>${t("orderNumber")}:</strong> ${escapeHtml(orderRef(order))}</p>
      <p><strong>${t("orderTime")}:</strong> ${escapeHtml(formatTime(order.createdAt))}</p>
      <p><strong>${t("customer")}:</strong> ${escapeHtml(order?.customer?.name || "-")}</p>
      <p><strong>${t("table")}:</strong> ${escapeHtml(orderTableLabel(order))}</p>
      <p><strong>${t("orderType")}:</strong> ${escapeHtml(orderTypeLabel(order))}</p>
      <p><strong>${t("status")}:</strong> ${escapeHtml(orderStatusLabel(order.status))}</p>
      <div class="agent-detail-block">
        <strong>${t("items")}:</strong>
        <ul class="agent-items-list">
          ${renderOrderItems(order)}
        </ul>
      </div>
      <div class="agent-detail-block">
        <strong>${t("comments")}:</strong>
        <p>${escapeHtml(orderComments(order))}</p>
      </div>
      ${shouldShowTotal(order) ? `<p><strong>${t("total")}:</strong> ${escapeHtml(money(order.total || 0))}</p>` : ""}
    </div>
  `;
}

function openDetail(orderId) {
  const order = ordersCache.find((row) => row.id === orderId);
  if (!order || !detailModal) return;
  selectedOrderId = orderId;
  renderDetail(order);
  detailModal.classList.remove("hidden");
}

function closeDetail() {
  selectedOrderId = "";
  detailModal?.classList.add("hidden");
}

function openLinkedOrderIfReady() {
  if (!pendingLinkedOrderId || !ordersCache.length) return;
  const order = ordersCache.find((row) => row.id === pendingLinkedOrderId);
  if (!order) return;
  openDetail(order.id);
  pendingLinkedOrderId = "";
}

async function registerAgentPushNotifications(options = {}) {
  const { showUnavailableToast = true, remember = false, force = false } = options;
  const now = Date.now();
  if (!force && agentPushNotificationsReady && now - lastAgentPushRegisterAt < 15 * 60 * 1000) {
    return true;
  }
  try {
    const token = await registerStaffNotificationToken("web-agent");
    if (token) {
      agentPushNotificationsReady = true;
      lastAgentPushRegisterAt = now;
      if (remember) writeAgentNotificationsEnabled(true);
      if (showUnavailableToast) showToast(t("agentNotificationsReady"));
      return true;
    }
  } catch (error) {
    agentPushNotificationsReady = false;
    console.warn("Agent push registration failed", error);
    if (showUnavailableToast) showToast(t("agentNotificationsUnavailable"));
  }
  return false;
}

async function activateAgentNotifications(options = {}) {
  const { showUnavailableToast = true, remember = true, force = false } = options;
  const permission = await ensureNotificationPermission();
  await unlockNotificationSound();

  if (permission !== "granted") {
    if (permission === "denied") writeAgentNotificationsEnabled(false);
    if (showUnavailableToast) showToast(t("agentNotificationsUnavailable"));
    return false;
  }

  return registerAgentPushNotifications({ showUnavailableToast, remember, force });
}

async function renewAgentNotificationsIfAllowed(options = {}) {
  if (!canUseBrowserNotifications()) return false;
  const { force = false } = options;
  const shouldRenew = Notification.permission === "granted" || readAgentNotificationsEnabled();
  if (!shouldRenew) return false;
  if (Notification.permission === "granted") {
    await unlockNotificationSound();
    return registerAgentPushNotifications({ showUnavailableToast: false, remember: true, force });
  }
  return activateAgentNotifications({ showUnavailableToast: false, remember: true, force });
}

function applyI18n() {
  document.documentElement.lang = lang;
  langToggle.textContent = lang === "es" ? "EN" : "ES";
  const shortLabel = compactSignOutQuery.matches;
  signOutBtn.textContent = shortLabel ? t("signOutShort") : t("signOut");
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
  });
  if (currentStaffUser && currentStaffProfile) {
    staffBadge.textContent = `${currentStaffUser.email} | ${t("staffRole")}: ${currentStaffProfile.role}`;
  }
  preserveSearchFocus(() => {
    renderSummary();
    renderOrders();
    if (selectedOrderId) {
      const order = ordersCache.find((row) => row.id === selectedOrderId);
      if (order) renderDetail(order);
      else closeDetail();
    }
  });
}

function stopRealtime() {
  if (unsubscribeOrders) unsubscribeOrders();
  unsubscribeOrders = null;
}

function startRealtime() {
  stopRealtime();
  unsubscribeOrders = listenOrders(
    (orders) => {
      const nextOrderIds = new Set(orders.map((order) => order.id));
      if (!hasSeenInitialOrdersSnapshot) {
        knownOrderIds = nextOrderIds;
        hasSeenInitialOrdersSnapshot = true;
      } else {
        const newOrders = orders.filter((order) => !knownOrderIds.has(order.id));
        newOrders.forEach(notifyNewOrder);
        knownOrderIds = nextOrderIds;
      }

      ordersCache = orders;
      preserveSearchFocus(() => {
        renderSummary();
        renderOrders();
        if (selectedOrderId) {
          const order = ordersCache.find((row) => row.id === selectedOrderId);
          if (order) renderDetail(order);
          else closeDetail();
        }
        openLinkedOrderIfReady();
      });
    },
    () => showToast("Orders listener error"),
    { scope: "agent_today", intervalMs: 5000, hiddenIntervalMs: 15000 }
  );
}

function lockUI() {
  agentPushNotificationsReady = false;
  authGate.classList.remove("hidden");
  appSection.classList.add("hidden");
  signOutBtn.classList.add("hidden");
  staffBadge.textContent = "";
  window.clearTimeout(searchFocusRestoreTimer);
  lastSummaryMarkup = "";
  lastOrdersMarkup = "";
  hasSeenInitialOrdersSnapshot = false;
  knownOrderIds = new Set();
  stopRealtime();
}

async function unlockUI(user, profile) {
  authGate.classList.add("hidden");
  appSection.classList.remove("hidden");
  signOutBtn.classList.remove("hidden");
  staffBadge.textContent = `${user.email} | ${t("staffRole")}: ${profile.role}`;
  await renewAgentNotificationsIfAllowed({ force: true });
  startRealtime();
}

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = authUser.value.trim();
  const password = authPassword.value;

  if (!username || !password) {
    setAuthMessage(t("authInvalid"), "error");
    return;
  }

  setAuthBusy(true);
  setAuthMessage(t("authChecking"), "info");
  try {
    const email = username.includes("@") ? username : await getEmailByUsername(username);
    if (!email) {
      setAuthMessage(username.includes("@") ? t("authUserNotFound") : t("authUserNeedsMapping"), "error");
      return;
    }
    await signInWithEmailPassword(email, password);
    authPassword.value = "";
  } catch (error) {
    setAuthMessage(describeAuthError(error), "error");
  } finally {
    setAuthBusy(false);
  }
});

signOutBtn.addEventListener("click", async () => {
  await signOutUser();
  lockUI();
});

langToggle.addEventListener("click", () => {
  lang = lang === "es" ? "en" : "es";
  applyI18n();
});

if (enableAgentNotificationsBtn) {
  enableAgentNotificationsBtn.addEventListener("click", async () => {
    await activateAgentNotifications({ remember: true, force: true });
  });
}

searchInput?.addEventListener("input", () => {
  searchTerm = searchInput.value || "";
  renderOrders();
});

statusFilters?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  statusFilter = button.dataset.filter || "all";
  statusFilters.querySelectorAll("[data-filter]").forEach((node) => {
    node.classList.toggle("active", node === button);
  });
  renderOrders();
});

ordersList?.addEventListener("click", (event) => {
  const detailButton = event.target.closest("[data-agent-detail]");
  if (!detailButton) return;
  openDetail(detailButton.dataset.agentDetail);
});

closeDetailBtn?.addEventListener("click", closeDetail);
detailModal?.addEventListener("click", (event) => {
  if (event.target === detailModal) closeDetail();
});

if (typeof compactSignOutQuery.addEventListener === "function") {
  compactSignOutQuery.addEventListener("change", applyI18n);
} else if (typeof compactSignOutQuery.addListener === "function") {
  compactSignOutQuery.addListener(applyI18n);
}

window.addEventListener("pointerdown", unlockNotificationSound, { once: true });
window.addEventListener("keydown", unlockNotificationSound, { once: true });
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && currentStaffUser) renewAgentNotificationsIfAllowed();
});

onAuthChange(async (user) => {
  if (!user) {
    currentStaffUser = null;
    currentStaffProfile = null;
    setAuthBusy(false);
    setAuthMessage("");
    lockUI();
    return;
  }

  currentStaffUser = user;
  setAuthMessage(t("authChecking"), "info");
  const access = await isStaffAuthorized(user);
  if (!access.allowed) {
    currentStaffProfile = null;
    setAuthMessage(t("authDenied"), "error");
    await signOutUser();
    lockUI();
    return;
  }

  currentStaffProfile = access.profile;
  if (redirectIfWrongPanel(currentStaffProfile)) return;
  setAuthMessage("");
  await unlockUI(user, currentStaffProfile);
});

applyI18n();
lockUI();
