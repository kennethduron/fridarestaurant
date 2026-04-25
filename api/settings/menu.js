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

function normalizeTextForTranslation(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function translateVisibleNoteToEnglish(value) {
  const text = cleanText(value);
  if (!text) return "";

  const phrase = normalizeTextForTranslation(text).replace(/[.!?]+$/g, "");
  const phrases = {
    "sin gluten": "Gluten-free",
    "sin lactosa": "Lactose-free",
    "sin azucar": "Sugar-free",
    "bajo en azucar": "Low in sugar",
    "vegetariano": "Vegetarian",
    "vegano": "Vegan",
    "picante": "Spicy",
    "muy picante": "Very spicy",
    "poco picante": "Mildly spicy",
    "recomendado": "Recommended",
    "favorito de la casa": "House favorite",
    "nuevo": "New",
    "producto nuevo": "New item",
    "especial de la casa": "House special",
    "preparado al momento": "Prepared fresh",
    "hecho al momento": "Made fresh",
    "ideal para compartir": "Great for sharing",
    "perfecto para compartir": "Perfect for sharing",
    "por tiempo limitado": "Limited time only",
    "disponible por tiempo limitado": "Available for a limited time",
    "acompanado de papas": "Served with fries",
    "acompanado con papas": "Served with fries",
    "incluye bebida": "Includes a drink"
  };
  if (phrases[phrase]) return phrases[phrase];

  const replacements = [
    [/\bsin\b/gi, "without"],
    [/\bcon\b/gi, "with"],
    [/\by\b/gi, "and"],
    [/\bo\b/gi, "or"],
    [/\bde la casa\b/gi, "house"],
    [/\bcasero\b/gi, "homemade"],
    [/\bcasera\b/gi, "homemade"],
    [/\bfresco\b/gi, "fresh"],
    [/\bfresca\b/gi, "fresh"],
    [/\bnatural\b/gi, "natural"],
    [/\bpicante\b/gi, "spicy"],
    [/\bsuave\b/gi, "mild"],
    [/\bdulce\b/gi, "sweet"],
    [/\bcrujiente\b/gi, "crispy"],
    [/\bcremoso\b/gi, "creamy"],
    [/\bcremosa\b/gi, "creamy"],
    [/\bartesanal\b/gi, "artisanal"],
    [/\brecomendado\b/gi, "recommended"],
    [/\brecomendada\b/gi, "recommended"],
    [/\bnuevo\b/gi, "new"],
    [/\bnueva\b/gi, "new"],
    [/\bespecial\b/gi, "special"],
    [/\bpollo\b/gi, "chicken"],
    [/\bres\b/gi, "beef"],
    [/\bcerdo\b/gi, "pork"],
    [/\bpescado\b/gi, "fish"],
    [/\bmariscos\b/gi, "seafood"],
    [/\bqueso\b/gi, "cheese"],
    [/\bpapas\b/gi, "fries"],
    [/\bensalada\b/gi, "salad"],
    [/\bsalsa\b/gi, "sauce"],
    [/\blimon\b/gi, "lime"],
    [/\blimón\b/gi, "lime"]
  ];

  let translated = text;
  replacements.forEach(([pattern, replacement]) => {
    translated = translated.replace(pattern, replacement);
  });
  return translated.trim();
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
    const noteEs = cleanText(note.es || note.en);

    items[cleanId] = {
      ...(hasPrice ? { price } : {}),
      note: {
        es: noteEs,
        en: translateVisibleNoteToEnglish(noteEs)
      },
      isNew: Boolean(value.isNew),
      isSoldOut: Boolean(value.isSoldOut),
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
      res.setHeader("Cache-Control", "public, s-maxage=15, stale-while-revalidate=60");
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
