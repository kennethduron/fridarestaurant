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

const SETTINGS_KEY = "menu_settings";
const MAX_NOTE_LENGTH = 180;

function cleanText(value, maxLength = MAX_NOTE_LENGTH) {
  return String(value || "").trim().slice(0, maxLength);
}

function normalizeMenuSettings(settings) {
  const inputItems = settings && typeof settings === "object" && settings.items && typeof settings.items === "object"
    ? settings.items
    : {};
  const items = {};

  Object.entries(inputItems).forEach(([id, value]) => {
    const cleanId = cleanText(id, 40).replace(/[^a-zA-Z0-9_-]/g, "");
    if (!cleanId || !value || typeof value !== "object") return;

    const price = Number(value.price);
    const hasPrice = Number.isFinite(price) && price >= 0;
    const note = value.note && typeof value.note === "object" ? value.note : {};

    items[cleanId] = {
      ...(hasPrice ? { price } : {}),
      note: {
        es: cleanText(note.es),
        en: cleanText(note.en)
      },
      isNew: Boolean(value.isNew),
      updatedAt: new Date().toISOString()
    };
  });

  return { items };
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["GET", "PATCH", "OPTIONS"])) return;

  try {
    requireMethod(req, ["GET", "PATCH"]);

    if (req.method === "GET") {
      const rows = await supabaseFetch(`/rest/v1/app_settings?key=eq.${SETTINGS_KEY}&select=value&limit=1`, {
        admin: true,
        prefer: "return=representation"
      });
      sendJson(req, res, 200, { settings: Array.isArray(rows) && rows[0] ? rows[0].value : { items: {} } }, ["GET", "PATCH", "OPTIONS"]);
      return;
    }

    const staff = await requireStaff(getBearerToken(req), ["admin", "cashier"]);
    const body = await readJson(req);
    const settings = normalizeMenuSettings(body.settings || {});
    const saved = await supabaseFetch("/rest/v1/app_settings?on_conflict=key", {
      method: "POST",
      admin: true,
      prefer: "resolution=merge-duplicates,return=representation",
      body: {
        key: SETTINGS_KEY,
        value: settings,
        updated_by_staff_profile_id: staff.id,
        updated_at: new Date().toISOString()
      }
    });

    sendJson(req, res, 200, { settings: Array.isArray(saved) && saved[0] ? saved[0].value : settings }, ["GET", "PATCH", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, errorPayload(error), ["GET", "PATCH", "OPTIONS"]);
  }
};
