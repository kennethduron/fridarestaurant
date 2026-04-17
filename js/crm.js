import {
  listenOrders,
  listenReservations,
  updateOrderStatus,
  updateOrderPaymentStatus,
  updateOrderPaymentMethod,
  updateOrderInvoiceData,
  loadFiscalSettings,
  saveFiscalSettings,
  reserveNextFiscalInvoiceNumber,
  signInWithEmailPassword,
  getEmailByUsername,
  onAuthChange,
  signOutUser,
  isStaffAuthorized,
  registerStaffNotificationToken
} from "./firebase-config.js?v=20260417b";
import { DEFAULT_FISCAL_SETTINGS, mergeFiscalSettings } from "./fiscal-config.js?v=20260309a";

if (window.location.search === "?") {
  window.history.replaceState({}, "", `${window.location.pathname}${window.location.hash}`);
}

const i18n = {
  es: {
    authTitle: "Acceso CRM del personal",
    authText: "Ingresa con usuario y contrasena para validar rol de representante.",
    authUserLabel: "Usuario",
    authPassLabel: "Contrasena",
    authButton: "Ingresar",
    authInvalid: "Usuario o contrasena invalidos.",
    authUserNotFound: "Usuario no encontrado.",
    authDenied: "Tu usuario no tiene permisos CRM. Contacta al administrador.",
    authStartupError: "El acceso fue valido, pero el CRM no pudo iniciar correctamente. Intenta de nuevo.",
    authChecking: "Validando acceso...",
    authProviderDisabled: "El acceso con usuario y contrasena no esta habilitado. Revisa Supabase Auth.",
    authUnauthorizedDomain: "Este dominio no esta autorizado para el backend. Revisa WEB_ORIGINS en Vercel.",
    authNetworkError: "No se pudo conectar con la API. Revisa tu conexion e intenta de nuevo.",
    authPermissionError: "La API bloqueo la validacion del usuario. Revisa roles y variables privadas.",
    authSessionExpired: "Tu sesion expiro. Ingresa de nuevo.",
    kitchenScreen: "Pantalla cocina",
    fiscalSettingsPage: "Ajustes fiscales",
    fiscalModalTitle: "Ajustes fiscales",
    fiscalModalText: "Completa los datos legales que se imprimen automaticamente en la factura fiscal.",
    crmTitle: "Panel de pedidos y reservas",
    crmSub: "Gestion operacional en tiempo real para representantes.",
    viewOrders: "Pedidos",
    viewReservations: "Reservas",
    filterAll: "Todos",
    filterPending: "Pendiente",
    filterInProgress: "Preparando",
    filterReady: "Listo",
    filterAccepted: "Aceptada",
    filterPreparing: "Preparando",
    filterDelivered: "Entregado",
    filterRejected: "Rechazado",
    btnPending: "Pendiente",
    btnInProgress: "Preparando",
    btnReady: "Listo",
    btnAccept: "Entregar",
    btnReject: "Rechazar",
    btnRejectShort: "Rechazar",
    btnReopen: "Reabrir",
    btnReactivate: "Reactivar",
    actionBack: "Atras",
    actionNext: "Siguiente",
    btnMarkPaid: "Marcar pagado",
  btnPrint: "Factura normal",
  btnFiscalPrint: "Factura fiscal",
  btnFiscalReprint: "Reimprimir factura fiscal",
    btnSaveInvoice: "Guardar factura",
    review: "Revisar pedido",
    reviewShort: "Detalles",
    emptyOrders: "No hay pedidos en este estado.",
    emptyReservations: "No hay reservas registradas.",
    customer: "Cliente",
    orderComments: "Comentarios del pedido",
    invoiceRequestSummary: "Solicita factura con RTN y nombre",
    orderPickupBadge: "Para llevar",
    orderCashierPending: "Pagará en caja",
    orderPaidMessage: "Pago realizado",
    orderUnpaidMessage: "No ha pagado el pedido",
    payment: "Pago",
    paymentMethod: "Metodo",
    paymentMethodSelect: "Forma de pago",
    paymentMethodPlaceholder: "Selecciona forma de pago",
    paymentMethodRequired: "Selecciona una forma de pago antes de entregar el pedido.",
    paymentStatus: "Estado",
    orderStatus: "Estado del pedido",
    invoiceSectionTitle: "Datos de factura",
    invoiceBillingName: "Nombre de facturacion",
    invoiceBillingRTN: "RTN del cliente",
    invoiceNumber: "Numero de factura",
    invoiceNumberAuto: "Numero asignado automaticamente",
    invoiceNumberPending: "Se asignara al imprimir",
    invoiceNotes: "Notas fiscales",
    invoiceHasExoneration: "Cliente con exoneracion",
    invoiceExemptionRegister: "Registro de exoneracion",
    invoiceExemptOrder: "Orden de compra exenta",
    invoiceSagRegister: "N. registro SAG",
    invoiceSaved: "Factura guardada",
    invoiceMissingNumber: "Completa el numero de factura antes de imprimir.",
    invoiceLegalNotice: "Verifica CAI, RTN, rango autorizado e ISV antes de usar esta factura con clientes.",
    invoiceInvalidRange: "El rango fiscal es invalido. Revisa ajustes fiscales.",
    invoiceRangeExhausted: "El rango autorizado ya se termino. Actualiza el siguiente numero de factura.",
    invoicePrintBlockedExhausted: "No se puede mostrar la factura fiscal. El rango autorizado ya se excedio y debes actualizarlo en Ajustes fiscales.",
    invoiceDeadlineExceeded: "La fecha limite de emision ya vencio. Actualiza los ajustes fiscales.",
    invoicePrintBlockedExpired: "No se puede mostrar la factura fiscal. La fecha limite de emision ya vencio y debes actualizarla en Ajustes fiscales.",
    brandName: "Marca comercial",
    legalName: "Razon social",
    phone: "Telefono",
    address: "Direccion",
    email: "Correo",
    emissionDeadline: "Fecha limite de emision",
    rangeStart: "Rango autorizado inicial",
    rangeEnd: "Rango autorizado final",
  nextInvoiceNumber: "Siguiente numero de factura",
  duplicateNextInvoiceNumber: "Ese numero ya fue dado en una factura anterior. Ingresa otro numero de factura.",
    copyLegend: "Leyenda de copia",
    generalTaxRate: "ISV general (%)",
    taxAppetizers: "ISV entradas (%)",
    taxMainCourses: "ISV principales (%)",
    taxBeverages: "ISV bebidas (%)",
    taxDesserts: "ISV postres (%)",
    saveButton: "Guardar configuracion",
    settingsWarning: "Cambia estos datos solo con informacion fiscal valida autorizada por SAR.",
    invalidRange: "El rango fiscal es invalido.",
    saved: "Configuracion guardada",
    invoiceTermsCash: "Contado",
    invoiceTermsPending: "Pendiente",
    invoiceStatePaid: "Pagada",
    invoiceStatePending: "Pendiente",
    invoiceLabel: "Factura",
    customerFinalConsumer: "Consumidor final",
    customerRTNDefault: "00000000000000",
    subtotal: "Subtotal",
    exemptAmount: "Importe exento",
    taxableAmount: "Importe gravado",
    taxAmount: "ISV",
    legalInfoPending: "ACTUALIZA TUS DATOS LEGALES EN LA PAGINA FISCAL.",
    fiscalRangeAlertTitle: "Advertencia fiscal",
    fiscalRangeAlertText: "Debes actualizar los datos fiscales para seguir imprimiendo facturas fiscales.",
    fiscalRangeAlertRangeText: "Debes actualizar el estado de las facturas en Ajustes fiscales. Ya llegaste a la cantidad estipulada y no puedes seguir imprimiendo factura fiscal.",
    fiscalRangeAlertDeadlineText: "Debes actualizar el estado de las facturas en Ajustes fiscales. La fecha limite de emision ya vencio y no puedes seguir imprimiendo factura fiscal.",
    fiscalRangeAlertAction: "Actualizar ahora",
    payMethodOnline: "En linea",
    payMethodCard: "Tarjeta",
    payMethodPaypal: "PayPal",
    payMethodCash: "Efectivo",
    payMethodTransfer: "Transferencia bancaria",
    payMethodCashOnPickup: "Pago al recoger",
    payStatusPending: "Pendiente de confirmacion",
    payStatusPaid: "Pagado",
    payStatusUnpaid: "No pagado",
    total: "Total",
    date: "Fecha",
    status_pending: "Pendiente",
    status_preparing: "Preparando",
    status_ready: "Listo",
    status_accepted: "Aceptada",
    status_delivered: "Entregado",
    status_rejected: "Rechazado",
    reservationsCount: "Reservas",
    ordersCount: "Pedidos",
    pendingCount: "Pendientes",
    progressCount: "Preparando",
    readyCount: "Listos",
    acceptedCount: "Entregados",
    revenueCount: "Ingresos",
    avgTicket: "Ticket promedio",
    statsSummary: "Resumen",
    statsOps: "Operacion",
    statsSales: "Ventas",
    topFoodTitle: "Top comida vendida",
    topFoodEmpty: "No hay ventas aceptadas para este periodo.",
    calendarTitle: "Calendario de ventas",
    calendarSub: "Selecciona fecha para revisar ventas entregadas y sus pedidos.",
    calendarNoSalesMonth: "No hay ventas entregadas en este mes.",
    calendarNoSalesDay: "No hay ventas entregadas en esta fecha.",
    calendarSearchPlaceholder: "Buscar por cliente, numero de orden, factura o pedido",
    calendarSearchEmpty: "No hay pedidos que coincidan con esa busqueda.",
    calendarOrders: "Pedidos",
    calendarRevenue: "Ingresos",
    calendarDetailsTitle: "Detalle del dia",
    calendarPrev: "Mes anterior",
    calendarNext: "Mes siguiente",
    calendarFoodBreakdown: "Comida vendida ese dia",
    qtySold: "Cantidad",
    salesLabel: "Ventas",
    period_day: "Hoy",
    period_week: "Semana",
    period_month: "Mes",
    updated: "Estado actualizado",
    paymentUpdated: "Pago actualizado",
    paymentMethodUpdated: "Metodo de pago actualizado",
    paymentReceived: "Pago recibido",
    crmNotificationsReady: "Avisos del CRM activados.",
    crmNotificationsUnavailable: "El CRM esta abierto, pero este navegador no pudo activar avisos push.",
    ordersListenerError: "No se pudieron cargar los pedidos.",
    reservationsListenerError: "No se pudieron cargar las reservas.",
    staffRole: "Rol",
    signOut: "Cerrar sesion",
    signOutShort: "Salir"
  },
  en: {
    authTitle: "Staff CRM access",
    authText: "Sign in with username and password to validate representative role.",
    authUserLabel: "Username",
    authPassLabel: "Password",
    authButton: "Sign in",
    authInvalid: "Invalid username or password.",
    authUserNotFound: "Username not found.",
    authDenied: "Your user does not have CRM permissions. Contact the admin.",
    authStartupError: "Sign-in succeeded, but the CRM could not start correctly. Please try again.",
    authChecking: "Validating access...",
    authProviderDisabled: "Username and password access is not enabled. Check Supabase Auth.",
    authUnauthorizedDomain: "This domain is not authorized for the backend. Check WEB_ORIGINS in Vercel.",
    authNetworkError: "The API could not be reached. Check the connection and try again.",
    authPermissionError: "The API blocked user validation. Check roles and private variables.",
    authSessionExpired: "Your session expired. Please sign in again.",
    kitchenScreen: "Kitchen screen",
    fiscalSettingsPage: "Fiscal settings",
    fiscalModalTitle: "Fiscal settings",
    fiscalModalText: "Complete the legal data that will print automatically on the fiscal invoice.",
    crmTitle: "Orders and reservations dashboard",
    crmSub: "Real-time operations view for representatives.",
    viewOrders: "Orders",
    viewReservations: "Reservations",
    filterAll: "All",
    filterPending: "Pending",
    filterInProgress: "Preparing",
    filterReady: "Ready",
    filterAccepted: "Accepted",
    filterPreparing: "Preparing",
    filterDelivered: "Delivered",
    filterRejected: "Rejected",
    btnPending: "Pending",
    btnInProgress: "Preparing",
    btnReady: "Ready",
    btnAccept: "Deliver",
    btnReject: "Reject",
    btnRejectShort: "Reject",
    btnReopen: "Reopen",
    btnReactivate: "Reactivate",
    actionBack: "Back",
    actionNext: "Next",
    btnMarkPaid: "Mark paid",
  btnPrint: "Normal invoice",
  btnFiscalPrint: "Fiscal invoice",
  btnFiscalReprint: "Reprint fiscal invoice",
    btnSaveInvoice: "Save invoice",
    review: "Review order",
    reviewShort: "Details",
    emptyOrders: "No orders for this status.",
    emptyReservations: "No reservations found.",
    customer: "Customer",
    orderComments: "Order comments",
    invoiceRequestSummary: "Customer requested invoice with RTN and name",
    orderPickupBadge: "To go",
    orderCashierPending: "Will pay in person",
    orderPaidMessage: "Payment made",
    orderUnpaidMessage: "Order not paid yet",
    payment: "Payment",
    paymentMethod: "Method",
    paymentMethodSelect: "Payment method",
    paymentMethodPlaceholder: "Select payment method",
    paymentMethodRequired: "Select a payment method before delivering the order.",
    paymentStatus: "Status",
    orderStatus: "Order status",
    invoiceSectionTitle: "Invoice details",
    invoiceBillingName: "Billing name",
    invoiceBillingRTN: "Customer RTN",
    invoiceNumber: "Invoice number",
    invoiceNumberAuto: "Invoice number assigned automatically",
    invoiceNumberPending: "It will be assigned on print",
    invoiceNotes: "Fiscal notes",
    invoiceHasExoneration: "Customer with exemption",
    invoiceExemptionRegister: "Exemption register",
    invoiceExemptOrder: "Tax-exempt purchase order",
    invoiceSagRegister: "SAG register no.",
    invoiceSaved: "Invoice saved",
    invoiceMissingNumber: "Complete the invoice number before printing.",
    invoiceLegalNotice: "Verify CAI, RTN, authorization range, and tax setup before using this invoice with customers.",
    invoiceInvalidRange: "The fiscal range is invalid. Review fiscal settings.",
    invoiceRangeExhausted: "The authorized range is exhausted. Update the next invoice number.",
    invoicePrintBlockedExhausted: "The fiscal invoice cannot be shown. The authorized range was exceeded and must be updated in Fiscal settings.",
    invoiceDeadlineExceeded: "The emission deadline already expired. Update Fiscal settings.",
    invoicePrintBlockedExpired: "The fiscal invoice cannot be shown. The emission deadline already expired and must be updated in Fiscal settings.",
    brandName: "Brand name",
    legalName: "Legal name",
    phone: "Phone",
    address: "Address",
    email: "Email",
    emissionDeadline: "Emission deadline",
    rangeStart: "Authorized range start",
    rangeEnd: "Authorized range end",
  nextInvoiceNumber: "Next invoice number",
  duplicateNextInvoiceNumber: "That number was already used on a previous invoice. Enter a different invoice number.",
    copyLegend: "Copy legend",
    generalTaxRate: "General tax (%)",
    taxAppetizers: "Appetizers tax (%)",
    taxMainCourses: "Main courses tax (%)",
    taxBeverages: "Beverages tax (%)",
    taxDesserts: "Desserts tax (%)",
    saveButton: "Save settings",
    settingsWarning: "Only change these values with valid tax data authorized by SAR.",
    invalidRange: "The fiscal range is invalid.",
    saved: "Settings saved",
    invoiceTermsCash: "Cash sale",
    invoiceTermsPending: "Pending",
    invoiceStatePaid: "Paid",
    invoiceStatePending: "Pending",
    invoiceLabel: "Invoice",
    customerFinalConsumer: "Final consumer",
    customerRTNDefault: "00000000000000",
    subtotal: "Subtotal",
    exemptAmount: "Exempt amount",
    taxableAmount: "Taxable amount",
    taxAmount: "Sales tax",
    legalInfoPending: "UPDATE YOUR LEGAL DATA IN THE FISCAL PAGE.",
    fiscalRangeAlertTitle: "Fiscal warning",
    fiscalRangeAlertText: "You must update fiscal settings to keep printing fiscal invoices.",
    fiscalRangeAlertRangeText: "Update Fiscal settings. You already reached the authorized quantity and cannot keep printing fiscal invoices.",
    fiscalRangeAlertDeadlineText: "Update Fiscal settings. The emission deadline already expired and you cannot keep printing fiscal invoices.",
    fiscalRangeAlertAction: "Update now",
    payMethodOnline: "Online",
    payMethodCard: "Card",
    payMethodPaypal: "PayPal",
    payMethodCash: "Cash",
    payMethodTransfer: "Bank transfer",
    payMethodCashOnPickup: "Pay on pickup",
    payStatusPending: "Pending confirmation",
    payStatusPaid: "Paid",
    payStatusUnpaid: "Unpaid",
    total: "Total",
    date: "Date",
    status_pending: "Pending",
    status_preparing: "Preparing",
    status_ready: "Ready",
    status_accepted: "Accepted",
    status_delivered: "Delivered",
    status_rejected: "Rejected",
    reservationsCount: "Reservations",
    ordersCount: "Orders",
    pendingCount: "Pending",
    progressCount: "Preparing",
    readyCount: "Ready",
    acceptedCount: "Delivered",
    revenueCount: "Revenue",
    avgTicket: "Average ticket",
    statsSummary: "Summary",
    statsOps: "Operations",
    statsSales: "Sales",
    topFoodTitle: "Top food sold",
    topFoodEmpty: "No accepted sales for this period.",
    calendarTitle: "Sales calendar",
    calendarSub: "Pick a date to review delivered sales and order details.",
    calendarNoSalesMonth: "No delivered sales in this month.",
    calendarNoSalesDay: "No delivered sales on this date.",
    calendarSearchPlaceholder: "Search by customer, order number, invoice, or item",
    calendarSearchEmpty: "No orders match that search.",
    calendarOrders: "Orders",
    calendarRevenue: "Revenue",
    calendarDetailsTitle: "Day details",
    calendarPrev: "Previous month",
    calendarNext: "Next month",
    calendarFoodBreakdown: "Food sold that day",
    qtySold: "Qty",
    salesLabel: "Sales",
    period_day: "Today",
    period_week: "Week",
    period_month: "Month",
    updated: "Status updated",
    paymentUpdated: "Payment updated",
    paymentMethodUpdated: "Payment method updated",
    paymentReceived: "Payment received",
    crmNotificationsReady: "CRM alerts enabled.",
    crmNotificationsUnavailable: "The CRM is open, but this browser could not enable push alerts.",
    ordersListenerError: "Could not load orders.",
    reservationsListenerError: "Could not load reservations.",
    staffRole: "Role",
    signOut: "Sign out",
    signOutShort: "Out"
  }
};

