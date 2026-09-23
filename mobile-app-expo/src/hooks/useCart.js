import { useCallback } from "react";
import { useAsyncStorage } from "./useAsyncStorage";
import { cartCount, cartTotal, formatPrice } from "../utils/format";

// El carrito se guarda POR USUARIO. Antes había una sola clave
// ("maq_carrito") compartida por todas las cuentas del teléfono.
export const LEGACY_CART_KEY = "maq_carrito";
export const cartStorageKey = (userId) => `maq_carrito:${userId}`;

const stockOf = (item) => (Number.isFinite(item?.stock) ? item.stock : Infinity);

// Cada item: { id, nombre, precio, qty, stock, imagen }
// `precio` y `stock` se refrescan con reconcile() cada vez que llega el
// catálogo del backend, y el backend vuelve a validarlos al comprar.
export function useCart(userId) {
  const [cart, setCart, hydrated] = useAsyncStorage(userId ? cartStorageKey(userId) : null, []);

  // Agrega `qty` unidades respetando el stock. Devuelve cuántas quedaron en
  // el carrito y si se llegó al límite, para que la UI lo comunique.
  const addToCart = useCallback((product, qty = 1) => {
    const stock = Number(product.stock) || 0;
    let result = { qty: 0, added: 0, limited: false };
    setCart((prev) => {
      const existing = prev.find((x) => x.id === product._id);
      const current = existing?.qty || 0;
      const nextQty = Math.min(current + qty, stock);
      result = { qty: nextQty, added: Math.max(nextQty - current, 0), limited: current + qty > stock };
      if (nextQty <= 0) return prev;
      const item = {
        id: product._id,
        nombre: product.name,
        precio: Number(product.price) || 0,
        qty: nextQty,
        stock,
        imagen: product.images?.[0]?.image || null,
      };
      return existing ? prev.map((x) => (x.id === product._id ? item : x)) : [...prev, item];
    });
    return result;
  }, [setCart]);

  // +1 / -1 desde el carrito. Nunca supera el stock; bajar de 1 elimina.
  const changeQty = useCallback((id, delta) => {
    setCart((prev) =>
      prev
        .map((x) => (x.id === id ? { ...x, qty: Math.min(x.qty + delta, stockOf(x)) } : x))
        .filter((x) => x.qty > 0)
    );
  }, [setCart]);

  const removeItem = useCallback((id) => setCart((prev) => prev.filter((x) => x.id !== id)), [setCart]);
  const clearCart = useCallback(() => setCart([]), [setCart]);

  // Sincroniza el carrito con el catálogo actual del backend: precios
  // nuevos, stock nuevo, productos eliminados o agotados. Devuelve la lista
  // de cambios (mensajes) para avisarle al usuario.
  const reconcile = useCallback((products) => {
    const byId = new Map(products.map((p) => [p._id, p]));
    const changes = [];
    setCart((prev) => {
      const next = [];
      for (const item of prev) {
        const p = byId.get(item.id);
        if (!p) {
          changes.push(`${item.nombre} ya no está disponible y se quitó del carrito.`);
          continue;
        }
        const stock = Number(p.stock) || 0;
        const price = Number(p.price) || 0;
        if (stock <= 0) {
          changes.push(`${p.name} se agotó y se quitó del carrito.`);
          continue;
        }
        let qty = item.qty;
        if (qty > stock) {
          qty = stock;
          changes.push(`${p.name}: solo quedan ${stock}, ajustamos la cantidad.`);
        }
        if (Math.abs(price - item.precio) > 0.0001) {
          changes.push(`${p.name} cambió de precio: ${formatPrice(item.precio)} → ${formatPrice(price)}.`);
        }
        next.push({ ...item, nombre: p.name, precio: price, stock, qty, imagen: p.images?.[0]?.image || item.imagen || null });
      }
      const same =
        next.length === prev.length &&
        next.every((x, i) => x.qty === prev[i].qty && x.precio === prev[i].precio && x.stock === prev[i].stock && x.nombre === prev[i].nombre && x.imagen === prev[i].imagen);
      return same ? prev : next;
    });
    return changes;
  }, [setCart]);

  const qtyOf = useCallback((id) => cart.find((x) => x.id === id)?.qty || 0, [cart]);

  return {
    cart,
    setCart,
    hydrated,
    addToCart,
    changeQty,
    removeItem,
    clearCart,
    reconcile,
    qtyOf,
    totalItems: cartCount(cart),
    subtotal: cartTotal(cart),
  };
}
