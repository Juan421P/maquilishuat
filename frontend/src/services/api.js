// Base URL del backend
// En desarrollo Vite hace proxy de /api → http://localhost:3000/api
// En producción cambia esto al dominio real del backend
const BASE = "/api";

// Helper genérico con manejo de errores
async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
  return data;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authAPI = {
  // Login de cliente
  login: (email, password) =>
    request("/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  // Logout
  logout: () => request("/logout", { method: "POST" }),

  // Registro de cliente: paso 1 - envía datos y recibe cookie + email de verificación
  register: (name, lastname, birthdate, email, password) =>
    request("/registerClient", {
      method: "POST",
      body: JSON.stringify({ name, lastname, birthdate, email, password }),
    }),

  // Registro: paso 2 - verifica el código de email
  verifyRegister: (verificationCodeRequest) =>
    request("/registerClient/verifyCodeEmail", {
      method: "POST",
      body: JSON.stringify({ verificationCodeRequest }),
    }),

  // Recuperación: paso 1 - solicita código
  requestRecovery: (email) =>
    request("/recoveryClient/requestCode", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  // Recuperación: paso 2 - verifica código
  verifyRecovery: (code) =>
    request("/recoveryClient/verifyCode", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  // Recuperación: paso 3 - nueva contraseña
  newPassword: (newPassword, confirmNewPassword) =>
    request("/recoveryClient/newPassword", {
      method: "POST",
      body: JSON.stringify({ newPassword, confirmNewPassword }),
    }),
};

// ─── Productos ───────────────────────────────────────────────────────────────

export const productsAPI = {
  getAll: () => request("/products"),

  getById: (id) => request(`/products/${id}`),

  create: (formData) =>
    fetch(`${BASE}/products`, {
      method: "POST",
      credentials: "include",
      body: formData, // multipart, no Content-Type header
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
      return data;
    }),

  update: (id, formData) =>
    fetch(`${BASE}/products/${id}`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
      return data;
    }),

  delete: (id) => request(`/products/${id}`, { method: "DELETE" }),
};

// ─── Clientes ────────────────────────────────────────────────────────────────

export const clientsAPI = {
  getAll: () => request("/clients"),

  update: (id, formData) =>
    fetch(`${BASE}/clients/${id}`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
      return data;
    }),

  delete: (id) => request(`/clients/${id}`, { method: "DELETE" }),
};

// ─── Ventas / Pedidos ─────────────────────────────────────────────────────────

export const salesAPI = {
  getAll: () => request("/sales"),

  getById: (id) => request(`/sales/${id}`),

  create: (shopping_cart_id, delivery_address, payment_method, payment_status) =>
    request("/sales", {
      method: "POST",
      body: JSON.stringify({ shopping_cart_id, delivery_address, payment_method, payment_status }),
    }),

  update: (id, data) =>
    request(`/sales/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id) => request(`/sales/${id}`, { method: "DELETE" }),
};

// ─── Carrito de compras ───────────────────────────────────────────────────────

export const cartAPI = {
  getAll: () => request("/shopping-carts"),

  getById: (id) => request(`/shopping-carts/${id}`),

  create: (products, user_id, discount = 0) =>
    request("/shopping-carts", {
      method: "POST",
      body: JSON.stringify({ products, user_id, discount }),
    }),

  update: (id, products, user_id, discount = 0) =>
    request(`/shopping-carts/${id}`, {
      method: "PUT",
      body: JSON.stringify({ products, user_id, discount }),
    }),

  delete: (id) => request(`/shopping-carts/${id}`, { method: "DELETE" }),
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminAPI = {
  getAll: () => request("/admin"),

  register: (name, lastname, email, password) =>
    request("/admin/register", {
      method: "POST",
      body: JSON.stringify({ name, lastname, email, password }),
    }),

  verify: (code) =>
    request("/admin/register/verify", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  update: (id, formData) =>
    fetch(`${BASE}/admin/${id}`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Error ${res.status}`);
      return data;
    }),

  delete: (id) => request(`/admin/${id}`, { method: "DELETE" }),
};