const authGate = document.getElementById("authGate");
const authMessage = document.getElementById("authMessage");
const authForm = document.getElementById("crmAuthForm");
const authUser = document.getElementById("crmUser");
const authPassword = document.getElementById("crmPassword");
const authSubmitBtn = document.getElementById("crmSignIn");
const signOutBtn = document.getElementById("crmSignOut");
const openFiscalSettingsBtn = document.getElementById("openFiscalSettings");
const crmNavToggle = document.getElementById("crmNavToggle");
const crmHeaderNav = document.getElementById("crmHeaderNav");
const crmApp = document.getElementById("crmApp");
const staffBadge = document.getElementById("staffBadge");

const ordersList = document.getElementById("ordersList");
const reservationsList = document.getElementById("reservationsList");
const statsGrid = document.getElementById("statsGrid");
const foodStats = document.getElementById("foodStats");
const salesCalendar = document.getElementById("salesCalendar");
const viewButtons = Array.from(document.querySelectorAll(".chip[data-view]"));
const filterButtons = Array.from(document.querySelectorAll(".chip[data-filter]"));
const periodButtons = Array.from(document.querySelectorAll(".chip[data-period]"));
const ordersView = document.getElementById("ordersView");
const reservationsView = document.getElementById("reservationsView");
const reviewModal = document.getElementById("reviewModal");
const reviewTitle = document.getElementById("reviewTitle");
const reviewBody = document.getElementById("reviewBody");
const closeReview = document.getElementById("closeReview");
const reviewPending = document.getElementById("reviewPending");
const reviewProgress = document.getElementById("reviewProgress");
const reviewAccept = document.getElementById("reviewAccept");
const reviewReject = document.getElementById("reviewReject");
const fiscalSettingsModal = document.getElementById("fiscalSettingsModal");
const fiscalSettingsForm = document.getElementById("crmFiscalSettingsForm");
const closeFiscalSettingsBtn = document.getElementById("closeFiscalSettings");
const langToggleDesktop = document.getElementById("crmLangToggleDesktop");
const langToggleMobile = document.getElementById("crmLangToggleMobile");
const fiscalRangeAlert = document.getElementById("fiscalRangeAlert");
const fiscalRangeAlertTitle = document.getElementById("fiscalRangeAlertTitle");
const fiscalRangeAlertText = document.getElementById("fiscalRangeAlertText");
const fiscalRangeAlertButton = document.getElementById("fiscalRangeAlertButton");
const toast = document.getElementById("toast");

let lang = "es";
let activeFilter = "all";
let selectedOrderId = null;
let currentStaffUser = null;
let currentStaffProfile = null;
let pendingAuthMessage = "";
let ordersCache = [];
let reservationsCache = [];
let activePeriod = "day";
let calendarMonth = (() => {
  const now = new Date();
  now.setDate(1);
  now.setHours(0, 0, 0, 0);
  return now;
})();
let selectedCalendarDate = null;
let salesDaySearchTerm = "";
let unsubscribeOrders = null;
let unsubscribeReservations = null;
let hasSeenInitialOrdersSnapshot = false;
let knownOrderIds = new Set();
let knownOrderPaymentStatus = new Map();
let audioCtx = null;
let audioUnlocked = false;
let realtimeAuthExpiredHandled = false;
let fiscalSettings = mergeFiscalSettings();

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
  authSubmitBtn.disabled = isBusy;
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

function roundMoney(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function amountToWordsEs(value) {
  const units = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
  const teens = ["diez", "once", "doce", "trece", "catorce", "quince", "dieciseis", "diecisiete", "dieciocho", "diecinueve"];
  const tens = ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
  const hundreds = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

  function underHundred(n) {
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    if (n === 20) return "veinte";
    if (n < 30) return `veinti${units[n - 20]}`;
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    return unit ? `${tens[ten]} y ${units[unit]}` : tens[ten];
  }

  function underThousand(n) {
    if (n === 0) return "";
    if (n === 100) return "cien";
    if (n < 100) return underHundred(n);
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    return rest ? `${hundreds[hundred]} ${underHundred(rest)}` : hundreds[hundred];
  }

  function integerWords(n) {
    if (n === 0) return "cero";
    if (n < 1000) return underThousand(n);
    if (n < 1000000) {
      const thousands = Math.floor(n / 1000);
      const rest = n % 1000;
      const thousandsText = thousands === 1 ? "mil" : `${integerWords(thousands)} mil`;
      return rest ? `${thousandsText} ${underThousand(rest)}` : thousandsText;
    }
    const millions = Math.floor(n / 1000000);
    const rest = n % 1000000;
    const millionsText = millions === 1 ? "un millon" : `${integerWords(millions)} millones`;
    return rest ? `${millionsText} ${integerWords(rest)}` : millionsText;
  }

  const amount = Number(value || 0);
  const integerPart = Math.floor(amount);
  const cents = Math.round((amount - integerPart) * 100);
  return `${integerWords(integerPart)} con ${String(cents).padStart(2, "0")}/100`;
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
  } catch (_e) {
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
  } catch (_e) {
    audioUnlocked = false;
  }
  return audioUnlocked;
}

