// utilidades de formato — las centralizamos aquí para no repetirlas por todo el código

// formatea un número como moneda SV (dólares)
export const formatMoney = (n) =>
  new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(n);

// devuelve las iniciales de un nombre (máximo 2 letras)
export const getInitials = (nombre = "") =>
  nombre.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

// formato de fecha legible en español
export const formatFecha = (isoStr) =>
  new Date(isoStr).toLocaleDateString("es-SV", { day: "2-digit", month: "short", year: "numeric" });
