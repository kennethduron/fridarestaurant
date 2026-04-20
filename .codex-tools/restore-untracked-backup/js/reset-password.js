import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://htmtmpmmhsdbzsqtwynz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_z6OHNBssdY3I2-P7_-dThw_6yCavvIT";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    detectSessionInUrl: true,
    persistSession: false,
    autoRefreshToken: false
  }
});

const form = document.getElementById("resetPasswordForm");
const passwordInput = document.getElementById("resetPassword");
const confirmInput = document.getElementById("resetPasswordConfirm");
const message = document.getElementById("resetMessage");
const intro = document.getElementById("resetIntro");
const submitButton = document.getElementById("resetPasswordSubmit");

let recoveryReady = false;

function setMessage(text, tone = "info") {
  message.textContent = text || "";
  message.dataset.state = tone;
}

function setBusy(isBusy) {
  if (submitButton) submitButton.disabled = isBusy;
  if (passwordInput) passwordInput.disabled = isBusy;
  if (confirmInput) confirmInput.disabled = isBusy;
}

function parseHashParams() {
  const rawHash = window.location.hash || "";
  return new URLSearchParams(rawHash.startsWith("#") ? rawHash.slice(1) : rawHash);
}

function describeRecoveryError(params) {
  const code = params.get("error_code") || params.get("code") || "";
  if (code === "otp_expired") {
    return "El enlace ya vencio o ya fue usado. Solicita un nuevo correo de restablecimiento y abre solo el enlace mas reciente.";
  }

  const description = params.get("error_description") || "";
  if (description) return decodeURIComponent(description.replace(/\+/g, " "));
  return "No se pudo validar el enlace de recuperacion. Solicita un nuevo correo de restablecimiento.";
}

function showRecoveryError(params) {
  recoveryReady = false;
  form?.classList.add("hidden");
  intro.textContent = "Necesitas un enlace valido de recuperacion para cambiar la contrasena.";
  setMessage(describeRecoveryError(params), "error");
}

function showReadyState() {
  recoveryReady = true;
  form?.classList.remove("hidden");
  intro.textContent = "Escribe tu nueva contrasena y luego vuelve a entrar al CRM.";
  setMessage("Sesion de recuperacion detectada. Ya puedes cambiar la contrasena.", "success");
}

async function prepareRecovery() {
  const hashParams = parseHashParams();
  if (hashParams.has("error_code") || hashParams.get("error") === "access_denied") {
    showRecoveryError(hashParams);
    return;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    setMessage("No se pudo abrir la sesion de recuperacion. Solicita un nuevo correo.", "error");
    return;
  }

  if (data?.session?.access_token) {
    showReadyState();
    return;
  }

  setMessage("Abre esta pagina solo desde el enlace de restablecimiento enviado por Supabase.", "info");
}

supabase.auth.onAuthStateChange((event, session) => {
  if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session?.access_token) {
    showReadyState();
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!recoveryReady) {
    setMessage("Primero abre un enlace de recuperacion valido.", "error");
    return;
  }

  const password = passwordInput.value;
  const passwordConfirm = confirmInput.value;

  if (!password || password.length < 6) {
    setMessage("La nueva contrasena debe tener al menos 6 caracteres.", "error");
    return;
  }

  if (password !== passwordConfirm) {
    setMessage("Las contrasenas no coinciden.", "error");
    return;
  }

  setBusy(true);
  setMessage("Guardando nueva contrasena...", "info");

  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;

    setMessage("Contrasena actualizada. Ahora entra al CRM con tu nueva contrasena.", "success");
    form.classList.add("hidden");
    window.setTimeout(() => {
      window.location.href = "/crm.html?reset=success";
    }, 1200);
  } catch (error) {
    setMessage(error?.message || "No se pudo actualizar la contrasena.", "error");
  } finally {
    setBusy(false);
  }
});

prepareRecovery();
