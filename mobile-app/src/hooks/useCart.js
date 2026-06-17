import { useSessionStorage } from "./useSessionStorage";
import { cartCount } from "../utils/format";

export function useCart() {
  const [cart, setCart] = useSessionStorage("maq_carrito", []);

  const addToCart = (product) => {
    const updated = (() => {
      const existing = cart.find((x) => x.id === product._id);
      if (existing) {
        return cart.map((x) =>
          x.id === product._id ? { ...x, qty: x.qty + 1 } : x
        );
      }
      return [
        ...cart,
        { id: product._id, nombre: product.name, precio: product.price, qty: 1 },
      ];
    })();
    setCart(updated);
  };

  const changeQty = (id, delta) => {
    const updated = cart
      .map((x) => (x.id === id ? { ...x, qty: x.qty + delta } : x))
      .filter((x) => x.qty > 0);
    setCart(updated);
  };

  const removeItem = (id) => {
    setCart(cart.filter((x) => x.id !== id));
  };

  const clearCart = () => setCart([]);

  return {
    cart,
    setCart,
    addToCart,
    changeQty,
    removeItem,
    clearCart,
    totalItems: cartCount(cart),
  };
}
