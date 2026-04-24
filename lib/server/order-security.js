"use strict";

const fs = require("fs");
const path = require("path");

const { httpError } = require("./http");
const { initialOrderStatus, supabaseFetch } = require("./supabase");

const MENU_SETTINGS_KEY = "menu_settings";
const FISCAL_SETTINGS_KEY = "fiscal_invoice";
const MENU_DATA_PATH = path.join(__dirname, "../../js/menu-data.js");

const DEFAULT_FISCAL_SETTINGS = {
  taxRate: 0.15,
  categoryRates: {
    appetizers: 0.15,
    main_courses: 0.15,
    beverages: 0.15,
    desserts: 0.15
  }
};

const STAFF_PAYMENT_METHODS = new Set([
  "cash",
  "card",
  "bank_transfer",
  "pedidos_ya",
  "cash_on_pickup",
  "online",
  "paypal"
]);

const STAFF_PAYMENT_STATUSES = new Set(["unpaid", "pending", "paid"]);

let cachedBaseMenuItems = null;

function roundMoney(value) {
  const amount = Number(value || 0);
  return Math.round(amount * 100) / 100;
}

function cleanText(value, maxLength = 300) {
  return String(value || "").trim().slice(0, maxLength);
}

function meaningfulFoodText(value) {
  const text = String(value || "").trim();
  return text && text !== "[object Object]" ? text : "";
}

function normalizeTitle(title, fallback = "Item") {
  if (title && typeof title === "object") {
    const es = meaningfulFoodText(title.es);
    const en = meaningfulFoodText(title.en);
    return {
      es: es || en || fallback,
      en: en || es || fallback
    };
  }

  const text = meaningfulFoodText(title) || fallback;
  return { es: text, en: text };
}

