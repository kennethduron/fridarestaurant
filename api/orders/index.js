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
      await requireStaff(getBearerToken(req), ["admin", "kitchen", "cashier"]);
      const orders = await supabaseFetch("/rest/v1/orders?select=*,order_items(*),order_status_events(status,created_at)&order=created_at.desc&order_status_events.order=created_at.asc", {
        admin: true,
        prefer: "return=representation"
      });
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
