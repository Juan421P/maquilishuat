import { GRAD } from "../utils/theme";
import Ic from "../components/Ic";

export default function AuthHeader({ title, sub, onBack }) {
  return (
    <div style={{
      background: GRAD,
      paddingTop: "calc(16px + env(safe-area-inset-top, 0px))",
      padding: `calc(16px + env(safe-area-inset-top, 0px)) 20px 28px`,
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 10,
          padding: "8px 14px", color: "rgba(255,255,255,0.9)", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 13, fontWeight: 600, marginBottom: 18,
          WebkitTapHighlightColor: "transparent",
        }}>
          <Ic n="back" size={15} color="rgba(255,255,255,0.9)" /> Volver
        </button>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 13,
          background: "rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Ic n="drop" size={24} color="#fff" />
        </div>
        <div>
          <p style={{ color: "#fff", fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>{title}</p>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 }}>{sub}</p>
        </div>
      </div>
    </div>
  );
}
