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
const MAX_RESERVE_ATTEMPTS = 5;

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["POST", "OPTIONS"])) return;

  try {
    requireMethod(req, ["POST"]);
    const staff = await requireStaff(getBearerToken(req), ["admin", "cashier"]);
    const reserved = await reserveNextInvoice(staff.id);
    sendJson(req, res, 200, reserved, ["POST", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, errorPayload(error), ["POST", "OPTIONS"]);
  }
};

async function reserveNextInvoice(staffProfileId) {
  for (let attempt = 0; attempt < MAX_RESERVE_ATTEMPTS; attempt += 1) {
    const currentRow = await loadFiscalSettingsRow();
    const settings = currentRow && currentRow.value ? currentRow.value || {} : null;
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

    const updatedAt = new Date().toISOString();
    const currentUpdatedAt = String(currentRow.updated_at || "").trim();
    const query = currentUpdatedAt
      ? `/rest/v1/app_settings?key=eq.${SETTINGS_KEY}&updated_at=eq.${encodeURIComponent(currentUpdatedAt)}`
      : `/rest/v1/app_settings?key=eq.${SETTINGS_KEY}&updated_at=is.null`;

    const savedRows = await supabaseFetch(query, {
      method: "PATCH",
      admin: true,
      prefer: "return=representation",
      body: {
        value: nextSettings,
        updated_by_staff_profile_id: staffProfileId,
        updated_at: updatedAt
      }
    });

    if (Array.isArray(savedRows) && savedRows[0]) {
      return {
        invoiceNumber: issuedInvoiceNumber,
        settings: savedRows[0].value || nextSettings
      };
    }
  }

  throw httpError(409, "fiscal_reservation_conflict", "Another cashier reserved a fiscal invoice at the same time. Try again.");
}

async function loadFiscalSettingsRow() {
  const rows = await supabaseFetch(`/rest/v1/app_settings?key=eq.${SETTINGS_KEY}&select=key,value,updated_at&limit=1`, {
    admin: true,
    prefer: "return=representation"
  });
  return Array.isArray(rows) ? rows[0] || null : null;
}

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
