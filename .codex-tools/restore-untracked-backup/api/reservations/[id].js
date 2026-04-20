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
const { supabaseFetch, requireStaff, CRM_STAFF_ROLES } = require("../../lib/server/supabase");

const RESERVATION_STATUSES = new Set(["pending", "confirmed", "cancelled", "completed"]);
const RESERVATION_NOTES_KEY = "reservation_internal_notes";
const MAX_INTERNAL_NOTE_LENGTH = 500;

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["PATCH", "OPTIONS"])) return;

  try {
    requireMethod(req, ["PATCH"]);
    const staff = await requireStaff(getBearerToken(req), CRM_STAFF_ROLES);
    const reservationId = req.query.id;
    if (!reservationId) throw httpError(400, "missing_reservation_id", "Missing reservation id.");

    const body = await readJson(req);
    const existingReservation = await getReservationById(reservationId);
    if (!existingReservation) throw httpError(404, "reservation_not_found", "Reservation not found.");

    let reservationRow = existingReservation;
    if (body.status !== undefined) {
      const nextStatus = String(body.status || "").trim();
      if (!RESERVATION_STATUSES.has(nextStatus)) {
        throw httpError(400, "invalid_reservation_status", "Reservation status is not valid.");
      }

      const updatedRows = await supabaseFetch(`/rest/v1/reservations?id=eq.${encodeURIComponent(reservationId)}`, {
        method: "PATCH",
        admin: true,
        body: {
          status: nextStatus,
          updated_at: new Date().toISOString()
        }
      });
      reservationRow = Array.isArray(updatedRows) ? updatedRows[0] || null : updatedRows;
      if (!reservationRow) throw httpError(404, "reservation_not_found", "Reservation not found.");
    }

    let internalNote = String(body.internal_note || body.internalNote || "").trim().slice(0, MAX_INTERNAL_NOTE_LENGTH);
    if (body.internal_note !== undefined || body.internalNote !== undefined) {
      const notesSettings = await loadReservationNotes();
      const notes = notesSettings && typeof notesSettings.notes === "object" ? { ...notesSettings.notes } : {};
      notes[reservationId] = {
        ...(notes[reservationId] || {}),
        internalNote,
        updatedAt: new Date().toISOString(),
        updatedBy: staff.username || ""
      };

      await supabaseFetch("/rest/v1/app_settings?on_conflict=key", {
        method: "POST",
        admin: true,
        prefer: "resolution=merge-duplicates,return=representation",
        body: {
          key: RESERVATION_NOTES_KEY,
          value: { notes },
          updated_by_staff_profile_id: staff.id,
          updated_at: new Date().toISOString()
        }
      });

      if (body.status === undefined) {
        const refreshedRows = await supabaseFetch(`/rest/v1/reservations?id=eq.${encodeURIComponent(reservationId)}`, {
          method: "PATCH",
          admin: true,
          body: {
            updated_at: new Date().toISOString()
          }
        });
        reservationRow = Array.isArray(refreshedRows) ? refreshedRows[0] || reservationRow : refreshedRows || reservationRow;
      }
    } else {
      internalNote = String((await loadReservationNotes()).notes?.[reservationId]?.internalNote || "").trim();
    }

    sendJson(req, res, 200, {
      reservation: {
        ...reservationRow,
        internal_note: internalNote
      }
    }, ["PATCH", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, errorPayload(error), ["PATCH", "OPTIONS"]);
  }
};

async function getReservationById(reservationId) {
  const rows = await supabaseFetch(`/rest/v1/reservations?id=eq.${encodeURIComponent(reservationId)}&select=*&limit=1`, {
    admin: true,
    prefer: "return=representation"
  });
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function loadReservationNotes() {
  const rows = await supabaseFetch(`/rest/v1/app_settings?key=eq.${RESERVATION_NOTES_KEY}&select=value&limit=1`, {
    admin: true,
    prefer: "return=representation"
  });
  return Array.isArray(rows) && rows[0] ? rows[0].value || {} : {};
}
