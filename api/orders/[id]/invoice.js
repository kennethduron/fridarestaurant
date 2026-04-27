"use strict";

const {
  handleOptions,
  sendJson,
  readJson,
  requireMethod,
  errorPayload,
  getBearerToken,
  httpError
} = require("../../../lib/server/http");
const { supabaseFetch, requireStaff } = require("../../../lib/server/supabase");

const ORDER_SELECT = "*,order_items(*),order_status_events(status,created_at)";

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["PATCH", "OPTIONS"])) return;

  try {
    requireMethod(req, ["PATCH"]);
    const staff = await requireStaff(getBearerToken(req), ["admin", "cashier"]);
    const orderId = req.query.id;
    if (!orderId) throw httpError(400, "missing_order_id", "Missing order id.");

    const body = await readJson(req);
    if (body.action === "void") {
      const order = await voidFiscalInvoice(orderId, body.reason, staff);
      sendJson(req, res, 200, { order }, ["PATCH", "OPTIONS"]);
      return;
    }

    const incomingInvoice = body.invoice && typeof body.invoice === "object" ? body.invoice : {};
    const invoice = await mergeProtectedFiscalVoidFields(orderId, incomingInvoice);
    const updatedRows = await supabaseFetch(`/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      admin: true,
      body: {
        invoice,
        updated_at: new Date().toISOString()
      }
    });

    const order = Array.isArray(updatedRows) ? updatedRows[0] : updatedRows;
    if (!order) throw httpError(404, "order_not_found", "Order not found.");
    sendJson(req, res, 200, { order }, ["PATCH", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, errorPayload(error), ["PATCH", "OPTIONS"]);
  }
};

async function mergeProtectedFiscalVoidFields(orderId, incomingInvoice) {
  const currentRows = await supabaseFetch(
    `/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=invoice&limit=1`,
    { admin: true, prefer: "return=representation" }
  );
  const currentOrder = Array.isArray(currentRows) ? currentRows[0] : currentRows;
  const currentInvoice = currentOrder && currentOrder.invoice && typeof currentOrder.invoice === "object"
    ? currentOrder.invoice
    : {};

  if (!currentInvoice.fiscalVoidedAt) return incomingInvoice;

  return {
    ...incomingInvoice,
    invoiceNumber: currentInvoice.invoiceNumber || incomingInvoice.invoiceNumber || "",
    fiscalPrintedAt: currentInvoice.fiscalPrintedAt || incomingInvoice.fiscalPrintedAt || "",
    fiscalVoidedAt: currentInvoice.fiscalVoidedAt,
    fiscalVoidReason: currentInvoice.fiscalVoidReason || "",
    fiscalVoidedByStaffProfileId: currentInvoice.fiscalVoidedByStaffProfileId || "",
    fiscalVoidedByUsername: currentInvoice.fiscalVoidedByUsername || "",
    fiscalVoidOriginalTotal: currentInvoice.fiscalVoidOriginalTotal || 0,
    fiscalVoidInvoiceNumber: currentInvoice.fiscalVoidInvoiceNumber || currentInvoice.invoiceNumber || ""
  };
}

async function voidFiscalInvoice(orderId, reasonValue, staff) {
  const reason = cleanText(reasonValue, 500);
  if (!reason) {
    throw httpError(400, "missing_void_reason", "Fiscal void reason is required.");
  }

  const currentRows = await supabaseFetch(
    `/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=id,display_id,total,invoice&limit=1`,
    { admin: true, prefer: "return=representation" }
  );
  const currentOrder = Array.isArray(currentRows) ? currentRows[0] : currentRows;
  if (!currentOrder) throw httpError(404, "order_not_found", "Order not found.");

  const currentInvoice = currentOrder.invoice && typeof currentOrder.invoice === "object"
    ? currentOrder.invoice
    : {};
  const invoiceNumber = cleanText(currentInvoice.invoiceNumber, 80);
  if (!invoiceNumber) {
    throw httpError(400, "missing_fiscal_invoice", "This order does not have a fiscal invoice.");
  }
  if (currentInvoice.fiscalVoidedAt) {
    throw httpError(409, "fiscal_invoice_already_voided", "This fiscal invoice was already voided.");
  }

  const voidedAt = new Date().toISOString();
  const nextInvoice = {
    ...currentInvoice,
    fiscalVoidedAt: voidedAt,
    fiscalVoidReason: reason,
    fiscalVoidedByStaffProfileId: staff.id,
    fiscalVoidedByUsername: staff.username || staff.login_email || "",
    fiscalVoidOriginalTotal: Number(currentOrder.total || 0),
    fiscalVoidInvoiceNumber: invoiceNumber
  };

  const updatedRows = await supabaseFetch(`/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
    method: "PATCH",
    admin: true,
    body: {
      invoice: nextInvoice,
      updated_at: voidedAt
    }
  });
  const updatedOrder = Array.isArray(updatedRows) ? updatedRows[0] : updatedRows;
  if (!updatedOrder) throw httpError(404, "order_not_found", "Order not found.");

  const fullRows = await supabaseFetch(
    `/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&select=${encodeURIComponent(ORDER_SELECT)}&order_status_events.order=created_at.asc&limit=1`,
    { admin: true, prefer: "return=representation" }
  );
  return Array.isArray(fullRows) ? fullRows[0] || updatedOrder : fullRows || updatedOrder;
}

function cleanText(value, maxLength = 300) {
  return String(value || "").trim().slice(0, maxLength);
}
