import {
  listenOrders,
  updateOrderStatus,
  signInWithEmailPassword,
  getEmailByUsername,
  onAuthChange,
  signOutUser,
  isStaffAuthorized
} from "./firebase-config.js?v=20260419b";
import { BASE_MENU_ITEMS } from "./menu-data.js?v=20260419a";

const i18n = {
  es: {
    authTitle: "Acceso de cocina",
    authText: "Ingresa con usuario y contraseña para ver los pedidos en preparación.",
    authUserLabel: "Usuario",
    authPassLabel: "Contraseña",
    authButton: "Ingresar",
    authInvalid: "Usuario o contraseña inválidos.",
    authUserNotFound: "Usuario no encontrado.",
    authUserNeedsMapping: "Ese usuario no existe. Verifica el usuario asignado en Supabase.",
    authDenied: "Tu usuario no tiene permisos para esta pantalla.",
    authChecking: "Validando acceso...",
    authProviderDisabled: "El acceso con usuario y contraseña no está habilitado. Revisa Supabase Auth.",
    authUnauthorizedDomain: "Este dominio no está autorizado para el backend. Revisa WEB_ORIGINS en Vercel.",
    authNetworkError: "No se pudo conectar con la API. Revisa tu conexión e intenta de nuevo.",
    authPermissionError: "La API bloqueó la validación del usuario. Revisa roles y variables privadas.",
    screenTitle: "Pedidos en preparación",
    screenSub: "Esta pantalla muestra únicamente pedidos marcados como En preparación.",
    countLabel: "Pendientes en cocina:",
    staffRole: "Rol",
    signOut: "Salir",
    signOutShort: "Salir",
    emptyPrep: "No hay pedidos en preparación.",
    date: "Fecha",
    time: "Hora",
    customer: "Cliente",
    mode: "Servicio",
    pickup: "Recoger",
    delivery: "Delivery",
    dineIn: "En restaurante",
    comments: "Comentarios",
    noComments: "Sin comentarios",
    address: "Dirección",
    total: "Total",
    status: "Estado",
    status_preparing: "Preparando",
    btnReady: "Marcar listo",
    updated: "Estado actualizado"
  },
  en: {
    authTitle: "Kitchen access",
    authText: "Sign in with username and password to view in-preparation orders.",
    authUserLabel: "Username",
    authPassLabel: "Password",
    authButton: "Sign in",
    authInvalid: "Invalid username or password.",
    authUserNotFound: "Username not found.",
    authUserNeedsMapping: "That username does not exist. Check the assigned Supabase username.",
    authDenied: "Your user does not have access to this screen.",
    authChecking: "Validating access...",
    authProviderDisabled: "Username and password access is not enabled. Check Supabase Auth.",
    authUnauthorizedDomain: "This domain is not authorized for the backend. Check WEB_ORIGINS in Vercel.",
    authNetworkError: "The API could not be reached. Check the connection and try again.",
    authPermissionError: "The API blocked user validation. Check roles and private variables.",
    screenTitle: "Orders in preparation",
    screenSub: "This screen only shows orders marked as In preparation.",
    countLabel: "Kitchen queue:",
    staffRole: "Role",
    signOut: "Sign out",
    signOutShort: "Out",
    emptyPrep: "No orders in preparation.",
    date: "Date",
    time: "Time",
    customer: "Customer",
    mode: "Service",
    pickup: "Pickup",
    delivery: "Delivery",
    dineIn: "Dine-in",
    comments: "Comments",
    noComments: "No comments",
    address: "Address",
    total: "Total",
    status: "Status",
    status_preparing: "Preparing",
    btnReady: "Mark ready",
    updated: "Status updated"
  }
};

const authGate = document.getElementById("authGate");
const authMessage = document.getElementById("authMessage");
const authForm = document.getElementById("kitchenAuthForm");
const authUser = document.getElementById("kitchenUser");
const authPassword = document.getElementById("kitchenPassword");
const authSubmitBtn = authForm ? authForm.querySelector('button[type="submit"]') : null;
const signOutBtn = document.getElementById("kitchenSignOut");
const appSection = document.getElementById("kitchenApp");
const langToggle = document.getElementById("kitchenLangToggle");
const staffBadge = document.getElementById("staffBadge");
const prepCount = document.getElementById("prepCount");
const prepOrdersList = document.getElementById("prepOrdersList");
const toast = document.getElementById("toast");

let lang = "es";
let ordersCache = [];
let unsubscribeOrders = null;
let currentStaffUser = null;
let currentStaffProfile = null;

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

