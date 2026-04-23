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
const { supabaseFetch, requireStaff } = require("../../lib/server/supabase");

const ORDER_SELECT = "*,order_items(*),order_status_events(status,created_at)";

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["GET", "PATCH", "OPTIONS"])) return;

  try {
    requireMethod(req, ["GET", "PATCH"]);
    const orderId = req.query.id;
    if (!orderId) throw httpError(400, "missing_order_id", "Missing order id.");

    if (req.method === "PATCH") {
      const body = await readJson(req);
      const hasItemsPatch = Array.isArray(body.items);
      const hasCustomerPatch = body.customer_name !== undefined || body.customerName !== undefined || body.name !== undefined;

      if (!hasItemsPatch && !hasCustomerPatch) {
        throw httpError(400, "missing_patch_fields", "Nothing to update.");
      }

      const allowedRoles = hasItemsPatch ? ["admin"] : ["admin", "cashier"];
      await requireStaff(getBearerToken(req), allowedRoles);

      const currentOrder = await fetchOrderById(orderId);
      if (!currentOrder) throw httpError(404, "order_not_found", "Order not found.");

      const patch = { updated_at: new Date().toISOString() };

      if (hasCustomerPatch) {
        const customerName = String(body.customer_name || body.customerName || body.name || "").trim();
        if (!customerName) throw httpError(400, "missing_customer", "Customer name is required.");
        patch.customer_name = customerName;
      }

      if (hasItemsPatch) {
        const items = normalizePatchItems(body.items);
        const subtotal = roundMoney(items.reduce((sum, item) => sum + Number(item.total || 0), 0));
        const tax = Number(currentOrder.tax || 0);
        const deliveryFee = Number(currentOrder.delivery_fee || 0);
        patch.subtotal = subtotal;
        patch.total = roundMoney(subtotal + tax + deliveryFee);

        await supabaseFetch(`/rest/v1/order_items?order_id=eq.${encodeURIComponent(orderId)}`, {
          method: "DELETE",
          admin: true
        });

        await supabaseFetch("/rest/v1/order_items", {
          method: "POST",
          admin: true,
          body: items.map((item) => ({
            ...item,
            order_id: orderId
          }))
        });
      }

      await supabaseFetch(`/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        admin: true,
        body: patch
      });

      const updatedOrder = await fetchOrderById(orderId);
      if (!updatedOrder) throw httpError(404, "order_not_found", "Order not found.");
      sendJson(req, res, 200, { order: updatedOrder }, ["GET", "PATCH", "OPTIONS"]);
      return;
    }

    const order = await fetchOrderById(orderId);
    if (!order) throw httpError(404, "order_not_found", "Order not found.");
    sendJson(req, res, 200, { order }, ["GET", "PATCH", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, errorPayload(error), ["GET", "PATCH", "OPTIONS"]);
  }
};

async function fetchOrderById(orderId) {
  const rows = await supabaseFetch(`/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=${encodeURIComponent(ORDER_SELECT)}&order_status_events.order=created_at.asc&limit=1`, {
    admin: true,
    prefer: "return=representation"
  });
  return Array.isArray(rows) ? rows[0] || null : null;
}

function normalizePatchItems(items) {
  if (!Array.isArray(items) || !items.length) {
    throw httpError(400, "missing_items", "At least one order item is required.");
  }

  return items.map((item) => {
    const quantity = Math.max(1, Math.round(Number(item.quantity || item.qty || 1)));
    const unitPrice = Number(item.unit_price || item.unitPrice || item.price || 0);
    const name = itemDisplayName(item);
    if (!name) {
      throw httpError(400, "invalid_item", "Each item needs a valid name.");
    }
    return {
      menu_item_id: item.menu_item_id || item.menuItemId || item.id || null,
      name,
      quantity,
      unit_price: roundMoney(unitPrice),
      total: roundMoney(Number(item.total || unitPrice * quantity)),
      notes: item.notes ? String(item.notes).trim() : null
    };
  });
}

function itemDisplayName(item) {
  const directName = String(item?.name || "").trim();
  if (directName && directName !== "[object Object]") return directName;
  const title = item?.title;
  if (typeof title === "string") {
    const text = title.trim();
    return text === "[object Object]" ? "" : text;
  }
  if (title && typeof title === "object") {
    return String(title.es || title.en || title[Object.keys(title)[0]] || "").trim();
  }
  return "";
}

function roundMoney(value) {
  const amount = Number(value || 0);
  return Math.round(amount * 100) / 100;
}
