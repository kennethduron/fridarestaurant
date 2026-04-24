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
  if (handleOptions(req, res, ["POST", "OPTIONS"])) return;

  try {
    requireMethod(req, ["POST"]);
    const staff = await requireStaff(getBearerToken(req), ["admin", "kitchen", "cashier", "agent"]);
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
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, errorPayload(error), ["POST", "OPTIONS"]);
  }
};