function playNewOrderSound() {
  if (!audioUnlocked) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const beepOffsets = [0, 0.23];
  beepOffsets.forEach((offset) => {
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
  } catch (_e) {
    return "denied";
  }
}

function notifyNewOrder(order) {
  const orderRef = `#${order.displayId || order.id.slice(0, 6)}`;
  const customerName = order.customer?.name || "-";
  const totalText = money(order.total);
  const title = lang === "es" ? "Nuevo pedido recibido" : "New order received";
  const body =
    lang === "es"
      ? `${orderRef} | ${customerName} | ${totalText}`
      : `${orderRef} | ${customerName} | ${totalText}`;

  showToast(`${title}: ${orderRef}`);
  playNewOrderSound();
  if (!canUseBrowserNotifications() || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body });
  } catch (_e) {
    // Ignore notification errors and keep toast feedback.
  }
}

function notifyPaymentReceived(order) {
  const orderRef = `#${order.displayId || order.id.slice(0, 6)}`;
  const customerName = order.customer?.name || "-";
  const title = t("paymentReceived");
  const body = `${orderRef} | ${customerName}`;
  showToast(`${title}: ${orderRef}`);
  if (!canUseBrowserNotifications() || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body });
  } catch (_e) {
    // Ignore notification errors and keep toast feedback.
  }
}

async function registerCRMPushNotifications() {
  try {
    const token = await registerStaffNotificationToken("web-crm");
    if (token) showToast(t("crmNotificationsReady"));
  } catch (error) {
    console.warn("CRM push registration failed", error);
    showToast(t("crmNotificationsUnavailable"));
  }
}

function orderStatusLabel(status) {
  return t(`status_${status}`);
}

const ORDER_STATUS_FLOW = ["pending", "accepted", "preparing", "ready", "delivered"];

function previousOrderStatus(status) {
  const index = ORDER_STATUS_FLOW.indexOf(status);
  return index > 0 ? ORDER_STATUS_FLOW[index - 1] : "";
}

function nextOrderStatus(status) {
  const index = ORDER_STATUS_FLOW.indexOf(status);
  return index >= 0 && index < ORDER_STATUS_FLOW.length - 1 ? ORDER_STATUS_FLOW[index + 1] : "";
}

function renderStatusActionButton({ orderId, targetStatus, variant = "outline", label, hint = "" }) {
  if (!targetStatus || !label) return "";
  const buttonClass = variant === "primary" ? "btn btn-primary" : "btn btn-outline";
  const singleLineClass = hint ? "" : " status-nav-single";
  return `
    <button class="${buttonClass} status-change status-nav-btn${singleLineClass}" data-id="${orderId}" data-status="${targetStatus}">
      ${hint ? `<span class="status-nav-hint">${hint}</span>` : ""}
      <strong>${label}</strong>
    </button>
  `;
}

function renderOrderStatusActions(order) {
  const status = order?.status || "pending";

  if (status === "delivered") {
    return renderStatusActionButton({
      orderId: order.id,
      targetStatus: "ready",
      label: t("btnReopen")
    });
  }

  if (status === "rejected") {
    return renderStatusActionButton({
      orderId: order.id,
      targetStatus: "pending",
      label: t("btnReactivate")
    });
  }

  const actions = [];
  const previousStatus = previousOrderStatus(status);

  if (previousStatus) {
    actions.push(renderStatusActionButton({
      orderId: order.id,
      targetStatus: previousStatus,
      label: orderStatusLabel(previousStatus),
      hint: t("actionBack")
    }));
  }

  if (status === "ready") {
    actions.push(renderStatusActionButton({
      orderId: order.id,
      targetStatus: "delivered",
      variant: "primary",
      label: t("btnAccept")
    }));
  } else {
    const upcomingStatus = nextOrderStatus(status);
    if (upcomingStatus) {
      actions.push(renderStatusActionButton({
        orderId: order.id,
        targetStatus: upcomingStatus,
        variant: "primary",
        label: orderStatusLabel(upcomingStatus),
        hint: t("actionNext")
      }));
    }
  }

  actions.push(`
    <button class="btn danger status-change status-nav-btn status-nav-single status-reject-btn" data-id="${order.id}" data-status="rejected">
      <strong>${t("btnRejectShort")}</strong>
    </button>
  `);

  return actions.join("");
}

function paymentMethodLabel(method) {
  if (method === "bank_transfer") return t("payMethodTransfer");
  if (method === "cash") return t("payMethodCash");
  if (method === "paypal") return t("payMethodPaypal");
  if (method === "card") return t("payMethodCard");
  if (method === "online") return t("payMethodOnline");
  return t("payMethodCashOnPickup");
}

function paymentStatusLabel(status) {
  if (status === "paid") return t("payStatusPaid");
  if (status === "pending") return t("payStatusPending");
  return t("payStatusUnpaid");
}

function invoicePaymentMethod(order) {
  const method = order?.payment?.method;
  if (method === "cash_on_pickup" && order?.status === "delivered") return "cash";
  return method;
}

function paymentDone(order) {
  if (order?.payment?.status === "paid") return true;
  const method = invoicePaymentMethod(order);
  return order?.status === "delivered" && (method === "cash" || method === "card");
}

function crmPaymentLine(order) {
  const done = paymentDone(order);
  const paymentText = done ? t("orderPaidMessage") : t("orderUnpaidMessage");
  if (order?.customer?.pickup) {
    return `${t("orderPickupBadge")} | ${paymentText}`;
  }
  if (order?.payment?.method === "cash_on_pickup" && !done) {
    return t("orderCashierPending");
  }
  return paymentText;
}

function paymentMethodSelectValue(order) {
  const method = order?.payment?.method;
  if (method === "bank_transfer") return "bank_transfer";
  if (method === "card" || method === "paypal" || method === "online") return "card";
  if (method === "cash") return "cash";
  return "";
}

function selectedPaymentMethodLabel(order) {
  const selectedMethod = paymentMethodSelectValue(order);
  return selectedMethod ? paymentMethodLabel(selectedMethod) : "";
}

async function refreshFiscalSettings() {
  try {
    const remoteSettings = await loadFiscalSettings();
    fiscalSettings = mergeFiscalSettings(remoteSettings || {});
  } catch (_e) {
    fiscalSettings = mergeFiscalSettings(DEFAULT_FISCAL_SETTINGS);
  }
  updateFiscalRangeAlert();
}

function setFiscalFormValues(settings) {
  if (!fiscalSettingsForm) return;
  fiscalSettingsForm.elements.brandName.value = settings.brandName || "";
  fiscalSettingsForm.elements.legalName.value = settings.legalName || "";
  fiscalSettingsForm.elements.rtn.value = settings.rtn || "";
  fiscalSettingsForm.elements.phone.value = settings.phone || "";
  fiscalSettingsForm.elements.address.value = settings.address || "";
  fiscalSettingsForm.elements.email.value = settings.email || "";
  fiscalSettingsForm.elements.cai.value = settings.cai || "";
  fiscalSettingsForm.elements.emissionDeadline.value = settings.emissionDeadline || "";
  fiscalSettingsForm.elements.authorizationRangeStart.value = settings.authorizationRangeStart || "";
  fiscalSettingsForm.elements.authorizationRangeEnd.value = settings.authorizationRangeEnd || "";
  fiscalSettingsForm.elements.nextInvoiceNumber.value = settings.nextInvoiceNumber || "";
  fiscalSettingsForm.elements.copyLegend.value = settings.copyLegend || "";
  fiscalSettingsForm.elements.taxRatePercent.value = String((Number(settings.taxRate || 0) * 100).toFixed(2));
  fiscalSettingsForm.elements.tax_appetizers.value = String((Number(settings.categoryRates?.appetizers || 0) * 100).toFixed(2));
  fiscalSettingsForm.elements.tax_main_courses.value = String((Number(settings.categoryRates?.main_courses || 0) * 100).toFixed(2));
  fiscalSettingsForm.elements.tax_beverages.value = String((Number(settings.categoryRates?.beverages || 0) * 100).toFixed(2));
  fiscalSettingsForm.elements.tax_desserts.value = String((Number(settings.categoryRates?.desserts || 0) * 100).toFixed(2));
}

function getFiscalFormValues() {
  return {
    brandName: fiscalSettingsForm.elements.brandName.value.trim(),
    legalName: fiscalSettingsForm.elements.legalName.value.trim(),
    rtn: fiscalSettingsForm.elements.rtn.value.trim(),
    phone: fiscalSettingsForm.elements.phone.value.trim(),
    address: fiscalSettingsForm.elements.address.value.trim(),
    email: fiscalSettingsForm.elements.email.value.trim(),
    cai: fiscalSettingsForm.elements.cai.value.trim(),
    emissionDeadline: fiscalSettingsForm.elements.emissionDeadline.value.trim(),
    authorizationRangeStart: fiscalSettingsForm.elements.authorizationRangeStart.value.trim(),
    authorizationRangeEnd: fiscalSettingsForm.elements.authorizationRangeEnd.value.trim(),
    nextInvoiceNumber: fiscalSettingsForm.elements.nextInvoiceNumber.value.trim(),
    copyLegend: fiscalSettingsForm.elements.copyLegend.value.trim(),
    taxRate: Number(fiscalSettingsForm.elements.taxRatePercent.value || 0) / 100,
    categoryRates: {
      appetizers: Number(fiscalSettingsForm.elements.tax_appetizers.value || 0) / 100,
      main_courses: Number(fiscalSettingsForm.elements.tax_main_courses.value || 0) / 100,
      beverages: Number(fiscalSettingsForm.elements.tax_beverages.value || 0) / 100,
      desserts: Number(fiscalSettingsForm.elements.tax_desserts.value || 0) / 100
    }
  };
}

async function openFiscalSettingsModal() {
  if (!currentStaffUser || !fiscalSettingsModal) return;
  await refreshFiscalSettings();
  setFiscalFormValues(fiscalSettings);
  fiscalSettingsModal.classList.remove("hidden");
  updateFiscalRangeAlert();
}

function closeFiscalSettingsModal() {
  if (!fiscalSettingsModal) return;
  fiscalSettingsModal.classList.add("hidden");
  updateFiscalRangeAlert();
}

function updateFiscalRangeAlert() {
  if (!fiscalRangeAlert) return;
  const rangeCheck = validateFiscalRange(fiscalSettings);
  const reason = rangeCheck.reason;
  const modalOpen = fiscalSettingsModal && !fiscalSettingsModal.classList.contains("hidden");
  const showAlert = Boolean(
    currentStaffUser &&
    currentStaffProfile &&
    !modalOpen &&
    (reason === "exhausted" || reason === "expired")
  );
  fiscalRangeAlert.classList.toggle("hidden", !showAlert);
  if (!showAlert) return;
  if (fiscalRangeAlertTitle) fiscalRangeAlertTitle.textContent = t("fiscalRangeAlertTitle");
  if (fiscalRangeAlertText) {
    fiscalRangeAlertText.textContent = reason === "expired"
      ? t("fiscalRangeAlertDeadlineText")
      : t("fiscalRangeAlertRangeText");
  }
  if (fiscalRangeAlertButton) fiscalRangeAlertButton.textContent = t("fiscalRangeAlertAction");
}

function invoiceStateLabel(order) {
  if (order?.status === "delivered") return orderStatusLabel("delivered");
  return orderStatusLabel(order?.status || "pending");
}

function defaultInvoiceData(order) {
  const hasCustomerInvoiceRequest = Boolean(
    order?.customer?.needsInvoice ||
    String(order?.invoice?.billingName || "").trim() ||
    String(order?.invoice?.billingRTN || "").trim()
  );
  return {
    billingName: hasCustomerInvoiceRequest
      ? String(order?.invoice?.billingName || "").trim()
      : "",
    billingRTN: hasCustomerInvoiceRequest
      ? String(order?.invoice?.billingRTN || "").trim()
      : "",
    invoiceNumber: String(order?.invoice?.invoiceNumber || "").trim(),
    notes: String(order?.invoice?.notes || "").trim(),
    fiscalPrintedAt: String(order?.invoice?.fiscalPrintedAt || "").trim(),
    hasExoneration: Boolean(order?.invoice?.hasExoneration),
    exemptionRegister: String(order?.invoice?.exemptionRegister || "").trim(),
    exemptOrderNumber: String(order?.invoice?.exemptOrderNumber || "").trim(),
    sagRegister: String(order?.invoice?.sagRegister || "").trim()
  };
}

function fiscalPrintButtonLabel(order) {
  const fiscalPrintedAt = String(order?.invoice?.fiscalPrintedAt || "").trim();
  return fiscalPrintedAt ? t("btnFiscalReprint") : t("btnFiscalPrint");
}

