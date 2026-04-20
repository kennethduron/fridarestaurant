"use strict";

const {
  handleOptions,
  sendJson,
  readJson,
  requireMethod,
  errorPayload,
  httpError
} = require("../../lib/server/http");
const { signInStaff, refreshStaffSession } = require("../../lib/server/supabase");

function getAction(req) {
  const value = req.query.action;
  return Array.isArray(value) ? value[0] : value;
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["POST", "OPTIONS"])) return;

  try {
    requireMethod(req, ["POST"]);
    const action = getAction(req);
    const body = await readJson(req);

    if (action === "login") {
      const session = await signInStaff(body.username, body.password);
      sendJson(req, res, 200, session, ["POST", "OPTIONS"]);
      return;
    }

    if (action === "refresh") {
      const session = await refreshStaffSession(body.refresh_token);
      sendJson(req, res, 200, session, ["POST", "OPTIONS"]);
      return;
    }

    throw httpError(404, "auth_route_not_found", "Auth route not found.");
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, errorPayload(error), ["POST", "OPTIONS"]);
  }
};
