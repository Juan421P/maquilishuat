import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Package, AlertCircle } from "lucide-react";
import PublicNav from "../components/PublicNav";
import { salesAPI } from "../services/api";
import "./Home.css";

const ESTADOS_PAGO_LABEL = { pending: "Pendiente", paid: "Pagado", partial: "Parcial" };
const PAGO_COLOR = {
  paid: { bg: "#dcfce7", color: "#16a34a" },
  partial: { bg: "#fef9c3", color: "#a16207" },
  pending: { bg: "#fee2e2", color: "#dc2626" },
};

const fmtDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-SV", { year: "numeric", month: "short", day: "numeric" });
};

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    salesAPI.getMine()
      .then(setPedidos)
      .catch(e => setError(e.message || "Error al cargar tus pedidos"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="public-page">
      <PublicNav />
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "96px 24px 64px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, color: "var(--text-primary)", marginBottom: 24 }}>
          Mis pedidos
        </h1>

        {loading && <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)" }}>Cargando pedidos...</div>}
        {error && (
          <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px 16px", borderRadius: 8, marginBottom: 16 }}>
            <AlertCircle size={14} style={{ display: "inline", marginRight: 6 }} />{error}
          </div>
        )}

        {!loading && !error && pedidos.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 0" }}>
            <Package size={40} style={{ color: "var(--text-muted)", marginBottom: 12 }} />
            <p style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Todavía no tienes pedidos.</p>
            <Link to="/catalogo" className="pub-btn-primary" style={{ display: "inline-flex", marginTop: 12 }}>Ver catálogo</Link>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {pedidos.map(pedido => {
            const cart = pedido.shopping_cart_id;
            const color = PAGO_COLOR[pedido.payment_status] || PAGO_COLOR.pending;
            return (
              <div key={pedido._id} style={{ background: "var(--surface)", border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius-md)", padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>Pedido #{pedido._id.slice(-6).toUpperCase()}</p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{fmtDate(pedido.createdAt)} · {pedido.delivery_address}</p>
                  </div>
                  <span style={{ background: color.bg, color: color.color, fontSize: 11.5, fontWeight: 700, padding: "4px 12px", borderRadius: 99 }}>
                    {ESTADOS_PAGO_LABEL[pedido.payment_status] || pedido.payment_status || "—"}
                  </span>
                </div>

                {cart?.products?.length > 0 && (
                  <div style={{ borderTop: "1px solid var(--gray-100)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                    {cart.products.map((item, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-secondary)" }}>
                        <span>{item.product_id?.name || "Producto"} × {item.amount}</span>
                        <span>${(item.subtotal || 0).toFixed(2)}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", borderTop: "1px solid var(--gray-100)", paddingTop: 6, marginTop: 2 }}>
                      <span>Total</span>
                      <span>${(cart.total_with_discount ?? cart.total ?? 0).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10 }}>Método de pago: {pedido.payment_method || "—"}</p>
              </div>
            );
          })}
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