function money(v) {
  return new Intl.NumberFormat(lang === "es" ? "es-HN" : "en-US", {
    style: "currency",
    currency: "HNL",
    minimumFractionDigits: 2
  }).format(Number(v || 0));
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

function formatDate(value) {
  const date = parseDate(value);
  if (!date) return "-";
  return date.toLocaleDateString(lang === "es" ? "es-HN" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

function formatTime(value) {
  const date = parseDate(value);
  if (!date) return "-";
  return date.toLocaleTimeString(lang === "es" ? "es-HN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function foodName(item) {
  const title = item?.title;
  const candidates = [
    title && typeof title === "object" ? title[lang] : "",
    title && typeof title === "object" ? title.es : "",
    title && typeof title === "object" ? title.en : "",
    typeof title === "string" ? title : "",
    item?.name
  ];
  for (const candidate of candidates) {
    const text = String(candidate || "").trim();
    if (text && text !== "[object Object]") return text;
  }

  const byId = BASE_MENU_ITEMS.find((menuItem) => menuItem.id === item?.id || menuItem.id === item?.menu_item_id);
  if (byId) return byId.title?.[lang] || byId.title?.es || byId.title?.en || "Item";

  const price = Number(item?.price || item?.unit_price || 0);
  const samePrice = price ? BASE_MENU_ITEMS.filter((menuItem) => Number(menuItem.price) === price) : [];
  const byPrice = samePrice.length === 1 ? samePrice[0] : null;
  return byPrice?.title?.[lang] || byPrice?.title?.es || byPrice?.title?.en || "Item";
}

function prepMode(order) {
  if (order?.customer?.delivery || order?.order_type === "delivery" || order?.orderType === "delivery") return t("delivery");
  return order?.customer?.pickup ? t("pickup") : t("dineIn");
}

async function setReady(orderId) {
  try {
    await updateOrderStatus(orderId, "ready", currentStaffUser);
    showToast(t("updated"));
  } catch (_e) {
    showToast("Error");
  }
}

function prepOrders() {
  return ordersCache
    .filter((order) => order.status === "preparing")
    .sort((a, b) => {
      const aDate = parseDate(a.createdAt);
      const bDate = parseDate(b.createdAt);
      return (bDate ? bDate.getTime() : 0) - (aDate ? aDate.getTime() : 0);
    });
}

function renderOrders() {
  const rows = prepOrders();
  prepCount.textContent = String(rows.length);
  if (!rows.length) {
    prepOrdersList.innerHTML = `<p>${t("emptyPrep")}</p>`;
    return;
  }

  prepOrdersList.innerHTML = rows
    .map((order) => {
      const ref = `#${order.displayId || order.id.slice(0, 6)}`;
      return `
        <article class="kitchen-ticket">
          <div class="kitchen-ticket-head">
            <strong>${ref}</strong>
            <span class="badge preparing">${t("status_preparing")}</span>
          </div>
          <p><strong>${t("date")}:</strong> ${formatDate(order.createdAt)} | <strong>${t("time")}:</strong> ${formatTime(order.createdAt)}</p>
          <p><strong>${t("customer")}:</strong> ${order.customer?.name || "-"} (${order.customer?.phone || "-"})</p>
          <p><strong>${t("mode")}:</strong> ${prepMode(order)}</p>
          ${order.customer?.deliveryAddress ? `<p><strong>${t("address")}:</strong> ${order.customer.deliveryAddress}</p>` : ""}
          <p><strong>${t("comments")}:</strong> ${order.customer?.comments || t("noComments")}</p>
          <ul>
            ${(order.items || [])
              .map((item) => `<li>${foodName(item)} x ${Number(item.qty || 0)}</li>`)
              .join("")}
          </ul>
          <div class="kitchen-ticket-actions">
            <button class="btn btn-primary kitchen-ready-btn" data-id="${order.id}">${t("btnReady")}</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function applyI18n() {
  document.documentElement.lang = lang;
  langToggle.textContent = lang === "es" ? "EN" : "ES";
  applyResponsiveChrome();
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  if (currentStaffUser && currentStaffProfile) {
    staffBadge.textContent = `${currentStaffUser.email} | ${t("staffRole")}: ${currentStaffProfile.role}`;
  }
  renderOrders();
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
      renderOrders();
    },
    () => showToast("Orders listener error")
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

function applyResponsiveChrome() {
  const shortLabel = window.matchMedia("(max-width: 560px)").matches;
  signOutBtn.textContent = shortLabel ? t("signOutShort") : t("signOut");
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

prepOrdersList.addEventListener("click", (event) => {
  const readyBtn = event.target.closest(".kitchen-ready-btn");
  if (!readyBtn) return;
  setReady(readyBtn.dataset.id);
});

langToggle.addEventListener("click", () => {
  lang = lang === "es" ? "en" : "es";
  applyI18n();
});

let kitchenResponsiveResizeFrame = null;
function scheduleKitchenResponsiveChrome() {
  if (kitchenResponsiveResizeFrame !== null) return;
  kitchenResponsiveResizeFrame = window.requestAnimationFrame(() => {
    kitchenResponsiveResizeFrame = null;
    applyResponsiveChrome();
  });
}

window.addEventListener("resize", scheduleKitchenResponsiveChrome);

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
  setAuthMessage("");
  unlockUI(user, currentStaffProfile);
});

applyI18n();
lockUI();
