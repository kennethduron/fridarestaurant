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

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["PATCH", "OPTIONS"])) return;

  try {
    requireMethod(req, ["PATCH"]);
    await requireStaff(getBearerToken(req), ["admin", "cashier"]);
    const orderId = req.query.id;
    if (!orderId) throw httpError(400, "missing_order_id", "Missing order id.");

    const body = await readJson(req);
    const patch = { updated_at: new Date().toISOString() };
    if (body.payment_status !== undefined) patch.payment_status = String(body.payment_status || "unpaid");
    if (body.payment_method !== undefined) patch.payment_method = String(body.payment_method || "cash");

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
