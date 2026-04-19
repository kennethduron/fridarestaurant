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
    const staff = await requireStaff(getBearerToken(req), ["admin", "kitchen", "cashier"]);
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

    await supabaseFetch(
      `/rest/v1/staff_notification_tokens?staff_profile_id=eq.${encodeURIComponent(staff.id)}&platform=eq.${encodeURIComponent(payload.platform)}&token=neq.${encodeURIComponent(token)}&active=eq.true`,
      {
        method: "PATCH",
        admin: true,
        prefer: "return=minimal",
        body: {
          active: false,
          updated_at: new Date().toISOString()
        }
      }
    ).catch(() => null);

    sendJson(req, res, 201, {
      token: Array.isArray(inserted) ? inserted[0] : inserted
    }, ["POST", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, errorPayload(error), ["POST", "OPTIONS"]);
  }
};
