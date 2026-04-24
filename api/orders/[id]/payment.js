"use strict";

const {
  handleOptions,
  sendJson,
  readJson,
  requireMethod,
  errorPayload,
  getBearerToken,
  httpError
} = require("../../../lib/server/http");
const { supabaseFetch, requireStaff } = require("../../../lib/server/supabase");
const {
  normalizePaymentMethod,
  normalizePaymentStatus
} = require("../../../lib/server/order-security");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["PATCH", "OPTIONS"])) return;

  try {
    requireMethod(req, ["PATCH"]);
    await requireStaff(getBearerToken(req), ["admin", "cashier"]);
    const orderId = req.query.id;
    if (!orderId) throw httpError(400, "missing_order_id", "Missing order id.");

    const body = await readJson(req);
    if (body.payment_status === undefined && body.payment_method === undefined) {
      throw httpError(400, "missing_payment_fields", "Nothing to update.");
    }

    const currentRows = await supabaseFetch(`/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=id,payment_method,payment_status&limit=1`, {
      admin: true,
      prefer: "return=representation"
    });
    const currentOrder = Array.isArray(currentRows) ? currentRows[0] || null : null;
    if (!currentOrder) throw httpError(404, "order_not_found", "Order not found.");

    const patch = { updated_at: new Date().toISOString() };
    const nextPaymentMethod = body.payment_method !== undefined
      ? normalizePaymentMethod(body.payment_method, { staff: true, defaultValue: currentOrder.payment_method || "cash" })
      : (currentOrder.payment_method || "cash");

    if (body.payment_method !== undefined) patch.payment_method = nextPaymentMethod;
    if (body.payment_status !== undefined) {
      patch.payment_status = normalizePaymentStatus(body.payment_status, nextPaymentMethod, {
        staff: true,
        defaultValue: currentOrder.payment_status || "unpaid"
      });
    }

    const updatedRows = await supabaseFetch(`/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      admin: true,
      body: patch
    });

    const order = Array.isArray(updatedRows) ? updatedRows[0] : updatedRows;
    if (!order) throw httpError(404, "order_not_found", "Order not found.");
    sendJson(req, res, 200, { order }, ["PATCH", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, errorPayload(error), ["PATCH", "OPTIONS"]);
  }
};