function loadBaseMenuItems() {
  if (cachedBaseMenuItems) return cachedBaseMenuItems;

  let loaded = null;
  try {
    const directModule = require(MENU_DATA_PATH);
    if (Array.isArray(directModule?.BASE_MENU_ITEMS)) {
      loaded = directModule.BASE_MENU_ITEMS;
    }
  } catch (_error) {
    loaded = null;
  }

  if (!loaded) {
    const source = fs.readFileSync(MENU_DATA_PATH, "utf8");
    const match = source.match(/const BASE_MENU_ITEMS = (\[[\s\S]*?\]);\s*export\s*\{/);
    if (!match) {
      throw httpError(500, "menu_catalog_unavailable", "The server menu catalog could not be loaded.");
    }
    loaded = Function(`"use strict"; return (${match[1]});`)();
  }

  if (!Array.isArray(loaded)) {
    throw httpError(500, "menu_catalog_invalid", "The server menu catalog is invalid.");
  }

  cachedBaseMenuItems = loaded
    .filter((item) => item && item.id)
    .map((item) => {
      const title = normalizeTitle(item.title, String(item.id));
      return {
        id: String(item.id),
        category: cleanText(item.category, 60) || "main_courses",
        title,
        name: title.es || title.en || String(item.id),
        price: roundMoney(item.price)
      };
    });

  return cachedBaseMenuItems;
}

async function loadMenuCatalog() {
  const baseItems = loadBaseMenuItems();
  const rows = await supabaseFetch(`/rest/v1/app_settings?key=eq.${MENU_SETTINGS_KEY}&select=value&limit=1`, {
    admin: true,
    prefer: "return=representation"
  });

  const overrides = Array.isArray(rows) && rows[0] && rows[0].value && typeof rows[0].value === "object"
    ? rows[0].value.items || {}
    : {};

  const catalog = new Map();
  baseItems.forEach((baseItem) => {
    const override = overrides[baseItem.id] && typeof overrides[baseItem.id] === "object"
      ? overrides[baseItem.id]
      : {};
    const overridePrice = Number(override.price);
    catalog.set(baseItem.id, {
      ...baseItem,
      price: Number.isFinite(overridePrice) && overridePrice >= 0 ? roundMoney(overridePrice) : baseItem.price,
      isSoldOut: Boolean(override.isSoldOut)
    });
  });

  return catalog;
}

function mergeFiscalSettings(remoteSettings = {}) {
  const categoryRates = remoteSettings && typeof remoteSettings.categoryRates === "object"
    ? remoteSettings.categoryRates
    : {};

  return {
    ...DEFAULT_FISCAL_SETTINGS,
    ...remoteSettings,
    taxRate: Number.isFinite(Number(remoteSettings.taxRate))
      ? Number(remoteSettings.taxRate)
      : DEFAULT_FISCAL_SETTINGS.taxRate,
    categoryRates: {
      ...DEFAULT_FISCAL_SETTINGS.categoryRates,
      ...categoryRates,
      appetizers: Number.isFinite(Number(categoryRates.appetizers))
        ? Number(categoryRates.appetizers)
        : DEFAULT_FISCAL_SETTINGS.categoryRates.appetizers,
      main_courses: Number.isFinite(Number(categoryRates.main_courses))
        ? Number(categoryRates.main_courses)
        : DEFAULT_FISCAL_SETTINGS.categoryRates.main_courses,
      beverages: Number.isFinite(Number(categoryRates.beverages))
        ? Number(categoryRates.beverages)
        : DEFAULT_FISCAL_SETTINGS.categoryRates.beverages,
      desserts: Number.isFinite(Number(categoryRates.desserts))
        ? Number(categoryRates.desserts)
        : DEFAULT_FISCAL_SETTINGS.categoryRates.desserts
    }
  };
}

async function loadFiscalSettings() {
  const rows = await supabaseFetch(`/rest/v1/app_settings?key=eq.${FISCAL_SETTINGS_KEY}&select=value&limit=1`, {
    admin: true,
    prefer: "return=representation"
  });
  const settings = Array.isArray(rows) && rows[0] ? rows[0].value || {} : {};
  return mergeFiscalSettings(settings);
}

function normalizeOrderItems(items, catalog, options = {}) {
  if (!Array.isArray(items) || !items.length) {
    throw httpError(400, "missing_items", "At least one order item is required.");
  }

  return items.map((item) => {
    const menuItemId = cleanText(item?.menu_item_id || item?.menuItemId || item?.id, 60);
    const menuItem = menuItemId ? catalog.get(menuItemId) : null;
    if (!menuItem) {
      throw httpError(400, "invalid_item", "One or more items are no longer available.");
    }
    if (menuItem.isSoldOut && !options.allowSoldOut) {
      throw httpError(409, "sold_out_item", `${menuItem.name} is currently sold out.`);
    }

    const quantity = Math.max(1, Math.min(100, Math.round(Number(item?.quantity || item?.qty || 1) || 1)));
    const name = menuItem.name;
    const unitPrice = roundMoney(menuItem.price);
    return {
      menu_item_id: menuItem.id,
      name,
      quantity,
      unit_price: unitPrice,
      total: roundMoney(unitPrice * quantity),
      notes: cleanText(item?.notes, 300) || null,
      category: menuItem.category
    };
  });
}

function resolveItemTaxRate(item, fiscalSettings) {
  const categoryRate = fiscalSettings?.categoryRates?.[item?.category];
  if (typeof categoryRate === "number" && Number.isFinite(categoryRate)) return categoryRate;
  return typeof fiscalSettings?.taxRate === "number" && Number.isFinite(fiscalSettings.taxRate)
    ? fiscalSettings.taxRate
    : 0;
}

function buildOrderAmounts(items, fiscalSettings, deliveryFee = 0) {
  const grossItemsTotal = roundMoney(items.reduce((sum, item) => sum + Number(item.total || 0), 0));
  const tax = roundMoney(items.reduce((sum, item) => {
    const gross = roundMoney(Number(item.total || Number(item.unit_price || 0) * Number(item.quantity || 0)));
    const taxRate = resolveItemTaxRate(item, fiscalSettings);
    if (!taxRate) return sum;
    const taxableBase = roundMoney(gross / (1 + taxRate));
    return sum + roundMoney(gross - taxableBase);
  }, 0));
  const subtotal = roundMoney(grossItemsTotal - tax);
  const normalizedDeliveryFee = roundMoney(Math.max(0, Number(deliveryFee || 0)));

  return {
    subtotal,
    tax,
    deliveryFee: normalizedDeliveryFee,
    total: roundMoney(grossItemsTotal + normalizedDeliveryFee)
  };
}

function normalizePaymentMethod(value, options = {}) {
  const normalized = cleanText(value, 40).toLowerCase();
  if (options.staff) {
    if (!normalized) return options.defaultValue || "cash";
    if (normalized === "in_store") return "cash_on_pickup";
    return STAFF_PAYMENT_METHODS.has(normalized) ? normalized : (options.defaultValue || "cash");
  }

  if (normalized === "online") return "online";
  return "cash_on_pickup";
}

function normalizePaymentStatus(value, paymentMethod, options = {}) {
  const normalized = cleanText(value, 40).toLowerCase();
  if (options.staff) {
    if (!normalized) return options.defaultValue || "unpaid";
    return STAFF_PAYMENT_STATUSES.has(normalized) ? normalized : (options.defaultValue || "unpaid");
  }

  return paymentMethod === "online" ? "pending" : "unpaid";
}

function normalizeInvoice(invoice) {
  if (!invoice || typeof invoice !== "object") return null;

  return {
    billingName: cleanText(invoice.billingName, 140),
    billingRTN: cleanText(invoice.billingRTN, 40),
    invoiceNumber: cleanText(invoice.invoiceNumber, 40),
    notes: cleanText(invoice.notes, 300),
    hasExoneration: Boolean(invoice.hasExoneration),
    exemptionRegister: cleanText(invoice.exemptionRegister, 80),
    exemptOrderNumber: cleanText(invoice.exemptOrderNumber, 80),
    sagRegister: cleanText(invoice.sagRegister, 80)
  };
}

function buildStoredOrder(body, options = {}) {
  const staff = options.staff || null;
  const orderType = cleanText(body.order_type || body.orderType, 40);
  const customerName = cleanText(body.customer_name || body.customerName || body.name, 140);
  if (!customerName) {
    throw httpError(400, "missing_customer", "Customer name is required.");
  }

  const paymentMethod = normalizePaymentMethod(body.payment_method || body.paymentMethod, {
    staff: Boolean(staff),
    defaultValue: staff ? "cash" : "cash_on_pickup"
  });
  const paymentStatus = normalizePaymentStatus(body.payment_status || body.paymentStatus, paymentMethod, {
    staff: Boolean(staff),
    defaultValue: paymentMethod === "online" ? "pending" : "unpaid"
  });
  const deliveryFee = staff ? roundMoney(Math.max(0, Number(body.delivery_fee || body.deliveryFee || 0))) : 0;

  const deliveryAddress = cleanText(body.delivery_address || body.deliveryAddress || body.address, 220) || null;
  const customerPhone = cleanText(body.customer_phone || body.customerPhone || body.phone, 40) || null;
  if (orderType === "delivery" && !deliveryAddress) {
    throw httpError(400, "missing_delivery_address", "Delivery address is required.");
  }
  if (!staff && (orderType === "delivery" || orderType === "takeaway") && !customerPhone) {
    throw httpError(400, "missing_customer_phone", "Customer phone is required for takeaway and delivery orders.");
  }

  return {
    order_type: orderType,
    status: staff && paymentMethod === "pedidos_ya" && paymentStatus === "paid"
      ? "delivered"
      : initialOrderStatus(orderType),
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: cleanText(body.customer_email || body.customerEmail || body.email, 140) || null,
    table_label: cleanText(body.table_label || body.tableLabel || body.table, 60) || null,
    delivery_address: deliveryAddress,
    notes: cleanText(body.notes, 500) || null,
    payment_method: paymentMethod,
    payment_status: paymentStatus,
    invoice: normalizeInvoice(body.invoice),
    delivery_fee: deliveryFee,
    source: "web"
  };
}

function sanitizePublicOrder(order) {
  if (!order) return null;

  return {
    id: order.id,
    display_id: order.display_id || null,
    order_type: order.order_type,
    status: order.status,
    customer_name: order.customer_name || "",
    delivery_address: order.delivery_address || null,
    subtotal: Number(order.subtotal || 0),
    tax: Number(order.tax || 0),
    delivery_fee: Number(order.delivery_fee || 0),
    total: Number(order.total || 0),
    created_at: order.created_at || null,
    updated_at: order.updated_at || null,
    order_items: Array.isArray(order.order_items)
      ? order.order_items.map((item) => ({
          menu_item_id: item.menu_item_id || item.id || null,
          name: item.name || "",
          quantity: Number(item.quantity || 0),
          unit_price: Number(item.unit_price || 0),
          total: Number(item.total || 0)
        }))
      : [],
    order_status_events: Array.isArray(order.order_status_events)
      ? order.order_status_events.map((event) => ({
          status: event.status,
          created_at: event.created_at
        }))
      : []
  };
}

module.exports = {
  buildOrderAmounts,
  buildStoredOrder,
  loadFiscalSettings,
  loadMenuCatalog,
  normalizeOrderItems,
  normalizePaymentMethod,
  normalizePaymentStatus,
  roundMoney,
  sanitizePublicOrder
};
