"use strict";

const { handleOptions, sendJson, readJson, requireMethod, errorPayload } = require("../../lib/server/http");
const { signInStaff } = require("../../lib/server/supabase");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["POST", "OPTIONS"])) return;

  try {
    requireMethod(req, ["POST"]);
    const body = await readJson(req);
    const session = await signInStaff(body.username, body.password);
    sendJson(res, 200, session, ["POST", "OPTIONS"]);
  } catch (error) {
    sendJson(res, error.statusCode || 500, errorPayload(error), ["POST", "OPTIONS"]);
  }
};
