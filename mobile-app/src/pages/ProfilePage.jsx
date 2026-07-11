import { useState, useEffect } from "react";
import { T, GRAD } from "../utils/theme";
import AppBar from "../layout/AppBar";
import Ic from "../components/Ic";
import { salesAPI } from "../services/api";
import { formatPrice } from "../utils/format";

const ESTADOS_PAGO_LABEL = { pending: "Pendiente", paid: "Pagado", partial: "Parcial" };
const PAGO_COLOR = {
  paid: { bg: "#dcfce7", color: "#16a34a" },
  partial: { bg: "#fef9c3", color: "#a16207" },
  pending: { bg: "#fee2e2", color: "#dc2626" },
};

export default function ProfilePage({ user, onLogout }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    salesAPI.getMine()
      .then(setPedidos)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AppBar title="Mi cuenta" />
      <div style={{ flex: 1, overflowY: "auto", background: T.bg }}>
        {/* Avatar header */}
        <div style={{ background: GRAD, padding: "24px 20px 32px", textAlign: "center" }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
            <Ic n="user" size={32} color="#fff" />
          </div>
          <p style={{ color: "#fff", fontSize: 17, fontWeight: 800 }}>{user.email?.split("@")[0]}</p>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2 }}>{user.email}</p>
          <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 14px", borderRadius: 99, display: "inline-block", marginTop: 10 }}>
            Cliente activo
          </span>
        </div>

        <div style={{ padding: "16px 18px" }}>
          {/* Info rows */}
          <div style={{ background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, overflow: "hidden", marginBottom: 14 }}>
            {[
              { icon: "mail", label: "Correo",           val: user.email  },
              { icon: "user", label: "Tipo de cuenta",   val: "Cliente"   },
            ].map(({ icon, label, val }, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 14px", borderBottom: i === 0 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#f3e8ff,#fce7f3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ic n={icon} size={17} color={T.purple} />
                </div>
                <div>
                  <p style={{ fontSize: 11, color: T.textMut, fontWeight: 600, letterSpacing: "0.3px" }}>{label}</p>
                  <p style={{ fontSize: 13, color: T.text1, fontWeight: 600 }}>{val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Historial de pedidos */}
          <div style={{ background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, padding: "13px 14px", marginBottom: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: T.text1, marginBottom: 10 }}>Mis pedidos</p>
            {loading && <p style={{ fontSize: 12, color: T.textMut }}>Cargando...</p>}
            {!loading && pedidos.length === 0 && (
              <p style={{ fontSize: 12, color: T.textMut }}>Todavía no tienes pedidos.</p>
            )}
            {!loading && pedidos.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pedidos.map(p => {
                  const color = PAGO_COLOR[p.payment_status] || PAGO_COLOR.pending;
                  const total = p.shopping_cart_id?.total_with_discount ?? p.shopping_cart_id?.total ?? 0;
                  return (
                    <div key={p._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                      <div>
                        <p style={{ fontSize: 12.5, fontWeight: 700, color: T.text1 }}>#{p._id.slice(-6).toUpperCase()}</p>
                        <p style={{ fontSize: 11, color: T.textMut }}>{formatPrice(total)}</p>
                      </div>
                      <span style={{ background: color.bg, color: color.color, fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>
                        {ESTADOS_PAGO_LABEL[p.payment_status] || p.payment_status || "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Brand card */}
          <div style={{ background: "linear-gradient(135deg,#fdf4ff,#fce7f3)", borderRadius: 12, border: "1px solid #f5d0fe", padding: "12px 14px", marginBottom: 14, display: "flex", gap: 10 }}>
            <Ic n="drop" size={18} color={T.purple} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: T.purpleDark, marginBottom: 2 }}>Maquilishuat S.A. de C.V.</p>
              <p style={{ fontSize: 12, color: T.purpleMid, lineHeight: 1.55 }}>Agua purificada con entrega a domicilio en El Salvador.</p>
            </div>
          </div>

          {/* Logout */}
          <button onClick={onLogout} style={{ width: "100%", padding: 13, borderRadius: 12, border: "1.5px solid #fecdd3", background: "#fff1f2", color: T.red, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Ic n="logout" size={18} color={T.red} /> Cerrar sesión
          </button>
        </div>
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
