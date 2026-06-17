import { T, GRAD_SIDEBAR } from "../utils/theme";
import Ic from "../components/Ic";
import Btn from "../components/Btn";

export default function SplashPage({ onLogin, onRegister }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: GRAD_SIDEBAR }}>
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: "0 36px", textAlign: "center", gap: 0,
      }}>
        <div style={{
          width: 88, height: 88, borderRadius: 24,
          background: "linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #06b6d4 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 22, boxShadow: "0 8px 32px rgba(168,85,247,0.45)",
        }}>
          <Ic n="drop" size={42} color="#fff" />
        </div>
        <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 800, letterSpacing: -0.5, marginBottom: 6 }}>
          Maquilishuat
        </h1>
        <p style={{ color: "rgba(216,180,254,0.8)", fontSize: 13, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 28 }}>
          S.A. de C.V.
        </p>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, lineHeight: 1.7, maxWidth: 280, marginBottom: 24 }}>
          Agua purificada de calidad, directo a tu puerta en El Salvador.
        </p>
        <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
          {[1,2,3,4,5].map(i => <Ic key={i} n="star" size={15} color="#f59e0b" />)}
        </div>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>+500 clientes satisfechos</p>
      </div>
      <div style={{
        padding: "0 28px",
        paddingBottom: "calc(32px + env(safe-area-inset-bottom, 0px))",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        <Btn onClick={onLogin}>Iniciar sesión</Btn>
        <Btn variant="ghost" onClick={onRegister}>Crear cuenta nueva</Btn>
      </div>
    </div>
  );
}
