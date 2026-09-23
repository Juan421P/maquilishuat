import * as SecureStore from "expo-secure-store";
import { API_URL, API_URL_MISSING_MESSAGE } from "../config";
import { ApiError, extractErrorMessage, NETWORK_MESSAGE, TIMEOUT_MESSAGE } from "../utils/errors";
import { normalizeEmail, sanitizeCode } from "../utils/validators";

const TOKEN_KEY = "maq_token";
const REG_TOKEN_KEY = "maq_registration_token";
const RECOVERY_TOKEN_KEY = "maq_recovery_token";

const REQUEST_TIMEOUT_MS = 15000;
const UPLOAD_TIMEOUT_MS = 60000;

const makeStore = (key) => ({
  get: () => SecureStore.getItemAsync(key),
  set: (value) => SecureStore.setItemAsync(key, value),
  clear: () => SecureStore.deleteItemAsync(key),
});

export const tokenStore = makeStore(TOKEN_KEY);

// El backend usa cookies (RegistrationCookie / recoveryCookie) para los
// pasos intermedios de registro y recuperación de contraseña. En Expo Go
// no existe un cookie jar como en el navegador, así que esos tokens se
// guardan aquí y se reenvían a mano en cada request (ver `authAPI`).
export const registrationTokenStore = makeStore(REG_TOKEN_KEY);
export const recoveryTokenStore = makeStore(RECOVERY_TOKEN_KEY);

// ─── Sesión expirada (401) ────────────────────────────────────────────────
// AuthContext registra aquí qué hacer cuando un request AUTENTICADO recibe
// 401: borrar la sesión y volver al login. Así ninguna pantalla tiene que
// manejarlo por su cuenta ni se queda "Cargando..." para siempre.
let unauthorizedHandler = null;
export const setUnauthorizedHandler = (fn) => {
  unauthorizedHandler = fn;
};

async function req(path, { method = "GET", body, headers = {}, auth = true, timeout = REQUEST_TIMEOUT_MS } = {}) {
  if (!API_URL) {
    throw new ApiError(API_URL_MISSING_MESSAGE, { kind: "config" });
  }
  const token = auth ? await tokenStore.get() : null;
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(isForm ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    if (e?.name === "AbortError") {
      throw new ApiError(TIMEOUT_MESSAGE, { kind: "timeout" });
    }
    throw new ApiError(NETWORK_MESSAGE, { kind: "network" });
  } finally {
    clearTimeout(timer);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new ApiError(extractErrorMessage(res.status, data), {
      status: res.status,
      code: data?.code || null,
      data,
    });
    // Solo es "sesión expirada" si el request llevaba token. Un 401 del
    // login (credenciales incorrectas) no debe cerrar ninguna sesión.
    if (res.status === 401 && token && unauthorizedHandler) {
      unauthorizedHandler(error);
    }
    throw error;
  }
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authAPI = {
  // Devuelve el body del backend: { token, userType, user }. NO guarda el
  // token: AuthContext decide si el usuario puede entrar (solo clientes).
  login: (email, password) =>
    req("/login", { method: "POST", auth: false, body: { email: normalizeEmail(email), password } }),

  logout: async () => {
    try {
      await req("/logout", { method: "POST" });
    } finally {
      await tokenStore.clear();
    }
  },

  register: async (name, lastname, birthdate, email, password) => {
    const data = await req("/registerClient", {
      method: "POST",
      auth: false,
      body: { name, lastname, birthdate, email: normalizeEmail(email), password },
    });
    if (data.registrationToken) await registrationTokenStore.set(data.registrationToken);
    return data;
  },

  verifyCode: async (verificationCodeRequest) => {
    const registrationToken = await registrationTokenStore.get();
    const data = await req("/registerClient/verifyCodeEmail", {
      method: "POST",
      auth: false,
      body: { verificationCodeRequest: sanitizeCode(verificationCodeRequest), registrationToken },
    });
    await registrationTokenStore.clear();
    return data;
  },

  requestRecovery: async (email) => {
    const data = await req("/recoveryClient/requestCode", {
      method: "POST",
      auth: false,
      body: { email: normalizeEmail(email) },
    });
    if (data.recoveryToken) await recoveryTokenStore.set(data.recoveryToken);
    return data;
  },

  verifyRecovery: async (code) => {
    const recoveryToken = await recoveryTokenStore.get();
    const data = await req("/recoveryClient/verifyCode", {
      method: "POST",
      auth: false,
      body: { code: sanitizeCode(code), recoveryToken },
    });
    if (data.recoveryToken) await recoveryTokenStore.set(data.recoveryToken);
    return data;
  },

  newPassword: async (newPassword, confirmNewPassword) => {
    const recoveryToken = await recoveryTokenStore.get();
    const data = await req("/recoveryClient/newPassword", {
      method: "POST",
      auth: false,
      body: { newPassword, confirmNewPassword, recoveryToken },
    });
    await recoveryTokenStore.clear();
    return data;
  },
};

// ─── Perfil del cliente ───────────────────────────────────────────────────
export const clientsAPI = {
  getById: (id) => req(`/clients/${id}`),

  // `fields` puede traer name, lastname, birthdate, currentPassword +
  // newPassword y `picture` ({ uri, name, type }) para cambiar la foto.
  update: (id, fields) => {
    const { picture, ...rest } = fields;
    if (!picture) {
      return req(`/clients/${id}`, { method: "PUT", body: rest });
    }
    const form = new FormData();
    Object.entries(rest).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, String(v));
    });
    form.append("picture", picture);
    return req(`/clients/${id}`, { method: "PUT", body: form, timeout: UPLOAD_TIMEOUT_MS });
  },

  remove: (id, password) => req(`/clients/${id}`, { method: "DELETE", body: { password } }),
};

// ─── Productos ────────────────────────────────────────────────────────────
export const productsAPI = {
  getAll: () => req("/products", { auth: false }),
  getById: (id) => req(`/products/${id}`, { auth: false }),
};

// ─── Carrito ──────────────────────────────────────────────────────────────
export const cartAPI = {
  // El descuento lo decide el backend (solo admin), no se envía.
  create: (products) => req("/shopping-carts", { method: "POST", body: { products } }),
};

// ─── Ventas ───────────────────────────────────────────────────────────────
export const salesAPI = {
  // payment_status NO se envía: el backend siempre crea la venta "pending".
  create: (shopping_cart_id, delivery_address, payment_method) =>
    req("/sales", {
      method: "POST",
      body: { shopping_cart_id, delivery_address, payment_method },
    }),

  getMine: () => req("/sales/mine"),
};

// ─── Reviews ──────────────────────────────────────────────────────────────
export const reviewsAPI = {
  getByProduct: (productId) => req(`/reviews/product/${productId}`, { auth: false }),

  create: (product_id, rating, comment) =>
    req("/reviews", { method: "POST", body: { product_id, rating, comment } }),

  getMine: () => req("/reviews/mine"),
};