function hasCustomerInvoiceRequest(order) {
  return Boolean(
    order?.customer?.needsInvoice ||
    String(order?.invoice?.billingName || "").trim() ||
    String(order?.invoice?.billingRTN || "").trim()
  );
}

function renderInvoiceRequestNotice(order) {
  return hasCustomerInvoiceRequest(order)
    ? `<p><strong>${t("invoiceRequestSummary")}</strong></p>`
    : "";
}

function renderOrderComments(order) {
  const comments = String(order?.customer?.comments || "").trim();
  return comments ? `<p>${t("orderComments")}: ${escapeHtml(comments)}</p>` : "";
}

function parseFiscalNumber(value) {
  const normalized = String(value || "").trim();
  const parts = normalized.split("-");
  if (parts.length < 4) return null;
  const serial = parts[parts.length - 1];
  const prefix = parts.slice(0, -1).join("-");
  const numeric = Number(serial);
  if (!prefix || !serial || !Number.isInteger(numeric)) return null;
  return { prefix, serial, width: serial.length, numeric };
}

function parseFiscalDeadline(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return null;
  const match = normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd), 23, 59, 59, 999);
  return Number.isNaN(date.getTime()) ? null : date;
}

function validateFiscalRange(settings) {
  const start = parseFiscalNumber(settings.authorizationRangeStart);
  const end = parseFiscalNumber(settings.authorizationRangeEnd);
  const nextRaw = String(settings.nextInvoiceNumber || "").trim();
  const lastIssued = parseFiscalNumber(settings.lastIssuedInvoiceNumber);
  const next = nextRaw ? parseFiscalNumber(nextRaw) : null;
  const deadline = parseFiscalDeadline(settings.emissionDeadline);
  if (!start || !end) return { ok: false, reason: "invalid" };
  if (deadline && Date.now() > deadline.getTime()) return { ok: false, reason: "expired" };
  if (start.prefix !== end.prefix) return { ok: false, reason: "invalid" };
  if (!next) {
    if (lastIssued && lastIssued.prefix === end.prefix && lastIssued.numeric >= end.numeric) {
      return { ok: false, reason: "exhausted" };
    }
    return { ok: false, reason: "invalid" };
  }
  if (next.prefix !== start.prefix) return { ok: false, reason: "invalid" };
  if (start.numeric > end.numeric) return { ok: false, reason: "invalid" };
  if (next.numeric < start.numeric || next.numeric > end.numeric + 1) return { ok: false, reason: "invalid" };
  if (next.numeric > end.numeric) return { ok: false, reason: "exhausted" };
  return { ok: true };
}

function resolveItemTaxRate(item) {
  if (typeof item?.taxRate === "number") return item.taxRate;
  const categoryRate = fiscalSettings.categoryRates[item?.category];
  if (typeof categoryRate === "number") return categoryRate;
  return fiscalSettings.taxRate;
}

function buildFiscalBreakdown(order) {
  const lines = (order.items || []).map((item) => {
    const qty = Number(item.qty || 0);
    const unitPrice = Number(item.price || 0);
    const gross = roundMoney(qty * unitPrice);
    const taxRate = resolveItemTaxRate(item);
    if (!taxRate) {
      return {
        item,
        qty,
        unitPrice,
        gross,
        taxRate: 0,
        taxableBase: 0,
        exemptAmount: gross,
        taxAmount: 0
      };
    }

    const taxableBase = roundMoney(gross / (1 + taxRate));
    const taxAmount = roundMoney(gross - taxableBase);
    return {
      item,
      qty,
      unitPrice,
      gross,
      taxRate,
      taxableBase,
      exemptAmount: 0,
      taxAmount
    };
  });

  const exemptAmount = roundMoney(lines.reduce((sum, row) => sum + row.exemptAmount, 0));
  const taxableAmount = roundMoney(lines.reduce((sum, row) => sum + row.taxableBase, 0));
  const taxAmount = roundMoney(lines.reduce((sum, row) => sum + row.taxAmount, 0));
  const subtotal = roundMoney(exemptAmount + taxableAmount);
  const total = roundMoney(subtotal + taxAmount);

  return { lines, exemptAmount, taxableAmount, taxAmount, subtotal, total };
}


function formatDate(value) {
  if (!value) return "-";
  const date = value.toDate ? value.toDate() : new Date(value);
  return date.toLocaleString(lang === "es" ? "es-ES" : "en-US");
}

function buildPrintableOrderHtml(order) {
  const orderRef = `#${escapeHtml(order.displayId || order.id.slice(0, 6))}`;
  const createdAt = formatDate(order.createdAt);
  const customerName = escapeHtml(order.customer?.name || "Consumidor final");
  const businessName = escapeHtml(fiscalSettings.brandName || "Frida Restaurant");
  const businessPhone = escapeHtml(fiscalSettings.phone || "-");
  const businessEmail = escapeHtml(fiscalSettings.email || "casabrava@gmail.com");
  const businessAddress = escapeHtml(fiscalSettings.address || "-");
  const paymentMethodText = escapeHtml(paymentMethodLabel(invoicePaymentMethod(order)));
  const amountInWords = escapeHtml(amountToWordsEs(order.total).toUpperCase());
  const logoUrl = new URL("assets/casa-brava-logo.jpg", window.location.href).href;
  const itemRows = (order.items || [])
    .map((item) => {
      const title = escapeHtml(item.title?.[lang] || item.title?.es || item.title?.en || "Item");
      const qty = Number(item.qty || 0);
      const unitPrice = Number(item.price || 0);
      const lineTotal = qty * unitPrice;
      return `
        <div class="line-item">
          <div class="line-main">${qty} x ${escapeHtml(money(unitPrice))} ${title}</div>
          <div class="line-total">${escapeHtml(money(lineTotal))}</div>
        </div>
      `;
    })
    .join("");

  return `
    <!doctype html>
    <html lang="${lang}">
    <head>
      <meta charset="utf-8">
      <title>Frida Restaurant ${orderRef}</title>
      <style>
        @page { size: 80mm auto; margin: 4mm; }
        * { box-sizing: border-box; }
        body {
          margin: 0 auto;
          width: 72mm;
          color: #000;
          font-family: "Courier New", monospace;
          font-size: 12px;
          line-height: 1.25;
        }
        .ticket { width: 100%; }
        .center { text-align: center; }
        .logo {
          width: 42mm;
          max-width: 100%;
          display: block;
          margin: 0 auto 4mm;
          filter: grayscale(100%);
        }
        h1, h2, p { margin: 0; }
        .brand-title {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0.6px;
          margin-bottom: 2px;
        }
        .muted { margin-top: 1px; }
        .row, .line-item, .summary-row {
          display: flex;
          justify-content: space-between;
          gap: 8px;
        }
        .row strong:last-child,
        .line-total,
        .summary-row strong:last-child,
        .summary-row span:last-child {
          text-align: right;
          white-space: nowrap;
        }
        .section { margin-top: 4mm; }
        .rule {
          border-top: 1px dashed #000;
          margin: 3mm 0 2mm;
        }
        .header-rule {
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
          padding: 1mm 0;
          margin: 3mm 0 2mm;
          font-weight: 700;
        }
        .line-item { padding: 1mm 0; align-items: flex-start; }
        .line-main { flex: 1; }
        .summary { margin-top: 2mm; }
        .summary-row { padding: 0.8mm 0; }
        .summary-row.total {
          font-size: 15px;
          font-weight: 700;
        }
        .amount-words {
          margin-top: 3mm;
          text-align: center;
          font-weight: 700;
        }
        .thanks {
          margin-top: 5mm;
          text-align: center;
          font-weight: 700;
        }
      </style>
      <script>
        window.addEventListener("load", () => {
          const logo = document.querySelector(".logo");
          const triggerPrint = () => {
            window.focus();
            window.print();
          };
          if (logo && !logo.complete) {
            logo.addEventListener("load", triggerPrint, { once: true });
            logo.addEventListener("error", triggerPrint, { once: true });
            setTimeout(triggerPrint, 800);
          } else {
            setTimeout(triggerPrint, 150);
          }
        });
      </script>
    </head>
    <body>
      <div class="ticket">
        <div class="center">
          <img class="logo" src="${escapeHtml(logoUrl)}" alt="Frida Restaurant">
          <p class="brand-title">${businessName}</p>
          <p class="muted">TEL: ${businessPhone}</p>
          <p class="muted">${businessEmail}</p>
          <p class="muted">${businessAddress}</p>
        </div>
        <div class="section">
          <div class="row">
            <strong>${lang === "es" ? "TICKET" : "TICKET"}</strong>
            <strong>${lang === "es" ? "FECHA" : "DATE"}</strong>
          </div>
          <div class="row">
            <span>${orderRef}</span>
            <span>${escapeHtml(createdAt)}</span>
          </div>
        </div>
        <div class="section">
          <strong>${lang === "es" ? "CLIENTE" : "CUSTOMER"}: ${customerName}</strong>
        </div>
        <div class="section">
          <p><strong>${lang === "es" ? "ESTADO" : "STATUS"}:</strong> ${escapeHtml(lang === "es" ? "Entregado" : "Delivered")}</p>
          <p><strong>${lang === "es" ? "PAGO" : "PAYMENT"}:</strong> ${paymentMethodText}</p>
        </div>
        <div class="header-rule">${lang === "es" ? "CANTIDAD / PRECIO / DESCRIPCION" : "QTY / PRICE / DESCRIPTION"} <span style="float:right;">${lang === "es" ? "TOTAL" : "TOTAL"}</span></div>
        <div>${itemRows}</div>
        <div class="rule"></div>
        <div class="summary">
          <div class="summary-row"><span>${lang === "es" ? "DESCUENTO" : "DISCOUNT"}</span><span>${escapeHtml(money(0))}</span></div>
          <div class="summary-row"><span>${lang === "es" ? "IMPORTE GRAVADO" : "TAXABLE AMOUNT"}</span><span>${escapeHtml(money(order.total))}</span></div>
          <div class="summary-row total"><strong>${lang === "es" ? "TOTAL A PAGAR" : "TOTAL DUE"}</strong><strong>${escapeHtml(money(order.total))}</strong></div>
          <div class="amount-words">${amountInWords}</div>
          <div class="summary-row"><span>${lang === "es" ? "PAGO" : "PAYMENT"}</span><span>${escapeHtml(money(order.total))}</span></div>
          <div class="summary-row"><span>${lang === "es" ? "CAMBIO" : "CHANGE"}</span><span>${escapeHtml(money(0))}</span></div>
        </div>
        <p class="thanks">${lang === "es" ? "MUCHAS GRACIAS, TE ESPERAMOS PRONTO" : "THANK YOU, SEE YOU SOON"}</p>
      </div>
    </body>
    </html>
  `;
}

async function printOrder(orderId) {
  const order = ordersCache.find((row) => row.id === orderId);
  if (!order) return;
  const printWindow = window.open("", "_blank", "width=420,height=900");
  if (!printWindow) return;
  try {
    printWindow.opener = null;
  } catch (_error) {
    // Ignore browsers that block changing opener.
  }
  printWindow.document.open();
  printWindow.document.write("<!doctype html><html><head><meta charset=\"utf-8\"><title>Imprimiendo...</title></head><body style=\"font-family:sans-serif;padding:16px;\">Preparando factura...</body></html>");
  printWindow.document.close();
  await refreshFiscalSettings();
  printWindow.document.open();
  printWindow.document.write(buildPrintableOrderHtml(order));
  printWindow.document.close();
}

