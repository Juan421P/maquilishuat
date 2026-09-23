// ─────────────────────────────────────────────────────────────────────────
// Límite de reenvío de códigos por correo (registro y recuperación).
//
// Evita que alguien use los endpoints para hacer spam a un correo: entre un
// envío y el siguiente al MISMO correo y para el MISMO propósito deben pasar
// CODE_RESEND_SECONDS. Se guarda en memoria: es suficiente para una sola
// instancia del backend (si en algún momento se escala a varias instancias,
// habría que moverlo a la base de datos o a Redis).
// ─────────────────────────────────────────────────────────────────────────
export const CODE_RESEND_SECONDS = 60;
export const CODE_TTL_SECONDS = 15 * 60;

const lastSent = new Map();

const key = (purpose, email) => `${purpose}:${email}`;

// Segundos que faltan para poder enviar otro código (0 si ya se puede).
export const secondsUntilResend = (purpose, email) => {
    const at = lastSent.get(key(purpose, email));
    if (!at) return 0;
    const remaining = Math.ceil((at + CODE_RESEND_SECONDS * 1000 - Date.now()) / 1000);
    if (remaining <= 0) {
        lastSent.delete(key(purpose, email));
        return 0;
    }
    return remaining;
};

export const markCodeSent = (purpose, email) => lastSent.set(key(purpose, email), Date.now());
export const clearCodeCooldown = (purpose, email) => lastSent.delete(key(purpose, email));
