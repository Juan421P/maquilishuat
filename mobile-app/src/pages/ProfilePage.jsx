import { T, GRAD } from "../utils/theme";
import AppBar from "../layout/AppBar";
import Ic from "../components/Ic";

export default function ProfilePage({ user, onLogout }) {
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
