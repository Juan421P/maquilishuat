import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "../components/Toast";
import { cartAPI, salesAPI } from "../services/api";
import { ApiError, getErrorMessage } from "../utils/errors";
import { cartTotal, round2, shippingFor, SHIPPING_COST } from "../utils/format";
import { validateAddress, rhfRule } from "../utils/validators";

// Deben coincidir con CLIENT_PAYMENT_METHODS del backend.
const METODOS = ["Efectivo", "Transferencia", "Tarjeta"];

// Encapsula el formulario de entrega/pago y el flujo de confirmar pedido:
//   1. valida dirección y método
//   2. vuelve a pedir el catálogo y revalida precio y stock del carrito
//      (si algo cambió, se avisa y NO se compra hasta que el usuario revise)
//   3. crea el shopping-cart (el backend calcula precios y valida stock)
//   4. crea la venta (el backend descuenta stock, suma el envío y deja el
//      pago en "pending")
//   5. limpia el carrito y refresca catálogo y pedidos
export function useCheckoutForm({ cart, clearCart, reconcile, loadProducts, onPurchased, defaultAddress = "" }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [changes, setChanges] = useState([]);
  const submittingRef = useRef(false);

  const { control, handleSubmit, getValues, setValue, formState: { errors } } = useForm({
    defaultValues: { addr: defaultAddress, metodo: METODOS[0] },
    mode: "onSubmit",
  });

  // Rellena la dirección con la del último pedido cuando llega del backend.
  useEffect(() => {
    if (defaultAddress && !getValues("addr")) setValue("addr", defaultAddress);
  }, [defaultAddress, getValues, setValue]);

  const subtotal = cartTotal(cart);
  const shipping = shippingFor(subtotal);
  const total = round2(subtotal + shipping);

  const submit = handleSubmit(async ({ addr, metodo }) => {
    if (submittingRef.current) return; // evita doble toque
    submittingRef.current = true;
    setServerError("");
    setChanges([]);
    setLoading(true);
    try {
      // 2. Revalidar con el backend antes de comprar.
      const fresh = await loadProducts({ silent: true, throwOnError: true });
      const detected = reconcile(fresh);
      if (detected.length > 0) {
        setChanges(detected);
        toast?.info("Tu carrito cambió. Revísalo antes de confirmar.");
        return;
      }
      const items = cart.map((x) => ({ product_id: x.id, amount: x.qty }));
      if (items.length === 0) return;

      // 3 y 4.
      const cartRes = await cartAPI.create(items);
      const saleRes = await salesAPI.create(cartRes.cart._id, addr.trim(), metodo);

      // 5.
      clearCart();
      toast?.success("¡Pedido registrado con éxito!");
      onPurchased(saleRes.sale || null);
    } catch (e) {
      if (e instanceof ApiError && (e.code === "INSUFFICIENT_STOCK" || e.status === 404)) {
        // Otro cliente compró antes: se actualiza el carrito con el stock real.
        try {
          const fresh = await loadProducts({ silent: true, throwOnError: true });
          setChanges(reconcile(fresh));
        } catch (reloadError) {
          console.warn("No se pudo actualizar el catálogo", reloadError);
        }
      }
      const msg = getErrorMessage(e, "Error al procesar el pedido");
      setServerError(msg);
      toast?.error(msg);
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  });

  return {
    control,
    errors,
    submit,
    loading,
    serverError,
    changes,
    dismissChanges: () => setChanges([]),
    subtotal,
    shipping,
    shippingCost: SHIPPING_COST,
    total,
    metodos: METODOS,
    rules: { addr: { validate: rhfRule(validateAddress) } },
  };
}
