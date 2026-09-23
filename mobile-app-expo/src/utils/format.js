export const formatPrice = (val) => `$${(Number(val) || 0).toFixed(2)}`;

export const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

export const cartTotal = (items) =>
  round2(items.reduce((acc, x) => acc + (Number(x.precio) || 0) * x.qty, 0));

export const cartCount = (items) =>
  items.reduce((acc, x) => acc + x.qty, 0);

// Debe coincidir con SHIPPING_COST del backend (backend/src/utils/validation.js).
// El backend es quien lo cobra; aquí solo se muestra antes de confirmar.
export const SHIPPING_COST = 1.5;
export const shippingFor = (subtotal) => (subtotal > 0 ? SHIPPING_COST : 0);

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MONTHS_LONG = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// "2026-09-22T20:10:00Z" → "22 sep 2026"
export const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

// Igual que formatDate pero con hora: "22 sep 2026, 8:10 p. m."
export const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const h = d.getHours();
  const hh = h % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${formatDate(value)}, ${hh}:${mm} ${h < 12 ? "a. m." : "p. m."}`;
};

// Fecha de nacimiento guardada por el backend (medianoche UTC) o
// "AAAA-MM-DD" → "20 de abril de 1995". Se usan los componentes de la
// fecha tal como vienen para no restar un día por la zona horaria.
export const formatBirthdate = (value) => {
  if (!value) return "—";
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "—";
  return `${Number(m[3])} de ${MONTHS_LONG[Number(m[2]) - 1]} de ${m[1]}`;
};

export const orderNumber = (id) => `#${String(id || "").slice(-6).toUpperCase()}`;

export const PAYMENT_STATUS_LABEL = { pending: "Pendiente", paid: "Pagado", partial: "Parcial" };
export const PAYMENT_STATUS_COLOR = {
  paid: { bg: "#dcfce7", color: "#16a34a" },
  partial: { bg: "#fef9c3", color: "#a16207" },
  pending: { bg: "#fee2e2", color: "#dc2626" },
};

// Total de una venta: las nuevas traen `total` (con envío) calculado por el
// backend; las anteriores a ese cambio solo tienen el total del carrito.
export const saleTotal = (sale) =>
  sale?.total ?? sale?.shopping_cart_id?.total_with_discount ?? sale?.shopping_cart_id?.total ?? 0;
