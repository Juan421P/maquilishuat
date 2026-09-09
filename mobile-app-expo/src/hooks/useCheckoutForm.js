import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "../components/Toast";
import { cartAPI, salesAPI } from "../services/api";
import { cartTotal } from "../utils/format";
import { validateAddress, rhfRule } from "../utils/validators";

const SHIPPING = 1.5;
const METODOS = ["Efectivo", "Transferencia", "Tarjeta"];

// Encapsula el formulario de entrega/pago y el flujo de confirmar pedido
// (crear shopping-cart -> crear sale -> limpiar carrito local).
export function useCheckoutForm({ cart, clearCart, onOrderSuccess }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { addr: "", metodo: METODOS[0] },
    mode: "onSubmit",
  });

  const subtotal = cartTotal(cart);
  const total = subtotal + (subtotal > 0 ? SHIPPING : 0);

  const submit = handleSubmit(async ({ addr, metodo }) => {
    setServerError("");
    setLoading(true);
    try {
      const products = cart.map((x) => ({ product_id: x.id, amount: x.qty }));
      const cartRes = await cartAPI.create(products);
      await salesAPI.create(cartRes.cart._id, addr.trim(), metodo);
      clearCart();
      toast?.success("¡Pedido registrado con éxito!");
      onOrderSuccess();
    } catch (e) {
      const msg = e.message || "Error al procesar el pedido";
      setServerError(msg);
      toast?.error(msg);
    } finally {
      setLoading(false);
    }
  });

  return {
    control,
    errors,
    submit,
    loading,
    serverError,
    subtotal,
    shipping: SHIPPING,
    total,
    metodos: METODOS,
    rules: { addr: { validate: rhfRule(validateAddress) } },
  };
}
