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
const {
  supabaseFetch,
  requireStaff,
  assertOrderStatus
} = require("../../../lib/server/supabase");
const { sendToTokens } = require("../../../lib/server/firebaseAdmin");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["PATCH", "OPTIONS"])) return;

  try {
    requireMethod(req, ["PATCH"]);
    const staff = await requireStaff(getBearerToken(req), ["admin", "kitchen", "cashier"]);
    const orderId = req.query.id;
    if (!orderId) throw httpError(400, "missing_order_id", "Missing order id.");

    const body = await readJson(req);
    const status = String(body.status || "").trim();
    assertOrderStatus(status);

    const updatedRows = await supabaseFetch(`/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      admin: true,
      body: {
        status,
        updated_at: new Date().toISOString()
      }
    });

    const order = Array.isArray(updatedRows) ? updatedRows[0] : updatedRows;
    if (!order) throw httpError(404, "order_not_found", "Order not found.");

    await supabaseFetch("/rest/v1/order_status_events", {
      method: "POST",
      admin: true,
      body: {
        order_id: orderId,
        status,
        staff_profile_id: staff.id,
        note: body.note || null
      }
    });

    await notifyOrderStatus(order).catch(() => null);

    sendJson(req, res, 200, { order }, ["PATCH", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, errorPayload(error), ["PATCH", "OPTIONS"]);
  }
};

async function notifyOrderStatus(order) {
  const rows = await supabaseFetch(`/rest/v1/notification_tokens?order_id=eq.${encodeURIComponent(order.id)}&active=eq.true&select=token`, {
    admin: true,
    prefer: "return=representation"
  });
  const tokens = Array.isArray(rows) ? rows.map((row) => row.token) : [];
  if (!tokens.length) return;

  const message = statusMessage(order.status);
  await sendToTokens(tokens, {
    title: message.title,
    body: message.body,
    link: "https://fridarestauranthn.web.app/",
    data: {
      orderId: order.id,
      status: order.status,
      displayId: order.display_id || ""
    }
  });
}

function statusMessage(status) {
  const messages = {
    pending: {
      title: "Pedido recibido",
      body: "Tu pedido esta pendiente de autorizacion."
    },
    accepted: {
      title: "Pedido aceptado",
      body: "Tu pedido fue aceptado y pronto pasara a cocina."
    },
    preparing: {
      title: "Pedido en preparacion",
      body: "Cocina ya esta preparando tu pedido."
    },
    ready: {
      title: "Pedido listo",
      body: "Tu pedido ya esta listo."
    },
    delivered: {
      title: "Pedido entregado",
      body: "Tu pedido fue marcado como entregado. Gracias por elegirnos."
    },
    rejected: {
      title: "Pedido rechazado",
      body: "No pudimos aceptar tu pedido. Contacta al restaurante para mas detalles."
    },
    cancelled: {
      title: "Pedido cancelado",
      body: "Tu pedido fue cancelado."
    }
  };
  return messages[status] || {
    title: "Actualizacion de pedido",
    body: "Tu pedido tiene una actualizacion."
  };
}
