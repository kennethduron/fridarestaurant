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
  if (handleOptions(req, res, ["GET", "POST", "PATCH", "OPTIONS"])) return;

  try {
    requireMethod(req, ["GET", "POST", "PATCH"]);

    if (req.method === "GET") {
      await requireStaff(getBearerToken(req), ["admin", "cashier"]);
      const reservations = await supabaseFetch("/rest/v1/reservations?select=*&order=created_at.desc", {
        admin: true,
        prefer: "return=representation"
      });
      sendJson(req, res, 200, { reservations }, ["GET", "POST", "OPTIONS"]);
      return;
    }

    if (req.method === "PATCH") {
      await requireStaff(getBearerToken(req), ["admin", "cashier"]);
      const body = await readJson(req);
      const reservationId = String(body.id || body.reservation_id || body.reservationId || "").trim();
      if (!reservationId) throw httpError(400, "missing_reservation_id", "Missing reservation id.");
      const status = normalizeReservationStatus(body.status);

      const updatedRows = await supabaseFetch(`/rest/v1/reservations?id=eq.${encodeURIComponent(reservationId)}`, {
        method: "PATCH",
        admin: true,
        body: {
          status: dbReservationStatus(status),
          updated_at: new Date().toISOString()
        }
      });

      const reservation = Array.isArray(updatedRows) ? updatedRows[0] : updatedRows;
      if (!reservation) throw httpError(404, "reservation_not_found", "Reservation not found.");
      sendJson(req, res, 200, { reservation }, ["GET", "POST", "PATCH", "OPTIONS"]);
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
    }, ["GET", "POST", "PATCH", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, errorPayload(error), ["GET", "POST", "PATCH", "OPTIONS"]);
  }
};

const RESERVATION_STATUSES = new Set(["pending", "accepted", "rejected", "confirmed", "cancelled", "canceled"]);

function normalizeReservationStatus(status) {
  const value = String(status || "").trim();
  if (!RESERVATION_STATUSES.has(value)) {
    throw httpError(400, "invalid_reservation_status", "Reservation status is not valid.");
  }
  if (value === "confirmed") return "accepted";
  if (value === "cancelled" || value === "canceled") return "rejected";
  return value;
}

function dbReservationStatus(status) {
  if (status === "accepted") return "confirmed";
  if (status === "rejected") return "cancelled";
  return "pending";
}

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
  const rows = await supabaseFetch("/rest/v1/staff_notification_tokens?active=eq.true&platform=neq.web-agent&select=token,staff_profile_id,updated_at,created_at&order=updated_at.desc", {
    admin: true,
    prefer: "return=representation"
  });
  const tokens = latestStaffTokens(rows);
  if (!tokens.length) return;

  const when = [reservation.reservation_date, reservation.reservation_time].filter(Boolean).join(" ");
  const partyText = `${Number(reservation.party_size || 1)} pax`;
  await sendToTokens(tokens, {
    title: "Nueva reserva recibida",
    body: `${reservation.name || "Cliente"} | ${when || "Fecha por confirmar"} | ${partyText}`,
    link: `https://fridarestauranthn.web.app/crm.html?reservation=${encodeURIComponent(reservation.id)}`,
    data: {
      type: "new_reservation",
      reservationId: reservation.id,
      name: reservation.name || "",
      date: reservation.reservation_date || "",
      time: reservation.reservation_time || ""
    }
  });
}

function latestStaffTokens(rows) {
  const byStaff = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    if (!row || !row.token) return;
    const key = row.staff_profile_id || row.token;
    if (!byStaff.has(key)) byStaff.set(key, row.token);
  });
  return Array.from(new Set(byStaff.values()));
}
