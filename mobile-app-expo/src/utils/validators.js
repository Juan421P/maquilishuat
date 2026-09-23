// ─────────────────────────────────────────────────────────────────────────
// Validadores puros y reutilizables. Cada función recibe un valor y
// devuelve un string con el mensaje de error, o "" si el valor es válido.
// Se usan tanto desde react-hook-form (como "validate") como desde
// runValidators() para validaciones que se disparan a mano.
//
// IMPORTANTE: estas reglas replican las del backend
// (backend/src/utils/validation.js). Así el usuario ve el error antes de
// enviar y nunca descubre un rechazo después de recibir un correo.
// ─────────────────────────────────────────────────────────────────────────

// Misma regex que el backend: acepta `juan+1@gmail.com`, subdominios y TLD
// de 2 a 24 letras (.com, .sv, .info, .online...).
export const EMAIL_REGEX =
  /^[A-Za-z0-9_%+-]+(?:\.[A-Za-z0-9_%+-]+)*@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,24}$/;
export const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]*$/;
export const CODE_REGEX = /^[0-9a-f]{6}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;
export const ADDRESS_MIN = 8;
export const ADDRESS_MAX = 200;
export const COMMENT_MAX = 500;
export const MIN_AGE = 18;
export const CODE_LENGTH = 6;

// ── Normalizadores ───────────────────────────────────────────────────────
export const normalizeEmail = (value) => (value || "").trim().toLowerCase();

// Deja solo caracteres hexadecimales en minúscula y corta a 6. Se usa en
// el onChangeText del campo de código, así el teclado nunca puede meter
// una mayúscula automática ni otros símbolos.
export const sanitizeCode = (value) =>
  (value || "").toLowerCase().replace(/[^0-9a-f]/g, "").slice(0, CODE_LENGTH);

// ── Fechas ───────────────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, "0");

// Date local → "AAAA-MM-DD" (el formato que espera el backend)
export const toISODate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// "AAAA-MM-DD" → Date local a mediodía (evita saltos de día por zona horaria)
export const fromISODate = (value) => {
  if (!value || !DATE_REGEX.test(String(value).slice(0, 10))) return null;
  const [y, m, d] = String(value).slice(0, 10).split("-").map(Number);
  const date = new Date(y, m - 1, d, 12);
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
};

// Fecha más reciente que se puede elegir: hoy hace 18 años.
export const maxBirthdate = () => {
  const now = new Date();
  return new Date(now.getFullYear() - MIN_AGE, now.getMonth(), now.getDate(), 12);
};
export const MIN_BIRTHDATE = new Date(1900, 0, 1, 12);

export const ageFromISODate = (value, now = new Date()) => {
  const date = fromISODate(value);
  if (!date) return null;
  let age = now.getFullYear() - date.getFullYear();
  const m = now.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < date.getDate())) age--;
  return age;
};

// ── Validadores ──────────────────────────────────────────────────────────
export const validateRequired = (value, label = "Este campo") => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return `${label} es obligatorio`;
  }
  return "";
};

export const validateEmail = (value) => {
  const email = normalizeEmail(value);
  if (!email) return "El correo es obligatorio";
  if (email.length > 254 || !EMAIL_REGEX.test(email)) return "Ingresa un correo válido";
  return "";
};

export const validateName = (value, label = "Este campo") => {
  const v = (value || "").trim();
  if (!v) return `${label} es obligatorio`;
  if (v.length < 2) return `${label} debe tener al menos 2 caracteres`;
  if (v.length > 60) return `${label} es demasiado largo`;
  if (!NAME_REGEX.test(v)) return `${label} solo puede contener letras`;
  return "";
};

export const validateBirthdate = (value) => {
  if (!value || !String(value).trim()) return "La fecha de nacimiento es obligatoria";
  const date = fromISODate(value);
  if (!date) return "Fecha de nacimiento inválida";
  if (date > new Date()) return "La fecha de nacimiento no puede ser futura";
  if (date < MIN_BIRTHDATE) return "Fecha de nacimiento inválida";
  if (ageFromISODate(value) < MIN_AGE) return `Debes ser mayor de ${MIN_AGE} años`;
  return "";
};

// Mismos requisitos que el backend: entre 8 y 72 caracteres.
export const validatePassword = (value) => {
  if (!value) return "La contraseña es obligatoria";
  if (value.length < PASSWORD_MIN) return `Mínimo ${PASSWORD_MIN} caracteres`;
  if (value.length > PASSWORD_MAX) return `Máximo ${PASSWORD_MAX} caracteres`;
  return "";
};

export const validateConfirmPassword = (password, confirm) => {
  if (!confirm) return "Confirma tu contraseña";
  if (password !== confirm) return "Las contraseñas no coinciden";
  return "";
};

export const validateCode = (value) => {
  const v = (value || "").trim().toLowerCase();
  if (!v) return "El código es obligatorio";
  if (!CODE_REGEX.test(v)) return "El código tiene 6 caracteres (números 0-9 y letras a-f)";
  return "";
};

export const validateAddress = (value) => {
  const v = (value || "").trim();
  if (!v) return "La dirección es obligatoria";
  if (v.length < ADDRESS_MIN) return "Escribe una dirección más detallada";
  if (v.length > ADDRESS_MAX) return `Máximo ${ADDRESS_MAX} caracteres`;
  return "";
};

export const validateMessage = (value) => {
  if (!value || !value.trim()) return "El mensaje es obligatorio";
  if (value.trim().length < 10) return "Escribe al menos 10 caracteres";
  if (value.trim().length > 1000) return "El mensaje es demasiado largo";
  return "";
};

export const validateRating = (value) => {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 5) return "Selecciona una calificación de 1 a 5";
  return "";
};

export const validateComment = (value) => {
  if (!value) return "";
  if (value.trim().length > COMMENT_MAX) return `Máximo ${COMMENT_MAX} caracteres`;
  return "";
};

export const validateQuantity = (qty, stock) => {
  const n = Number(qty);
  if (!Number.isInteger(n) || n < 1) return "La cantidad mínima es 1";
  if (stock !== undefined && n > stock) return `Solo hay ${stock} disponibles`;
  return "";
};

// Adapta una función validate*(value) -> "" | mensaje a una regla de
// react-hook-form: RHF espera `true` cuando el valor es válido, o un
// string (el mensaje de error) cuando no lo es.
export const rhfRule = (validateFn, ...args) => (value) =>
  validateFn(value, ...args) || true;

// Corre un objeto { campo: mensajeDeError } producido por varias llamadas a
// validate* y devuelve { valid, errors } filtrando los campos sin error.
export const runValidators = (fieldsToErrors) => {
  const errors = {};
  let valid = true;
  for (const [key, message] of Object.entries(fieldsToErrors)) {
    if (message) {
      errors[key] = message;
      valid = false;
    }
  }
  return { valid, errors };
};
