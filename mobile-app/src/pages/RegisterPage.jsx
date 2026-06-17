import { useState } from "react";
import { T } from "../utils/theme";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import AuthHeader from "../layout/AuthHeader";
import Field from "../components/Field";
import Alert from "../components/Alert";
import Btn from "../components/Btn";
import Ic from "../components/Ic";

export default function RegisterPage({ onBack, onSuccess }) {
  const { login } = useAuth();
  const [step, setStep]       = useState(1);
  const [form, setForm]       = useState({ name: "", lastname: "", birthdate: "", email: "", pw: "", pw2: "" });
  const [code, setCode]       = useState("");
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");

  const set = (key) => (e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setErr(""); };

  const handleRegister = async () => {
    if (!form.name || !form.lastname || !form.birthdate || !form.email || !form.pw) {
      setErr("Completa todos los campos"); return;
    }
    if (form.pw !== form.pw2) { setErr("Las contraseñas no coinciden"); return; }
    if (form.pw.length < 6)   { setErr("Mínimo 6 caracteres"); return; }
    setLoading(true);
    try {
      await authAPI.register(form.name, form.lastname, form.birthdate, form.email, form.pw);
      setStep(2); setErr("");
    } catch (e) { setErr(e.message); } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (!code.trim()) { setErr("Ingresa el código"); return; }
    setLoading(true);
    try {
      await authAPI.verifyCode(code);
      const user = await login(form.email, form.pw);
      onSuccess(user);
    } catch (e) { setErr(e.message); } finally { setLoading(false); }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff" }}>
      <AuthHeader
        title={step === 1 ? "Crear cuenta" : "Verifica tu correo"}
        sub={step === 1 ? "Solo para clientes" : `Código enviado a ${form.email}`}
        onBack={onBack}
      />
      {/* Stepper */}
      <div style={{ background: "#f8f9fb", padding: "10px 20px", display: "flex", gap: 6, alignItems: "center", borderBottom: `1px solid ${T.border}` }}>
        {[{ n: 1, l: "Datos" }, { n: 2, l: "Verificar" }].map(({ n, l }, i) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: step >= n ? T.purple : T.border,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: step >= n ? "#fff" : T.textMut,
            }}>
              {step > n ? <Ic n="check" size={11} color="#fff" /> : n}
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: step >= n ? T.purple : T.textMut }}>{l}</span>
            {i < 1 && <div style={{ width: 20, height: 1, background: step > 1 ? T.purple : T.border, marginLeft: 2 }} />}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: "24px 24px", overflowY: "auto" }}>
        <Alert msg={err} />
        {step === 1 ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Nombre"  value={form.name}     onChange={set("name")}     placeholder="Juan" />
              <Field label="Apellido" value={form.lastname} onChange={set("lastname")} placeholder="Pérez" />
            </div>
            <Field label="Fecha de nacimiento" type="date" value={form.birthdate} onChange={set("birthdate")} />
            <Field label="Correo" type="email" value={form.email} onChange={set("email")}
              placeholder="correo@ejemplo.com" iconName="mail" autoComplete="email" />
            <Field label="Contraseña" type={show ? "text" : "password"} value={form.pw} onChange={set("pw")}
              placeholder="Mínimo 6 caracteres" iconName="lock"
              right={
                <button onClick={() => setShow((s) => !s)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                  <Ic n={show ? "eyeOff" : "eye"} size={17} color={T.textMut} />
                </button>
              }
            />
            <Field label="Confirmar contraseña" type="password" value={form.pw2} onChange={set("pw2")}
              placeholder="Repite tu contraseña" iconName="lock" />
            <Btn onClick={handleRegister} disabled={loading}>{loading ? "Registrando..." : "Continuar"}</Btn>
          </>
        ) : (
          <>
            <div style={{ textAlign: "center", padding: "20px 0 24px" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "linear-gradient(135deg,#f3e8ff,#e9d5ff)",
                border: "2px solid #d8b4fe",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px",
              }}>
                <Ic n="mail" size={28} color={T.purple} />
              </div>
              <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.6, maxWidth: 240, margin: "0 auto" }}>
                Revisa tu bandeja y copia el código de verificación.
              </p>
            </div>
            <Field label="Código de verificación" value={code}
              onChange={(e) => { setCode(e.target.value); setErr(""); }}
              placeholder="Ingresa el código" />
            <Btn onClick={handleVerify} disabled={loading}>{loading ? "Verificando..." : "Activar cuenta"}</Btn>
          </>
        )}
      </div>
    </div>
  );
}
