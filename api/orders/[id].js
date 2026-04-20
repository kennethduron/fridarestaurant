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

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["GET", "PATCH", "OPTIONS"])) return;

  try {
    requireMethod(req, ["GET", "PATCH"]);
    const orderId = req.query.id;
    if (!orderId) throw httpError(400, "missing_order_id", "Missing order id.");

    if (req.method === "PATCH") {
      await requireStaff(getBearerToken(req), ["admin", "cashier"]);
      const body = await readJson(req);
      const customerName = String(body.customer_name || body.customerName || body.name || "").trim();
      if (!customerName) throw httpError(400, "missing_customer", "Customer name is required.");

      const updatedRows = await supabaseFetch(`/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        admin: true,
        body: {
          customer_name: customerName,
          updated_at: new Date().toISOString()
        }
      });

      const updatedOrder = Array.isArray(updatedRows) ? updatedRows[0] || null : updatedRows;
      if (!updatedOrder) throw httpError(404, "order_not_found", "Order not found.");
      sendJson(req, res, 200, { order: updatedOrder }, ["GET", "PATCH", "OPTIONS"]);
      return;
    }

    const rows = await supabaseFetch(`/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=*,order_items(*),order_status_events(status,created_at)&order_status_events.order=created_at.asc&limit=1`, {
      admin: true,
      prefer: "return=representation"
    });

    const order = Array.isArray(rows) ? rows[0] || null : null;
    if (!order) throw httpError(404, "order_not_found", "Order not found.");
    sendJson(req, res, 200, { order }, ["GET", "PATCH", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, errorPayload(error), ["GET", "PATCH", "OPTIONS"]);
  }
};
