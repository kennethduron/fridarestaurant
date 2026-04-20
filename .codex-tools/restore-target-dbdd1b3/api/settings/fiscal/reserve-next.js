"use strict";

const {
  handleOptions,
  sendJson,
  requireMethod,
  errorPayload,
  getBearerToken,
  httpError
} = require("../../../lib/server/http");
const { supabaseFetch, requireStaff } = require("../../../lib/server/supabase");

const SETTINGS_KEY = "fiscal_invoice";

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["POST", "OPTIONS"])) return;

  try {
    requireMethod(req, ["POST"]);
    const staff = await requireStaff(getBearerToken(req), ["admin", "cashier"]);
    const rows = await supabaseFetch(`/rest/v1/app_settings?key=eq.${SETTINGS_KEY}&select=value&limit=1`, {
      admin: true,
      prefer: "return=representation"
    });
    const settings = Array.isArray(rows) && rows[0] ? rows[0].value || {} : null;
    if (!settings) throw httpError(400, "missing_fiscal_settings", "Missing fiscal settings.");

    const issuedInvoiceNumber = String(settings.nextInvoiceNumber || settings.authorizationRangeStart || "").trim();
    const current = parseFiscalNumber(issuedInvoiceNumber);
    const end = parseFiscalNumber(settings.authorizationRangeEnd);
    if (!current || !end || current.prefix !== end.prefix) {
      throw httpError(400, "invalid_fiscal_range", "Invalid fiscal range.");
    }
    if (current.numeric > end.numeric) {
      throw httpError(400, "fiscal_range_exhausted", "Fiscal range exhausted.");
    }

    const nextNumeric = current.numeric + 1;
    const nextInvoiceNumber = nextNumeric <= end.numeric
      ? `${current.prefix}-${String(nextNumeric).padStart(current.width, "0")}`
      : "";

    const nextSettings = {
      ...settings,
      nextInvoiceNumber,
      lastIssuedInvoiceNumber: issuedInvoiceNumber
    };

    await supabaseFetch("/rest/v1/app_settings?on_conflict=key", {
      method: "POST",
      admin: true,
      prefer: "resolution=merge-duplicates,return=representation",
      body: {
        key: SETTINGS_KEY,
        value: nextSettings,
        updated_by_staff_profile_id: staff.id,
        updated_at: new Date().toISOString()
      }
    });

    sendJson(req, res, 200, { invoiceNumber: issuedInvoiceNumber, settings: nextSettings }, ["POST", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, errorPayload(error), ["POST", "OPTIONS"]);
  }
};

function parseFiscalNumber(value) {
  const normalized = String(value || "").trim();
  const parts = normalized.split("-");
  if (parts.length < 4) return null;
  const serial = parts[parts.length - 1];
  const prefix = parts.slice(0, -1).join("-");
  const numeric = Number(serial);
  if (!prefix || !serial || !Number.isInteger(numeric)) return null;
  return { prefix, serial, width: serial.length, numeric };
}
