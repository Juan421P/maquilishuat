import * as SecureStore from "expo-secure-store";
import { API_URL } from "../config";

const TOKEN_KEY = "maq_token";
const REG_TOKEN_KEY = "maq_registration_token";
const RECOVERY_TOKEN_KEY = "maq_recovery_token";

const makeStore = (key) => ({
  get: () => SecureStore.getItemAsync(key),
  set: (value) => SecureStore.setItemAsync(key, value),
  clear: () => SecureStore.deleteItemAsync(key),
});

export const tokenStore = makeStore(TOKEN_KEY);

// El backend usa cookies (RegistrationCookie / recoveryCookie) para los
// pasos intermedios de registro y recuperación de contraseña. En Expo Go
// no existe un cookie jar como en el navegador, así que esos tokens se
// guardan aquí y se reenvían a mano en cada request (ver `req()` abajo y
// los métodos de `authAPI`).
export const registrationTokenStore = makeStore(REG_TOKEN_KEY);
export const recoveryTokenStore = makeStore(RECOVERY_TOKEN_KEY);

async function req(path, opts = {}) {
  const token = await tokenStore.get();
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authAPI = {
  login: async (email, password) => {
    const data = await req("/login", { method: "POST", body: JSON.stringify({ email, password }) });
    // El backend ahora también devuelve `token` en el body (además de la
    // cookie que usa la web) para que la app nativa pueda guardarlo.
    if (data.token) await tokenStore.set(data.token);
    return data;
  },

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
      body: JSON.stringify({ name, lastname, birthdate, email, password }),
    });
    if (data.registrationToken) await registrationTokenStore.set(data.registrationToken);
    return data;
  },

  verifyCode: async (verificationCodeRequest) => {
    const registrationToken = await registrationTokenStore.get();
    const data = await req("/registerClient/verifyCodeEmail", {
      method: "POST",
      body: JSON.stringify({ verificationCodeRequest, registrationToken }),
    });
    await registrationTokenStore.clear();
    return data;
  },

  requestRecovery: async (email) => {
    const data = await req("/recoveryClient/requestCode", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    if (data.recoveryToken) await recoveryTokenStore.set(data.recoveryToken);
    return data;
  },

  verifyRecovery: async (code) => {
    const recoveryToken = await recoveryTokenStore.get();
    const data = await req("/recoveryClient/verifyCode", {
      method: "POST",
      body: JSON.stringify({ code, recoveryToken }),
    });
    if (data.recoveryToken) await recoveryTokenStore.set(data.recoveryToken);
    return data;
  },

  newPassword: async (newPassword, confirmNewPassword) => {
    const recoveryToken = await recoveryTokenStore.get();
    const data = await req("/recoveryClient/newPassword", {
      method: "POST",
      body: JSON.stringify({ newPassword, confirmNewPassword, recoveryToken }),
    });
    await recoveryTokenStore.clear();
    return data;
  },
};

// ─── Productos ────────────────────────────────────────────────────────────
export const productsAPI = {
  getAll: () => req("/products"),
};

// ─── Carrito ──────────────────────────────────────────────────────────────
export const cartAPI = {
  create: (products, discount = 0) =>
    req("/shopping-carts", { method: "POST", body: JSON.stringify({ products, discount }) }),
};

// ─── Ventas ───────────────────────────────────────────────────────────────
export const salesAPI = {
  create: (shopping_cart_id, delivery_address, payment_method, payment_status = "pending") =>
    req("/sales", {
      method: "POST",
      body: JSON.stringify({ shopping_cart_id, delivery_address, payment_method, payment_status }),
    }),

  getMine: () => req("/sales/mine"),
};

// ─── Reviews ────────────────────────────────────────────────────────────
export const reviewsAPI = {
  getByProduct: (productId) => req(`/reviews/product/${productId}`),

  create: (product_id, rating, comment) =>
    req("/reviews", { method: "POST", body: JSON.stringify({ product_id, rating, comment }) }),

  getMine: () => req("/reviews/mine"),
};
