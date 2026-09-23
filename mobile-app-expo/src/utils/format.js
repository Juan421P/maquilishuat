export const formatPrice = (val) => `$${Number(val).toFixed(2)}`;

export const cartTotal = (items) =>
  items.reduce((acc, x) => acc + x.precio * x.qty, 0);

export const cartCount = (items) =>
  items.reduce((acc, x) => acc + x.qty, 0);
