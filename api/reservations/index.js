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
const { sendToTokens } = require("../../lib/server/firebaseAdmin");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["GET", "POST", "OPTIONS"])) return;

  try {
    requireMethod(req, ["GET", "POST"]);

    if (req.method === "GET") {
      await requireStaff(getBearerToken(req), ["admin", "cashier"]);
      const reservations = await supabaseFetch("/rest/v1/reservations?select=*&order=created_at.desc", {
        admin: true,
        prefer: "return=representation"
      });
      sendJson(req, res, 200, { reservations }, ["GET", "POST", "OPTIONS"]);
      return;
    }

    const body = await readJson(req);
    const reservation = normalizeReservation(body);
    const inserted = await supabaseFetch("/rest/v1/reservations", {
      method: "POST",
      admin: true,
      body: reservation
    });
    const createdReservation = Array.isArray(inserted) ? inserted[0] : inserted;

    await notifyStaffNewReservation(createdReservation).catch(() => null);

    sendJson(req, res, 201, {
      reservation: createdReservation
    }, ["GET", "POST", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, errorPayload(error), ["GET", "POST", "OPTIONS"]);
  }
};

function normalizeReservation(body) {
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  if (!name || !phone) {
    throw httpError(400, "missing_reservation_contact", "Name and phone are required.");
  }

  return {
    name,
    phone,
    email: String(body.email || "").trim() || null,
    reservation_date: String(body.date || body.reservation_date || "").trim() || null,
    reservation_time: String(body.time || body.reservation_time || "").trim() || null,
    party_size: Number(body.party || body.party_size || 1),
    occasion: String(body.occasion || "").trim() || null,
    allergies: String(body.allergies || "").trim() || null,
    notes: String(body.notes || "").trim() || null,
    status: "pending"
  };
}

async function notifyStaffNewReservation(reservation) {
  const rows = await supabaseFetch("/rest/v1/staff_notification_tokens?active=eq.true&select=token", {
    admin: true,
    prefer: "return=representation"
  });
  const tokens = Array.isArray(rows) ? rows.map((row) => row.token) : [];
  if (!tokens.length) return;

  const when = [reservation.reservation_date, reservation.reservation_time].filter(Boolean).join(" ");
  const partyText = `${Number(reservation.party_size || 1)} pax`;
  await sendToTokens(tokens, {
    title: "Nueva reserva recibida",
    body: `${reservation.name || "Cliente"} | ${when || "Fecha por confirmar"} | ${partyText}`,
    link: "https://fridarestauranthn.web.app/crm.html",
    data: {
      type: "new_reservation",
      reservationId: reservation.id,
      name: reservation.name || "",
      date: reservation.reservation_date || "",
      time: reservation.reservation_time || ""
    }
  });
}
