// ─────────────────────────────────────────────────────────────────────────
// Reglas de validación compartidas por los controladores y los modelos.
//
// La app móvil (mobile-app-expo/src/utils/validators.js) replica EXACTAMENTE
// estas mismas reglas para que el usuario vea el error antes de enviar y
// nunca descubra un rechazo del backend después de recibir un correo.
// Si cambias algo aquí, cámbialo también allá.
// ─────────────────────────────────────────────────────────────────────────
import mongoose from "mongoose";

// Correo: parte local con letras, números y . _ % + - (sin puntos al inicio,
// al final ni dobles), dominio con subdominios y TLD alfabético de 2 a 24
// letras. Acepta casos reales como `juan+1@gmail.com` o `ana@empresa.info`,
// que la regex anterior rechazaba.
export const EMAIL_REGEX =
    /^[A-Za-z0-9_%+-]+(?:\.[A-Za-z0-9_%+-]+)*@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,24}$/;

// Nombre / apellido: letras (con tildes, ü y ñ), espacios, apóstrofo, guion
// y punto. Sin números ni otros símbolos.
export const NAME_REGEX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]*$/;

// Los códigos de verificación se generan con crypto.randomBytes(3).toString("hex")
export const CODE_REGEX = /^[0-9a-f]{6}$/;

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72; // límite real de bcrypt
export const ADDRESS_MIN = 8;
export const ADDRESS_MAX = 200;
export const MIN_AGE = 18;

// Costo fijo de envío a domicilio. La web y la app lo muestran igual.
export const SHIPPING_COST = 1.5;

// Métodos de pago que puede elegir el cliente al comprar. El admin, desde el
// panel, además puede usar "Otro".
export const CLIENT_PAYMENT_METHODS = ["Efectivo", "Transferencia", "Tarjeta"];
export const ADMIN_PAYMENT_METHODS = [...CLIENT_PAYMENT_METHODS, "Otro"];
export const PAYMENT_STATUSES = ["pending", "paid", "partial"];

export const normalizeEmail = (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : "";

export const normalizeCode = (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : "";

export const isValidObjectId = (value) =>
    typeof value === "string" && mongoose.isValidObjectId(value) && /^[0-9a-fA-F]{24}$/.test(value);

export const validateEmail = (email) => {
    if (!email) return "El correo es obligatorio";
    if (email.length > 254 || !EMAIL_REGEX.test(email)) return "Ingresa un correo válido";
    return "";
};

export const validateName = (value, label) => {
    const v = typeof value === "string" ? value.trim() : "";
    if (!v) return `${label} es obligatorio`;
    if (v.length < 2) return `${label} debe tener al menos 2 caracteres`;
    if (v.length > 60) return `${label} es demasiado largo`;
    if (!NAME_REGEX.test(v)) return `${label} solo puede contener letras`;
    return "";
};

export const validatePassword = (value) => {
    if (typeof value !== "string" || !value) return "La contraseña es obligatoria";
    if (value.length < PASSWORD_MIN) return `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres`;
    if (value.length > PASSWORD_MAX) return `La contraseña no puede superar ${PASSWORD_MAX} caracteres`;
    return "";
};

// Edad en años cumplidos usando componentes UTC. Las fechas llegan como
// "AAAA-MM-DD", que JavaScript interpreta como medianoche UTC; usar getters
// locales podía desfasar el cálculo un día según la zona horaria del server.
export const ageInYears = (date, now = new Date()) => {
    let age = now.getUTCFullYear() - date.getUTCFullYear();
    const m = now.getUTCMonth() - date.getUTCMonth();
    if (m < 0 || (m === 0 && now.getUTCDate() < date.getUTCDate())) age--;
    return age;
};

export const parseBirthdate = (value) => {
    if (value instanceof Date) return value;
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(value.trim())) return null;
    const date = new Date(value.trim().slice(0, 10));
    if (Number.isNaN(date.getTime())) return null;
    // Rechaza fechas que JS "corrige" solo, como 2001-02-31 → 2001-03-03
    if (date.toISOString().slice(0, 10) !== value.trim().slice(0, 10)) return null;
    return date;
};

export const validateBirthdate = (value) => {
    if (!value) return "La fecha de nacimiento es obligatoria";
    const date = parseBirthdate(value);
    if (!date) return "Fecha de nacimiento inválida";
    if (date > new Date()) return "La fecha de nacimiento no puede ser futura";
    if (date < new Date("1900-01-01")) return "Fecha de nacimiento inválida";
    if (ageInYears(date) < MIN_AGE) return `Debes ser mayor de ${MIN_AGE} años`;
    return "";
};

export const validateAddress = (value) => {
    const v = typeof value === "string" ? value.trim() : "";
    if (!v) return "La dirección de entrega es obligatoria";
    if (v.length < ADDRESS_MIN) return "Escribe una dirección más detallada";
    if (v.length > ADDRESS_MAX) return `La dirección no puede superar ${ADDRESS_MAX} caracteres`;
    return "";
};

// Error HTTP con status y datos extra que los controladores pueden lanzar.
export class HttpError extends Error {
    constructor(status, message, extra = {}) {
        super(message);
        this.status = status;
        this.extra = extra;
    }
}

export const sendHttpError = (res, error, fallbackMessage = "Error interno del servidor") => {
    if (error instanceof HttpError) {
        return res.status(error.status).json({ message: error.message, ...error.extra });
    }
    if (error?.name === "ValidationError") {
        const message = Object.values(error.errors || {})[0]?.message || "Datos inválidos";
        return res.status(400).json({ message });
    }
    if (error?.name === "CastError") {
        return res.status(400).json({ message: "Identificador inválido" });
    }
    console.log("error " + (error?.stack || error));
    return res.status(500).json({ message: fallbackMessage });
};
