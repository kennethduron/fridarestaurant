"use strict";

const {
  handleOptions,
  sendJson,
  requireMethod,
  errorPayload,
  httpError
} = require("../../lib/server/http");
const { supabaseFetch } = require("../../lib/server/supabase");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["GET", "OPTIONS"])) return;

  try {
    requireMethod(req, ["GET"]);
    const orderId = req.query.id;
    if (!orderId) throw httpError(400, "missing_order_id", "Missing order id.");

    const rows = await supabaseFetch(`/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=*,order_items(*)&limit=1`, {
      admin: true,
      prefer: "return=representation"
    });

    const order = Array.isArray(rows) ? rows[0] || null : null;
    if (!order) throw httpError(404, "order_not_found", "Order not found.");
    sendJson(req, res, 200, { order }, ["GET", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, errorPayload(error), ["GET", "OPTIONS"]);
  }
};
