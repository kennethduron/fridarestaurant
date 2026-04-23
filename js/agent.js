import {
  listenOrders,
  signInWithEmailPassword,
  getEmailByUsername,
  onAuthChange,
  signOutUser,
  isStaffAuthorized
} from "./firebase-config.js?v=20260422b";

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
let statusFilter = "all";
let searchTerm = "";
let selectedOrderId = "";

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
  return [
    orderRef(order),
    order?.customer?.name || "",
    order?.customer?.table || "",
    orderTypeLabel(order)
  ].join(" ").toLowerCase();
}

function filteredOrders() {
  const query = searchTerm.trim().toLowerCase();
  return ordersCache
    .filter((order) => statusFilter === "all" || order.status === statusFilter)
    .filter((order) => !query || searchableOrderText(order).includes(query))
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
  summaryGrid.innerHTML = `
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
        <p><strong>${t("comments")}:</strong> ${escapeHtml(orderComments(order))}</p>
        <div class="agent-items-block">
          <strong>${t("items")}:</strong>
          <ul class="agent-items-list">
            ${renderOrderItems(order)}
          </ul>
        </div>
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
  if (!rows.length) {
    ordersList.innerHTML = `<p class="agent-empty">${t("emptyOrders")}</p>`;
    return;
  }
  ordersList.innerHTML = rows.map(renderOrderCard).join("");
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

function applyI18n() {
  document.documentElement.lang = lang;
  langToggle.textContent = lang === "es" ? "EN" : "ES";
  const shortLabel = window.matchMedia("(max-width: 560px)").matches;
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
  renderSummary();
  renderOrders();
  if (selectedOrderId) {
    const order = ordersCache.find((row) => row.id === selectedOrderId);
    if (order) renderDetail(order);
    else closeDetail();
  }
}

function stopRealtime() {
  if (unsubscribeOrders) unsubscribeOrders();
  unsubscribeOrders = null;
}

function startRealtime() {
  stopRealtime();
  unsubscribeOrders = listenOrders(
    (orders) => {
      ordersCache = orders;
      renderSummary();
      renderOrders();
      if (selectedOrderId) {
        const order = ordersCache.find((row) => row.id === selectedOrderId);
        if (order) renderDetail(order);
        else closeDetail();
      }
    },
    () => showToast("Orders listener error"),
    { scope: "agent_today" }
  );
}

function lockUI() {
  authGate.classList.remove("hidden");
  appSection.classList.add("hidden");
  signOutBtn.classList.add("hidden");
  staffBadge.textContent = "";
  stopRealtime();
}

function unlockUI(user, profile) {
  authGate.classList.add("hidden");
  appSection.classList.remove("hidden");
  signOutBtn.classList.remove("hidden");
  staffBadge.textContent = `${user.email} | ${t("staffRole")}: ${profile.role}`;
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

window.addEventListener("resize", applyI18n);

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
  unlockUI(user, currentStaffProfile);
});

applyI18n();
lockUI();
