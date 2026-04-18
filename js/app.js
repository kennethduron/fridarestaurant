import { addOrder, addReservation, listenOrderById, loadMenuSettings, registerOrderNotificationToken } from "./firebase-config.js?v=20260418a";
import { BASE_MENU_ITEMS } from "./menu-data.js?v=20260417a";

const STORAGE = {
  cart: "restaurant_cart_v1",
  lastOrderId: "restaurant_last_order_id",
  recentOrderIds: "restaurant_recent_order_ids",
  lastPickupPhone: "restaurant_last_pickup_phone"
};

const i18n = {
  es: {
    navMenu: "Menu",
    navOrder: "Pedido",
    navReservations: "Reservas",
    navAbout: "Nosotros",
    heroEyebrow: "Restaurante y experiencias memorables",
    heroTitle: "Frida Restaurant",
    heroSub: "Explora el menu, envia pedidos y reserva tu mesa desde cualquier dispositivo con una presentacion elegante y clara.",
    heroCtaMenu: "Ver menu",
    heroCtaReservation: "Reservar mesa",
    heroCardEyebrow: "Atencion y horarios",
    heroCardTitle: "Horario",
    heroCardText: "Todo listo para pedidos, reservas y una experiencia comoda en sala durante toda la semana.",
    daysWeek: "Lunes a Viernes",
    daysWeekend: "Sabado y Domingo",
    badgeFast: "Servicio rapido",
    badgeFresh: "Producto fresco",
    badgeFamily: "Ambiente familiar",
    strip1Title: "Menu digital",
    strip1Text: "Categorias claras y recorrido intuitivo desde cualquier pantalla.",
    strip2Title: "Pedidos rapidos",
    strip2Text: "Carrito directo a cocina con un flujo simple y profesional.",
    strip3Title: "Reservas faciles",
    strip3Text: "Solicita tu mesa en segundos desde celular, tablet o computadora.",
    menuTitle: "Menu por categorias",
    menuText: "Categorias formales: Entradas, Platos principales, Bebidas y Postres.",
    menuNewBadge: "Nuevo",
    tabAll: "Todo",
    tabAppetizers: "Entradas",
    tabMain: "Platos principales",
    tabBeverages: "Bebidas",
    tabDesserts: "Postres",
    category_appetizers: "Entradas",
    category_main_courses: "Platos principales",
    category_beverages: "Bebidas",
    category_desserts: "Postres",
    orderTitle: "Pedido rapido",
    orderText: "Agrega productos al carrito y envia el pedido a cocina con un clic.",
    reservationTitle: "Reserva de mesa",
    reservationText: "Comparte datos importantes para organizar tu experiencia.",
    fieldName: "Nombre completo",
    fieldPhone: "Telefono",
    fieldEmail: "Correo",
    fieldDate: "Fecha",
    fieldTime: "Hora",
    fieldParty: "Personas",
    fieldOccasion: "Ocasion",
    fieldOccasionPlaceholder: "Cumpleanos, reunion, aniversario",
    fieldAllergies: "Alergias",
    fieldAllergiesPlaceholder: "Gluten, lactosa, frutos secos",
    fieldNotes: "Notas especiales",
    fieldNotesPlaceholder: "Mesa cerca de ventana, silla para bebe, etc.",
    btnReserve: "Enviar reserva",
    about1Title: "Atencion profesional",
    about1Text: "Equipo entrenado para tiempos de respuesta rapidos.",
    about2Title: "Calidad constante",
    about2Text: "Control interno en cocina y servicio al cliente.",
    about3Title: "Experiencia memorable",
    about3Text: "Diseno visual, sabor y confort en equilibrio.",
    cartTitle: "Carrito",
    cartTotal: "Total",
    orderCustomerName: "Nombre para el pedido",
    orderCustomerPhone: "Telefono de contacto",
    orderCustomerComments: "Comentarios del pedido",
    orderCustomerCommentsPlaceholder: "Alergias, sin picante, para llevar, etc.",
    orderNeedInvoice: "Necesita factura con RTN?",
    orderBusinessName: "Nombre de la empresa",
    orderBusinessNamePlaceholder: "Nombre del negocio o razon social",
    orderBusinessRTN: "RTN de la empresa",
    orderBusinessRTNPlaceholder: "RTN del negocio o empresa",
    orderInvoiceStepTitle: "Datos para factura con RTN",
    orderInvoiceStepText: "Completa estos datos para preparar la factura fiscal de este pedido.",
    orderInvoiceBack: "Volver",
    orderInvoiceContinue: "Continuar",
    orderPickupLabel: "Para llevar",
    pickupStepTitle: "Pedido para llevar",
    pickupStepText: "Agrega el telefono de contacto y elige como deseas pagar este pedido para llevar.",
    pickupPhoneLabel: "Telefono para recoger",
    pickupPhonePlaceholder: "Telefono de contacto",
    pickupBack: "Volver",
    btnSendKitchen: "Enviar a cocina",
    btnPayNow: "Pagar ahora",
    btnBack: "Volver",
    btnPayCashier: "Pagar en caja",
    btnPay: "Pagar",
    paymentChoiceTitle: "Metodo de pago",
    paymentChoiceText: "Elige como deseas pagar este pedido para continuar.",
    paypalTitle: "Pagar con tarjeta",
    paypalInstructions: "Agrega la informacion de tu tarjeta y luego toca Pagar ahora.",
    cardNameLabel: "Nombre en la tarjeta",
    cardNumberLabel: "Numero de tarjeta",
    cardExpiryLabel: "Vencimiento (MM/AA)",
    cardCvvLabel: "CVV",
    btnClear: "Vaciar",
    footerText: "Direccion, telefono y horarios actualizados.",
    add: "Agregar",
    remove: "Eliminar",
    emptyCart: "Tu carrito esta vacio.",
    addedToCart: "agregado al carrito",
    orderSent: "Pedido enviado a cocina",
    reservationSent: "Reserva enviada",
    needCustomer: "Completa el nombre del pedido.",
    needPickupName: "Completa primero el nombre para el pedido.",
    needPickupPhone: "Confirma el telefono para el pedido para llevar.",
    needInvoiceCustomer: "Completa nombre o empresa y RTN para la factura.",
    trackerEmpty: "No hay pedidos recientes.",
    trackerLabel: "Ultimo pedido",
    trackerPrint: "Imprimir pedido",
    trackerView: "Ver pedido",
    trackerModalTitle: "Detalle del pedido",
    trackerCustomer: "Cliente",
    trackerDate: "Fecha",
    trackerStatus: "Estado",
    trackerPaymentMethod: "Metodo de pago",
    trackerMethodCash: "Efectivo",
    trackerMethodCard: "Tarjeta",
    trackerMethodTransfer: "Transferencia bancaria",
    trackerItems: "Productos",
    trackerTotal: "Total",
    trackerPayAtCashier: "Pagar en caja",
    trackerPaymentProcessed: "Pago procesado con éxito",
    notificationEnableAction: "Activar avisos",
    status_pending: "Pendiente",
    status_preparing: "Preparando",
    status_ready: "Listo",
    status_accepted: "Aceptada",
    status_delivered: "Entregada",
    status_rejected: "Rechazado",
    orderError: "No se pudo enviar el pedido. Intenta de nuevo.",
    invalidCardData: "Completa los datos de tarjeta correctamente.",
    paypalNotConfigured: "PayPal no esta configurado. Contacta al restaurante.",
    paypalLoadError: "No se pudo cargar PayPal. Intenta nuevamente.",
    paypalPaymentError: "No se pudo completar el pago con PayPal.",
    paymentCashSent: "Pedido enviado a cocina. Estara completado aproximadamente en 15 minutos.",
    paymentCardSent: "Pago aprobado. Pedido confirmado y listo aproximadamente en 15 minutos.",
    orderSubmitting: "Enviando pedido...",
    notificationReady: "Notificaciones activadas para este pedido.",
    notificationUnavailable: "El pedido se envio, pero no se pudo activar la notificacion en este navegador.",
    reservationSubmitting: "Enviando reserva...",
    reservationError: "No se pudo enviar la reserva. Intenta de nuevo.",
    hnTimeLabel: "Hora en Honduras",
    hnWeatherLabel: "Clima en El Progreso",
    hnWeatherLoading: "Cargando clima...",
    hnWeatherError: "Clima no disponible"
  },
  en: {
    navMenu: "Menu",
    navOrder: "Order",
    navReservations: "Reservations",
    navAbout: "About",
    heroEyebrow: "Restaurant and memorable experiences",
    heroTitle: "Frida Restaurant",
    heroSub: "Explore the menu, place orders, and reserve your table from any device with an elegant, clear presentation.",
    heroCtaMenu: "View menu",
    heroCtaReservation: "Reserve table",
    heroCardEyebrow: "Service and hours",
    heroCardTitle: "Hours",
    heroCardText: "Everything is ready for orders, reservations, and a comfortable dining experience throughout the week.",
    daysWeek: "Monday to Friday",
    daysWeekend: "Saturday and Sunday",
    badgeFast: "Fast service",
    badgeFresh: "Fresh products",
    badgeFamily: "Family friendly",
    strip1Title: "Digital menu",
    strip1Text: "Clear categories and an intuitive flow from any screen.",
    strip2Title: "Fast ordering",
    strip2Text: "A direct cart-to-kitchen flow with a simple, professional feel.",
    strip3Title: "Easy reservations",
    strip3Text: "Book your table in seconds from your phone, tablet, or computer.",
    menuTitle: "Menu by category",
    menuText: "Formal categories: Appetizers, Main Courses, Beverages, and Desserts.",
    menuNewBadge: "New",
    tabAll: "All",
    tabAppetizers: "Appetizers",
    tabMain: "Main Courses",
    tabBeverages: "Beverages",
    tabDesserts: "Desserts",
    category_appetizers: "Appetizers",
    category_main_courses: "Main Courses",
    category_beverages: "Beverages",
    category_desserts: "Desserts",
    orderTitle: "Quick order",
    orderText: "Add products to cart and send to kitchen in one click.",
    reservationTitle: "Table reservation",
    reservationText: "Share important details so we can prepare your visit.",
    fieldName: "Full name",
    fieldPhone: "Phone",
    fieldEmail: "Email",
    fieldDate: "Date",
    fieldTime: "Time",
    fieldParty: "Guests",
    fieldOccasion: "Occasion",
    fieldOccasionPlaceholder: "Birthday, meeting, anniversary",
    fieldAllergies: "Allergies",
    fieldAllergiesPlaceholder: "Gluten, lactose, nuts",
    fieldNotes: "Special notes",
    fieldNotesPlaceholder: "Window table, baby chair, etc.",
    btnReserve: "Send reservation",
    about1Title: "Professional service",
    about1Text: "Team trained for fast response times.",
    about2Title: "Consistent quality",
    about2Text: "Internal controls in kitchen and customer service.",
    about3Title: "Memorable experience",
    about3Text: "Visual design, flavor and comfort in balance.",
    cartTitle: "Cart",
    cartTotal: "Total",
    orderCustomerName: "Order name",
    orderCustomerPhone: "Contact phone",
    orderCustomerComments: "Order comments",
    orderCustomerCommentsPlaceholder: "Allergies, no spice, takeaway, etc.",
    orderNeedInvoice: "Need an invoice with RTN?",
    orderBusinessName: "Business name",
    orderBusinessNamePlaceholder: "Business or legal name",
    orderBusinessRTN: "Business RTN",
    orderBusinessRTNPlaceholder: "Business RTN",
    orderInvoiceStepTitle: "Invoice details with RTN",
    orderInvoiceStepText: "Complete these details so we can prepare the fiscal invoice for this order.",
    orderInvoiceBack: "Back",
    orderInvoiceContinue: "Continue",
    orderPickupLabel: "To go",
    pickupStepTitle: "Pickup order",
    pickupStepText: "Add the contact phone and choose how you want to pay for this pickup order.",
    pickupPhoneLabel: "Pickup phone",
    pickupPhonePlaceholder: "Contact phone",
    pickupBack: "Back",
    btnSendKitchen: "Send to kitchen",
    btnPayNow: "Pay now",
    btnBack: "Back",
    btnPayCashier: "Pay at cashier",
    btnPay: "Pay",
    paymentChoiceTitle: "Payment method",
    paymentChoiceText: "Choose how you want to pay this order to continue.",
    paypalTitle: "Pay with card",
    paypalInstructions: "Add your card information and then tap Pay now.",
    cardNameLabel: "Name on card",
    cardNumberLabel: "Card number",
    cardExpiryLabel: "Expiry (MM/YY)",
    cardCvvLabel: "CVV",
    btnClear: "Clear",
    footerText: "Address, phone and opening hours up to date.",
    add: "Add",
    remove: "Remove",
    emptyCart: "Your cart is empty.",
    addedToCart: "added to cart",
    orderSent: "Order sent to kitchen",
    reservationSent: "Reservation sent",
    needCustomer: "Please complete the order name.",
    needPickupName: "Please enter the order name first.",
    needPickupPhone: "Please confirm the phone for the pickup order.",
    needInvoiceCustomer: "Please complete business name and RTN for the invoice.",
    trackerEmpty: "No recent orders.",
    trackerLabel: "Last order",
    trackerPrint: "Print order",
    trackerView: "View order",
    trackerModalTitle: "Order details",
    trackerCustomer: "Customer",
    trackerDate: "Date",
    trackerStatus: "Status",
    trackerPaymentMethod: "Payment method",
    trackerMethodCash: "Cash",
    trackerMethodCard: "Card",
    trackerMethodTransfer: "Bank transfer",
    trackerItems: "Items",
    trackerTotal: "Total",
    trackerPayAtCashier: "Pay at cashier",
    trackerPaymentProcessed: "Payment was successfully processed",
    notificationEnableAction: "Enable alerts",
    status_pending: "Pending",
    status_preparing: "Preparing",
    status_ready: "Ready",
    status_accepted: "Accepted",
    status_delivered: "Delivered",
    status_rejected: "Rejected",
    orderError: "Could not send order. Please try again.",
    invalidCardData: "Please complete valid card details.",
    paypalNotConfigured: "PayPal is not configured. Please contact the restaurant.",
    paypalLoadError: "Could not load PayPal. Please try again.",
    paypalPaymentError: "Could not complete PayPal payment.",
    paymentCashSent: "Order sent to kitchen. It will be completed in about 15 minutes.",
    paymentCardSent: "Payment approved. Order confirmed and ready in about 15 minutes.",
    orderSubmitting: "Sending order...",
    notificationReady: "Notifications enabled for this order.",
    notificationUnavailable: "The order was sent, but notifications could not be enabled in this browser.",
    reservationSubmitting: "Sending reservation...",
    reservationError: "Could not send reservation. Please try again.",
    hnTimeLabel: "Honduras time",
    hnWeatherLabel: "Weather in El Progreso",
    hnWeatherLoading: "Loading weather...",
    hnWeatherError: "Weather unavailable"
  }
};

