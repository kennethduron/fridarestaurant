"use strict";

const { httpError, requiredEnv } = require("./http");

const STAFF_ROLES = new Set(["admin", "kitchen", "cashier"]);
const ORDER_TYPES = new Set(["dine_in", "takeaway", "delivery"]);
const ORDER_STATUSES = new Set([
  "pending",
  "accepted",
  "preparing",
  "ready",
  "delivered",
  "rejected",
  "cancelled"
]);

function supabaseUrl() {
  return requiredEnv("SUPABASE_URL").replace(/\/$/, "");
}

function publishableKey() {
  return requiredEnv("SUPABASE_PUBLISHABLE_KEY");
}

function serviceRoleKey() {
  return requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
}

function staffEmailForUsername(username) {
  const normalized = normalizeUsername(username);
  const domain = process.env.STAFF_EMAIL_DOMAIN || "frida.local";
  return `${normalized}@${domain}`;
}

function normalizeUsername(username) {
  return String(username || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");
}

async function supabaseFetch(path, options = {}) {
  const url = `${supabaseUrl()}${path}`;
  const headers = {
    apikey: options.admin ? serviceRoleKey() : publishableKey(),
    Authorization: `Bearer ${options.admin ? serviceRoleKey() : publishableKey()}`,
    "Content-Type": "application/json",
    Prefer: options.prefer || "return=representation",
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  let payload = null;
  const text = await response.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (error) {
      payload = text;
    }
  }

  if (!response.ok) {
    throw httpError(response.status, "supabase_error", "Supabase request failed.", payload);
  }

  return payload;
}

async function signInStaff(username, password) {
  const cleanUsername = normalizeUsername(username);
  if (!cleanUsername || !password) {
    throw httpError(400, "invalid_credentials", "Username and password are required.");
  }

  const profile = await getStaffByUsername(cleanUsername);
  if (!profile || !profile.active) {
    throw httpError(403, "staff_denied", "Este usuario no tiene acceso al CRM.");
  }

  const loginEmail = String(profile.login_email || staffEmailForUsername(cleanUsername)).trim().toLowerCase();

  const response = await fetch(`${supabaseUrl()}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: publishableKey(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: loginEmail,
      password
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw httpError(401, "invalid_credentials", "Usuario o contrasena invalidos.");
  }

  const staff = await getStaffByUserId(payload.user && payload.user.id);
  if (!staff || staff.id !== profile.id || staff.username !== cleanUsername || !staff.active) {
    throw httpError(403, "staff_denied", "Este usuario no tiene acceso al CRM.");
  }

  return {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    expires_in: payload.expires_in,
    token_type: payload.token_type,
    user: {
      id: payload.user.id,
      email: loginEmail,
      username: staff.username,
      role: staff.role
    }
  };
}

async function refreshStaffSession(refreshToken) {
  if (!refreshToken) {
    throw httpError(400, "missing_refresh_token", "Missing refresh token.");
  }

  const response = await fetch(`${supabaseUrl()}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: {
      apikey: publishableKey(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      refresh_token: refreshToken
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.user || !payload.access_token) {
    throw httpError(401, "invalid_refresh_token", "Session could not be refreshed.");
  }

  const staff = await getStaffByUserId(payload.user.id);
  if (!staff || !staff.active) {
    throw httpError(403, "staff_denied", "Este usuario no tiene acceso al CRM.");
  }

  return {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token || refreshToken,
    expires_in: payload.expires_in,
    token_type: payload.token_type,
    user: {
      id: payload.user.id,
      email: payload.user.email || staffEmailForUsername(staff.username),
      username: staff.username,
      role: staff.role
    }
  };
}

async function getUserFromAccessToken(accessToken) {
  if (!accessToken) throw httpError(401, "missing_token", "Missing bearer token.");

  const response = await fetch(`${supabaseUrl()}/auth/v1/user`, {
    headers: {
      apikey: publishableKey(),
      Authorization: `Bearer ${accessToken}`
    }
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.id) {
    throw httpError(401, "invalid_token", "Invalid or expired session.");
  }

  return payload;
}

async function getStaffByUserId(userId) {
  if (!userId) return null;
  const rows = await supabaseFetch(`/rest/v1/staff_profiles?user_id=eq.${encodeURIComponent(userId)}&select=*`, {
    admin: true,
    prefer: "return=minimal"
  });
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function getStaffByUsername(username) {
  const cleanUsername = normalizeUsername(username);
  if (!cleanUsername) return null;
  const rows = await supabaseFetch(`/rest/v1/staff_profiles?username=eq.${encodeURIComponent(cleanUsername)}&select=*`, {
    admin: true,
    prefer: "return=minimal"
  });
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function requireStaff(accessToken, allowedRoles = Array.from(STAFF_ROLES)) {
  const user = await getUserFromAccessToken(accessToken);
  const staff = await getStaffByUserId(user.id);
  if (!staff || !staff.active) {
    throw httpError(403, "staff_denied", "This session does not have staff access.");
  }
  if (!allowedRoles.includes(staff.role)) {
    throw httpError(403, "role_denied", "This staff role cannot perform this action.");
  }
  return staff;
}

function initialOrderStatus(orderType) {
  if (orderType === "dine_in") return "preparing";
  return "pending";
}

function assertOrderType(orderType) {
  if (!ORDER_TYPES.has(orderType)) {
    throw httpError(400, "invalid_order_type", "Order type must be dine_in, takeaway, or delivery.");
  }
}

function assertOrderStatus(status) {
  if (!ORDER_STATUSES.has(status)) {
    throw httpError(400, "invalid_order_status", "Order status is not valid.");
  }
}

module.exports = {
  STAFF_ROLES,
  ORDER_TYPES,
  ORDER_STATUSES,
  staffEmailForUsername,
  normalizeUsername,
  supabaseFetch,
  signInStaff,
  refreshStaffSession,
  getStaffByUsername,
  requireStaff,
  initialOrderStatus,
  assertOrderType,
  assertOrderStatus
};
