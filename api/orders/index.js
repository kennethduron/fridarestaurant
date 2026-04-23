"use strict";

const {
  handleOptions,
  sendJson,
  readJson,
  requireMethod,
  errorPayload,
  getBearerToken,
  httpError
} = require("../../lib/server/http");
const {
  supabaseFetch,
  requireStaff,
  initialOrderStatus,
  assertOrderType
} = require("../../lib/server/supabase");
const { sendToTokens } = require("../../lib/server/firebaseAdmin");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["GET", "POST", "OPTIONS"])) return;

  try {
    requireMethod(req, ["GET", "POST"]);

    if (req.method === "GET") {
      const staff = await requireStaff(getBearerToken(req), ["admin", "representative", "kitchen", "cashier", "agent"]);
      const orders = await loadOrdersForQuery(req.query || {}, staff);
      sendJson(req, res, 200, { orders }, ["GET", "POST", "OPTIONS"]);
      return;
    }

    const body = await readJson(req);
    const order = normalizeOrder(body);
    const items = normalizeItems(body.items);

    const inserted = await supabaseFetch("/rest/v1/orders", {
      method: "POST",
      admin: true,
      body: order
    });
    const createdOrder = Array.isArray(inserted) ? inserted[0] : inserted;

    if (items.length) {
      await supabaseFetch("/rest/v1/order_items", {
        method: "POST",
        admin: true,
        body: items.map((item) => ({
          ...item,
          order_id: createdOrder.id
        }))
      });
    }

    await supabaseFetch("/rest/v1/order_status_events", {
      method: "POST",
      admin: true,
      body: {
        order_id: createdOrder.id,
        status: createdOrder.status,
        note: "Order created"
      }
    });

    if (createdOrder.status !== "delivered") {
      await notifyStaffNewOrder(createdOrder).catch(() => null);
    }

    sendJson(req, res, 201, { order: createdOrder }, ["GET", "POST", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, errorPayload(error), ["GET", "POST", "OPTIONS"]);
  }
};

const ORDER_SELECT = "*,order_items(*),order_status_events(status,created_at)";
const AGENT_TIMEZONE = "America/Tegucigalpa";

async function loadOrdersForQuery(query, staff) {
  if (staff && staff.role === "agent") {
    return loadAgentOrders();
  }
  const scope = String(query.scope || "").trim();
  if (scope === "ops") {
    return loadOperationalOrders(query);
  }
  return loadFilteredOrders(query);
}

async function loadAgentOrders() {
  const { startDate, endDate } = currentBusinessDayBounds();
  return fetchOrdersWithFilters({
    startDate,
    endDate
  });
}

async function loadOperationalOrders(query) {
  const recentDays = clampRecentDays(query.recent_days, 120);
  const cutoff = new Date(Date.now() - recentDays * 24 * 60 * 60 * 1000).toISOString();
  const [activeOrders, recentTerminalOrders] = await Promise.all([
    fetchOrdersWithFilters({
      statuses: ["pending", "accepted", "preparing", "ready"]
    }),
    fetchOrdersWithFilters({
      statuses: ["delivered", "rejected"],
      startDate: cutoff
    })
  ]);

  return mergeOrdersById([...activeOrders, ...recentTerminalOrders]);
}

async function loadFilteredOrders(query) {
  const statuses = normalizeStatuses(query.statuses || query.status);
  const paymentMethod = normalizePaymentMethod(query.payment_method || query.paymentMethod);
  const startDate = normalizeDateParam(query.start_date || query.startDate);
  const endDate = normalizeDateParam(query.end_date || query.endDate);
  const limit = normalizeLimit(query.limit);

  return fetchOrdersWithFilters({
    statuses,
    paymentMethod,
    startDate,
    endDate,
    limit
  });
}

async function fetchOrdersWithFilters(filters = {}) {
  const params = [];
  params.push(`select=${encodeURIComponent(ORDER_SELECT)}`);
  params.push("order=created_at.desc");
  params.push("order_status_events.order=created_at.asc");

  const statuses = Array.isArray(filters.statuses) ? filters.statuses.filter(Boolean) : [];
  if (statuses.length === 1) {
    params.push(`status=${encodeURIComponent(`eq.${statuses[0]}`)}`);
  } else if (statuses.length > 1) {
    params.push(`status=${encodeURIComponent(`in.(${statuses.join(",")})`)}`);
  }

  if (filters.paymentMethod) {
    params.push(`payment_method=${encodeURIComponent(`eq.${filters.paymentMethod}`)}`);
  }

  if (filters.startDate) {
    params.push(`created_at=${encodeURIComponent(`gte.${filters.startDate}`)}`);
  }

  if (filters.endDate) {
    params.push(`created_at=${encodeURIComponent(`lte.${filters.endDate}`)}`);
  }

  if (Number.isFinite(filters.limit) && filters.limit > 0) {
    params.push(`limit=${filters.limit}`);
  }

  return supabaseFetch(`/rest/v1/orders?${params.join("&")}`, {
    admin: true,
    prefer: "return=representation"
  });
}

function mergeOrdersById(rows) {
  const byId = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    if (!row || !row.id) return;
    byId.set(row.id, row);
  });
  return Array.from(byId.values()).sort((left, right) => {
    const leftTime = Date.parse(left.created_at || 0) || 0;
    const rightTime = Date.parse(right.created_at || 0) || 0;
    return rightTime - leftTime;
  });
}

