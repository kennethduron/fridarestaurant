import { addOrder, addReservation, listenOrderById, listenMenuSettings, registerOrderNotificationToken } from "./firebase-config.js?v=20260424b";
import { BASE_MENU_ITEMS } from "./menu-data.js?v=20260419a";

const STORAGE = {
  cart: "restaurant_cart_v1",
  lastOrderId: "restaurant_last_order_id",
  recentOrderIds: "restaurant_recent_order_ids",
  lastPickupPhone: "restaurant_last_pickup_phone"
};

const i18n = {
  es: {
    navMenu: "Menú",
    navOrder: "Pedido",
    navReservations: "Reservas",
    navAbout: "Nosotros",
    heroEyebrow: "Restaurante y experiencias memorables",
    heroTitle: "Frida Restaurant",
    heroSub: "Explora el menú, envía pedidos y reserva tu mesa desde cualquier dispositivo con una presentación elegante y clara.",
    heroCtaMenu: "Ver menú",
    heroCtaReservation: "Reservar mesa",
    heroCardEyebrow: "Atención y horarios",
    heroCardTitle: "Horario",
    heroCardText: "Todo listo para pedidos, reservas y una experiencia comoda en sala durante toda la semana.",
    daysWeek: "Lunes a Viernes",
    daysWeekend: "Sabado y Domingo",
    badgeFast: "Servicio rápido",
    badgeFresh: "Producto fresco",
    badgeFamily: "Ambiente familiar",
    strip1Title: "Menú digital",
    strip1Text: "Categorías claras y recorrido intuitivo desde cualquier pantalla.",
    strip2Title: "Pedidos rápidos",
    strip2Text: "Carrito directo a cocina con un flujo simple y profesional.",
    strip3Title: "Reservas fáciles",
    strip3Text: "Solicita tu mesa en segundos desde celular, tablet o computadora.",
    menuTitle: "Menú por categorías",
    menuText: "Categorías formales: Entradas, Platos principales, Bebidas y Postres.",
    menuNewBadge: "Nuevo",
    menuSoldOutBadge: "Agotado",
    menuSoldOutAction: "Agotado",
    menuSoldOutToast: "está agotado por el momento",
    tabAll: "Todo",
    tabAppetizers: "Entradas",
    tabMain: "Platos principales",
    tabBeverages: "Bebidas",
    tabDesserts: "Postres",
    category_appetizers: "Entradas",
    category_main_courses: "Platos principales",
    category_beverages: "Bebidas",
    category_desserts: "Postres",
    orderTitle: "Pedido rápido",
    orderText: "Agrega productos al carrito y envía el pedido a cocina con un clic.",
    reservationTitle: "Reserva de mesa",
    reservationText: "Comparte datos importantes para organizar tu experiencia.",
    fieldName: "Nombre completo",
    fieldPhone: "Teléfono",
    fieldEmail: "Correo",
    fieldDate: "Fecha",
    fieldTime: "Hora",
    fieldParty: "Personas",
    fieldOccasion: "Ocasión",
    fieldOccasionPlaceholder: "Cumpleaños, reunión, aniversario",
    fieldAllergies: "Alergias",
    fieldAllergiesPlaceholder: "Gluten, lactosa, frutos secos",
    fieldReservationArea: "Área de reserva",
    reservationAreaOpen: "Area Libre",
    reservationAreaAir: "Area climatizada",
    fieldReservationArea: "Área de reserva",
    reservationAreaPrompt: "Selecciona el área de reserva",
    reservationAreaOpen: "Área libre",
    reservationAreaAir: "Área climatizada",
    fieldNotes: "Notas especiales",
    fieldNotesPlaceholder: "Mesa cerca de ventana, silla para bebé, etc.",
    btnReserve: "Enviar reserva",
    about1Title: "Atención profesional",
    about1Text: "Equipo entrenado para tiempos de respuesta rápidos.",
    about2Title: "Calidad constante",
    about2Text: "Control interno en cocina y servicio al cliente.",
    about3Title: "Experiencia memorable",
    about3Text: "Diseno visual, sabor y confort en equilibrio.",
    cartTitle: "Carrito",
    cartTotal: "Total",
    orderCustomerName: "Nombre para el pedido",
    orderCustomerPhone: "Teléfono de contacto",
    orderCustomerComments: "Comentarios del pedido",
    orderCustomerCommentsPlaceholder: "Alergias, sin picante, recoger, delivery, etc.",
    orderTableLabel: "Número de mesa",
    orderTablePlaceholder: "Mesa",
    orderNeedInvoice: "Factura con RTN?",
    orderBusinessName: "Nombre de la empresa",
    orderBusinessNamePlaceholder: "Nombre del negocio o razón social",
    orderBusinessRTN: "RTN de la empresa",
    orderBusinessRTNPlaceholder: "RTN del negocio o empresa",
    orderInvoiceStepTitle: "Datos para factura con RTN",
    orderInvoiceStepText: "Completa estos datos para preparar la factura fiscal de este pedido.",
    orderInvoiceBack: "Volver",
    orderTypeLabel: "Tipo de pedido",
    orderDineInLabel: "En restaurante",
    orderPickupLabel: "Recoger",
    orderDeliveryLabel: "Delivery",
    pickupStepTitle: "Datos del pedido",
    pickupStepText: "Confirma los datos para enviar este pedido a cocina.",
    pickupPhoneLabel: "Teléfono de contacto",
    pickupPhonePlaceholder: "Teléfono de contacto",
    deliveryAddressLabel: "Dirección de entrega",
    deliveryAddressPlaceholder: "Dirección completa para delivery",
    pickupBack: "Volver",
    btnSendKitchen: "Enviar a cocina",
    btnBack: "Volver",
    btnClear: "Vaciar",
    footerText: "Dirección, teléfono y horarios actualizados.",
    add: "Agregar",
    remove: "Eliminar",
    emptyCart: "Tu carrito está vacío.",
    addedToCart: "agregado al carrito",
    orderSent: "Pedido enviado a cocina",
    reservationSent: "Reserva enviada",
    needCustomer: "Completa el nombre del pedido.",
    needTableNumber: "Completa el número de mesa.",
    needPickupName: "Completa primero el nombre para el pedido.",
    needPickupPhone: "Confirma el teléfono para este pedido.",
    needDeliveryAddress: "Escribe la dirección para el delivery.",
    needInvoiceCustomer: "Completa nombre o empresa y RTN para la factura.",
    trackerEmpty: "No hay pedidos recientes.",
    trackerLabel: "Último pedido",
    trackerPrint: "Imprimir pedido",
    trackerView: "Ver pedido",
    trackerModalTitle: "Detalle del pedido",
    trackerCustomer: "Cliente",
    trackerDate: "Fecha",
    trackerStatus: "Estado",
    trackerOrderType: "Tipo de pedido",
    trackerDineIn: "Comer en restaurante",
    trackerToGo: "Recoger",
    trackerDelivery: "Delivery",
    trackerItems: "Productos",
    trackerTotal: "Total",
    trackerRejectedHelpTitle: "Esta orden fue rechazada.",
    trackerRejectedHelpText: "Si tienes alguna pregunta o duda, llama a Frida Restaurant al +504 3198-4734.",
    trackerRejectedHelpAction: "Llamar a Frida",
    trackerRejectedHelpWhatsApp: "WhatsApp",
    notificationEnableAction: "Activar avisos",
    status_pending: "Pendiente",
    status_preparing: "Preparando",
    status_ready: "Listo",
    status_accepted: "Aceptada",
    status_delivered: "Entregada",
    status_rejected: "Rechazado",
    orderError: "No se pudo enviar el pedido. Intenta de nuevo.",
    orderSentNotice: "Pedido enviado a cocina. Estará completado aproximadamente en 15 minutos.",
    orderViewPromptTitle: "Orden enviada",
    orderViewPromptText: "¿Deseas ver la orden?",
    yesButton: "Sí",
    noButton: "No",
    orderLoading: "Cargando orden...",
    orderSubmitting: "Enviando pedido...",
    notificationReady: "Notificaciones activadas para este pedido.",
    notificationUnavailable: "El pedido se envió, pero no se pudo activar la notificación en este navegador.",
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
    menuSoldOutBadge: "Sold out",
    menuSoldOutAction: "Sold out",
    menuSoldOutToast: "is sold out for now",
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
    fieldReservationArea: "Reservation area",
    reservationAreaOpen: "Open area",
    reservationAreaAir: "Air-conditioned area",
    reservationAreaPrompt: "Choose the reservation area",
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
    orderCustomerCommentsPlaceholder: "Allergies, no spice, pickup, delivery, etc.",
    orderTableLabel: "Table number",
    orderTablePlaceholder: "Table",
    orderNeedInvoice: "Invoice with RTN?",
    orderBusinessName: "Business name",
    orderBusinessNamePlaceholder: "Business or legal name",
    orderBusinessRTN: "Business RTN",
    orderBusinessRTNPlaceholder: "Business RTN",
    orderInvoiceStepTitle: "Invoice details with RTN",
    orderInvoiceStepText: "Complete these details so we can prepare the fiscal invoice for this order.",
    orderInvoiceBack: "Back",
    orderTypeLabel: "Order type",
    orderDineInLabel: "Dine in",
    orderPickupLabel: "Pickup",
    orderDeliveryLabel: "Delivery",
    pickupStepTitle: "Order details",
    pickupStepText: "Confirm the details to send this order to the kitchen.",
    pickupPhoneLabel: "Contact phone",
    pickupPhonePlaceholder: "Contact phone",
    deliveryAddressLabel: "Delivery address",
    deliveryAddressPlaceholder: "Full delivery address",
    pickupBack: "Back",
    btnSendKitchen: "Send to kitchen",
    btnBack: "Back",
    btnClear: "Clear",
    footerText: "Address, phone and opening hours up to date.",
    add: "Add",
    remove: "Remove",
    emptyCart: "Your cart is empty.",
    addedToCart: "added to cart",
    orderSent: "Order sent to kitchen",
    reservationSent: "Reservation sent",
    needCustomer: "Please complete the order name.",
    needTableNumber: "Please enter the table number.",
    needPickupName: "Please enter the order name first.",
    needPickupPhone: "Please confirm the phone for this order.",
    needDeliveryAddress: "Please enter the delivery address.",
    needInvoiceCustomer: "Please complete business name and RTN for the invoice.",
    trackerEmpty: "No recent orders.",
    trackerLabel: "Last order",
    trackerPrint: "Print order",
    trackerView: "View order",
    trackerModalTitle: "Order details",
    trackerCustomer: "Customer",
    trackerDate: "Date",
    trackerStatus: "Status",
    trackerOrderType: "Order type",
    trackerDineIn: "Dine in",
    trackerToGo: "Pickup",
    trackerDelivery: "Delivery",
    trackerItems: "Items",
    trackerTotal: "Total",
    trackerRejectedHelpTitle: "This order was rejected.",
    trackerRejectedHelpText: "If you have any question or need help, call Frida Restaurant at +504 3198-4734.",
    trackerRejectedHelpAction: "Call Frida",
    trackerRejectedHelpWhatsApp: "WhatsApp",
    notificationEnableAction: "Enable alerts",
    status_pending: "Pending",
    status_preparing: "Preparing",
    status_ready: "Ready",
    status_accepted: "Accepted",
    status_delivered: "Delivered",
    status_rejected: "Rejected",
    orderError: "Could not send order. Please try again.",
    orderSentNotice: "Order sent to kitchen. It will be completed in about 15 minutes.",
    orderViewPromptTitle: "Order sent",
    orderViewPromptText: "Would you like to view the order?",
    yesButton: "Yes",
    noButton: "No",
    orderLoading: "Loading order...",
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
const orderFulfillmentSelect = document.getElementById("orderFulfillment");
const orderTableGroup = document.getElementById("orderTableGroup");
const orderTableNumberInput = document.getElementById("orderTableNumber");
const orderNeedInvoiceCheckbox = document.getElementById("orderNeedInvoice");
const invoiceDetailsModal = document.getElementById("invoiceDetailsModal");
const closeInvoiceDetailsBtn = document.getElementById("closeInvoiceDetails");
const invoiceDetailsBackBtn = document.getElementById("invoiceDetailsBack");
const invoiceDetailsContinueBtn = document.getElementById("invoiceDetailsContinue");
const invoicePhoneGroup = document.getElementById("invoicePhoneGroup");
const invoicePickupPhoneInput = document.getElementById("invoicePickupPhone");
const invoiceDeliveryAddressGroup = document.getElementById("invoiceDeliveryAddressGroup");
const invoiceDeliveryAddressInput = document.getElementById("invoiceDeliveryAddressInput");
const pickupDetailsModal = document.getElementById("pickupDetailsModal");
const closePickupDetailsBtn = document.getElementById("closePickupDetails");
const pickupDetailsBackBtn = document.getElementById("pickupDetailsBack");
const pickupSendKitchenBtn = document.getElementById("pickupSendKitchen");
const pickupPhoneInput = document.getElementById("pickupPhoneInput");
const deliveryAddressGroup = document.getElementById("deliveryAddressGroup");
const deliveryAddressInput = document.getElementById("deliveryAddressInput");
const trackerOrderModal = document.getElementById("trackerOrderModal");
const trackerOrderModalTitle = document.getElementById("trackerOrderModalTitle");
const trackerOrderModalBody = document.getElementById("trackerOrderModalBody");
const closeTrackerOrderModal = document.getElementById("closeTrackerOrderModal");
const orderViewPrompt = document.getElementById("orderViewPrompt");
const closeOrderViewPromptBtn = document.getElementById("closeOrderViewPrompt");
const viewOrderPromptYesBtn = document.getElementById("viewOrderPromptYes");
const viewOrderPromptNoBtn = document.getElementById("viewOrderPromptNo");
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
const urlParams = new URLSearchParams(window.location.search);
let pendingLinkedOrderId = urlParams.get("order") || urlParams.get("orderId") || "";
const trackerOrderById = new Map();
const trackerUnsubs = new Map();
const trackerClearTimers = new Map();
let toastTimer = null;
let hnTimeTick = null;
let hnWeatherTick = null;
let weatherState = { loading: true, error: false, temperature: null, weatherCode: null };
let latestSubmittedOrderId = "";
let pendingPromptOrderId = "";
const HONDURAS_TIMEZONE = "America/Tegucigalpa";
const WEATHER_ENDPOINT = "https://api.open-meteo.com/v1/forecast?latitude=15.4012&longitude=-87.8000&current=temperature_2m,weather_code&timezone=America%2FTegucigalpa";
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

function meaningfulText(value) {
  const text = String(value || "").trim();
  return text && text !== "[object Object]" ? text : "";
}

function orderItemTitle(item) {
  const title = item?.title;
  const candidates = [
    title && typeof title === "object" ? title[lang] : "",
    title && typeof title === "object" ? title.es : "",
    title && typeof title === "object" ? title.en : "",
    typeof title === "string" ? title : "",
    item?.name
  ];
  for (const candidate of candidates) {
    const text = meaningfulText(candidate);
    if (text) return text;
  }
  const source = menuItemForOrderItem(item);
  return source?.title?.[lang] || source?.title?.es || source?.title?.en || "Item";
}

function menuItemForOrderItem(item) {
  const byId = menuItems.find((menuItem) => menuItem.id === item?.id || menuItem.id === item?.menu_item_id);
  if (byId) return byId;

  const price = Number(item?.price || item?.unit_price || 0);
  if (!price) return null;
  const samePrice = menuItems.filter((menuItem) => Number(menuItem.price) === price);
  return samePrice.length === 1 ? samePrice[0] : null;
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
  const statusText = escapeHtml(statusLabel(order.status));
  const amountInWords = escapeHtml(amountToWordsEs(order.total).toUpperCase());
  const logoUrl = new URL("assets/casa-brava-logo.jpg", window.location.href).href;
  const itemRows = (order.items || [])
    .map((item) => {
      const title = escapeHtml(orderItemTitle(item));
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
          <p><strong>${lang === "es" ? "PEDIDO" : "ORDER"}:</strong> ${statusText}</p>
          <p><strong>${lang === "es" ? "COMENTARIOS" : "COMMENTS"}:</strong> ${comments}</p>
        </div>
        <div class="header-rule">${lang === "es" ? "CANTIDAD / PRECIO / DESCRIPCION" : "QTY / PRICE / DESCRIPTION"} <span style="float:right;">${lang === "es" ? "TOTAL" : "TOTAL"}</span></div>
        <div>${itemRows}</div>
        <div class="rule"></div>
        <div class="summary">
          <div class="summary-row"><span>${lang === "es" ? "DESCUENTO" : "DISCOUNT"}</span><span>${escapeHtml(money(0))}</span></div>
          <div class="summary-row"><span>${lang === "es" ? "IMPORTE GRAVADO" : "TAXABLE AMOUNT"}</span><span>${escapeHtml(money(order.total))}</span></div>
          <div class="summary-row total"><strong>${lang === "es" ? "TOTAL" : "TOTAL"}</strong><strong>${escapeHtml(money(order.total))}</strong></div>
          <div class="amount-words">${amountInWords}</div>
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

function normalizeReservationArea(value) {
  if (value === "area_climatizada") return "area_climatizada";
  if (value === "area_libre") return "area_libre";
  return "";
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

function normalizeTextForTranslation(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function translateVisibleNoteToEnglish(value) {
  const text = String(value || "").trim();
  if (!text) return "";

  const phrase = normalizeTextForTranslation(text).replace(/[.!?]+$/g, "");
  const phrases = {
    "sin gluten": "Gluten-free",
    "sin lactosa": "Lactose-free",
    "sin azucar": "Sugar-free",
    "bajo en azucar": "Low in sugar",
    "vegetariano": "Vegetarian",
    "vegano": "Vegan",
    "picante": "Spicy",
    "muy picante": "Very spicy",
    "poco picante": "Mildly spicy",
    "recomendado": "Recommended",
    "favorito de la casa": "House favorite",
    "nuevo": "New",
    "producto nuevo": "New item",
    "especial de la casa": "House special",
    "preparado al momento": "Prepared fresh",
    "hecho al momento": "Made fresh",
    "ideal para compartir": "Great for sharing",
    "perfecto para compartir": "Perfect for sharing",
    "por tiempo limitado": "Limited time only",
    "disponible por tiempo limitado": "Available for a limited time",
    "acompanado de papas": "Served with fries",
    "acompanado con papas": "Served with fries",
    "incluye bebida": "Includes a drink"
  };
  if (phrases[phrase]) return phrases[phrase];

  const replacements = [
    [/\bsin\b/gi, "without"],
    [/\bcon\b/gi, "with"],
    [/\by\b/gi, "and"],
    [/\bo\b/gi, "or"],
    [/\bde la casa\b/gi, "house"],
    [/\bcasero\b/gi, "homemade"],
    [/\bcasera\b/gi, "homemade"],
    [/\bfresco\b/gi, "fresh"],
    [/\bfresca\b/gi, "fresh"],
    [/\bnatural\b/gi, "natural"],
    [/\bpicante\b/gi, "spicy"],
    [/\bsuave\b/gi, "mild"],
    [/\bdulce\b/gi, "sweet"],
    [/\bcrujiente\b/gi, "crispy"],
    [/\bcremoso\b/gi, "creamy"],
    [/\bcremosa\b/gi, "creamy"],
    [/\bartesanal\b/gi, "artisanal"],
    [/\brecomendado\b/gi, "recommended"],
    [/\brecomendada\b/gi, "recommended"],
    [/\bnuevo\b/gi, "new"],
    [/\bnueva\b/gi, "new"],
    [/\bespecial\b/gi, "special"],
    [/\bpollo\b/gi, "chicken"],
    [/\bres\b/gi, "beef"],
    [/\bcerdo\b/gi, "pork"],
    [/\bpescado\b/gi, "fish"],
    [/\bmariscos\b/gi, "seafood"],
    [/\bqueso\b/gi, "cheese"],
    [/\bpapas\b/gi, "fries"],
    [/\bensalada\b/gi, "salad"],
    [/\bsalsa\b/gi, "sauce"],
    [/\blimon\b/gi, "lime"],
    [/\blimón\b/gi, "lime"]
  ];

  let translated = text;
  replacements.forEach(([pattern, replacement]) => {
    translated = translated.replace(pattern, replacement);
  });
  return translated.trim();
}

function applyMenuSettings(settings) {
  const overrides = settings?.items && typeof settings.items === "object" ? settings.items : {};
  menuItems.splice(0, menuItems.length, ...BASE_MENU_ITEMS.map((baseItem) => {
    const override = overrides[baseItem.id] || {};
    const price = Number(override.price);
    const note = override.note && typeof override.note === "object" ? override.note : {};
    const noteEs = String(note.es || note.en || "").trim();
    return {
      ...baseItem,
      title: { ...baseItem.title },
      price: Number.isFinite(price) && price >= 0 ? price : baseItem.price,
      note: {
        es: noteEs,
        en: translateVisibleNoteToEnglish(noteEs)
      },
      isNew: Boolean(override.isNew),
      isSoldOut: Boolean(override.isSoldOut)
    };
  }));
}

function syncCartWithMenu() {
  let changed = false;
  cart = cart
    .map((row) => {
      const item = menuItems.find((menuItem) => menuItem.id === row.id);
      if (!item) return row;
      if (
        row.price === item.price &&
        row.title?.es === item.title.es &&
        row.title?.en === item.title.en &&
        Boolean(row.isSoldOut) === Boolean(item.isSoldOut)
      ) return row;
      changed = true;
      return {
        ...row,
        title: item.title,
        price: item.price,
        image: item.image,
        category: item.category,
        isSoldOut: Boolean(item.isSoldOut)
      };
    });
  if (changed) write(STORAGE.cart, cart);
}

function startMenuSettingsSync() {
  return listenMenuSettings((settings) => {
    applyMenuSettings(settings);
    syncCartWithMenu();
    renderMenu();
    renderCart();
  });
}

function renderMenu() {
  const items = filteredMenu();
  menuGrid.innerHTML = items
    .map((item) => `
      <article class="menu-card ${item.isSoldOut ? "is-sold-out" : ""}">
        <figure class="menu-photo-wrap">
          <img class="menu-photo" src="${itemImage(item)}" alt="${item.title[lang]}" loading="lazy" onerror="this.onerror=null;this.src='assets/postres.svg';">
        </figure>
        ${item.isNew ? `<div class="menu-badges">
          ${item.isNew ? `<span class="menu-new-badge">${t("menuNewBadge")}</span>` : ""}
        </div>` : ""}
        <h3>${item.title[lang]}</h3>
        <p class="menu-category">${categoryLabel(item.category)}</p>
        ${item.note?.[lang] ? `<p class="menu-note">${escapeHtml(item.note[lang])}</p>` : ""}
        <div class="meta">
          <span class="price">${money(item.price)}</span>
          <button class="btn ${item.isSoldOut ? "btn-outline menu-add-soldout" : "btn-primary"} add-item" data-id="${item.id}" data-sold-out="${item.isSoldOut ? "true" : "false"}">${item.isSoldOut ? t("menuSoldOutAction") : t("add")}</button>
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
  closePickupDetailsModal();
  closeInvoiceDetailsModal();
  hideOrderViewPrompt();
}

function selectedOrderFulfillment() {
  return orderFulfillmentSelect?.value || document.querySelector('input[name="orderFulfillment"]:checked')?.value || "dine_in";
}

function setOrderFulfillment(value = "dine_in") {
  if (orderFulfillmentSelect) orderFulfillmentSelect.value = value;
  const field = document.querySelector(`input[name="orderFulfillment"][value="${value}"]`);
  if (field) field.checked = true;
  syncOrderTypeFields();
}

function needsOrderDetailsStep() {
  return ["takeaway", "delivery"].includes(selectedOrderFulfillment());
}

function syncOrderTypeFields() {
  const isDineIn = selectedOrderFulfillment() === "dine_in";
  orderTableGroup?.classList.toggle("hidden", !isDineIn);
  if (!isDineIn && orderTableNumberInput) orderTableNumberInput.value = "";
  if (deliveryAddressGroup) {
    deliveryAddressGroup.classList.toggle("hidden", selectedOrderFulfillment() !== "delivery");
  }
}

function openPickupDetailsModal() {
  const fulfillment = selectedOrderFulfillment();
  const isDelivery = fulfillment === "delivery";
  if (pickupPhoneInput) {
    pickupPhoneInput.value = localStorage.getItem(STORAGE.lastPickupPhone) || "";
  }
  if (deliveryAddressGroup) deliveryAddressGroup.classList.toggle("hidden", !isDelivery);
  if (deliveryAddressInput && !isDelivery) deliveryAddressInput.value = "";
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
  if (selectedOrderFulfillment() === "delivery" && !String(deliveryAddressInput?.value || "").trim()) {
    showToast(t("needDeliveryAddress"));
    return false;
  }
  const mainPhoneInput = document.getElementById("orderCustomerPhone");
  if (mainPhoneInput) mainPhoneInput.value = phoneValue;
  localStorage.setItem(STORAGE.lastPickupPhone, phoneValue);
  return true;
}

async function sendCurrentOrderToKitchen(options = {}) {
  const sent = await submitOrderToKitchen({ showConfirmation: false, ...options });
  if (sent) showCenterNotice(t("orderSentNotice"), 4200);
}

function openInvoiceDetailsModal() {
  const fulfillment = selectedOrderFulfillment();
  const needsContactPhone = fulfillment === "takeaway" || fulfillment === "delivery";
  const needsDeliveryAddress = fulfillment === "delivery";
  if (invoicePhoneGroup) invoicePhoneGroup.classList.toggle("hidden", !needsContactPhone);
  if (invoicePickupPhoneInput && needsContactPhone) {
    invoicePickupPhoneInput.value =
      (pickupPhoneInput?.value || "").trim() ||
      localStorage.getItem(STORAGE.lastPickupPhone) ||
      "";
  }
  if (invoiceDeliveryAddressGroup) invoiceDeliveryAddressGroup.classList.toggle("hidden", !needsDeliveryAddress);
  if (invoiceDeliveryAddressInput) {
    invoiceDeliveryAddressInput.value = needsDeliveryAddress ? (deliveryAddressInput?.value || "").trim() : "";
  }
  invoiceDetailsModal?.classList.remove("hidden");
}

function closeInvoiceDetailsModal() {
  invoiceDetailsModal?.classList.add("hidden");
}

function syncInvoicePickupPhone() {
  const fulfillment = selectedOrderFulfillment();
  if (fulfillment !== "takeaway" && fulfillment !== "delivery") return true;
  const phoneValue = (invoicePickupPhoneInput?.value || "").trim();
  if (!phoneValue) {
    showToast(t("needPickupPhone"));
    return false;
  }
  if (pickupPhoneInput) pickupPhoneInput.value = phoneValue;
  localStorage.setItem(STORAGE.lastPickupPhone, phoneValue);

  if (fulfillment === "delivery") {
    const addressValue = (invoiceDeliveryAddressInput?.value || "").trim();
    if (!addressValue) {
      showToast(t("needDeliveryAddress"));
      return false;
    }
    if (deliveryAddressInput) deliveryAddressInput.value = addressValue;
  }
  return true;
}

async function handleInvoiceCheckout() {
  if (!syncInvoicePickupPhone()) return;
  const customer = validateCustomerForOrder({ requireInvoiceDetails: true });
  if (!customer) return;
  closeInvoiceDetailsModal();
  await sendCurrentOrderToKitchen();
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

function showOrderViewPrompt(orderId) {
  if (!orderId || !orderViewPrompt) return;
  latestSubmittedOrderId = orderId;
  orderViewPrompt.classList.remove("hidden");
}

function hideOrderViewPrompt() {
  orderViewPrompt?.classList.add("hidden");
}

function viewSubmittedOrder(orderId = latestSubmittedOrderId) {
  if (!orderId) return;
  const order = trackerOrderById.get(orderId);
  hideOrderViewPrompt();
  if (order) {
    tracker?.scrollIntoView({ behavior: "smooth", block: "center" });
    requestAnimationFrame(() => openTrackerOrderModal(orderId));
    return;
  }
  pendingPromptOrderId = orderId;
  showToast(t("orderLoading"), { duration: 1600, highlight: true });
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
    pickupSendKitchenBtn,
    invoiceDetailsContinueBtn
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

function clearLinkedOrderUrl() {
  if (!pendingLinkedOrderId) return;
  const url = new URL(window.location.href);
  url.searchParams.delete("order");
  url.searchParams.delete("orderId");
  url.searchParams.delete("notificationOpen");
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, "", nextUrl || "/");
}

function openLinkedTrackerOrderIfReady(orderId) {
  if (!pendingLinkedOrderId || pendingLinkedOrderId !== orderId || !trackerOrderById.has(orderId)) return;
  tracker?.scrollIntoView({ behavior: "smooth", block: "center" });
  requestAnimationFrame(() => {
    openTrackerOrderModal(orderId);
    clearLinkedOrderUrl();
    pendingLinkedOrderId = "";
  });
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
  if (item.isSoldOut) {
    showToast(`${item.title[lang]} ${t("menuSoldOutToast")}`, { highlight: true, duration: 2000 });
    return;
  }
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
          <div class="qty-stepper" aria-label="Cantidad">
            <button class="btn btn-outline qty" data-id="${row.id}" data-delta="-1" aria-label="Reducir cantidad">-</button>
            <strong class="cart-qty-value">${row.qty}</strong>
            <button class="btn btn-outline qty" data-id="${row.id}" data-delta="1" aria-label="Aumentar cantidad">+</button>
          </div>
          <button class="cart-remove-icon remove" data-id="${row.id}" title="${escapeHtml(t("remove"))}" aria-label="${escapeHtml(`${t("remove")} ${row.title[lang]}`)}">
            <span aria-hidden="true">&times;</span>
          </button>
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
      const orderTypeLine = orderFulfillmentLabel(order);
      return `
        <div class="tracker-row">
          <strong>${t("trackerLabel")}: #${order.displayId || order.id.slice(0, 6)}</strong>
          <p>${order.customer?.name || ""} | ${createdAt.toLocaleString(lang === "es" ? "es-ES" : "en-US")}</p>
          <p><strong>${t("trackerOrderType")}:</strong> ${escapeHtml(orderTypeLine)}</p>
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
  const rejectedHelp = order.status === "rejected"
    ? `
      <div class="tracker-rejected-help">
        <strong>${t("trackerRejectedHelpTitle")}</strong>
        <p>${t("trackerRejectedHelpText")}</p>
        <div class="tracker-rejected-help-actions">
          <a class="btn btn-primary tracker-rejected-help-btn" href="tel:+50431984734">${t("trackerRejectedHelpAction")}</a>
          <a class="btn btn-outline tracker-rejected-help-btn tracker-rejected-help-wa" href="https://wa.me/50431984734" target="_blank" rel="noopener noreferrer">${t("trackerRejectedHelpWhatsApp")}</a>
        </div>
      </div>
    `
    : "";
  trackerOrderModalTitle.textContent = `${t("trackerModalTitle")} #${order.displayId || order.id.slice(0, 6)}`;
  trackerOrderModalBody.innerHTML = `
    <p><strong>${t("trackerCustomer")}:</strong> ${escapeHtml(order.customer?.name || "")}</p>
    <p><strong>${t("trackerDate")}:</strong> ${escapeHtml((asDate(order.createdAt) || new Date()).toLocaleString(lang === "es" ? "es-ES" : "en-US"))}</p>
    <p><strong>${t("trackerOrderType")}:</strong> ${escapeHtml(orderFulfillmentLabel(order))}</p>
    ${orderDeliveryAddressLine(order)}
    <p><strong>${t("trackerStatus")}:</strong> ${escapeHtml(statusLabel(order.status))}</p>
    ${rejectedHelp}
    <p><strong>${t("trackerItems")}:</strong></p>
    <ul>
      ${(order.items || [])
        .map((item) => `<li>${escapeHtml(orderItemTitle(item))} x ${Number(item.qty || 0)} (${escapeHtml(money(item.price))})</li>`)
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
      if (pendingPromptOrderId === orderId) {
        pendingPromptOrderId = "";
        viewSubmittedOrder(orderId);
      }
      openLinkedTrackerOrderIfReady(orderId);
    },
    () => {
      trackerOrderById.delete(orderId);
      renderTracker();
    },
    { intervalMs: 7000, hiddenIntervalMs: 20000 }
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

function orderFulfillmentLabel(order) {
  const type = String(order?.order_type || order?.orderType || "").trim();
  if (type === "delivery" || order?.customer?.delivery) return t("trackerDelivery");
  if (type === "takeaway" || order?.customer?.pickup) return t("trackerToGo");
  return t("trackerDineIn");
}

function orderDeliveryAddressLine(order) {
  const type = String(order?.order_type || order?.orderType || "").trim();
  const isDelivery = type === "delivery" || order?.customer?.delivery;
  const address = String(order?.customer?.deliveryAddress || "").trim();
  return isDelivery && address ? `<p><strong>${t("deliveryAddressLabel")}:</strong> ${escapeHtml(address)}</p>` : "";
}

function buildOrderProcessingDetails() {
  return {
    method: "in_store",
    status: "unpaid",
    provider: "in_store"
  };
}

function validateCustomerForOrder(options = {}) {
  const { requireInvoiceDetails = true } = options;
  const customerName = (document.getElementById("orderCustomerName").value || "").trim();
  const customerComments = (document.getElementById("orderCustomerComments")?.value || "").trim();
  const fulfillment = selectedOrderFulfillment();
  const customerPickup = fulfillment === "takeaway";
  const customerDelivery = fulfillment === "delivery";
  const tableNumber = fulfillment === "dine_in" ? (orderTableNumberInput?.value || "").trim() : "";
  const deliveryAddress = ((deliveryAddressInput?.value || "") || (invoiceDeliveryAddressInput?.value || "")).trim();
  const customerPhone = (
    document.getElementById("orderCustomerPhone")?.value ||
    (needsOrderDetailsStep() ? invoicePickupPhoneInput?.value : "") ||
    (needsOrderDetailsStep() ? pickupPhoneInput?.value : "") ||
    (needsOrderDetailsStep() ? localStorage.getItem(STORAGE.lastPickupPhone) : "") ||
    ""
  ).trim();
  const needsInvoice = Boolean(document.getElementById("orderNeedInvoice")?.checked);
  const businessName = (document.getElementById("orderBusinessName")?.value || "").trim();
  const businessRTN = (document.getElementById("orderBusinessRTN")?.value || "").trim();
  if (!customerName) {
    showToast(t("needCustomer"));
    return null;
  }
  if (fulfillment === "dine_in" && !tableNumber) {
    showToast(t("needTableNumber"));
    return null;
  }
  if (customerDelivery && requireInvoiceDetails && !deliveryAddress) {
    showToast(t("needDeliveryAddress"));
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
    fulfillment,
    tableNumber,
    customerPickup,
    customerDelivery,
    deliveryAddress,
    needsInvoice,
    businessName,
    businessRTN
  };
}

async function submitOrderToKitchen(options = {}) {
  const { showConfirmation = true } = options;
  if (!cart.length) return false;
  if (isSubmittingOrder) return false;
  const customer = validateCustomerForOrder();
  if (!customer) return false;
  isSubmittingOrder = true;
  setCheckoutBusy(true);

  const orderPayload = {
    language: lang,
    order_type: customer.fulfillment,
    customer: {
      name: customer.customerName,
      phone: customer.customerPhone,
      table: customer.tableNumber,
      comments: customer.customerComments,
      pickup: customer.customerPickup,
      delivery: customer.customerDelivery,
      deliveryAddress: customer.deliveryAddress
    },
    items: cart,
    total: cart.reduce((sum, row) => sum + row.qty * row.price, 0),
    payment: buildOrderProcessingDetails(),
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
    finishSuccessfulOrder(orderId, showConfirmation, customer.customerPhone);
    return true;
  } catch (_e) {
    showToast(t("orderError"));
    return false;
  } finally {
    isSubmittingOrder = false;
    setCheckoutBusy(false);
  }
}

function finishSuccessfulOrder(orderId, showConfirmation, customerPhone) {
  addRecentOrderId(orderId);
  latestSubmittedOrderId = orderId;
  cart = [];
  write(STORAGE.cart, cart);
  renderCart();
  const commentsField = document.getElementById("orderCustomerComments");
  if (commentsField) commentsField.value = "";
  setOrderFulfillment("dine_in");
  if (orderTableNumberInput) orderTableNumberInput.value = "";
  if (pickupPhoneInput) pickupPhoneInput.value = "";
  if (invoicePickupPhoneInput) invoicePickupPhoneInput.value = "";
  if (deliveryAddressInput) deliveryAddressInput.value = "";
  if (invoiceDeliveryAddressInput) invoiceDeliveryAddressInput.value = "";
  if (deliveryAddressGroup) deliveryAddressGroup.classList.add("hidden");
  if (invoiceDeliveryAddressGroup) invoiceDeliveryAddressGroup.classList.add("hidden");
  if (invoicePhoneGroup) invoicePhoneGroup.classList.add("hidden");
  const needInvoiceField = document.getElementById("orderNeedInvoice");
  if (needInvoiceField) needInvoiceField.checked = false;
  const businessNameField = document.getElementById("orderBusinessName");
  if (businessNameField) businessNameField.value = "";
  const businessRTNField = document.getElementById("orderBusinessRTN");
  if (businessRTNField) businessRTNField.value = "";
  const invoiceFieldsBox = document.getElementById("orderInvoiceFields");
  if (invoiceFieldsBox) invoiceFieldsBox.classList.add("hidden");
  closeDrawer();
  if (showConfirmation) {
    showCenterNotice(t("orderSentNotice"));
  }
  window.setTimeout(() => {
    if (latestSubmittedOrderId === orderId) showOrderViewPrompt(orderId);
  }, 900);
  activateOrderNotifications(orderId, customerPhone);
}

async function submitReservation(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(reservationForm).entries());
  if (!data.name || !data.phone || !data.date || !data.time || !data.party || !data.reservationArea) {
    reservationForm.reportValidity();
    return;
  }

  data.reservationArea = normalizeReservationArea(data.reservationArea);

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

  const scrollToTarget = (behavior = "smooth") => {
    const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
    const visualTarget = hash === "#menu"
      ? document.querySelector("#menu .section-head p") || target
      : target;
    const extraOffset = hash === "#menu" ? -10 : hash === "#pedido" ? -6 : hash === "#reservas" ? 0 : 28;
    const top = visualTarget.getBoundingClientRect().top + window.scrollY - headerHeight - extraOffset;
    window.scrollTo({
      top: Math.max(0, top),
      behavior
    });
  };

  scrollToTarget();
  if (hash === "#menu") {
    window.setTimeout(() => scrollToTarget("smooth"), 180);
    window.setTimeout(() => scrollToTarget("auto"), 520);
  }
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
  if (customer.needsInvoice) {
    openInvoiceDetailsModal();
    return;
  }
  if (needsOrderDetailsStep()) {
    openPickupDetailsModal();
    return;
  }
  sendCurrentOrderToKitchen();
});
closePickupDetailsBtn?.addEventListener("click", () => {
  setOrderFulfillment("dine_in");
  closePickupDetailsModal();
});
pickupDetailsBackBtn?.addEventListener("click", () => {
  setOrderFulfillment("dine_in");
  closePickupDetailsModal();
});
async function handlePickupCheckout() {
  if (!applyPickupPhoneFromModal()) return;
  closePickupDetailsModal();
  const customer = validateCustomerForOrder({ requireInvoiceDetails: false });
  if (!customer) return;
  if (customer.needsInvoice) {
    openInvoiceDetailsModal();
    return;
  }
  await sendCurrentOrderToKitchen();
}

pickupSendKitchenBtn?.addEventListener("click", () => {
  handlePickupCheckout();
});
closeInvoiceDetailsBtn?.addEventListener("click", () => {
  closeInvoiceDetailsModal();
});
invoiceDetailsBackBtn?.addEventListener("click", () => {
  closeInvoiceDetailsModal();
});
invoiceDetailsContinueBtn?.addEventListener("click", () => {
  handleInvoiceCheckout();
});
orderNeedInvoiceCheckbox?.addEventListener("change", () => {
  if (orderNeedInvoiceCheckbox.checked) return;
  const businessNameField = document.getElementById("orderBusinessName");
  const businessRTNField = document.getElementById("orderBusinessRTN");
  if (businessNameField) businessNameField.value = "";
  if (businessRTNField) businessRTNField.value = "";
  closeInvoiceDetailsModal();
});
orderFulfillmentSelect?.addEventListener("change", () => {
  if (selectedOrderFulfillment() === "dine_in") closePickupDetailsModal();
  syncOrderTypeFields();
});
document.querySelectorAll('input[name="orderFulfillment"]').forEach((field) => {
  field.addEventListener("change", () => {
    if (selectedOrderFulfillment() === "dine_in") closePickupDetailsModal();
    syncOrderTypeFields();
  });
});
pickupDetailsModal?.addEventListener("click", (event) => {
  if (event.target === pickupDetailsModal) {
    setOrderFulfillment("dine_in");
    closePickupDetailsModal();
  }
});
invoiceDetailsModal?.addEventListener("click", (event) => {
  if (event.target === invoiceDetailsModal) {
    closeInvoiceDetailsModal();
  }
});
closeOrderViewPromptBtn?.addEventListener("click", hideOrderViewPrompt);
viewOrderPromptNoBtn?.addEventListener("click", hideOrderViewPrompt);
viewOrderPromptYesBtn?.addEventListener("click", () => {
  viewSubmittedOrder();
});
orderViewPrompt?.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hideOrderViewPrompt();
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
reservationForm.addEventListener("submit", submitReservation);

recentOrderIds = readRecentOrderIds();
if (!recentOrderIds.length) {
  const existingLastOrderId = localStorage.getItem(STORAGE.lastOrderId);
  if (existingLastOrderId) {
    recentOrderIds = [existingLastOrderId];
    writeRecentOrderIds(recentOrderIds);
  }
}
if (pendingLinkedOrderId) addRecentOrderId(pendingLinkedOrderId);
syncTrackerSubscriptions();
syncOrderTypeFields();
applyI18n();
startMenuSettingsSync();
startHondurasLiveInfo();