function buildFiscalPrintableOrderHtml(order) {
  const invoice = defaultInvoiceData(order);
  const createdAt = parseDate(order.createdAt) || new Date();
  const createdAtDateText = createdAt.toLocaleDateString(lang === "es" ? "es-HN" : "en-US");
  const createdAtTimeText = createdAt.toLocaleTimeString(lang === "es" ? "es-HN" : "en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
  const customerName = escapeHtml(invoice.billingName || t("customerFinalConsumer"));
  const customerRTN = escapeHtml(invoice.billingRTN || t("customerRTNDefault"));
  const orderPhone = escapeHtml(order.customer?.phone || "-");
  const invoiceNumber = escapeHtml(invoice.invoiceNumber || "PENDIENTE");
  const logoUrl = new URL("assets/casa-brava-logo.jpg", window.location.href).href;
  const breakdown = buildFiscalBreakdown(order);
  const amountInWords = escapeHtml(amountToWordsEs(breakdown.total).toUpperCase());
  const lineRows = breakdown.lines.map((row) => {
    const itemTitle = escapeHtml(row.item.title?.[lang] || row.item.title?.es || row.item.title?.en || "Item");
    const taxPercent = Math.round(row.taxRate * 100);
    const taxLabel = row.taxRate ? `ISV ${taxPercent}%` : "ISV 0%";
    return `
      <div class="line-item">
        <div class="line-main">${row.qty} X ${escapeHtml(roundMoney(row.unitPrice).toFixed(2))} ${itemTitle.toUpperCase()}</div>
        <div class="line-total">${escapeHtml(money(row.gross))}</div>
      </div>
      <div class="tax-row">${taxLabel}: ${escapeHtml(money(row.taxAmount))}</div>
    `;
  }).join("");
  const exonerationBlock = invoice.hasExoneration
    ? `
      <p>${t("invoiceExemptionRegister").toUpperCase()}: ${escapeHtml(invoice.exemptionRegister)}</p>
      <p>${t("invoiceExemptOrder").toUpperCase()}: ${escapeHtml(invoice.exemptOrderNumber)}</p>
      <p>${t("invoiceSagRegister").toUpperCase()}: ${escapeHtml(invoice.sagRegister)}</p>
    `
    : "";

  function buildCopy(copyLabel) {
    return `
      <div class="ticket">
        <div class="center">
          <img class="logo" src="${escapeHtml(logoUrl)}" alt="${escapeHtml(fiscalSettings.brandName)}">
          <p class="brand-title">${escapeHtml(fiscalSettings.brandName)}</p>
          <p><strong>${escapeHtml(fiscalSettings.legalName)}</strong></p>
          <p class="muted">RTN: ${escapeHtml(fiscalSettings.rtn)} TEL: ${escapeHtml(fiscalSettings.phone)}</p>
          <p class="muted">${escapeHtml(fiscalSettings.address)}</p>
          <p class="muted">${escapeHtml(fiscalSettings.email)}</p>
        </div>
        <div class="section">
          <div class="row invoice-meta-head">
            <strong>${t("invoiceLabel").toUpperCase()}</strong>
            <strong>${lang === "es" ? "FECHA" : "DATE"}</strong>
          </div>
          <div class="row invoice-meta-values">
            <span>${invoiceNumber}</span>
            <span class="invoice-datetime">
              <span>${escapeHtml(createdAtDateText)}</span>
              <span>${escapeHtml(createdAtTimeText)}</span>
            </span>
          </div>
        </div>
        <div class="section center">
          <p class="big-customer"><strong>${lang === "es" ? "CLIENTE" : "CUSTOMER"}:</strong> ${customerName}</p>
          <p><strong>RTN:</strong> ${customerRTN}</p>
          <p><strong>TEL:</strong> ${orderPhone}</p>
        </div>
        <div class="section">
          <p><strong>${lang === "es" ? "ESTADO" : "STATUS"}:</strong> ${escapeHtml(invoiceStateLabel(order))}</p>
          <p><strong>${lang === "es" ? "PAGO" : "PAYMENT"}:</strong> ${escapeHtml(paymentMethodLabel(invoicePaymentMethod(order)))}</p>
          ${invoice.notes ? `<p><strong>${t("invoiceNotes").toUpperCase()}:</strong> ${escapeHtml(invoice.notes)}</p>` : ""}
        </div>
        <div class="header-rule">${lang === "es" ? "CANTIDAD / PRECIO / DESCRIPCION" : "QTY / PRICE / DESCRIPTION"} <span style="float:right;">${lang === "es" ? "TOTAL" : "TOTAL"}</span></div>
        <div>${lineRows}</div>
        <div class="rule"></div>
        <div class="summary">
          <div class="summary-row"><span>${lang === "es" ? "DESCUENTO" : "DISCOUNT"}</span><span>${escapeHtml(money(0))}</span></div>
          <div class="summary-row"><span>${t("subtotal").toUpperCase()}</span><span>${escapeHtml(money(breakdown.subtotal))}</span></div>
          <div class="summary-row"><span>${t("exemptAmount").toUpperCase()}</span><span>${escapeHtml(money(breakdown.exemptAmount))}</span></div>
          <div class="summary-row"><span>${t("taxableAmount").toUpperCase()}</span><span>${escapeHtml(money(breakdown.taxableAmount))}</span></div>
          <div class="summary-row"><span>${t("taxAmount").toUpperCase()}</span><span>${escapeHtml(money(breakdown.taxAmount))}</span></div>
          <div class="summary-row total"><strong>${lang === "es" ? "TOTAL A PAGAR" : "TOTAL DUE"}</strong><strong>${escapeHtml(money(breakdown.total))}</strong></div>
        </div>
        <div class="amount-words">${amountInWords}</div>
        <div class="section center">
          <div class="summary-row"><span>${lang === "es" ? "PAGO" : "PAYMENT"}</span><span>${escapeHtml(money(breakdown.total))}</span></div>
          <div class="summary-row"><span>${lang === "es" ? "CAMBIO" : "CHANGE"}</span><span>${escapeHtml(money(0))}</span></div>
        </div>
        <div class="section center">
          <p>CAI: ${escapeHtml(fiscalSettings.cai)}</p>
          <p>${lang === "es" ? "RANGO AUTORIZADO" : "AUTHORIZED RANGE"}: ${escapeHtml(fiscalSettings.authorizationRangeStart)} / ${escapeHtml(fiscalSettings.authorizationRangeEnd)}</p>
          <p>${lang === "es" ? "FECHA LIMITE DE EMISION" : "ISSUE DEADLINE"}: ${escapeHtml(fiscalSettings.emissionDeadline)}</p>
          <p>${escapeHtml(copyLabel)}</p>
          ${exonerationBlock}
        </div>
      </div>
    `;
  }

  return `
    <!doctype html>
    <html lang="${lang}">
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(fiscalSettings.brandName)} ${invoiceNumber}</title>
      <style>
        @page { size: 80mm auto; margin: 4mm; }
        * { box-sizing: border-box; }
        body {
          margin: 0 auto;
          width: 72mm;
          color: #000;
          font-family: "Courier New", monospace;
          font-size: 12px;
          line-height: 1.15;
        }
        .ticket { width: 100%; }
        .ticket-copy + .ticket-copy {
          page-break-before: always;
          margin-top: 8mm;
        }
        .center { text-align: center; }
        .logo {
          width: 42mm;
          max-width: 100%;
          display: block;
          margin: 0 auto 4mm;
          filter: grayscale(100%);
        }
        p { margin: 0; }
        .brand-title {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.4px;
          margin: 1mm 0 0.4mm;
        }
        .muted { margin-top: 1px; }
        .row, .line-item, .summary-row {
          display: flex;
          justify-content: space-between;
          gap: 8px;
        }
        .invoice-meta-head,
        .invoice-meta-values {
          display: grid;
          grid-template-columns: minmax(0, 24mm) minmax(0, 38mm);
          column-gap: 4mm;
          align-items: start;
        }
        .invoice-meta-head strong:last-child,
        .invoice-meta-values span:last-child {
          text-align: right;
        }
        .invoice-meta-values span {
          display: block;
          white-space: normal;
          overflow-wrap: anywhere;
          word-break: break-word;
        }
        .invoice-datetime {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1mm;
        }
        .invoice-meta-values span:first-child {
          padding-right: 2mm;
        }
        .section { margin-top: 4mm; }
        .rule {
          border-top: 1px solid #000;
          margin: 3mm 0 2mm;
        }
        .header-rule {
          border-top: 1px solid #000;
          border-bottom: 1px solid #000;
          padding: 1mm 0;
          margin: 3mm 0 2mm;
          font-weight: 700;
        }
        .line-item { padding-top: 1mm; align-items: flex-start; }
        .line-main { flex: 1; }
        .line-total, .summary-row span:last-child, .summary-row strong:last-child {
          text-align: right;
          white-space: nowrap;
        }
        .tax-row {
          padding-left: 4mm;
          margin-top: 0.5mm;
        }
        .summary {
          margin-top: 1mm;
        }
        .summary-row {
          padding: 0.5mm 0;
        }
        .summary-row.total {
          font-size: 15px;
          font-weight: 700;
        }
        .big-customer {
          font-size: 13px;
          font-weight: 700;
        }
        .amount-words,
        .thanks,
        .notice {
          text-align: center;
          margin-top: 3mm;
        }
        .notice {
          font-size: 10px;
          font-weight: 700;
        }
      </style>
      <script>
        window.addEventListener("load", () => {
          const logo = document.querySelector(".logo");
          const triggerPrint = () => {
            window.focus();
            window.print();
          };
          if (logo && !logo.complete) {
            logo.addEventListener("load", triggerPrint, { once: true });
            logo.addEventListener("error", triggerPrint, { once: true });
            setTimeout(triggerPrint, 800);
          } else {
            setTimeout(triggerPrint, 150);
          }
        });
      </script>
    </head>
    <body>
      <div class="ticket-copy">
        ${buildCopy("ORIGINAL: CLIENTE")}
      </div>
      <div class="ticket-copy">
        ${buildCopy("COPIA: EMISOR")}
      </div>
    </body>
    </html>
  `;
}

async function printFiscalOrder(orderId) {
  const printWindow = window.open("", "_blank", "width=420,height=900");
  if (!printWindow) return;
  try {
    printWindow.opener = null;
  } catch (_error) {
    // Ignore browsers that block changing opener.
  }
  printWindow.document.open();
  printWindow.document.write("<!doctype html><html><head><meta charset=\"utf-8\"><title>Imprimiendo...</title></head><body style=\"font-family:sans-serif;padding:16px;\">Preparando factura fiscal...</body></html>");
  printWindow.document.close();
  const order = await ensureInvoiceDataBeforePrint(orderId);
  if (!order) {
    printWindow.close();
    return;
  }
  const fiscalOrder = order.invoice?.fiscalPrintedAt
    ? order
    : ((await persistInvoiceData(orderId, {
        ...defaultInvoiceData(order),
        fiscalPrintedAt: new Date().toISOString()
      })) && (ordersCache.find((row) => row.id === orderId) || order));
  printWindow.document.open();
  printWindow.document.write(buildFiscalPrintableOrderHtml(fiscalOrder));
  printWindow.document.close();
}

function parseDate(value) {
  if (!value) return null;
  const date = value.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function activePeriodRange() {
  const now = new Date();
  if (activePeriod === "day") {
    const start = new Date(now);
    const end = new Date(now);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (activePeriod === "week") {
    const start = new Date(now);
    const mondayOffset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - mondayOffset);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  const start = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function activePeriodSummaryLabel() {
  if (activePeriod === "day") return t("period_day");
  if (activePeriod === "week") {
    const { start, end } = activePeriodRange();
    const locale = lang === "es" ? "es-ES" : "en-US";
    const options = { day: "numeric", month: "short" };
    return `${t("period_week")}: ${start.toLocaleDateString(locale, options)} - ${end.toLocaleDateString(locale, options)}`;
  }
  return `${t("period_month")}: ${monthLabel(calendarMonth)}`;
}

function inActivePeriod(value) {
  const date = parseDate(value);
  if (!date) return false;
  const { start, end } = activePeriodRange();
  return date >= start && date <= end;
}

function salesRowsForPeriod() {
  return ordersCache.filter((order) => inActivePeriod(order.createdAt));
}

function reservationsForPeriod() {
  return reservationsCache.filter((res) => inActivePeriod(res.createdAt));
}

function acceptedSalesRows() {
  return salesRowsForPeriod().filter((order) => order.status === "delivered");
}

function updateLanguageToggleButtons() {
  const nextLabel = lang === "es" ? "EN" : "ES";
  if (langToggleDesktop) langToggleDesktop.textContent = nextLabel;
  if (langToggleMobile) langToggleMobile.textContent = nextLabel;
}

function applyI18n() {
  document.documentElement.lang = lang;
  updateLanguageToggleButtons();
  const shortLabel = window.matchMedia("(max-width: 560px)").matches;
  signOutBtn.textContent = shortLabel ? t("signOutShort") : t("signOut");
  periodButtons.forEach((button) => {
    const label = t(`period_${button.dataset.period}`);
    button.textContent = label;
  });
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  renderStats();
  renderFoodStats();
  renderSalesCalendar();
  renderOrders();
  renderReservations();
}

function filteredOrders() {
  return ordersCache.filter((o) => (activeFilter === "all" ? true : o.status === activeFilter));
}

function renderStats() {
  const periodOrders = salesRowsForPeriod();
  const periodReservations = reservationsForPeriod();
  const pending = periodOrders.filter((o) => o.status === "pending").length;
  const progress = periodOrders.filter((o) => o.status === "preparing").length;
  const ready = periodOrders.filter((o) => o.status === "ready").length;
  const acceptedOrders = periodOrders.filter((o) => o.status === "delivered");
  const revenue = acceptedOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const avgTicket = acceptedOrders.length ? revenue / acceptedOrders.length : 0;
  statsGrid.innerHTML = `
    <article class="stats-panel-card">
      <header class="stats-panel-head">
        <h3>${t("statsSummary")} (${activePeriodSummaryLabel()})</h3>
      </header>
      <div class="stats-groups">
        <section class="stats-group">
          <h4>${t("statsOps")}</h4>
          <div class="stats-subgrid">
            <article class="stat-card tone-neutral"><p>${t("ordersCount")}</p><h3>${periodOrders.length}</h3></article>
            <article class="stat-card tone-warn"><p>${t("pendingCount")}</p><h3>${pending}</h3></article>
            <article class="stat-card tone-progress"><p>${t("progressCount")}</p><h3>${progress}</h3></article>
            <article class="stat-card tone-ready"><p>${t("readyCount")}</p><h3>${ready}</h3></article>
            <article class="stat-card tone-ok"><p>${t("acceptedCount")}</p><h3>${acceptedOrders.length}</h3></article>
            <article class="stat-card tone-neutral"><p>${t("reservationsCount")}</p><h3>${periodReservations.length}</h3></article>
          </div>
        </section>
        <section class="stats-group">
          <h4>${t("statsSales")}</h4>
          <div class="stats-subgrid stats-subgrid-sales">
            <article class="stat-card tone-sales"><p>${t("revenueCount")}</p><h3>${money(revenue)}</h3></article>
            <article class="stat-card tone-sales-soft"><p>${t("avgTicket")}</p><h3>${money(avgTicket)}</h3></article>
          </div>
        </section>
      </div>
    </article>
  `;
}

function foodName(item) {
  return item.title?.[lang] || item.title?.es || item.title?.en || "Item";
}

function dayKeyFromDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function monthKeyFromDate(date) {
  return dayKeyFromDate(date).slice(0, 7);
}

function monthLabel(date) {
  return date.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", { month: "long", year: "numeric" });
}

function timeLabel(value) {
  const date = parseDate(value);
  if (!date) return "-";
  return date.toLocaleTimeString(lang === "es" ? "es-ES" : "en-US", { hour: "2-digit", minute: "2-digit" });
}

function calendarWeekdayLabels() {
  return lang === "es"
    ? ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
}

function salesByDayForMonth(referenceMonth) {
  const month = referenceMonth.getMonth();
  const year = referenceMonth.getFullYear();
  const map = new Map();
  ordersCache
    .filter((order) => order.status === "delivered")
    .forEach((order) => {
      const when = parseDate(order.createdAt);
      if (!when) return;
      if (when.getMonth() !== month || when.getFullYear() !== year) return;
      const key = dayKeyFromDate(when);
      const row = map.get(key) || { orders: [], count: 0, revenue: 0 };
      row.orders.push(order);
      row.count += 1;
      row.revenue += Number(order.total || 0);
      map.set(key, row);
    });
  return map;
}

function renderFoodStats() {
  if (!foodStats) return;
  const acceptedOrders = acceptedSalesRows();
  const byFood = new Map();

  acceptedOrders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const key = item.id || foodName(item);
      const existing = byFood.get(key) || { name: foodName(item), qty: 0, sales: 0 };
      const qty = Number(item.qty || 0);
      const lineTotal = qty * Number(item.price || 0);
      existing.qty += qty;
      existing.sales += lineTotal;
      byFood.set(key, existing);
    });
  });

  const topRows = Array.from(byFood.values()).sort((a, b) => b.qty - a.qty).slice(0, 8);
  if (!topRows.length) {
    foodStats.innerHTML = `
      <article class="food-stats-card">
        <h3>${t("topFoodTitle")} (${activePeriodSummaryLabel()})</h3>
        <p>${t("topFoodEmpty")}</p>
      </article>
    `;
    return;
  }

  foodStats.innerHTML = `
    <article class="food-stats-card">
      <h3>${t("topFoodTitle")} (${activePeriodSummaryLabel()})</h3>
      <ul>
        ${topRows
          .map((row, index) => `
            <li>
              <span class="food-rank">#${index + 1}</span>
              <span class="food-name">${row.name}</span>
              <span class="food-metrics">
                <em>${t("qtySold")}: ${row.qty}</em>
                <strong>${t("salesLabel")}: ${money(row.sales)}</strong>
              </span>
            </li>
          `)
          .join("")}
      </ul>
    </article>
  `;
}

