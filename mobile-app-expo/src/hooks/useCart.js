import { useAsyncStorage } from "./useAsyncStorage";
import { cartCount } from "../utils/format";

export function useCart() {
  const [cart, setCart] = useAsyncStorage("maq_carrito", []);

  const addToCart = (product) => {
    const existing = cart.find((x) => x.id === product._id);
    const updated = existing
      ? cart.map((x) => (x.id === product._id ? { ...x, qty: x.qty + 1 } : x))
      : [...cart, { id: product._id, nombre: product.name, precio: product.price, qty: 1 }];
    setCart(updated);
  };

  const changeQty = (id, delta) => {
    const updated = cart
      .map((x) => (x.id === id ? { ...x, qty: x.qty + delta } : x))
      .filter((x) => x.qty > 0);
    setCart(updated);
  };

  const removeItem = (id) => setCart(cart.filter((x) => x.id !== id));
  const clearCart = () => setCart([]);

  return { cart, setCart, addToCart, changeQty, removeItem, clearCart, totalItems: cartCount(cart) };
}
