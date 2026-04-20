"use strict";

const {
  handleOptions,
  sendJson,
  readJson,
  requireMethod,
  errorPayload,
  getBearerToken
} = require("../../lib/server/http");
const { supabaseFetch, requireStaff, CRM_STAFF_ROLES } = require("../../lib/server/supabase");

const SETTINGS_KEY = "business_profile";

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["GET", "PATCH", "OPTIONS"])) return;

  try {
    requireMethod(req, ["GET", "PATCH"]);

    if (req.method === "GET") {
      const settings = await loadBusinessSettings();
      sendJson(req, res, 200, { settings }, ["GET", "PATCH", "OPTIONS"]);
      return;
    }

    const staff = await requireStaff(getBearerToken(req), CRM_STAFF_ROLES);
    const body = await readJson(req);
    const settings = normalizeBusinessSettings(body.settings || {});
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

    sendJson(req, res, 200, {
      settings: Array.isArray(saved) && saved[0] ? saved[0].value : settings
    }, ["GET", "PATCH", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, errorPayload(error), ["GET", "PATCH", "OPTIONS"]);
  }
};

async function loadBusinessSettings() {
  const rows = await supabaseFetch(`/rest/v1/app_settings?key=eq.${SETTINGS_KEY}&select=value&limit=1`, {
    admin: true,
    prefer: "return=representation"
  });
  return Array.isArray(rows) && rows[0] ? rows[0].value || {} : {};
}

function normalizeBusinessSettings(settings) {
  const input = settings && typeof settings === "object" ? settings : {};

  return {
    branding: {
      siteName: cleanText(input.branding?.siteName, 80),
      logoUrl: cleanAssetUrl(input.branding?.logoUrl, 400)
    },
    contact: {
      phone: cleanText(input.contact?.phone, 60),
      email: cleanText(input.contact?.email, 120),
      address: cleanText(input.contact?.address, 220)
    },
    hours: {
      weekdays: normalizeLocalePair(input.hours?.weekdays, 80),
      weekends: normalizeLocalePair(input.hours?.weekends, 80)
    },
    hero: {
      eyebrow: normalizeLocalePair(input.hero?.eyebrow, 90),
      title: normalizeLocalePair(input.hero?.title, 90),
      subtitle: normalizeLocalePair(input.hero?.subtitle, 240),
      cardEyebrow: normalizeLocalePair(input.hero?.cardEyebrow, 90),
      cardTitle: normalizeLocalePair(input.hero?.cardTitle, 90),
      cardText: normalizeLocalePair(input.hero?.cardText, 220)
    },
    footer: {
      text: normalizeLocalePair(input.footer?.text, 180)
    },
    social: {
      instagramUrl: cleanUrl(input.social?.instagramUrl, 300),
      facebookUrl: cleanUrl(input.social?.facebookUrl, 300),
      xUrl: cleanUrl(input.social?.xUrl, 300)
    },
    updatedAt: new Date().toISOString()
  };
}

function normalizeLocalePair(value, maxLength) {
  const source = value && typeof value === "object" ? value : {};
  return {
    es: cleanText(source.es || source.en, maxLength),
    en: cleanText(source.en || source.es, maxLength)
  };
}

function cleanText(value, maxLength = 180) {
  return String(value || "").trim().slice(0, maxLength);
}

function cleanUrl(value, maxLength = 300) {
  const text = cleanText(value, maxLength);
  if (!text) return "";
  if (/^https?:\/\//i.test(text)) return text;
  return "";
}

function cleanAssetUrl(value, maxLength = 400) {
  const text = cleanText(value, maxLength);
  if (!text) return "";
  if (/^https?:\/\//i.test(text) || text.startsWith("/") || text.startsWith("assets/")) return text;
  return "";
}