function renderSalesCalendar() {
  if (!salesCalendar) return;
  const monthSales = salesByDayForMonth(calendarMonth);
  const firstOfMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
  const today = new Date();
  const isCurrentMonth =
    calendarMonth.getFullYear() === today.getFullYear() &&
    calendarMonth.getMonth() === today.getMonth();
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const firstDayOffset = (firstOfMonth.getDay() + 6) % 7;
  const monthKey = monthKeyFromDate(firstOfMonth);
  const dayCells = [];

  if (!selectedCalendarDate || !selectedCalendarDate.startsWith(monthKey)) {
    if (isCurrentMonth) {
      selectedCalendarDate = dayKeyFromDate(today);
    } else {
      selectedCalendarDate = monthSales.size ? Array.from(monthSales.keys())[0] : `${monthKey}-01`;
    }
  }

  for (let i = 0; i < firstDayOffset; i += 1) {
    dayCells.push('<div class="calendar-cell muted" aria-hidden="true"></div>');
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    const key = dayKeyFromDate(date);
    const bucket = monthSales.get(key);
    const selected = selectedCalendarDate === key ? "selected" : "";
    const hasSales = bucket ? "has-sales" : "";
    dayCells.push(`
      <button class="calendar-cell day ${selected} ${hasSales}" data-calendar-date="${key}">
        <span class="calendar-day">${day}</span>
        <span class="calendar-meta">${bucket ? `${bucket.count} ${t("calendarOrders")}` : "-"}</span>
      </button>
    `);
  }

  const selectedBucket = monthSales.get(selectedCalendarDate) || null;
  const normalizedSalesDaySearch = salesDaySearchTerm.trim().toLowerCase();
  const filteredDayOrders = selectedBucket
    ? selectedBucket.orders.filter((order) => {
        if (!normalizedSalesDaySearch) return true;
        const customerName = String(order.customer?.name || "").toLowerCase();
        const invoiceNumber = String(order.invoice?.invoiceNumber || "").toLowerCase();
        const displayId = String(order.displayId || order.id.slice(0, 6) || "").toLowerCase();
        const orderId = String(order.id || "").toLowerCase();
        const itemNames = (order.items || [])
          .map((item) => String(foodName(item) || "").toLowerCase())
          .join(" ");
        return customerName.includes(normalizedSalesDaySearch)
          || invoiceNumber.includes(normalizedSalesDaySearch)
          || displayId.includes(normalizedSalesDaySearch)
          || orderId.includes(normalizedSalesDaySearch)
          || itemNames.includes(normalizedSalesDaySearch);
      })
    : [];
  const dayFoodRows = (() => {
    if (!selectedBucket) return [];
    const byFood = new Map();
    selectedBucket.orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const key = item.id || foodName(item);
        const existing = byFood.get(key) || { name: foodName(item), qty: 0, sales: 0 };
        const qty = Number(item.qty || 0);
        existing.qty += qty;
        existing.sales += qty * Number(item.price || 0);
        byFood.set(key, existing);
      });
    });
    return Array.from(byFood.values()).sort((a, b) => b.qty - a.qty);
  })();
  const selectedDateObject = new Date(`${selectedCalendarDate}T00:00:00`);
  const selectedDateLabel = Number.isNaN(selectedDateObject.getTime())
    ? selectedCalendarDate
    : selectedDateObject.toLocaleDateString(lang === "es" ? "es-ES" : "en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });

  salesCalendar.innerHTML = `
    <article class="sales-calendar-card">
      <header class="sales-calendar-head">
        <div>
          <h3>${t("calendarTitle")}</h3>
          <p>${t("calendarSub")}</p>
        </div>
        <div class="sales-calendar-nav">
          <button class="btn btn-outline" data-calendar-shift="-1" aria-label="${t("calendarPrev")}">&lt;</button>
          <strong>${monthLabel(calendarMonth)}</strong>
          <button class="btn btn-outline" data-calendar-shift="1" aria-label="${t("calendarNext")}">&gt;</button>
        </div>
      </header>
      <div class="sales-calendar-grid">
        ${calendarWeekdayLabels().map((label) => `<div class="calendar-cell weekday">${label}</div>`).join("")}
        ${dayCells.join("")}
      </div>
      ${monthSales.size ? "" : `<p class="calendar-empty-month">${t("calendarNoSalesMonth")}</p>`}
      <section class="sales-day-details">
        ${
          selectedBucket
            ? `
              <div class="sales-day-head">
                <div class="sales-day-copy">
                  <h4>${t("calendarDetailsTitle")}: ${selectedDateLabel}</h4>
                  <p><strong>${t("calendarOrders")}:</strong> ${selectedBucket.count} | <strong>${t("calendarRevenue")}:</strong> ${money(selectedBucket.revenue)}</p>
                </div>
                <label class="sales-day-search" for="salesDaySearch">
                  <span>${escapeHtml(t("calendarSearchPlaceholder"))}</span>
                  <input
                    id="salesDaySearch"
                    class="sales-day-search-input"
                    type="text"
                    inputmode="search"
                    enterkeyhint="search"
                    autocapitalize="off"
                    autocomplete="off"
                    autocorrect="off"
                    spellcheck="false"
                    value="${escapeHtml(salesDaySearchTerm)}"
                    placeholder="${escapeHtml(t("calendarSearchPlaceholder"))}">
                </label>
              </div>
              <div class="sales-day-list">
                ${filteredDayOrders.length
                  ? filteredDayOrders
                  .map(
                    (order) => `
                      <article class="sales-day-row">
                        <div>
                          <strong>#${order.displayId || order.id.slice(0, 6)}</strong>
                          <p>${t("customer")}: ${order.customer?.name || "-"} (${order.customer?.phone || "-"})</p>
                          ${renderInvoiceRequestNotice(order)}
                          <p><strong>${crmPaymentLine(order)}</strong></p>
                          <p>${timeLabel(order.createdAt)} | ${money(order.total)}</p>
                        </div>
                        <button class="btn btn-outline" data-review-order="${order.id}">${t("review")}</button>
                      </article>
                    `
                  )
                  .join("")
                  : ""}
                ${filteredDayOrders.length ? "" : `<p class="sales-day-empty">${t("calendarSearchEmpty")}</p>`}
              </div>
              <div class="sales-food-breakdown">
                <h5>${t("calendarFoodBreakdown")}</h5>
                ${
                  dayFoodRows.length
                    ? `
                      <ul>
                        ${dayFoodRows
                          .map(
                            (row) => `
                              <li>
                                <span>${row.name}</span>
                                <span>${t("qtySold")}: ${row.qty} | ${t("salesLabel")}: ${money(row.sales)}</span>
                              </li>
                            `
                          )
                          .join("")}
                      </ul>
                    `
                    : `<p>${t("calendarNoSalesDay")}</p>`
                }
              </div>
            `
            : `
              <div class="sales-day-head">
                <div class="sales-day-copy">
                  <h4>${t("calendarDetailsTitle")}: ${selectedDateLabel}</h4>
                </div>
              </div>
              <p>${t("calendarNoSalesDay")}</p>
            `
        }
      </section>
    </article>
  `;
}

