"use strict";

const { handleOptions, sendJson, readJson, requireMethod, errorPayload } = require("../../lib/server/http");
const { refreshStaffSession } = require("../../lib/server/supabase");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["POST", "OPTIONS"])) return;

  try {
    requireMethod(req, ["POST"]);
    const body = await readJson(req);
    const session = await refreshStaffSession(body.refresh_token);
    sendJson(req, res, 200, session, ["POST", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, errorPayload(error), ["POST", "OPTIONS"]);
  }
};
