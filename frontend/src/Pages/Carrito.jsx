import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ArrowLeft, CheckCircle2, Plus, Minus, LogIn } from "lucide-react";
import { toast } from "react-toastify";
import ProductIcon from "../components/ProductIcon";
import PublicNav from "../components/PublicNav";
import { cartAPI, salesAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

export default function Carrito() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("maq_carrito") || "[]"); } catch { return []; }
  });
  const [pedidoOk, setPedidoOk] = useState(false);
  const [direccion, setDireccion] = useState("");
  const [metodo, setMetodo] = useState("Efectivo");
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { isLoggedIn } = useAuth();

  const cambiar = (id, delta) => {
    const updated = items.map(x => x.id === id ? { ...x, qty: x.qty + delta } : x).filter(x => x.qty > 0);
    setItems(updated);
    sessionStorage.setItem("maq_carrito", JSON.stringify(updated));
  };

  const quitar = (id) => {
    const updated = items.filter(x => x.id !== id);
    setItems(updated);
    sessionStorage.setItem("maq_carrito", JSON.stringify(updated));
  };

  const subtotal = items.reduce((a, x) => a + x.precio * x.qty, 0);
  const envio = subtotal > 0 ? 1.50 : 0;
  const total = subtotal + envio;

  const handleConfirm = async () => {
    if (!isLoggedIn) { setError("Debes iniciar sesión para confirmar el pedido"); return; }
    if (!direccion.trim()) { setError("Ingresa la dirección de entrega"); return; }
    setSubmitting(true);
    setError("");
    try {
      // 1. Crear carrito en backend (el user_id lo asocia el backend con la sesión)
      const products = items.map(x => ({ product_id: x.id, amount: x.qty }));
      const cartRes = await cartAPI.create(products, 0);
      // 2. Crear venta
      await salesAPI.create(cartRes.cart._id, direccion, metodo, "pending");
      // 3. Limpiar carrito local
      sessionStorage.removeItem("maq_carrito");
      setItems([]);
      setPedidoOk(true);
      toast.success("¡Pedido registrado con éxito!");
    } catch (e) {
      const msg = e.message || "Error al procesar el pedido. Verifica que los productos estén disponibles.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (pedidoOk) {
    return (
      <div className="public-page">
        <PublicNav />
        <div style={{ textAlign: "center", padding: "100px 24px 80px" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--brand-50)", border: "2px solid var(--brand-100)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-500)", margin: "0 auto 18px" }}>
            <CheckCircle2 size={32} />
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 28, fontWeight: 400, color: "var(--text-primary)", marginBottom: 8 }}>
            ¡Pedido recibido!
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 380, margin: "0 auto 24px" }}>
            Tu pedido fue registrado. Nos pondremos en contacto para coordinar la entrega.
          </p>
          <Link to="/catalogo" className="pub-btn-primary" style={{ display: "inline-flex" }}>
            Seguir comprando
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="public-page">
        <PublicNav />
        <div className="carrito-empty" style={{ padding: "120px 24px 80px" }}>
          <div className="carrito-empty-icon">🛒</div>
          <h2>Tu carrito está vacío</h2>
          <p>Agrega productos desde el catálogo y aquí aparecerán.</p>
          <Link to="/catalogo" className="pub-btn-primary" style={{ display: "inline-flex" }}>Ver catálogo</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="public-page">
      <PublicNav />
      <div className="carrito-layout">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <Link to="/catalogo" className="pub-back-link" style={{ marginBottom: 0 }}>
              <ArrowLeft size={13} /> Seguir comprando
            </Link>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 26, fontWeight: 400, color: "var(--text-primary)", marginBottom: 16 }}>
            Tu carrito
          </h2>
          <div className="carrito-items">
            {items.map(x => (
              <div key={x.id} className="carrito-item">
                <div className="carrito-icon-wrap">
                  <ProductIcon emoji={x.emoji || "💧"} size={24} color="var(--brand-600)" />
                </div>
                <div className="carrito-info">
                  <p className="carrito-nombre">{x.nombre}</p>
                  <p className="carrito-precio">${(x.precio || 0).toFixed(2)} c/u</p>
                </div>
                <div className="carrito-qty">
                  <button className="qty-btn" onClick={() => cambiar(x.id, -1)}><Minus size={12} /></button>
                  <span className="qty-val">{x.qty}</span>
                  <button className="qty-btn" onClick={() => cambiar(x.id, +1)}><Plus size={12} /></button>
                </div>
                <span style={{ fontWeight: 700, minWidth: 52, textAlign: "right", fontSize: 14 }}>
                  ${(x.precio * x.qty).toFixed(2)}
                </span>
                <button className="carrito-del" onClick={() => quitar(x.id)}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>

        <div className="carrito-summary">
          <h3>Resumen del pedido</h3>
          <div className="carrito-line"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="carrito-line"><span>Envío a domicilio</span><span>${envio.toFixed(2)}</span></div>
          <div className="carrito-line total"><span>Total</span><span>${total.toFixed(2)}</span></div>

          {!isLoggedIn ? (
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
                Inicia sesión para confirmar tu pedido.
              </p>
              <Link to="/login" className="carrito-checkout" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none" }}>
                <LogIn size={15} /> Iniciar sesión
              </Link>
            </div>
          ) : !confirming ? (
            <button className="carrito-checkout" onClick={() => setConfirming(true)}>
              Proceder al pedido →
            </button>
          ) : (
            <div style={{ marginTop: 12 }}>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Dirección de entrega</label>
                <input
                  type="text" placeholder="Col. Escalón, San Salvador..."
                  value={direccion} onChange={e => { setDireccion(e.target.value); setError(""); }}
                  style={{ width: "100%", padding: "8px 10px", border: "1.5px solid var(--gray-200)", borderRadius: 6, fontSize: 13, fontFamily: "var(--font-sans)" }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>Método de pago</label>
                <select value={metodo} onChange={e => setMetodo(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", border: "1.5px solid var(--gray-200)", borderRadius: 6, fontSize: 13, fontFamily: "var(--font-sans)" }}>
                  {["Efectivo", "Transferencia", "Tarjeta"].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              {error && <p style={{ color: "#dc2626", fontSize: 12, marginBottom: 8 }}>{error}</p>}
              <button className="carrito-checkout" onClick={handleConfirm} disabled={submitting}>
                {submitting ? "Procesando..." : "Confirmar pedido →"}
              </button>
              <button onClick={() => setConfirming(false)} style={{ width: "100%", marginTop: 8, background: "none", border: "none", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>
                Cancelar
              </button>
            </div>
          )}

          <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
            Te contactaremos para coordinar la entrega
          </p>
        </div>
      </div>

      <footer className="pub-footer">
        <div className="pub-container">
          <span>© 2026 Maquilishuat S.A. de C.V.</span>
        </div>
      </footer>
    </div>
  );
}
