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
const {
  buildOrderAmounts,
  loadFiscalSettings,
  loadMenuCatalog,
  normalizeOrderItems,
  sanitizePublicOrder
} = require("../../lib/server/order-security");

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
        const [menuCatalog, fiscalSettings] = await Promise.all([
          loadMenuCatalog(),
          loadFiscalSettings()
        ]);
        const items = normalizePatchItems(body.items, menuCatalog);
        const amounts = buildOrderAmounts(items, fiscalSettings, Number(currentOrder.delivery_fee || 0));
        patch.subtotal = amounts.subtotal;
        patch.tax = amounts.tax;
        patch.total = amounts.total;

        await replaceOrderItemsSafely(orderId, items, currentOrder.order_items);
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

    const staff = await resolveViewingStaff(getBearerToken(req));
    const order = await fetchOrderById(orderId);
    if (!order) throw httpError(404, "order_not_found", "Order not found.");
    if (staff?.role === "kitchen" && order.status !== "preparing") {
      throw httpError(403, "role_denied", "Kitchen can only view orders in preparation.");
    }
    sendJson(req, res, 200, { order: staff ? order : sanitizePublicOrder(order) }, ["GET", "PATCH", "OPTIONS"]);
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

async function resolveViewingStaff(accessToken) {
  if (!accessToken) return null;
  return requireStaff(accessToken, ["admin", "representative", "kitchen", "cashier", "agent"]);
}

function normalizePatchItems(items, menuCatalog) {
  return normalizeOrderItems(items, menuCatalog, { allowSoldOut: true }).map((item) => ({
    menu_item_id: item.menu_item_id,
    name: item.name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total: item.total,
    notes: item.notes
  }));
}

async function replaceOrderItemsSafely(orderId, nextItems, previousItems) {
  const backupItems = Array.isArray(previousItems)
    ? previousItems
      .map((item) => normalizeStoredOrderItem(item, orderId))
      .filter(Boolean)
    : [];

  await supabaseFetch(`/rest/v1/order_items?order_id=eq.${encodeURIComponent(orderId)}`, {
    method: "DELETE",
    admin: true
  });

  try {
    await supabaseFetch("/rest/v1/order_items", {
      method: "POST",
      admin: true,
      body: nextItems.map((item) => ({
        ...item,
        order_id: orderId
      }))
    });
  } catch (error) {
    try {
      if (backupItems.length) {
        await supabaseFetch("/rest/v1/order_items", {
          method: "POST",
          admin: true,
          body: backupItems
        });
      }
    } catch (restoreError) {
      error.details = {
        ...(error.details && typeof error.details === "object" ? error.details : {}),
        rollback_failed: true,
        rollback_message: restoreError?.message || "Rollback failed."
      };
    }
    throw error;
  }
}

function normalizeStoredOrderItem(item, orderId) {
  if (!item) return null;
  return {
    order_id: orderId,
    menu_item_id: item.menu_item_id || item.id || null,
    name: item.name || "",
    quantity: Math.max(1, Math.round(Number(item.quantity || 1))),
    unit_price: Number(item.unit_price || 0),
    total: Number(item.total || 0),
    notes: item.notes || null
  };
}
