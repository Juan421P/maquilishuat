import * as SecureStore from "expo-secure-store";
import { API_URL } from "../config";

const TOKEN_KEY = "maq_token";

export const tokenStore = {
  get: () => SecureStore.getItemAsync(TOKEN_KEY),
  set: (token) => SecureStore.setItemAsync(TOKEN_KEY, token),
  clear: () => SecureStore.deleteItemAsync(TOKEN_KEY),
};

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

  register: (name, lastname, birthdate, email, password) =>
    req("/registerClient", {
      method: "POST",
      body: JSON.stringify({ name, lastname, birthdate, email, password }),
    }),

  verifyCode: (verificationCodeRequest) =>
    req("/registerClient/verifyCodeEmail", {
      method: "POST",
      body: JSON.stringify({ verificationCodeRequest }),
    }),

  requestRecovery: (email) =>
    req("/recoveryClient/requestCode", { method: "POST", body: JSON.stringify({ email }) }),

  verifyRecovery: (code) =>
    req("/recoveryClient/verifyCode", { method: "POST", body: JSON.stringify({ code }) }),

  newPassword: (newPassword, confirmNewPassword) =>
    req("/recoveryClient/newPassword", {
      method: "POST",
      body: JSON.stringify({ newPassword, confirmNewPassword }),
    }),
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
