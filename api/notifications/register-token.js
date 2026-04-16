"use strict";

const {
  handleOptions,
  sendJson,
  readJson,
  requireMethod,
  errorPayload,
  httpError
} = require("../../lib/server/http");
const { supabaseFetch } = require("../../lib/server/supabase");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["POST", "OPTIONS"])) return;

  try {
    requireMethod(req, ["POST"]);
    const body = await readJson(req);
    const token = String(body.token || "").trim();
    if (!token) throw httpError(400, "missing_token", "Notification token is required.");

    const payload = {
      token,
      order_id: body.order_id || body.orderId || null,
      customer_phone: String(body.customer_phone || body.customerPhone || body.phone || "").trim() || null,
      platform: String(body.platform || "web").trim(),
      active: true,
      updated_at: new Date().toISOString()
    };

    const inserted = await supabaseFetch("/rest/v1/notification_tokens?on_conflict=token", {
      method: "POST",
      admin: true,
      prefer: "resolution=merge-duplicates,return=representation",
      body: payload
    });

    sendJson(res, 201, {
      token: Array.isArray(inserted) ? inserted[0] : inserted
    }, ["POST", "OPTIONS"]);
  } catch (error) {
    sendJson(res, error.statusCode || 500, errorPayload(error), ["POST", "OPTIONS"]);
  }
};
