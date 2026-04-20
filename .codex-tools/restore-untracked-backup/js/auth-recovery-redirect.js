(function redirectSupabaseRecoveryFlow() {
  const currentPath = window.location.pathname.toLowerCase();
  if (currentPath.endsWith("/reset-password.html")) return;

  const hash = window.location.hash || "";
  if (!hash) return;

  const params = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const isRecoveryFlow =
    params.has("access_token") ||
    params.has("refresh_token") ||
    params.get("type") === "recovery" ||
    params.has("error_code") ||
    params.get("error") === "access_denied";

  if (!isRecoveryFlow) return;

  const destination = new URL("/reset-password.html", window.location.origin);
  destination.hash = hash.startsWith("#") ? hash : `#${hash}`;
  window.location.replace(destination.toString());
})();
