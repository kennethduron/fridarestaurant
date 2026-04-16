"use strict";

const { handleOptions, sendJson, requireMethod, errorPayload } = require("../lib/server/http");

module.exports = async function handler(req, res) {
  if (handleOptions(req, res, ["GET", "OPTIONS"])) return;

  try {
    requireMethod(req, ["GET"]);
    sendJson(res, 200, {
      ok: true,
      service: "frida-restaurant-api"
    }, ["GET", "OPTIONS"]);
  } catch (error) {
    sendJson(res, error.statusCode || 500, errorPayload(error), ["GET", "OPTIONS"]);
  }
};
