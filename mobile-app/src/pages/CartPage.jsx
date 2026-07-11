import { useState } from "react";
import { toast } from "react-toastify";
import { T, GRAD } from "../utils/theme";
import { cartAPI, salesAPI } from "../services/api";
import { formatPrice, cartTotal } from "../utils/format";
import AppBar from "../layout/AppBar";
import Field from "../components/Field";
import Alert from "../components/Alert";
import Btn from "../components/Btn";
import Ic from "../components/Ic";

const SHIPPING = 1.5;
const METODOS  = ["Efectivo", "Transferencia", "Tarjeta"];

export default function CartPage({ cart, changeQty, removeItem, clearCart, onOrderSuccess }) {
  const [addr,    setAddr]    = useState("");
  const [metodo,  setMetodo]  = useState("Efectivo");
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");

  const subtotal = cartTotal(cart);
  const total    = subtotal + (subtotal > 0 ? SHIPPING : 0);

  const handleOrder = async () => {
    if (!addr.trim()) { setErr("Ingresa la dirección de entrega"); return; }
    setLoading(true); setErr("");
    try {
      const products = cart.map((x) => ({ product_id: x.id, amount: x.qty }));
      const cartRes  = await cartAPI.create(products);
      await salesAPI.create(cartRes.cart._id, addr, metodo);
      clearCart();
      toast.success("¡Pedido registrado con éxito!");
      onOrderSuccess();
    } catch (e) {
      const msg = e.message || "Error al procesar el pedido";
      setErr(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <AppBar title="Carrito" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: T.bg, padding: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#fce7f3,#f3e8ff)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ic n="bag" size={32} color={T.purple} />
          </div>
          <p style={{ fontSize: 17, fontWeight: 800, color: T.text1 }}>Carrito vacío</p>
          <p style={{ fontSize: 14, color: T.textMut, textAlign: "center" }}>Agrega productos desde el catálogo</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AppBar title="Mi carrito" />
      <div style={{ flex: 1, overflowY: "auto", background: T.bg, padding: 14 }}>
        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {cart.map((item) => (
            <div key={item.id} style={{ background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, padding: "12px 13px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 42, height: 42, borderRadius: 9, background: "linear-gradient(135deg,#f3e8ff,#fce7f3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Ic n="water" size={20} color={T.purple} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: T.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.nombre}</p>
                <p style={{ fontSize: 12, color: T.textMut }}>{formatPrice(item.precio)} c/u</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <button onClick={() => changeQty(item.id, -1)} style={{ width: 26, height: 26, borderRadius: "50%", background: "#f3e8ff", border: "1px solid #e9d5ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ic n="minus" size={12} color={T.purple} />
                </button>
                <span style={{ fontSize: 14, fontWeight: 800, minWidth: 20, textAlign: "center", color: T.text1 }}>{item.qty}</span>
                <button onClick={() => changeQty(item.id, 1)} style={{ width: 26, height: 26, borderRadius: "50%", background: "#f3e8ff", border: "1px solid #e9d5ff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ic n="plus" size={12} color={T.purple} />
                </button>
                <button onClick={() => removeItem(item.id)} style={{ width: 26, height: 26, borderRadius: "50%", background: "#fff1f2", border: "1px solid #fecdd3", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 4 }}>
                  <Ic n="trash" size={11} color={T.red} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery */}
        <div style={{ background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, padding: 14, marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: T.text1, marginBottom: 12 }}>Datos de entrega</p>
          <Field label="Dirección" value={addr} onChange={(e) => { setAddr(e.target.value); setErr(""); }}
            placeholder="Col. San Benito, Av. La Revolución #25" iconName="map" />
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: T.text3, display: "block", marginBottom: 7 }}>
              Método de pago
            </label>
            <div style={{ display: "flex", gap: 6 }}>
              {METODOS.map((m) => (
                <button key={m} onClick={() => setMetodo(m)} style={{
                  flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer",
                  fontSize: 11, fontWeight: 700,
                  background: metodo === m ? T.purple : "#f3e8ff",
                  color:      metodo === m ? "#fff"   : T.purple,
                }}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div style={{ background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, padding: 14 }}>
          {[["Subtotal", formatPrice(subtotal)], ["Envío", formatPrice(SHIPPING)]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, color: T.text3, marginBottom: 7 }}>
              <span>{l}</span><span>{v}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: T.text1, borderTop: `1px solid ${T.border}`, paddingTop: 9, marginTop: 4 }}>
            <span>Total</span>
            <span style={{ color: T.purpleDark }}>{formatPrice(total)}</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <Alert msg={err} />
            <Btn onClick={handleOrder} disabled={loading}>
              {loading ? "Procesando..." : "Confirmar pedido"}
            </Btn>
          </div>
        </div>
        <div style={{ height: 14 }} />
      </div>
    </div>
  );
}
