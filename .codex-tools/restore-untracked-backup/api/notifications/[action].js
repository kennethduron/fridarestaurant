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
const { supabaseFetch, requireStaff, ORDER_STAFF_ROLES } = require("../../lib/server/supabase");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["POST", "OPTIONS"])) return;

  try {
    requireMethod(req, ["POST"]);
    const action = String(req.query.action || "").trim();
    if (action === "register-token") {
      await registerCustomerToken(req, res);
      return;
    }
    if (action === "register-staff-token") {
      await registerStaffToken(req, res);
      return;
    }
    throw httpError(404, "notification_action_not_found", "Notification action not found.");
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, errorPayload(error), ["POST", "OPTIONS"]);
  }
};

async function registerCustomerToken(req, res) {
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

  sendJson(req, res, 201, {
    token: Array.isArray(inserted) ? inserted[0] : inserted
  }, ["POST", "OPTIONS"]);
}

async function registerStaffToken(req, res) {
  const staff = await requireStaff(getBearerToken(req), ORDER_STAFF_ROLES);
  const body = await readJson(req);
  const token = String(body.token || "").trim();
  if (!token) throw httpError(400, "missing_token", "Notification token is required.");

  const payload = {
    staff_profile_id: staff.id,
    username: staff.username,
    token,
    platform: String(body.platform || "web-crm").trim(),
    active: true,
    updated_at: new Date().toISOString()
  };

  const inserted = await supabaseFetch("/rest/v1/staff_notification_tokens?on_conflict=token", {
    method: "POST",
    admin: true,
    prefer: "resolution=merge-duplicates,return=representation",
    body: payload
  });

  sendJson(req, res, 201, {
    token: Array.isArray(inserted) ? inserted[0] : inserted
  }, ["POST", "OPTIONS"]);
}