function normalizeStatuses(raw) {
  const list = Array.isArray(raw)
    ? raw
    : String(raw || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  return list.filter((status) => /^[a-z_]+$/i.test(status));
}

function normalizePaymentMethod(value) {
  const normalized = String(value || "").trim();
  return /^[a-z_]+$/i.test(normalized) ? normalized : "";
}

function normalizeDateParam(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function clampRecentDays(value, fallback = 120) {
  const days = Number(value);
  if (!Number.isFinite(days) || days <= 0) return fallback;
  return Math.min(Math.max(Math.round(days), 7), 365);
}

function normalizeLimit(value) {
  const limit = Number(value);
  if (!Number.isFinite(limit) || limit <= 0) return 0;
  return Math.min(Math.round(limit), 5000);
}

function currentBusinessDayBounds() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: AGENT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const parts = formatter.formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value || "1970";
  const month = parts.find((part) => part.type === "month")?.value || "01";
  const day = parts.find((part) => part.type === "day")?.value || "01";
  return {
    startDate: new Date(`${year}-${month}-${day}T00:00:00-06:00`).toISOString(),
    endDate: new Date(`${year}-${month}-${day}T23:59:59.999-06:00`).toISOString()
  };
}

function normalizeOrder(body) {
  const orderType = String(body.order_type || body.orderType || "").trim();
  assertOrderType(orderType);

  const customerName = String(body.customer_name || body.customerName || body.name || "").trim();
  const customerPhone = String(body.customer_phone || body.customerPhone || body.phone || "").trim();
  const paymentMethod = String(body.payment_method || body.paymentMethod || "cash").trim();
  const paymentStatus = String(body.payment_status || body.paymentStatus || "unpaid").trim();
  if (!customerName) {
    throw httpError(400, "missing_customer", "Customer name is required.");
  }

  const subtotal = Number(body.subtotal || 0);
  const tax = Number(body.tax || 0);
  const deliveryFee = Number(body.delivery_fee || body.deliveryFee || 0);
  const total = Number(body.total || subtotal + tax + deliveryFee);

  return {
    order_type: orderType,
    status: paymentMethod === "pedidos_ya" && paymentStatus === "paid"
      ? "delivered"
      : initialOrderStatus(orderType),
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: String(body.customer_email || body.customerEmail || body.email || "").trim() || null,
    table_label: String(body.table_label || body.tableLabel || body.table || "").trim() || null,
    delivery_address: String(body.delivery_address || body.deliveryAddress || body.address || "").trim() || null,
    notes: String(body.notes || "").trim() || null,
    subtotal,
    tax,
    delivery_fee: deliveryFee,
    total,
    payment_method: paymentMethod,
    payment_status: paymentStatus,
    invoice: body.invoice || null,
    source: "web"
  };
}

function normalizeItems(items) {
  if (!Array.isArray(items) || !items.length) {
    throw httpError(400, "missing_items", "At least one order item is required.");
  }

  return items.map((item) => {
    const quantity = Number(item.quantity || item.qty || 1);
    const unitPrice = Number(item.unit_price || item.unitPrice || item.price || 0);
    const name = itemDisplayName(item);
    if (!name || quantity <= 0) {
      throw httpError(400, "invalid_item", "Each item needs a name and quantity.");
    }
    return {
      menu_item_id: item.menu_item_id || item.id || null,
      name,
      quantity,
      unit_price: unitPrice,
      total: Number(item.total || unitPrice * quantity),
      notes: item.notes || null
    };
  });
}

function itemDisplayName(item) {
  const directName = String(item.name || "").trim();
  if (directName && directName !== "[object Object]") return directName;
  const title = item.title;
  if (typeof title === "string") {
    const text = title.trim();
    return text === "[object Object]" ? "" : text;
  }
  if (title && typeof title === "object") {
    return String(title.es || title.en || title[Object.keys(title)[0]] || "").trim();
  }
  return "";
}

async function notifyStaffNewOrder(order) {
  const rows = await supabaseFetch("/rest/v1/staff_notification_tokens?active=eq.true&select=token,staff_profile_id,updated_at,created_at&order=updated_at.desc", {
    admin: true,
    prefer: "return=representation"
  });
  const tokens = latestStaffTokens(rows);
  if (!tokens.length) return;

  const orderRef = order.display_id ? `#${order.display_id}` : `#${String(order.id).slice(0, 6)}`;
  const orderLink = `https://fridarestauranthn.web.app/crm.html?order=${encodeURIComponent(order.id)}`;
  await sendToTokens(tokens, {
    title: "Nuevo pedido recibido",
    body: `${orderRef} | ${order.customer_name || "Cliente"} | L ${Number(order.total || 0).toFixed(2)}`,
    link: orderLink,
    data: {
      type: "new_order",
      orderId: order.id,
      status: order.status,
      displayId: order.display_id || ""
    }
  });
}

function latestStaffTokens(rows) {
  const byStaff = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    if (!row || !row.token) return;
    const key = row.staff_profile_id || row.token;
    if (!byStaff.has(key)) byStaff.set(key, row.token);
  });
  return Array.from(new Set(byStaff.values()));
}
