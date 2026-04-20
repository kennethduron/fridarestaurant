"use strict";

const {
  handleOptions,
  sendJson,
  readJson,
  requireMethod,
  errorPayload,
  getBearerToken
} = require("../../lib/server/http");
const { supabaseFetch, requireStaff } = require("../../lib/server/supabase");

const SETTINGS_KEY = "fiscal_invoice";

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["GET", "PATCH", "OPTIONS"])) return;

  try {
    requireMethod(req, ["GET", "PATCH"]);
    const staff = await requireStaff(getBearerToken(req), ["admin", "cashier"]);

    if (req.method === "GET") {
      const rows = await supabaseFetch(`/rest/v1/app_settings?key=eq.${SETTINGS_KEY}&select=value&limit=1`, {
        admin: true,
        prefer: "return=representation"
      });
      sendJson(req, res, 200, { settings: Array.isArray(rows) && rows[0] ? rows[0].value : null }, ["GET", "PATCH", "OPTIONS"]);
      return;
    }

    const body = await readJson(req);
    const saved = await supabaseFetch("/rest/v1/app_settings?on_conflict=key", {
      method: "POST",
      admin: true,
      prefer: "resolution=merge-duplicates,return=representation",
      body: {
        key: SETTINGS_KEY,
        value: body.settings || {},
        updated_by_staff_profile_id: staff.id,
        updated_at: new Date().toISOString()
      }
    });

    sendJson(req, res, 200, { settings: Array.isArray(saved) && saved[0] ? saved[0].value : body.settings || {} }, ["GET", "PATCH", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, errorPayload(error), ["GET", "PATCH", "OPTIONS"]);
  }
};
