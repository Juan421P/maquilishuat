// ─────────────────────────────────────────────────────────────────────────
// Validadores puros y reutilizables. Cada función recibe un valor y
// devuelve un string con el mensaje de error, o "" si el valor es válido.
// Se usan tanto desde react-hook-form (como "validate") como desde
// runValidators() para validaciones que se disparan a mano.
// ─────────────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const validateRequired = (value, label = "Este campo") => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return `${label} es obligatorio`;
  }
  return "";
};

export const validateEmail = (value) => {
  if (!value || !value.trim()) return "El correo es obligatorio";
  if (!EMAIL_REGEX.test(value.trim())) return "Ingresa un correo válido";
  return "";
};

export const validateName = (value, label = "Este campo") => {
  if (!value || !value.trim()) return `${label} es obligatorio`;
  if (value.trim().length < 2) return `${label} debe tener al menos 2 caracteres`;
  if (value.trim().length > 60) return `${label} es demasiado largo`;
  return "";
};

export const validateBirthdate = (value) => {
  if (!value || !value.trim()) return "La fecha de nacimiento es obligatoria";
  if (!DATE_REGEX.test(value.trim())) return "Usa el formato AAAA-MM-DD";
  const date = new Date(value.trim());
  if (Number.isNaN(date.getTime())) return "Fecha inválida";
  const age = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  if (age < 13) return "Debes tener al menos 13 años";
  if (age > 120) return "Fecha inválida";
  return "";
};

export const validatePassword = (value) => {
  if (!value) return "La contraseña es obligatoria";
  if (value.length < 8) return "Mínimo 8 caracteres";
  if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
    return "Debe incluir al menos 1 letra y 1 número";
  }
  return "";
};

export const validateConfirmPassword = (password, confirm) => {
  if (!confirm) return "Confirma tu contraseña";
  if (password !== confirm) return "Las contraseñas no coinciden";
  return "";
};

export const validateCode = (value) => {
  if (!value || !value.trim()) return "El código es obligatorio";
  if (value.trim().length < 4) return "El código no es válido";
  return "";
};

export const validateAddress = (value) => {
  if (!value || !value.trim()) return "La dirección es obligatoria";
  if (value.trim().length < 8) return "Escribe una dirección más detallada";
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
  if (!n || n < 1 || n > 5) return "Selecciona una calificación de 1 a 5";
  return "";
};

export const validateComment = (value) => {
  if (!value) return "";
  if (value.trim().length > 500) return "Máximo 500 caracteres";
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
