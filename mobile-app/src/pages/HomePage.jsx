import { T, GRAD } from "../utils/theme";
import AppBar from "../layout/AppBar";
import ProductCard from "../components/ProductCard";

export default function HomePage({ user, products, cart, onAdd, onGoCart, onGoCatalog }) {
  const cartCount = cart.reduce((a, x) => a + x.qty, 0);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AppBar cartCount={cartCount} onCartPress={onGoCart} />
      <div style={{ flex: 1, overflowY: "auto", background: T.bg }}>
        {/* Welcome banner */}
        <div style={{ background: GRAD, padding: "0 18px 22px" }}>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
            Hola, {user.email?.split("@")[0]} 👋
          </p>
          <p style={{ color: "#fff", fontSize: 18, fontWeight: 800, lineHeight: 1.3, marginTop: 2 }}>
            ¿Qué necesitas hoy?
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {["Entrega a domicilio", "100% purificada", "Sin químicos"].map((t) => (
              <span key={t} style={{ background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 99 }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        <div style={{ padding: "20px 18px 0" }}>
          {/* Quick actions */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { icon: "grid", label: "Ver catálogo",  action: onGoCatalog, bg: "#f3e8ff", ic: T.purple },
              { icon: "bag",  label: "Mi carrito",    action: onGoCart,    bg: "#fce7f3", ic: T.pink, badge: cartCount },
            ].map(({ icon, label, action, bg, ic, badge }) => (
              <button key={label} onClick={action} style={{
                background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12,
                padding: "14px 0", display: "flex", flexDirection: "column",
                alignItems: "center", gap: 8, cursor: "pointer",
              }}>
                <div style={{ position: "relative" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={ic} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      {icon === "grid"
                        ? <><rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/></>
                        : <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></>
                      }
                    </svg>
                  </div>
                  {badge > 0 && (
                    <span style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: T.pink, color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {badge}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.text1 }}>{label}</span>
              </button>
            ))}
          </div>

          {/* Featured products */}
          <p style={{ fontSize: 14, fontWeight: 800, color: T.text1, marginBottom: 12 }}>Productos destacados</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {products.slice(0, 3).map((p) => (
              <ProductCard key={p._id} product={p} inCart={!!cart.find((x) => x.id === p._id)} onAdd={() => onAdd(p)} />
            ))}
            {products.length === 0 && (
              <p style={{ color: T.textMut, fontSize: 14, textAlign: "center", padding: "20px 0" }}>
                Cargando productos...
              </p>
            )}
          </div>
          {products.length > 3 && (
            <button onClick={onGoCatalog} style={{
              width: "100%", marginTop: 12, padding: 11, borderRadius: 10,
              background: "linear-gradient(135deg,#f3e8ff,#fce7f3)", border: "none",
              color: T.purple, fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>
              Ver todo el catálogo →
            </button>
          )}
        </div>
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
