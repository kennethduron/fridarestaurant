"use strict";

const DEFAULT_ALLOWED_METHODS = ["GET", "POST", "PATCH", "OPTIONS"];

function allowedOrigins() {
  const raw = process.env.WEB_ORIGINS || process.env.WEB_ORIGIN || "";
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function allowedOrigin(req) {
  const origins = allowedOrigins();
  if (!origins.length) return "*";

  const requestOrigin = req.headers.origin || req.headers.Origin || "";
  if (origins.includes(requestOrigin)) return requestOrigin;

  return origins[0];
}

function setCorsHeaders(req, res, methods = DEFAULT_ALLOWED_METHODS) {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin(req));
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", methods.join(", "));
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function handleOptions(req, res, methods = DEFAULT_ALLOWED_METHODS) {
  setCorsHeaders(req, res, methods);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true;
  }
  return false;
}

function sendJson(req, res, statusCode, payload, methods) {
  setCorsHeaders(req, res, methods);
  res.status(statusCode).json(payload);
}

async function readJson(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      throw httpError(400, "invalid_json", "The request body must be valid JSON.");
    }
  }
  return {};
}

function requireMethod(req, allowed) {
  if (!allowed.includes(req.method)) {
    throw httpError(405, "method_not_allowed", `Use one of: ${allowed.join(", ")}.`);
  }
}

function httpError(statusCode, code, message, details) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  if (details) error.details = details;
  return error;
}

function errorPayload(error) {
  return {
    error: {
      code: error.code || "server_error",
      message: error.message || "Unexpected server error.",
      details: error.details || undefined
    }
  };
}

function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || "";
  const match = String(header).match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : "";
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw httpError(500, "missing_env", `Missing environment variable: ${name}`);
  return value;
}

module.exports = {
  handleOptions,
  sendJson,
  readJson,
  requireMethod,
  httpError,
  errorPayload,
  getBearerToken,
  requiredEnv
};