const menuItems = BASE_MENU_ITEMS.map((item) => ({ ...item, title: { ...item.title } }));
const categoryImageMap = {
  appetizers: "assets/entradas.svg",
  main_courses: "assets/principales.svg",
  beverages: "assets/bebidas.svg",
  desserts: "assets/postres.svg"
};
const menuGrid = document.getElementById("menuGrid");
const tabs = Array.from(document.querySelectorAll(".chip[data-category]"));
const cartBtn = document.getElementById("cartBtn");
const closeCart = document.getElementById("closeCart");
const overlay = document.getElementById("overlay");
const drawer = document.getElementById("cartDrawer");
const cartItemsEl = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const clearCart = document.getElementById("clearCart");
const sendToKitchenBtn = document.getElementById("sendToKitchen");
const orderNeedInvoiceCheckbox = document.getElementById("orderNeedInvoice");
const paymentChoiceModal = document.getElementById("paymentChoiceModal");
const closePaymentChoiceBtn = document.getElementById("closePaymentChoice");
const choosePayNowBtn = document.getElementById("choosePayNow");
const choosePayCashBtn = document.getElementById("choosePayCash");
const invoiceDetailsModal = document.getElementById("invoiceDetailsModal");
const closeInvoiceDetailsBtn = document.getElementById("closeInvoiceDetails");
const invoiceDetailsBackBtn = document.getElementById("invoiceDetailsBack");
const invoiceDetailsContinueBtn = document.getElementById("invoiceDetailsContinue");
const invoicePayNowBtn = document.getElementById("invoicePayNow");
const invoicePayCashBtn = document.getElementById("invoicePayCash");
const invoicePhoneGroup = document.getElementById("invoicePhoneGroup");
const invoicePickupPhoneInput = document.getElementById("invoicePickupPhone");
const pickupDetailsModal = document.getElementById("pickupDetailsModal");
const closePickupDetailsBtn = document.getElementById("closePickupDetails");
const pickupDetailsBackBtn = document.getElementById("pickupDetailsBack");
const pickupPayNowBtn = document.getElementById("pickupPayNow");
const pickupPayCashBtn = document.getElementById("pickupPayCash");
const pickupPhoneInput = document.getElementById("pickupPhoneInput");
const paypalPaymentModal = document.getElementById("paypalPaymentModal");
const closePaypalPaymentBtn = document.getElementById("closePaypalPayment");
const cardPaymentBackBtn = document.getElementById("cardPaymentBack");
const paypalPaymentTotal = document.getElementById("paypalPaymentTotal");
const trackerOrderModal = document.getElementById("trackerOrderModal");
const trackerOrderModalTitle = document.getElementById("trackerOrderModalTitle");
const trackerOrderModalBody = document.getElementById("trackerOrderModalBody");
const closeTrackerOrderModal = document.getElementById("closeTrackerOrderModal");
const cardFallbackForm = document.getElementById("cardFallbackForm");
const cardNameInput = document.getElementById("cardName");
const cardNumberInput = document.getElementById("cardNumber");
const cardExpiryInput = document.getElementById("cardExpiry");
const cardCvvInput = document.getElementById("cardCvv");
const paypalButtonsContainer = document.getElementById("paypalButtonsContainer");
const toast = document.getElementById("toast");
const busyScreen = createBusyScreen();
const tracker = document.getElementById("orderTracker");
const reservationForm = document.getElementById("reservationForm");
const langToggle = document.getElementById("langToggle");
const navToggle = document.getElementById("navToggle");
const primaryNav = document.getElementById("primaryNav");
const hnTimeValue = document.getElementById("hnTimeValue");
const hnWeatherValue = document.getElementById("hnWeatherValue");

