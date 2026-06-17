import { useState } from "react";
import { T } from "../utils/theme";
import { useAuth } from "../context/AuthContext";
import AuthHeader from "../layout/AuthHeader";
import Field from "../components/Field";
import Alert from "../components/Alert";
import Btn from "../components/Btn";
import Ic from "../components/Ic";

export default function LoginPage({ onSuccess, onRegister, onForgot, onBack }) {
  const { login } = useAuth();
  const [form, setForm]       = useState({ email: "", pw: "" });
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErr(""); };

  const handle = async () => {
    if (!form.email || !form.pw) { setErr("Completa todos los campos"); return; }
    setLoading(true);
    try { await login(form.email, form.pw); onSuccess(); }
    catch (e) { setErr(e.message || "Correo o contraseña incorrectos"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff", overflowY: "auto" }}>
      <AuthHeader title="Bienvenido" sub="Accede a tu cuenta de cliente" onBack={onBack} />
      <div style={{ flex: 1, padding: "28px 24px 32px" }}>
        <Alert msg={err} />
        <Field label="Correo" type="email" value={form.email} onChange={set("email")}
          placeholder="correo@ejemplo.com" iconName="mail" autoComplete="email" />
        <Field label="Contraseña" type={show ? "text" : "password"} value={form.pw} onChange={set("pw")}
          placeholder="••••••••" iconName="lock" autoComplete="current-password"
          right={
            <button onClick={() => setShow(s => !s)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}>
              <Ic n={show ? "eyeOff" : "eye"} size={18} color={T.textMut} />
            </button>
          }
        />
        <button onClick={onForgot} style={{ background: "none", border: "none", color: T.purple, fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 24, padding: 0, display: "block" }}>
          ¿Olvidaste tu contraseña?
        </button>
        <Btn onClick={handle} disabled={loading}>{loading ? "Verificando..." : "Ingresar"}</Btn>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 15, color: T.text3 }}>
          ¿Sin cuenta?{" "}
          <button onClick={onRegister} style={{ background: "none", border: "none", color: T.purple, fontWeight: 700, cursor: "pointer", fontSize: 15, padding: 0 }}>
            Regístrate
          </button>
        </p>
      </div>
    </div>
  );
}
