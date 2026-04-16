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
const {
  supabaseFetch,
  requireStaff,
  assertOrderStatus
} = require("../../../lib/server/supabase");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["PATCH", "OPTIONS"])) return;

  try {
    requireMethod(req, ["PATCH"]);
    const staff = await requireStaff(getBearerToken(req), ["admin", "kitchen", "cashier"]);
    const orderId = req.query.id;
    if (!orderId) throw httpError(400, "missing_order_id", "Missing order id.");

    const body = await readJson(req);
    const status = String(body.status || "").trim();
    assertOrderStatus(status);

    const updatedRows = await supabaseFetch(`/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      admin: true,
      body: {
        status,
        updated_at: new Date().toISOString()
      }
    });

    const order = Array.isArray(updatedRows) ? updatedRows[0] : updatedRows;
    if (!order) throw httpError(404, "order_not_found", "Order not found.");

    await supabaseFetch("/rest/v1/order_status_events", {
      method: "POST",
      admin: true,
      body: {
        order_id: orderId,
        status,
        staff_profile_id: staff.id,
        note: body.note || null
      }
    });

    sendJson(res, 200, { order }, ["PATCH", "OPTIONS"]);
  } catch (error) {
    sendJson(res, error.statusCode || 500, errorPayload(error), ["PATCH", "OPTIONS"]);
  }
};