function renderSalesCalendarKeepingSearchPosition(selectionStart = null, selectionEnd = null) {
  const previousScrollY = window.scrollY;
  renderSalesCalendar();
  const nextSearchInput = document.getElementById("salesDaySearch");
  if (!nextSearchInput) return;
  nextSearchInput.focus({ preventScroll: true });
  const inputLength = nextSearchInput.value.length;
  const start = Number.isInteger(selectionStart) ? Math.min(selectionStart, inputLength) : inputLength;
  const end = Number.isInteger(selectionEnd) ? Math.min(selectionEnd, inputLength) : start;
  nextSearchInput.setSelectionRange(start, end);
  window.scrollTo({ top: previousScrollY, behavior: "auto" });
}

function renderOrders() {
  const rows = filteredOrders();
  if (!rows.length) {
    ordersList.innerHTML = `<p>${t("emptyOrders")}</p>`;
    return;
  }

  ordersList.innerHTML = rows
    .map((order) => `
      <article class="crm-card">
        <div class="crm-top">
          <div>
            <strong>#${order.displayId || order.id.slice(0, 6)}</strong>
            <p>${t("customer")}: ${order.customer?.name || ""} (${order.customer?.phone || ""})</p>
            ${renderInvoiceRequestNotice(order)}
            <p><strong>${crmPaymentLine(order)}</strong></p>
          </div>
          <div class="crm-side-actions">
            <span class="badge ${order.status}">${orderStatusLabel(order.status)}</span>
            <button class="btn btn-outline print-order print-order-small" data-id="${order.id}">${t("btnPrint")}</button>
            <button class="btn btn-outline print-fiscal-order print-order-small" data-id="${order.id}">${fiscalPrintButtonLabel(order)}</button>
          </div>
        </div>
        <p>${t("total")}: <strong>${money(order.total)}</strong></p>
        <p>${t("date")}: ${formatDate(order.createdAt)}</p>
        <div class="crm-payment-row">
          <label class="crm-payment-method-select">
            <span>${t("paymentMethodSelect")}</span>
            <select class="payment-method-select" data-id="${order.id}">
              <option value="" ${paymentMethodSelectValue(order) === "" ? "selected" : ""} disabled>${t("paymentMethodPlaceholder")}</option>
              <option value="cash" ${paymentMethodSelectValue(order) === "cash" ? "selected" : ""}>${t("payMethodCash")}</option>
              <option value="card" ${paymentMethodSelectValue(order) === "card" ? "selected" : ""}>${t("payMethodCard")}</option>
              <option value="bank_transfer" ${paymentMethodSelectValue(order) === "bank_transfer" ? "selected" : ""}>${t("payMethodTransfer")}</option>
            </select>
          </label>
        </div>
        <div class="crm-actions">
          <div class="crm-main-actions">
            <button class="btn btn-outline review-order crm-review-btn" data-id="${order.id}">${t("reviewShort")}</button>
            <div class="crm-status-actions">
              ${renderOrderStatusActions(order)}
            </div>
          </div>
          ${
            order.payment?.method === "online" && order.payment?.status !== "paid"
              ? `<div class="crm-meta-actions"><button class="btn btn-outline payment-change" data-id="${order.id}" data-payment-status="paid">${t("btnMarkPaid")}</button></div>`
              : ""
          }
        </div>
      </article>
    `)
    .join("");
}

function renderReservations() {
  if (!reservationsCache.length) {
    reservationsList.innerHTML = `<p>${t("emptyReservations")}</p>`;
    return;
  }

  reservationsList.innerHTML = reservationsCache
    .map((res) => `
      <article class="crm-card">
        <div class="crm-top">
          <div>
            <strong>${res.name || "-"}</strong>
            <p>${res.phone || ""}${res.email ? ` | ${res.email}` : ""}</p>
          </div>
          <span class="badge pending">${res.party || 1} pax</span>
        </div>
        <p>${t("date")}: ${res.date || "-"} ${res.time || ""}</p>
        <p>Occasion: ${res.occasion || "-"}</p>
        <p>Allergies: ${res.allergies || "-"}</p>
        <p>Notes: ${res.notes || "-"}</p>
      </article>
    `)
    .join("");
}

function renderReviewBody(order) {
  const invoice = defaultInvoiceData(order);
  return `
    <p>${t("customer")}: <strong>${order.customer?.name || ""}</strong> (${order.customer?.phone || ""})</p>
    ${renderOrderComments(order)}
    ${renderInvoiceRequestNotice(order)}
    <p><strong>${crmPaymentLine(order)}</strong></p>
    <p>${t("date")}: ${formatDate(order.createdAt)}</p>
    <p>${t("total")}: <strong>${money(order.total)}</strong></p>
    <ul>
      ${(order.items || [])
        .map((item) => `<li>${item.title?.[lang] || item.title?.es || item.title?.en || "Item"} x ${item.qty} (${money(item.price)})</li>`)
        .join("")}
    </ul>
    <p><strong>${t("orderStatus")}:</strong> ${orderStatusLabel(order.status)}</p>
    <p><strong>${t("paymentMethodSelect")}:</strong> ${escapeHtml(selectedPaymentMethodLabel(order))}</p>
    <section class="invoice-editor">
      <h4>${t("invoiceSectionTitle")}</h4>
      <div class="invoice-editor-grid">
        <label>
          <span>${t("invoiceBillingName")}</span>
          <input class="invoice-input" data-field="billingName" value="${escapeHtml(invoice.billingName)}">
        </label>
        <label>
          <span>${t("invoiceBillingRTN")}</span>
          <input class="invoice-input" data-field="billingRTN" value="${escapeHtml(invoice.billingRTN)}">
        </label>
        <label>
          <span>${t("invoiceNumberAuto")}</span>
          <input class="invoice-input" value="${escapeHtml(invoice.invoiceNumber || t("invoiceNumberPending"))}" readonly>
        </label>
      </div>
      <div class="invoice-editor-actions">
        <button class="btn btn-outline print-fiscal-order" data-id="${order.id}">${fiscalPrintButtonLabel(order)}</button>
      </div>
    </section>
  `;
}

function openReview(orderId) {
  const order = ordersCache.find((o) => o.id === orderId);
  if (!order) return;
  selectedOrderId = orderId;
  reviewTitle.textContent = `#${order.displayId || order.id.slice(0, 6)}`;
  reviewBody.innerHTML = renderReviewBody(order);
  reviewModal.classList.remove("hidden");
}

function closeReviewModal() {
  selectedOrderId = null;
  reviewModal.classList.add("hidden");
}

function closeCRMHeaderNav() {
  if (!crmHeaderNav || !crmNavToggle) return;
  crmHeaderNav.classList.remove("open");
  crmNavToggle.setAttribute("aria-expanded", "false");
}

function toggleCRMHeaderNav() {
  if (!crmHeaderNav || !crmNavToggle) return;
  const isOpen = crmHeaderNav.classList.toggle("open");
  crmNavToggle.setAttribute("aria-expanded", String(isOpen));
}

async function setStatus(orderId, status) {
  const order = ordersCache.find((row) => row.id === orderId);
  if (!order) return;
  if (status === "delivered" && !paymentMethodSelectValue(order)) {
    showToast(t("paymentMethodRequired"));
    return;
  }
  try {
    await updateOrderStatus(orderId, status, currentStaffUser);
    showToast(t("updated"));
  } catch (_e) {
    showToast("Error");
  }
}

async function setPaymentStatus(orderId, paymentStatus) {
  try {
    await updateOrderPaymentStatus(orderId, paymentStatus, currentStaffUser);
    showToast(t("paymentUpdated"));
  } catch (_e) {
    showToast("Error");
  }
}

async function setPaymentMethod(orderId, paymentMethod) {
  if (!paymentMethod) return;
  try {
    await updateOrderPaymentMethod(orderId, paymentMethod, currentStaffUser);
    ordersCache = ordersCache.map((order) => (
      order.id === orderId
        ? {
            ...order,
            payment: {
              ...(order.payment || {}),
              method: paymentMethod
            }
          }
        : order
    ));
    if (selectedOrderId === orderId) {
      const selectedOrder = ordersCache.find((order) => order.id === orderId);
      if (selectedOrder) reviewBody.innerHTML = renderReviewBody(selectedOrder);
    }
    renderOrders();
    showToast(t("paymentMethodUpdated"));
  } catch (_e) {
    showToast("Error");
  }
}

function getInvoiceDraftFromReview() {
  const inputs = Array.from(reviewBody.querySelectorAll(".invoice-input, .invoice-checkbox"));
  return inputs.reduce((acc, input) => {
    const field = input.dataset.field;
    if (!field) return acc;
    if (input.classList.contains("invoice-checkbox")) {
      acc[field] = input.checked;
      return acc;
    }
    acc[field] = input.value;
    return acc;
  }, {});
}

function mergeOrderInvoiceInCache(orderId, invoiceData) {
  ordersCache = ordersCache.map((order) => (
    order.id === orderId
      ? {
          ...order,
          invoice: {
            ...(order.invoice || {}),
            ...invoiceData
          }
        }
      : order
  ));
}

async function persistInvoiceData(orderId, invoiceData, successMessage = "") {
  try {
    await updateOrderInvoiceData(orderId, invoiceData, currentStaffUser);
    mergeOrderInvoiceInCache(orderId, invoiceData);
    const selectedOrder = ordersCache.find((order) => order.id === orderId);
    if (selectedOrder && selectedOrder.id === selectedOrderId) {
      reviewBody.innerHTML = renderReviewBody(selectedOrder);
    }
    renderOrders();
    if (successMessage) showToast(successMessage);
    return true;
  } catch (_e) {
    showToast("Error");
    return false;
  }
}

async function setInvoiceData(orderId) {
  const order = ordersCache.find((row) => row.id === orderId);
  if (!order) return false;
  const invoiceData = {
    ...defaultInvoiceData(order),
    ...getInvoiceDraftFromReview()
  };
  return persistInvoiceData(orderId, invoiceData, t("invoiceSaved"));
}

async function ensureInvoiceDataBeforePrint(orderId) {
  const order = ordersCache.find((row) => row.id === orderId);
  if (!order) return null;

  const draft = orderId === selectedOrderId
    ? { ...defaultInvoiceData(order), ...getInvoiceDraftFromReview() }
    : defaultInvoiceData(order);

  await refreshFiscalSettings();
  const rangeCheck = validateFiscalRange(fiscalSettings);

  if (!draft.invoiceNumber) {
    if (!rangeCheck.ok) {
      showToast(t(
        rangeCheck.reason === "exhausted"
          ? "invoiceRangeExhausted"
          : rangeCheck.reason === "expired"
            ? "invoiceDeadlineExceeded"
            : "invoiceInvalidRange"
      ));
      return null;
    }
    try {
      draft.invoiceNumber = await reserveNextFiscalInvoiceNumber(currentStaffUser);
      await refreshFiscalSettings();
    } catch (error) {
      const code = error && error.message ? error.message : "";
      if (code === "fiscal_range_exhausted") {
        showToast(t("invoicePrintBlockedExhausted"));
        return null;
      }
      if (code === "fiscal_emission_deadline_exceeded") {
        showToast(t("invoicePrintBlockedExpired"));
        return null;
      }
      if (code === "invalid_fiscal_range" || code === "missing_fiscal_settings") {
        showToast(t("invoiceInvalidRange"));
        return null;
      }
      showToast("Error");
      return null;
    }
  }

  const saved = await persistInvoiceData(orderId, draft);
  if (!saved) return null;
  return ordersCache.find((row) => row.id === orderId) || null;
}

function stopRealtime() {
  if (unsubscribeOrders) unsubscribeOrders();
  if (unsubscribeReservations) unsubscribeReservations();
  unsubscribeOrders = null;
  unsubscribeReservations = null;
  hasSeenInitialOrdersSnapshot = false;
  knownOrderIds = new Set();
  knownOrderPaymentStatus = new Map();
}

function isAuthRealtimeError(error) {
  const code = String(error?.code || "");
  return code === "invalid_token" ||
    code === "missing_token" ||
    code === "staff_denied" ||
    code === "role_denied" ||
    code === "http/401" ||
    code === "http/403";
}

