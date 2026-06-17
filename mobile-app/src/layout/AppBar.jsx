import { T, GRAD } from "../utils/theme";
import Ic from "../components/Ic";

export default function AppBar({ title, cartCount, onCartPress }) {
  return (
    <div style={{
      background: GRAD, flexShrink: 0,
      paddingTop: "env(safe-area-inset-top, 0px)",
    }}>
      <div style={{
        padding: "14px 18px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Ic n="drop" size={18} color="#fff" />
          </div>
          <span style={{ color: "#fff", fontSize: 17, fontWeight: 800 }}>
            {title || "Maquilishuat"}
          </span>
        </div>
        {onCartPress && (
          <button onClick={onCartPress} style={{
            position: "relative", background: "rgba(255,255,255,0.2)", border: "none",
            borderRadius: 10, width: 40, height: 40,
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}>
            <Ic n="bag" size={20} color="#fff" />
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: -4, right: -4, width: 20, height: 20,
                borderRadius: "50%", background: T.pink, color: "#fff",
                fontSize: 10, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
