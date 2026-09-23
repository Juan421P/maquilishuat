// ─────────────────────────────────────────────────────────────────────────
// Manejo centralizado de errores de la API.
//
// El backend no siempre responde con la misma forma:
//   { message }                          → la mayoría de rutas
//   { message: "error creating...", error: "stock insuficiente para X" }
//   { errors: [...] } / { errors: { campo: { message } } }
//   { error: "..." }                     → librerías (rate limit antiguo)
// y además pueden fallar la red, el timeout o el propio JSON. Todo pasa por
// aquí para que las pantallas reciban SIEMPRE un mensaje entendible.
// ─────────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(message, { status = 0, code = null, data = null, kind = "http" } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status; // 0 = no hubo respuesta HTTP (red / timeout)
    this.code = code; // código propio del backend (CODE_EXPIRED, ...)
    this.data = data; // body completo por si la pantalla necesita más datos
    this.kind = kind; // "http" | "network" | "timeout" | "config"
  }
}

const FRIENDLY_BY_STATUS = {
  400: "Revisa los datos e inténtalo de nuevo.",
  401: "Tu sesión ha expirado. Inicia sesión nuevamente.",
  403: "No tienes permiso para realizar esta acción.",
  404: "No encontramos lo que buscabas.",
  409: "La información cambió mientras tanto. Revisa e inténtalo de nuevo.",
  413: "El archivo es demasiado grande.",
  429: "Demasiadas solicitudes. Espera un momento e inténtalo nuevamente.",
  500: "Ocurrió un problema en el servidor. Inténtalo más tarde.",
  502: "El servidor no pudo completar la solicitud. Inténtalo más tarde.",
  503: "El servidor no está disponible en este momento. Inténtalo más tarde.",
  504: "El servidor tardó demasiado en responder. Inténtalo más tarde.",
};

export const NETWORK_MESSAGE =
  "No pudimos conectar con el servidor. Revisa tu conexión a internet e inténtalo de nuevo.";
export const TIMEOUT_MESSAGE = "El servidor tardó demasiado en responder. Inténtalo de nuevo.";

// Mensajes técnicos (en inglés) que devuelven algunas rutas y que no le
// sirven al cliente: se reemplazan por el mensaje genérico del status.
const GENERIC_SERVER_MESSAGES = [
  /^internal server error$/i,
  /^error creating/i,
  /^error updating/i,
  /^error retrieving/i,
  /^fields required$/i,
  /^insufficient permissions$/i,
  /^path .* not found/i,
  /^too many requests/i,
];

const isGeneric = (msg) => GENERIC_SERVER_MESSAGES.some((re) => re.test(msg.trim()));

const firstString = (...values) => values.find((v) => typeof v === "string" && v.trim());

const fromErrorsField = (errors) => {
  if (!errors) return null;
  if (typeof errors === "string") return errors;
  if (Array.isArray(errors)) {
    const first = errors[0];
    return typeof first === "string" ? first : first?.message || first?.msg || null;
  }
  if (typeof errors === "object") {
    const first = Object.values(errors)[0];
    return typeof first === "string" ? first : first?.message || null;
  }
  return null;
};

// Extrae el mejor mensaje posible de la respuesta de error del backend.
export function extractErrorMessage(status, data) {
  const detail = firstString(
    typeof data?.error === "string" ? data.error : null,
    fromErrorsField(data?.errors)
  );
  const message = firstString(data?.message);

  // Si `message` es técnico/genérico pero `error` trae el motivo real
  // (p. ej. "stock insuficiente para X"), se muestra el motivo.
  if (message && !isGeneric(message)) return message;
  if (detail && !isGeneric(detail)) return detail.charAt(0).toUpperCase() + detail.slice(1);
  if (status === 429 || status >= 500 || status === 401) return FRIENDLY_BY_STATUS[status] || FRIENDLY_BY_STATUS[500];
  return FRIENDLY_BY_STATUS[status] || `Ocurrió un error inesperado (${status}).`;
}

// Mensaje para mostrar en la UI a partir de cualquier error.
export function getErrorMessage(error, fallback = "Ocurrió un error inesperado. Inténtalo de nuevo.") {
  if (!error) return fallback;
  if (error instanceof ApiError) return error.message || fallback;
  if (typeof error === "string") return error;
  return error.message || fallback;
}

export const isNetworkError = (error) =>
  error instanceof ApiError && (error.kind === "network" || error.kind === "timeout");