async function handleRealtimeError(error, fallbackKey) {
  console.warn("CRM realtime error", error);
  if (isAuthRealtimeError(error)) {
    if (realtimeAuthExpiredHandled) return;
    realtimeAuthExpiredHandled = true;
    pendingAuthMessage = t("authSessionExpired");
    showToast(t("authSessionExpired"));
    try {
      await signOutUser();
    } catch (_signOutError) {
      lockUI();
    }
    return;
  }
  showToast(t(fallbackKey));
}

function startRealtime() {
  stopRealtime();
  realtimeAuthExpiredHandled = false;
  unsubscribeOrders = listenOrders(
    (orders) => {
      const nextIds = new Set(orders.map((order) => order.id));
      const nextPaymentMap = new Map(orders.map((order) => [order.id, order.payment?.status || "unpaid"]));
      if (!hasSeenInitialOrdersSnapshot) {
        knownOrderIds = nextIds;
        knownOrderPaymentStatus = nextPaymentMap;
        hasSeenInitialOrdersSnapshot = true;
      } else {
        const newOrders = orders.filter((order) => !knownOrderIds.has(order.id));
        newOrders.forEach((order) => {
          notifyNewOrder(order);
          if ((order.payment?.status || "unpaid") === "paid") notifyPaymentReceived(order);
        });
        orders.forEach((order) => {
          const previous = knownOrderPaymentStatus.get(order.id) || "unpaid";
          const current = order.payment?.status || "unpaid";
          if (previous !== "paid" && current === "paid") notifyPaymentReceived(order);
        });
        knownOrderIds = nextIds;
        knownOrderPaymentStatus = nextPaymentMap;
      }

      ordersCache = orders;
      renderStats();
      renderFoodStats();
      renderSalesCalendar();
      renderOrders();
      if (selectedOrderId) openReview(selectedOrderId);
    },
    (error) => handleRealtimeError(error, "ordersListenerError")
  );

  unsubscribeReservations = listenReservations(
    (reservations) => {
      reservationsCache = reservations;
      renderStats();
      renderReservations();
    },
    (error) => handleRealtimeError(error, "reservationsListenerError")
  );
}

function lockUI() {
  authGate.classList.remove("hidden");
  crmApp.classList.add("hidden");
  signOutBtn.classList.add("hidden");
  staffBadge.textContent = "";
  updateFiscalRangeAlert();
  closeFiscalSettingsModal();
  stopRealtime();
}

async function unlockUI(user, profile) {
  authGate.classList.add("hidden");
  crmApp.classList.remove("hidden");
  signOutBtn.classList.remove("hidden");
  staffBadge.textContent = `${user.email} | ${t("staffRole")}: ${profile.role}`;
  await refreshFiscalSettings();
  ensureNotificationPermission();
  unlockNotificationSound();
  registerCRMPushNotifications();
  startRealtime();
}

ordersList.addEventListener("click", (event) => {
  const reviewButton = event.target.closest(".review-order");
  if (reviewButton) {
    openReview(reviewButton.dataset.id);
    return;
  }
  const printButton = event.target.closest(".print-order");
  if (printButton) {
    printOrder(printButton.dataset.id);
    return;
  }
  const fiscalPrintButton = event.target.closest(".print-fiscal-order");
  if (fiscalPrintButton) {
    printFiscalOrder(fiscalPrintButton.dataset.id);
    return;
  }
  const statusButton = event.target.closest(".status-change");
  if (statusButton) setStatus(statusButton.dataset.id, statusButton.dataset.status);
  const paymentButton = event.target.closest(".payment-change");
  if (paymentButton) setPaymentStatus(paymentButton.dataset.id, paymentButton.dataset.paymentStatus);
});

ordersList.addEventListener("change", (event) => {
  const paymentMethodSelect = event.target.closest(".payment-method-select");
  if (paymentMethodSelect) setPaymentMethod(paymentMethodSelect.dataset.id, paymentMethodSelect.value);
});


if (salesCalendar) {
  const focusSalesDaySearch = (event) => {
    const searchField = event.target.closest(".sales-day-search, #salesDaySearch");
    if (!searchField) return;
    event.stopPropagation();
    const searchInput = document.getElementById("salesDaySearch");
    if (!searchInput) return;
    searchInput.focus({ preventScroll: true });
  };

  salesCalendar.addEventListener("pointerdown", focusSalesDaySearch);
  salesCalendar.addEventListener("touchend", focusSalesDaySearch);
  salesCalendar.addEventListener("click", (event) => {
    const searchField = event.target.closest(".sales-day-search, #salesDaySearch");
    if (searchField) {
      event.stopPropagation();
      const searchInput = document.getElementById("salesDaySearch");
      if (searchInput) searchInput.focus({ preventScroll: true });
      return;
    }

    const shiftBtn = event.target.closest("[data-calendar-shift]");
    if (shiftBtn) {
      const shift = Number(shiftBtn.dataset.calendarShift || 0);
      calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + shift, 1);
      renderSalesCalendar();
      return;
    }

    const dayBtn = event.target.closest("[data-calendar-date]");
    if (dayBtn) {
      selectedCalendarDate = dayBtn.dataset.calendarDate;
      salesDaySearchTerm = "";
      renderSalesCalendar();
      return;
    }

    const reviewBtn = event.target.closest("[data-review-order]");
    if (reviewBtn) {
      openReview(reviewBtn.dataset.reviewOrder);
      return;
    }

  });

  salesCalendar.addEventListener("input", (event) => {
    const searchInput = event.target.closest("#salesDaySearch");
    if (!searchInput) return;
    salesDaySearchTerm = searchInput.value || "";
    renderSalesCalendarKeepingSearchPosition(searchInput.selectionStart, searchInput.selectionEnd);
  });
}

if (reviewPending) reviewPending.addEventListener("click", () => selectedOrderId && setStatus(selectedOrderId, "pending"));
if (reviewProgress) reviewProgress.addEventListener("click", () => selectedOrderId && setStatus(selectedOrderId, "preparing"));
if (reviewAccept) reviewAccept.addEventListener("click", () => selectedOrderId && setStatus(selectedOrderId, "accepted"));
if (reviewReject) reviewReject.addEventListener("click", () => selectedOrderId && setStatus(selectedOrderId, "rejected"));
closeReview.addEventListener("click", closeReviewModal);
reviewModal.addEventListener("click", (event) => {
  if (event.target === reviewModal) closeReviewModal();
});
if (openFiscalSettingsBtn) {
  openFiscalSettingsBtn.addEventListener("click", () => {
    closeCRMHeaderNav();
    openFiscalSettingsModal();
  });
}
if (fiscalRangeAlertButton) {
  fiscalRangeAlertButton.addEventListener("click", () => {
    closeCRMHeaderNav();
    openFiscalSettingsModal();
  });
}
if (closeFiscalSettingsBtn) closeFiscalSettingsBtn.addEventListener("click", closeFiscalSettingsModal);
if (crmNavToggle) crmNavToggle.addEventListener("click", toggleCRMHeaderNav);
if (crmHeaderNav) {
  crmHeaderNav.addEventListener("click", (event) => {
    const action = event.target.closest("a, button");
    if (action && window.innerWidth <= 860) closeCRMHeaderNav();
  });
}
document.addEventListener("click", (event) => {
  if (window.innerWidth > 860) return;
  if (!crmHeaderNav || !crmNavToggle) return;
  if (crmHeaderNav.contains(event.target) || crmNavToggle.contains(event.target)) return;
  closeCRMHeaderNav();
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 860) closeCRMHeaderNav();
});
if (fiscalSettingsModal) {
  fiscalSettingsModal.addEventListener("click", (event) => {
    if (event.target === fiscalSettingsModal) closeFiscalSettingsModal();
  });
}

reviewBody.addEventListener("click", async (event) => {
  const saveInvoiceButton = event.target.closest(".save-invoice-data");
  if (saveInvoiceButton) {
    await setInvoiceData(saveInvoiceButton.dataset.id);
    return;
  }
  const fiscalPrintButton = event.target.closest(".print-fiscal-order");
  if (fiscalPrintButton) {
    await printFiscalOrder(fiscalPrintButton.dataset.id);
  }
});

reviewBody.addEventListener("change", (event) => {
  const toggle = event.target.closest(".invoice-checkbox");
  if (!toggle || !selectedOrderId) return;
  const order = ordersCache.find((row) => row.id === selectedOrderId);
  if (!order) return;
  mergeOrderInvoiceInCache(selectedOrderId, {
    ...defaultInvoiceData(order),
    ...getInvoiceDraftFromReview()
  });
  const selectedOrder = ordersCache.find((row) => row.id === selectedOrderId);
  if (selectedOrder) reviewBody.innerHTML = renderReviewBody(selectedOrder);
});

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    viewButtons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    const view = button.dataset.view;
    if (view === "orders") {
      ordersView.classList.remove("hidden");
      reservationsView.classList.add("hidden");
    } else {
      ordersView.classList.add("hidden");
      reservationsView.classList.remove("hidden");
    }
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    renderOrders();
  });
});

periodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    periodButtons.forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    activePeriod = button.dataset.period;
    renderStats();
    renderFoodStats();
  });
});

function toggleLanguage() {
  lang = lang === "es" ? "en" : "es";
  applyI18n();
}

let crmI18nResizeFrame = null;
function scheduleCRMApplyI18n() {
  if (crmI18nResizeFrame !== null) return;
  crmI18nResizeFrame = window.requestAnimationFrame(() => {
    crmI18nResizeFrame = null;
    applyI18n();
  });
}

if (langToggleDesktop) langToggleDesktop.addEventListener("click", toggleLanguage);
if (langToggleMobile) langToggleMobile.addEventListener("click", toggleLanguage);

window.addEventListener("resize", scheduleCRMApplyI18n);
window.addEventListener("pointerdown", unlockNotificationSound, { once: true });
window.addEventListener("keydown", unlockNotificationSound, { once: true });

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  pendingAuthMessage = "";
  const username = authUser.value.trim();
  const password = authPassword.value;

  if (!username || !password) {
    setAuthMessage(t("authInvalid"), "error");
    return;
  }

  setAuthBusy(true);
  setAuthMessage(t("authChecking"), "info");
  try {
    const email = await getEmailByUsername(username);
    if (!email) {
      throw { code: "crm/username-not-found" };
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

if (fiscalSettingsForm) {
  fiscalSettingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      if (!currentStaffUser) {
        lockUI();
        return;
      }
      const values = getFiscalFormValues();
      const rangeCheck = validateFiscalRange(values);
      if (!rangeCheck.ok) {
        showToast(t(
          rangeCheck.reason === "exhausted"
            ? "invoiceRangeExhausted"
            : rangeCheck.reason === "expired"
              ? "invoiceDeadlineExceeded"
              : "invalidRange"
        ));
        return;
      }
      await saveFiscalSettings(values, currentStaffUser);
      fiscalSettings = mergeFiscalSettings(values);
      updateFiscalRangeAlert();
      showToast(t("saved"));
      renderOrders();
      if (selectedOrderId) openReview(selectedOrderId);
    } catch (error) {
      if (error && error.message === "duplicate_next_invoice_number") {
        showToast(t("duplicateNextInvoiceNumber"));
        return;
      }
      showToast("Error");
    }
  });
}

onAuthChange(async (user) => {
  if (!user) {
    currentStaffUser = null;
    currentStaffProfile = null;
    setAuthBusy(false);
    setAuthMessage(pendingAuthMessage || "", pendingAuthMessage ? "error" : "info");
    pendingAuthMessage = "";
    lockUI();
    return;
  }

  try {
    currentStaffUser = user;
    setAuthMessage(t("authChecking"), "info");
    const access = await isStaffAuthorized(user);
    if (!access.allowed) {
      currentStaffProfile = null;
      pendingAuthMessage = t("authDenied");
      await signOutUser();
      return;
    }

    currentStaffProfile = access.profile;
    setAuthMessage("");
    await unlockUI(user, currentStaffProfile);
  } catch (_error) {
    currentStaffProfile = null;
    pendingAuthMessage = t("authStartupError");
    try {
      await signOutUser();
    } catch (_signOutError) {
      setAuthBusy(false);
      setAuthMessage(pendingAuthMessage, "error");
      pendingAuthMessage = "";
      lockUI();
    }
  }
});

applyI18n();
lockUI();