let lang = "es";
let activeCategory = "all";
let cart = read(STORAGE.cart, []);
let recentOrderIds = [];
const trackerOrderById = new Map();
const trackerUnsubs = new Map();
const trackerClearTimers = new Map();
let toastTimer = null;
let hnTimeTick = null;
let hnWeatherTick = null;
let weatherState = { loading: true, error: false, temperature: null, weatherCode: null };
let pendingCheckoutAction = null;
let paypalBackTarget = "paymentChoice";

const HONDURAS_TIMEZONE = "America/Tegucigalpa";
const WEATHER_ENDPOINT = "https://api.open-meteo.com/v1/forecast?latitude=15.4012&longitude=-87.8000&current=temperature_2m,weather_code&timezone=America%2FTegucigalpa";
const PAYPAL_CLIENT_ID = (document.querySelector('meta[name="paypal-client-id"]')?.content || "").trim();
const PAYPAL_CURRENCY = (document.querySelector('meta[name="paypal-currency"]')?.content || "USD").trim().toUpperCase();

let paypalSdkPromise = null;
let isSubmittingOrder = false;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_e) {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function t(key) {
  return (i18n[lang] && i18n[lang][key]) || key;
}

function money(v) {
  return new Intl.NumberFormat(lang === "es" ? "es-HN" : "en-US", {
    style: "currency",
    currency: "HNL",
    minimumFractionDigits: 2
  }).format(Number(v || 0));
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

function buildPrintableOrderHtml(order) {
  const orderRef = `#${escapeHtml(order.displayId || order.id.slice(0, 6))}`;
  const createdAt = asDate(order.createdAt) || new Date();
  const customerName = escapeHtml(order.customer?.name || "Consumidor final");
  const customerPhone = escapeHtml(order.customer?.phone || "-");
  const comments = escapeHtml(order.customer?.comments || "-");
  const paymentState = order.payment?.status === "paid"
    ? (lang === "es" ? "Pagada" : "Paid")
    : (lang === "es" ? "Pendiente" : "Pending");
  const paymentTerms = order.payment?.status === "paid"
    ? (lang === "es" ? "Contado" : "Paid in full")
    : (lang === "es" ? "Pendiente" : "Pending");
  const statusText = escapeHtml(statusLabel(order.status));
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
    </head>
    <body>
      <div class="ticket">
        <div class="center">
          <img class="logo" src="${escapeHtml(logoUrl)}" alt="Frida Restaurant">
          <p class="brand-title">Frida Restaurant</p>
          <p class="muted">TEL: ${customerPhone}</p>
          <p class="muted">PEDIDO EN LINEA</p>
        </div>
        <div class="section">
          <div class="row">
            <strong>${lang === "es" ? "TICKET" : "TICKET"}</strong>
            <strong>${lang === "es" ? "FECHA" : "DATE"}</strong>
          </div>
          <div class="row">
            <span>${orderRef}</span>
            <span>${escapeHtml(createdAt.toLocaleString(lang === "es" ? "es-ES" : "en-US"))}</span>
          </div>
        </div>
        <div class="section center">
          <strong>${lang === "es" ? "CLIENTE" : "CUSTOMER"}: ${customerName}</strong>
        </div>
        <div class="section">
          <p><strong>${lang === "es" ? "TERMINOS" : "TERMS"}:</strong> ${escapeHtml(paymentTerms)}</p>
          <p><strong>${lang === "es" ? "ESTADO" : "STATUS"}:</strong> ${escapeHtml(paymentState)}</p>
          <p><strong>${lang === "es" ? "PEDIDO" : "ORDER"}:</strong> ${statusText}</p>
          <p><strong>${lang === "es" ? "COMENTARIOS" : "COMMENTS"}:</strong> ${comments}</p>
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

function printOrderReceipt(orderId) {
  const order = trackerOrderById.get(orderId);
  if (!order) return;
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=420,height=900");
  if (!printWindow) return;
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
  printWindow.document.open();
  printWindow.document.write(buildPrintableOrderHtml(order));
  printWindow.document.close();
}

function renderHondurasTime() {
  if (!hnTimeValue) return;
  const formatter = new Intl.DateTimeFormat(lang === "es" ? "es-HN" : "en-US", {
    timeZone: HONDURAS_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  hnTimeValue.textContent = formatter.format(new Date());
}

function weatherLabelFromCode(code) {
  const labels = lang === "es"
    ? {
        0: "Despejado",
        1: "Mayormente despejado",
        2: "Parcialmente nublado",
        3: "Nublado",
        45: "Neblina",
        48: "Neblina escarchada",
        51: "Llovizna ligera",
        53: "Llovizna moderada",
        55: "Llovizna intensa",
        61: "Lluvia ligera",
        63: "Lluvia moderada",
        65: "Lluvia intensa",
        71: "Nieve ligera",
        73: "Nieve moderada",
        75: "Nieve intensa",
        80: "Chubascos ligeros",
        81: "Chubascos moderados",
        82: "Chubascos intensos",
        95: "Tormenta",
        96: "Tormenta con granizo",
        99: "Tormenta fuerte con granizo"
      }
    : {
        0: "Clear sky",
        1: "Mostly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Light rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Light snow",
        73: "Moderate snow",
        75: "Heavy snow",
        80: "Light showers",
        81: "Moderate showers",
        82: "Violent showers",
        95: "Thunderstorm",
        96: "Thunderstorm with hail",
        99: "Severe thunderstorm with hail"
      };

  return labels[Number(code)] || (lang === "es" ? "Condicion variable" : "Variable conditions");
}

function renderHondurasWeather() {
  if (!hnWeatherValue) return;
  if (weatherState.loading) {
    hnWeatherValue.textContent = t("hnWeatherLoading");
    return;
  }
  if (weatherState.error || weatherState.temperature === null) {
    hnWeatherValue.textContent = t("hnWeatherError");
    return;
  }
  const roundedTemp = Math.round(Number(weatherState.temperature));
  hnWeatherValue.textContent = `${roundedTemp}°C | ${weatherLabelFromCode(weatherState.weatherCode)}`;
}

async function fetchHondurasWeather() {
  weatherState.loading = true;
  weatherState.error = false;
  renderHondurasWeather();
  try {
    const response = await fetch(WEATHER_ENDPOINT, { cache: "no-store" });
    if (!response.ok) throw new Error("weather_fetch_failed");
    const data = await response.json();
    weatherState = {
      loading: false,
      error: false,
      temperature: data?.current?.temperature_2m ?? null,
      weatherCode: data?.current?.weather_code ?? null
    };
  } catch (_e) {
    weatherState = { ...weatherState, loading: false, error: true };
  }
  renderHondurasWeather();
}

function startHondurasLiveInfo() {
  if (!hnTimeValue && !hnWeatherValue) return;
  renderHondurasTime();
  renderHondurasWeather();
  if (hnTimeTick) clearInterval(hnTimeTick);
  hnTimeTick = setInterval(renderHondurasTime, 1000);
  fetchHondurasWeather();
  if (hnWeatherTick) clearInterval(hnWeatherTick);
  hnWeatherTick = setInterval(fetchHondurasWeather, 10 * 60 * 1000);
}

function showToast(message, options = {}) {
  const { duration = 1700, center = false, highlight = false } = options;
  toast.textContent = message;
  toast.classList.remove("center", "highlight");
  if (center) toast.classList.add("center");
  if (highlight) toast.classList.add("highlight");
  toast.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show", "center", "highlight");
  }, duration);
}

function statusLabel(status) {
  return t(`status_${status}`) || status;
}

function trackerPaymentMethodLabel(method) {
  if (method === "bank_transfer") return t("trackerMethodTransfer");
  if (method === "card" || method === "paypal" || method === "online") return t("trackerMethodCard");
  return t("trackerMethodCash");
}

function applyI18n() {
  document.documentElement.lang = lang;
  langToggle.textContent = lang === "es" ? "EN" : "ES";
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  renderMenu();
  renderCart();
  renderTracker();
  renderHondurasTime();
  renderHondurasWeather();
}

function filteredMenu() {
  return menuItems.filter((item) => (activeCategory === "all" ? true : item.category === activeCategory));
}

function categoryLabel(category) {
  const key = `category_${String(category || "")}`;
  const translated = t(key);
  if (translated !== key) return translated;
  return String(category || "").replace(/_/g, " ");
}

function itemImage(item) {
  return item.image || categoryImageMap[item.category] || "assets/food.svg";
}

function applyMenuSettings(settings) {
  const overrides = settings?.items && typeof settings.items === "object" ? settings.items : {};
  menuItems.splice(0, menuItems.length, ...BASE_MENU_ITEMS.map((baseItem) => {
    const override = overrides[baseItem.id] || {};
    const price = Number(override.price);
    const note = override.note && typeof override.note === "object" ? override.note : {};
    return {
      ...baseItem,
      title: { ...baseItem.title },
      price: Number.isFinite(price) && price >= 0 ? price : baseItem.price,
      note: {
        es: String(note.es || "").trim(),
        en: String(note.en || "").trim()
      },
      isNew: Boolean(override.isNew)
    };
  }));
}

function syncCartWithMenu() {
  let changed = false;
  cart = cart
    .map((row) => {
      const item = menuItems.find((menuItem) => menuItem.id === row.id);
      if (!item) return row;
      if (row.price === item.price && row.title?.es === item.title.es && row.title?.en === item.title.en) return row;
      changed = true;
      return {
        ...row,
        title: item.title,
        price: item.price,
        image: item.image,
        category: item.category
      };
    });
  if (changed) write(STORAGE.cart, cart);
}

async function refreshMenuSettings() {
  try {
    const settings = await loadMenuSettings();
    applyMenuSettings(settings);
    syncCartWithMenu();
  } catch (_error) {
    applyMenuSettings({ items: {} });
  }
  renderMenu();
  renderCart();
}

function renderMenu() {
  const items = filteredMenu();
  menuGrid.innerHTML = items
    .map((item) => `
      <article class="menu-card">
        <figure class="menu-photo-wrap">
          <img class="menu-photo" src="${itemImage(item)}" alt="${item.title[lang]}" loading="lazy" onerror="this.onerror=null;this.src='assets/postres.svg';">
        </figure>
        ${item.isNew ? `<div class="menu-badges"><span class="menu-new-badge">${t("menuNewBadge")}</span></div>` : ""}
        <h3>${item.title[lang]}</h3>
        <p class="menu-category">${categoryLabel(item.category)}</p>
        ${item.note?.[lang] ? `<p class="menu-note">${escapeHtml(item.note[lang])}</p>` : ""}
        <div class="meta">
          <span class="price">${money(item.price)}</span>
          <button class="btn btn-primary add-item" data-id="${item.id}">${t("add")}</button>
        </div>
      </article>
    `)
    .join("");
}

function openDrawer() {
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  overlay.classList.remove("hidden");
}

function closeDrawer() {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  overlay.classList.add("hidden");
  pendingCheckoutAction = null;
  closePickupDetailsModal();
  closeInvoiceDetailsModal();
  closePaymentChoiceModal();
  closePaypalPaymentModal();
}

function openPickupDetailsModal() {
  if (pickupPhoneInput) {
    pickupPhoneInput.value = "";
  }
  pickupDetailsModal?.classList.remove("hidden");
}

function closePickupDetailsModal() {
  pickupDetailsModal?.classList.add("hidden");
}

function applyPickupPhoneFromModal() {
  const phoneValue = (pickupPhoneInput?.value || "").trim();
  if (!phoneValue) {
    showToast(t("needPickupPhone"));
    return false;
  }
  const mainPhoneInput = document.getElementById("orderCustomerPhone");
  if (mainPhoneInput) mainPhoneInput.value = phoneValue;
  localStorage.setItem(STORAGE.lastPickupPhone, phoneValue);
  return true;
}

async function proceedWithCheckoutAction(action) {
  pendingCheckoutAction = null;
  if (action === "cash") {
    const sent = await submitOrderWithMode("cash_on_pickup", {}, { showConfirmation: false });
    if (sent) showCenterNotice(t("paymentCashSent"), 4200);
    return;
  }
  if (action === "card") {
    const customer = validateCustomerForOrder({ requireInvoiceDetails: false });
    paypalBackTarget = customer?.needsInvoice ? "invoiceDetails" : "paymentChoice";
    showToast(t("paypalInstructions"), { duration: 2600 });
    openPaypalPaymentModal();
    renderPayPalButtons();
  }
}

function openInvoiceDetailsModal() {
  const isPickup = Boolean(document.getElementById("orderPickup")?.checked);
  if (invoicePhoneGroup) invoicePhoneGroup.classList.toggle("hidden", !isPickup);
  if (invoicePayNowBtn) invoicePayNowBtn.classList.remove("hidden");
  if (invoicePayCashBtn) invoicePayCashBtn.classList.remove("hidden");
  if (invoiceDetailsContinueBtn) invoiceDetailsContinueBtn.classList.add("hidden");
  if (isPickup && invoicePickupPhoneInput) {
    invoicePickupPhoneInput.value = "";
  }
  invoiceDetailsModal?.classList.remove("hidden");
}

function closeInvoiceDetailsModal() {
  invoiceDetailsModal?.classList.add("hidden");
}

function syncInvoicePickupPhone() {
  const isPickup = Boolean(document.getElementById("orderPickup")?.checked);
  if (!isPickup) return true;
  const phoneValue = (invoicePickupPhoneInput?.value || "").trim();
  if (!phoneValue) {
    showToast(t("needPickupPhone"));
    return false;
  }
  if (pickupPhoneInput) pickupPhoneInput.value = phoneValue;
  localStorage.setItem(STORAGE.lastPickupPhone, phoneValue);
  return true;
}

async function handleInvoiceCheckout(action) {
  pendingCheckoutAction = action;
  if (!syncInvoicePickupPhone()) return;
  const customer = validateCustomerForOrder({ requireInvoiceDetails: true });
  if (!customer) return;
  closeInvoiceDetailsModal();
  await proceedWithCheckoutAction(action);
}

function openPaymentChoiceModal() {
  paymentChoiceModal?.classList.remove("hidden");
}

function closePaymentChoiceModal() {
  paymentChoiceModal?.classList.add("hidden");
}

function openPaypalPaymentModal() {
  if (paypalPaymentTotal) {
    const total = cart.reduce((sum, row) => sum + row.qty * row.price, 0);
    paypalPaymentTotal.textContent = money(total);
  }
  paypalPaymentModal?.classList.remove("hidden");
}

function closePaypalPaymentModal() {
  paypalPaymentModal?.classList.add("hidden");
  if (paypalButtonsContainer) paypalButtonsContainer.innerHTML = "";
  if (cardFallbackForm) cardFallbackForm.reset();
  paypalBackTarget = "paymentChoice";
}

function animateAddToCart(sourceEl, message) {
  if (!sourceEl || !cartBtn) return;

  const start = sourceEl.getBoundingClientRect();
  const end = cartBtn.getBoundingClientRect();
  const badge = document.createElement("div");
  badge.className = "cart-fly-note";
  badge.textContent = message;
  badge.style.left = `${start.left + start.width / 2}px`;
  badge.style.top = `${start.top + start.height / 2}px`;
  document.body.appendChild(badge);

  requestAnimationFrame(() => {
    const dx = end.left + end.width / 2 - (start.left + start.width / 2);
    const dy = end.top + end.height / 2 - (start.top + start.height / 2);
    badge.style.transform = `translate(${dx}px, ${dy}px) scale(0.75)`;
    badge.style.opacity = "0";
  });

  cartBtn.classList.add("bump");
  setTimeout(() => cartBtn.classList.remove("bump"), 430);
  setTimeout(() => badge.remove(), 520);
}

function showCenterNotice(message, duration = 2200) {
  showToast(message, { duration, center: true, highlight: true });
}

async function activateOrderNotifications(orderId, customerPhone) {
  if (!orderId) return false;
  try {
    const notificationToken = await registerOrderNotificationToken(orderId, customerPhone || "");
    if (notificationToken) {
      showToast(t("notificationReady"), { duration: 2600, highlight: true });
      return true;
    }
  } catch (notificationError) {
    console.warn("Notification registration failed", notificationError);
    showToast(t("notificationUnavailable"), { duration: 4200 });
  }
  return false;
}

function setCheckoutBusy(isBusy) {
  [
    sendToKitchenBtn,
    choosePayCashBtn,
    choosePayNowBtn,
    pickupPayCashBtn,
    pickupPayNowBtn,
    invoicePayCashBtn,
    invoicePayNowBtn,
    cardFallbackForm?.querySelector('button[type="submit"]')
  ].filter(Boolean).forEach((button) => {
    button.disabled = isBusy;
    button.classList.toggle("is-busy", isBusy);
  });
}

function createBusyScreen() {
  const node = document.createElement("div");
  node.className = "busy-screen hidden";
  node.setAttribute("role", "status");
  node.setAttribute("aria-live", "polite");
  node.innerHTML = '<div class="busy-card"><span></span></div>';
  document.body.appendChild(node);
  return node;
}

async function withSlowBusyScreen(message, action, delay = 900) {
  let visible = false;
  const label = busyScreen.querySelector("span");
  const timer = setTimeout(() => {
    if (label) label.textContent = message;
    busyScreen.classList.remove("hidden");
    visible = true;
  }, delay);

  try {
    return await action();
  } finally {
    clearTimeout(timer);
    if (visible) busyScreen.classList.add("hidden");
  }
}

function readRecentOrderIds() {
  const saved = read(STORAGE.recentOrderIds, []);
  if (!Array.isArray(saved)) return [];
  return Array.from(new Set(saved.filter((id) => typeof id === "string" && id.trim())));
}

function writeRecentOrderIds(ids) {
  recentOrderIds = Array.from(new Set(ids.filter((id) => typeof id === "string" && id.trim())));
  write(STORAGE.recentOrderIds, recentOrderIds);
}

function clearTrackerTimer(orderId) {
  const timer = trackerClearTimers.get(orderId);
  if (!timer) return;
  clearTimeout(timer);
  trackerClearTimers.delete(orderId);
}

function unsubscribeTrackerOrder(orderId) {
  clearTrackerTimer(orderId);
  const unsub = trackerUnsubs.get(orderId);
  if (typeof unsub === "function") unsub();
  trackerUnsubs.delete(orderId);
  trackerOrderById.delete(orderId);
}

function removeRecentOrderId(orderId) {
  unsubscribeTrackerOrder(orderId);
  writeRecentOrderIds(recentOrderIds.filter((id) => id !== orderId));
  if (!recentOrderIds.length) localStorage.removeItem(STORAGE.lastOrderId);
  renderTracker();
}

function asDate(value) {
  if (!value) return null;
  const date = value.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function scheduleAcceptedTrackerClear(order) {
  if (!order || !order.id) return;
  const orderId = order.id;
  clearTrackerTimer(orderId);
  const isTerminalStatus = order && (order.status === "delivered" || order.status === "rejected" || order.status === "cancelled");
  if (!isTerminalStatus) return;

  const resolvedAt = asDate(order.updatedAt) || asDate(order.createdAt);
  if (!resolvedAt) return;

  const hideAt = resolvedAt.getTime() + 3 * 60 * 1000;
  const waitMs = hideAt - Date.now();
  if (waitMs <= 0) {
    removeRecentOrderId(orderId);
    return;
  }
  const timer = setTimeout(() => {
    removeRecentOrderId(orderId);
  }, waitMs);
  trackerClearTimers.set(orderId, timer);
}

function addToCart(id, sourceEl) {
  const item = menuItems.find((m) => m.id === id);
  if (!item) return;
  const row = cart.find((c) => c.id === id);
  if (row) row.qty += 1;
  else cart.push({ id: item.id, title: item.title, price: item.price, qty: 1, image: item.image, category: item.category });
  write(STORAGE.cart, cart);
  renderCart();
  const message = `${item.title[lang]} ${t("addedToCart")}`;
  showToast(message, { highlight: true, duration: 1500 });
  animateAddToCart(sourceEl, message);
}

function updateQty(id, delta) {
  const row = cart.find((c) => c.id === id);
  if (!row) return;
  row.qty += delta;
  if (row.qty <= 0) cart = cart.filter((c) => c.id !== id);
  write(STORAGE.cart, cart);
  renderCart();
}

function renderCart() {
  const count = cart.reduce((sum, row) => sum + row.qty, 0);
  const total = cart.reduce((sum, row) => sum + row.qty * row.price, 0);
  cartCount.textContent = String(count);
  cartTotal.textContent = money(total);

  if (!cart.length) {
    cartItemsEl.innerHTML = `<p>${t("emptyCart")}</p>`;
    return;
  }

  cartItemsEl.innerHTML = cart
    .map(
      (row) => `
      <div class="cart-row">
        <div class="cart-row-main">
          <img class="cart-thumb" src="${cartImage(row)}" alt="${row.title[lang]}" loading="lazy" onerror="this.onerror=null;this.src='assets/food.svg';">
          <div class="cart-row-text">
            <h4>${row.title[lang]}</h4>
            <p>${money(row.price)} x ${row.qty}</p>
          </div>
        </div>
        <div class="qty-line">
          <button class="btn btn-outline qty" data-id="${row.id}" data-delta="-1">-</button>
          <button class="btn btn-outline qty" data-id="${row.id}" data-delta="1">+</button>
          <button class="btn btn-ghost remove" data-id="${row.id}">${t("remove")}</button>
        </div>
      </div>
    `
    )
    .join("");
}

function cartImage(row) {
  if (row.image) return row.image;
  const source = menuItems.find((item) => item.id === row.id);
  if (source) return itemImage(source);
  return "assets/food.svg";
}

function renderTracker() {
  const orders = recentOrderIds
    .map((id) => trackerOrderById.get(id))
    .filter((order) => Boolean(order))
    .sort((a, b) => {
      const aDate = asDate(a.createdAt);
      const bDate = asDate(b.createdAt);
      return (bDate ? bDate.getTime() : 0) - (aDate ? aDate.getTime() : 0);
    });

  if (!orders.length) {
    tracker.innerHTML = `<p>${t("trackerEmpty")}</p>`;
    return;
  }
  tracker.innerHTML = orders
    .map((order) => {
      const createdAt = asDate(order.createdAt) || new Date();
      const isPaid = order.payment?.status === "paid";
      const isToGo = Boolean(order.customer?.pickup);
      const customerPaymentLine = isPaid
        ? (isToGo ? `${t("orderPickupLabel")} | ${t("trackerPaymentProcessed")}` : t("trackerPaymentProcessed"))
        : (isToGo ? `${t("orderPickupLabel")} | ${t("trackerPayAtCashier")}` : t("trackerPayAtCashier"));
      return `
        <div class="tracker-row">
          <strong>${t("trackerLabel")}: #${order.displayId || order.id.slice(0, 6)}</strong>
          <p>${order.customer?.name || ""} | ${createdAt.toLocaleString(lang === "es" ? "es-ES" : "en-US")}</p>
          <p><strong>${customerPaymentLine}</strong></p>
          <p><strong>${t("trackerPaymentMethod")}:</strong> ${escapeHtml(trackerPaymentMethodLabel(order.payment?.method))}</p>
          <div class="tracker-status-row">
            <p><strong>${statusLabel(order.status)}</strong></p>
            <button class="btn btn-outline tracker-view-order" data-id="${order.id}">${t("trackerView")}</button>
            <button class="btn btn-outline tracker-enable-notifications" data-id="${order.id}">${t("notificationEnableAction")}</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function openTrackerOrderModal(orderId) {
  const order = trackerOrderById.get(orderId);
  if (!order || !trackerOrderModal || !trackerOrderModalTitle || !trackerOrderModalBody) return;
  trackerOrderModalTitle.textContent = `${t("trackerModalTitle")} #${order.displayId || order.id.slice(0, 6)}`;
  trackerOrderModalBody.innerHTML = `
    <p><strong>${t("trackerCustomer")}:</strong> ${escapeHtml(order.customer?.name || "")}</p>
    <p><strong>${t("trackerDate")}:</strong> ${escapeHtml((asDate(order.createdAt) || new Date()).toLocaleString(lang === "es" ? "es-ES" : "en-US"))}</p>
    <p><strong>${t("trackerPaymentMethod")}:</strong> ${escapeHtml(order.payment?.status === "paid" ? t("trackerPaymentProcessed") : t("trackerPayAtCashier"))}</p>
    <p><strong>${t("trackerStatus")}:</strong> ${escapeHtml(statusLabel(order.status))}</p>
    <p><strong>${t("trackerItems")}:</strong></p>
    <ul>
      ${(order.items || [])
        .map((item) => `<li>${escapeHtml(item.title?.[lang] || item.title?.es || item.title?.en || "Item")} x ${Number(item.qty || 0)} (${escapeHtml(money(item.price))})</li>`)
        .join("")}
    </ul>
    <p><strong>${t("trackerTotal")}:</strong> ${escapeHtml(money(order.total))}</p>
  `;
  trackerOrderModal.classList.remove("hidden");
}

function closeTrackerModal() {
  trackerOrderModal?.classList.add("hidden");
}

function subscribeTrackerOrder(orderId) {
  if (!orderId || trackerUnsubs.has(orderId)) return;
  const unsub = listenOrderById(
    orderId,
    (order) => {
      if (!order) {
        removeRecentOrderId(orderId);
        return;
      }
      trackerOrderById.set(orderId, order);
      scheduleAcceptedTrackerClear(order);
      renderTracker();
    },
    () => {
      trackerOrderById.delete(orderId);
      renderTracker();
    }
  );
  trackerUnsubs.set(orderId, unsub);
}

function syncTrackerSubscriptions() {
  const active = new Set(recentOrderIds);
  Array.from(trackerUnsubs.keys()).forEach((id) => {
    if (!active.has(id)) unsubscribeTrackerOrder(id);
  });
  recentOrderIds.forEach((id) => subscribeTrackerOrder(id));
}

function addRecentOrderId(orderId) {
  if (!orderId) return;
  const next = [orderId, ...recentOrderIds.filter((id) => id !== orderId)].slice(0, 5);
  writeRecentOrderIds(next);
  localStorage.setItem(STORAGE.lastOrderId, orderId);
  syncTrackerSubscriptions();
}

function buildPaymentDetails(mode, paymentMeta = {}) {
  if (mode === "paypal_paid") {
    return {
      method: "paypal",
      status: "paid",
      provider: "paypal",
      checkoutUrl: "",
      cardLast4: "",
      transactionId: paymentMeta.transactionId || "",
      paypalOrderId: paymentMeta.paypalOrderId || ""
    };
  }
  if (mode === "card_paid") {
    return {
      method: "card",
      status: "paid",
      provider: "manual_card_entry",
      checkoutUrl: "",
      cardLast4: paymentMeta.cardLast4 || "",
      transactionId: paymentMeta.transactionId || "",
      paypalOrderId: ""
    };
  }
  return {
    method: "cash_on_pickup",
    status: "unpaid",
    provider: "in_store",
    checkoutUrl: "",
    cardLast4: "",
    transactionId: "",
    paypalOrderId: ""
  };
}

function normalizeCardNumber(value) {
  return String(value || "").replace(/\D/g, "");
}

function validateCardForm() {
  const cardName = (cardNameInput?.value || "").trim();
  const cardNumber = normalizeCardNumber(cardNumberInput?.value || "");
  const cardExpiry = (cardExpiryInput?.value || "").trim();
  const cardCvv = String(cardCvvInput?.value || "").trim();
  const validExpiry = /^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry);
  const validNumber = cardNumber.length >= 13 && cardNumber.length <= 19;
  const validCvv = /^\d{3,4}$/.test(cardCvv);
  if (!cardName || !validNumber || !validExpiry || !validCvv) return null;
  return { cardLast4: cardNumber.slice(-4) };
}

function validateCustomerForOrder(options = {}) {
  const { requireInvoiceDetails = true } = options;
  const customerName = (document.getElementById("orderCustomerName").value || "").trim();
  const customerComments = (document.getElementById("orderCustomerComments")?.value || "").trim();
  const customerPickup = Boolean(document.getElementById("orderPickup")?.checked);
  const customerPhone = (
    document.getElementById("orderCustomerPhone")?.value ||
    (customerPickup ? pickupPhoneInput?.value : "") ||
    (customerPickup ? localStorage.getItem(STORAGE.lastPickupPhone) : "") ||
    ""
  ).trim();
  const needsInvoice = Boolean(document.getElementById("orderNeedInvoice")?.checked);
  const businessName = (document.getElementById("orderBusinessName")?.value || "").trim();
  const businessRTN = (document.getElementById("orderBusinessRTN")?.value || "").trim();
  if (!customerName) {
    showToast(t("needCustomer"));
    return null;
  }
  if (requireInvoiceDetails && needsInvoice && (!businessName || !businessRTN)) {
    showToast(t("needInvoiceCustomer"));
    return null;
  }
  return {
    customerName,
    customerPhone,
    customerComments,
    customerPickup,
    needsInvoice,
    businessName,
    businessRTN
  };
}

function loadPayPalSdk() {
  if (!PAYPAL_CLIENT_ID) return Promise.reject(new Error("paypal_not_configured"));
  if (window.paypal) return Promise.resolve(window.paypal);
  if (paypalSdkPromise) return paypalSdkPromise;

  paypalSdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-paypal-sdk="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.paypal));
      existing.addEventListener("error", () => reject(new Error("paypal_sdk_load_error")));
      return;
    }
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(PAYPAL_CLIENT_ID)}&currency=${encodeURIComponent(PAYPAL_CURRENCY)}&intent=capture`;
    script.async = true;
    script.dataset.paypalSdk = "true";
    script.addEventListener("load", () => resolve(window.paypal));
    script.addEventListener("error", () => reject(new Error("paypal_sdk_load_error")));
    document.head.appendChild(script);
  });

  return paypalSdkPromise;
}

async function renderPayPalButtons() {
  const customer = validateCustomerForOrder();
  if (!customer) return;
  if (!paypalButtonsContainer) return;
  if (cardFallbackForm) cardFallbackForm.classList.remove("hidden");
  const total = cart.reduce((sum, row) => sum + row.qty * row.price, 0);
  if (!total) return;

  paypalButtonsContainer.innerHTML = "";
  try {
    const paypal = await loadPayPalSdk();
    if (!paypal || !paypal.Buttons) throw new Error("paypal_sdk_unavailable");
    paypal
      .Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "pay"
        },
        createOrder: (_data, actions) =>
          actions.order.create({
            purchase_units: [
              {
                amount: {
                  currency_code: PAYPAL_CURRENCY,
                  value: total.toFixed(2)
                }
              }
            ]
          }),
        onApprove: async (data, actions) => {
          const capture = await actions.order.capture();
          const transactionId = capture?.purchase_units?.[0]?.payments?.captures?.[0]?.id || "";
          const paid = await submitOrderWithMode(
            "paypal_paid",
            { transactionId, paypalOrderId: data?.orderID || "" },
            { showConfirmation: false }
          );
          if (paid) showCenterNotice(t("paymentCardSent"));
        },
        onError: () => {
          showToast(t("paypalPaymentError"));
        },
        onCancel: () => {}
      })
      .render("#paypalButtonsContainer");
  } catch (error) {
    const missingConfig = error.message === "paypal_not_configured";
    showToast(missingConfig ? t("paypalNotConfigured") : t("paypalLoadError"));
  }
}

async function submitOrderWithMode(mode, paymentMeta = {}, options = {}) {
  const { showConfirmation = true } = options;
  if (!cart.length) return false;
  if (isSubmittingOrder) return false;
  const customer = validateCustomerForOrder();
  if (!customer) return false;
  isSubmittingOrder = true;
  setCheckoutBusy(true);

  const orderPayload = {
    language: lang,
    customer: {
      name: customer.customerName,
      phone: customer.customerPhone,
      comments: customer.customerComments,
      pickup: customer.customerPickup
    },
    items: cart,
    total: cart.reduce((sum, row) => sum + row.qty * row.price, 0),
    payment: buildPaymentDetails(mode, paymentMeta),
    invoice: customer.needsInvoice
      ? {
          billingName: customer.businessName,
          billingRTN: customer.businessRTN,
          notes: "",
          hasExoneration: false,
          exemptionRegister: "",
          exemptOrderNumber: "",
          sagRegister: ""
        }
      : undefined
  };

  try {
    const orderId = await withSlowBusyScreen(t("orderSubmitting"), () => addOrder(orderPayload));
    finishSuccessfulOrder(orderId, mode, showConfirmation, customer.customerPhone);
    return true;
  } catch (_e) {
    showToast(t("orderError"));
    return false;
  } finally {
    isSubmittingOrder = false;
    setCheckoutBusy(false);
  }
}

function finishSuccessfulOrder(orderId, mode, showConfirmation, customerPhone) {
  addRecentOrderId(orderId);
  cart = [];
  write(STORAGE.cart, cart);
  renderCart();
  const commentsField = document.getElementById("orderCustomerComments");
  if (commentsField) commentsField.value = "";
  const pickupField = document.getElementById("orderPickup");
  if (pickupField) pickupField.checked = false;
  const needInvoiceField = document.getElementById("orderNeedInvoice");
  if (needInvoiceField) needInvoiceField.checked = false;
  const businessNameField = document.getElementById("orderBusinessName");
  if (businessNameField) businessNameField.value = "";
  const businessRTNField = document.getElementById("orderBusinessRTN");
  if (businessRTNField) businessRTNField.value = "";
  const invoiceFieldsBox = document.getElementById("orderInvoiceFields");
  if (invoiceFieldsBox) invoiceFieldsBox.classList.add("hidden");
  closePaypalPaymentModal();
  closePaymentChoiceModal();
  closeDrawer();
  if (showConfirmation) {
    showCenterNotice(mode === "paypal_paid" || mode === "card_paid" ? t("paymentCardSent") : t("paymentCashSent"));
  }
  activateOrderNotifications(orderId, customerPhone);
}

async function submitReservation(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(reservationForm).entries());
  if (!data.name || !data.phone || !data.date || !data.time || !data.party) {
    reservationForm.reportValidity();
    return;
  }

  try {
    await withSlowBusyScreen(t("reservationSubmitting"), () => addReservation({ ...data, language: lang }));
    showToast(t("reservationSent"));
    reservationForm.reset();
  } catch (_e) {
    showToast(t("reservationError"));
  }
}

function scrollToPageSection(hash) {
  if (!hash || hash === "#") return false;
  const target = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!target) return false;

  const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
  const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 24;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: "smooth"
  });
  window.history.pushState(null, "", hash);
  return true;
}

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const url = new URL(link.href, window.location.href);
  if (url.pathname !== window.location.pathname) return;
  if (!scrollToPageSection(url.hash)) return;
  event.preventDefault();
  if (primaryNav && navToggle) {
    primaryNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((node) => node.classList.remove("active"));
    tab.classList.add("active");
    activeCategory = tab.dataset.category;
    renderMenu();
  });
});

menuGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".add-item");
  if (button) addToCart(button.dataset.id, button);
});

cartItemsEl.addEventListener("click", (event) => {
  const qty = event.target.closest(".qty");
  if (qty) {
    updateQty(qty.dataset.id, Number(qty.dataset.delta));
    return;
  }
  const removeBtn = event.target.closest(".remove");
  if (removeBtn) {
    cart = cart.filter((row) => row.id !== removeBtn.dataset.id);
    write(STORAGE.cart, cart);
    renderCart();
  }
});

langToggle.addEventListener("click", () => {
  lang = lang === "es" ? "en" : "es";
  applyI18n();
});

if (navToggle && primaryNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = primaryNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  primaryNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      primaryNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("pointerdown", (event) => {
    const isOpen = primaryNav.classList.contains("open");
    if (!isOpen) return;
    const clickedInsideMenu = event.target.closest("#primaryNav");
    const clickedToggle = event.target.closest("#navToggle");
    if (clickedInsideMenu || clickedToggle) return;
    primaryNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
}

cartBtn.addEventListener("click", openDrawer);
closeCart.addEventListener("click", closeDrawer);
overlay.addEventListener("click", closeDrawer);
clearCart.addEventListener("click", () => {
  cart = [];
  write(STORAGE.cart, cart);
  renderCart();
});
sendToKitchenBtn.addEventListener("click", () => {
  if (!cart.length) return;
  const customer = validateCustomerForOrder({ requireInvoiceDetails: false });
  if (!customer) return;
  if (customer.customerPickup && customer.needsInvoice) {
    openInvoiceDetailsModal();
    return;
  }
  if (customer.customerPickup) {
    openPickupDetailsModal();
    return;
  }
  if (customer.needsInvoice && (!customer.businessName || !customer.businessRTN)) {
    openInvoiceDetailsModal();
    return;
  }
  openPaymentChoiceModal();
});
closePickupDetailsBtn?.addEventListener("click", () => {
  const pickupField = document.getElementById("orderPickup");
  if (pickupField) pickupField.checked = false;
  pendingCheckoutAction = null;
  closePickupDetailsModal();
});
pickupDetailsBackBtn?.addEventListener("click", () => {
  const pickupField = document.getElementById("orderPickup");
  if (pickupField) pickupField.checked = false;
  pendingCheckoutAction = null;
  closePickupDetailsModal();
});
async function handlePickupCheckout(action) {
  if (!applyPickupPhoneFromModal()) return;
  closePickupDetailsModal();
  const customer = validateCustomerForOrder({ requireInvoiceDetails: false });
  if (!customer) return;
  if (customer.needsInvoice && (!customer.businessName || !customer.businessRTN)) {
    pendingCheckoutAction = action;
    openInvoiceDetailsModal();
    return;
  }
  await proceedWithCheckoutAction(action);
}

pickupPayCashBtn?.addEventListener("click", () => {
  handlePickupCheckout("cash");
});

pickupPayNowBtn?.addEventListener("click", () => {
  handlePickupCheckout("card");
});
closeInvoiceDetailsBtn?.addEventListener("click", () => {
  pendingCheckoutAction = null;
  closeInvoiceDetailsModal();
});
invoiceDetailsBackBtn?.addEventListener("click", () => {
  pendingCheckoutAction = null;
  closeInvoiceDetailsModal();
});
invoiceDetailsContinueBtn?.addEventListener("click", () => {
  if (!syncInvoicePickupPhone()) return;
  const customer = validateCustomerForOrder({ requireInvoiceDetails: true });
  if (!customer) return;
  closeInvoiceDetailsModal();
  if (pendingCheckoutAction) {
    proceedWithCheckoutAction(pendingCheckoutAction);
    return;
  }
  openPaymentChoiceModal();
});
invoicePayCashBtn?.addEventListener("click", () => {
  handleInvoiceCheckout("cash");
});
invoicePayNowBtn?.addEventListener("click", () => {
  handleInvoiceCheckout("card");
});
closePaymentChoiceBtn?.addEventListener("click", closePaymentChoiceModal);
choosePayCashBtn?.addEventListener("click", async () => {
  closePaymentChoiceModal();
  await proceedWithCheckoutAction("cash");
});
choosePayNowBtn?.addEventListener("click", () => {
  closePaymentChoiceModal();
  proceedWithCheckoutAction("card");
});
orderNeedInvoiceCheckbox?.addEventListener("change", () => {
  if (orderNeedInvoiceCheckbox.checked) return;
  const businessNameField = document.getElementById("orderBusinessName");
  const businessRTNField = document.getElementById("orderBusinessRTN");
  if (businessNameField) businessNameField.value = "";
  if (businessRTNField) businessRTNField.value = "";
  closeInvoiceDetailsModal();
});
document.getElementById("orderPickup")?.addEventListener("change", (event) => {
  if (!event.target.checked) {
    pendingCheckoutAction = null;
    closePickupDetailsModal();
    return;
  }
});
pickupDetailsModal?.addEventListener("click", (event) => {
  if (event.target === pickupDetailsModal) {
    const pickupField = document.getElementById("orderPickup");
    if (pickupField) pickupField.checked = false;
    pendingCheckoutAction = null;
    closePickupDetailsModal();
  }
});
invoiceDetailsModal?.addEventListener("click", (event) => {
  if (event.target === invoiceDetailsModal) {
    pendingCheckoutAction = null;
    closeInvoiceDetailsModal();
  }
});
closePaypalPaymentBtn?.addEventListener("click", closePaypalPaymentModal);
cardPaymentBackBtn?.addEventListener("click", () => {
  const nextStep = paypalBackTarget;
  closePaypalPaymentModal();
  if (nextStep === "invoiceDetails") {
    openInvoiceDetailsModal();
    return;
  }
  openPaymentChoiceModal();
});
closeTrackerOrderModal?.addEventListener("click", closeTrackerModal);
trackerOrderModal?.addEventListener("click", (event) => {
  if (event.target === trackerOrderModal) closeTrackerModal();
});
tracker?.addEventListener("click", (event) => {
  const viewButton = event.target.closest(".tracker-view-order");
  if (viewButton) {
    openTrackerOrderModal(viewButton.dataset.id);
    return;
  }

  const notificationButton = event.target.closest(".tracker-enable-notifications");
  if (!notificationButton) return;
  const order = trackerOrderById.get(notificationButton.dataset.id);
  activateOrderNotifications(notificationButton.dataset.id, order?.customer?.phone);
});
if (cardFallbackForm) {
  cardFallbackForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const card = validateCardForm();
    if (!card) {
      showToast(t("invalidCardData"));
      return;
    }
    const paid = await submitOrderWithMode(
      "card_paid",
      { cardLast4: card.cardLast4, transactionId: `manual_${Date.now()}` },
      { showConfirmation: false }
    );
    if (paid) showCenterNotice(t("paymentCardSent"));
  });
}
reservationForm.addEventListener("submit", submitReservation);

recentOrderIds = readRecentOrderIds();
if (!recentOrderIds.length) {
  const existingLastOrderId = localStorage.getItem(STORAGE.lastOrderId);
  if (existingLastOrderId) {
    recentOrderIds = [existingLastOrderId];
    writeRecentOrderIds(recentOrderIds);
  }
}
syncTrackerSubscriptions();
applyI18n();
refreshMenuSettings();
startHondurasLiveInfo();
