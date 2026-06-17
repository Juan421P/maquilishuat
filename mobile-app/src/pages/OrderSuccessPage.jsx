import { T } from "../utils/theme";
import Btn from "../components/Btn";
import Ic from "../components/Ic";

export default function OrderSuccessPage({ onContinue }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, background: "#fff", gap: 14, textAlign: "center" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#f0fdf4,#bbf7d0)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Ic n="ok" size={40} color={T.green} />
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text1 }}>¡Pedido confirmado!</h2>
      <p style={{ fontSize: 14, color: T.textMut, maxWidth: 240, lineHeight: 1.65 }}>
        Tu pedido fue registrado. Nos pondremos en contacto para coordinar la entrega.
      </p>
      <div style={{ width: "100%", marginTop: 4 }}>
        <Btn onClick={onContinue}>Seguir comprando</Btn>
      </div>
    </div>
  );
}
