import { useState } from "react";
import { T } from "../utils/theme";
import { authAPI } from "../services/api";
import AuthHeader from "../layout/AuthHeader";
import Field from "../components/Field";
import Alert from "../components/Alert";
import Btn from "../components/Btn";
import Ic from "../components/Ic";

export default function ForgotPage({ onBack }) {
  const [step, setStep]       = useState(1);
  const [email, setEmail]     = useState("");
  const [code, setCode]       = useState("");
  const [pw, setPw]           = useState("");
  const [pw2, setPw2]         = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const [done, setDone]       = useState(false);

  const s1 = async () => {
    if (!email) { setErr("Ingresa tu correo"); return; }
    setLoading(true);
    try { await authAPI.requestRecovery(email); setStep(2); setErr(""); }
    catch (e) { setErr(e.message); } finally { setLoading(false); }
  };
  const s2 = async () => {
    if (!code) { setErr("Ingresa el código"); return; }
    setLoading(true);
    try { await authAPI.verifyRecovery(code); setStep(3); setErr(""); }
    catch (e) { setErr(e.message); } finally { setLoading(false); }
  };
  const s3 = async () => {
    if (!pw || !pw2) { setErr("Completa los campos"); return; }
    if (pw !== pw2)  { setErr("Las contraseñas no coinciden"); return; }
    setLoading(true);
    try { await authAPI.newPassword(pw, pw2); setDone(true); }
    catch (e) { setErr(e.message); } finally { setLoading(false); }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#fff" }}>
      <AuthHeader title="Recuperar acceso" sub="Restablece tu contraseña" onBack={onBack} />
      <div style={{ flex: 1, padding: "28px 24px 32px" }}>
        {done ? (
          <div style={{ textAlign: "center", paddingTop: 36 }}>
            <div style={{
              width: 68, height: 68, borderRadius: "50%",
              background: "linear-gradient(135deg,#f0fdf4,#bbf7d0)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
            }}>
              <Ic n="ok" size={32} color={T.green} />
            </div>
            <p style={{ fontSize: 18, fontWeight: 800, color: T.text1, marginBottom: 8 }}>¡Listo!</p>
            <p style={{ color: T.text3, fontSize: 14, marginBottom: 24 }}>
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <Btn onClick={onBack}>Ir a iniciar sesión</Btn>
          </div>
        ) : (
          <>
            <Alert msg={err} />
            {step === 1 && (
              <>
                <Field label="Correo electrónico" type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setErr(""); }}
                  placeholder="correo@ejemplo.com" iconName="mail" />
                <Btn onClick={s1} disabled={loading}>{loading ? "Enviando..." : "Enviar código"}</Btn>
              </>
            )}
            {step === 2 && (
              <>
                <Field label="Código recibido" value={code}
                  onChange={(e) => { setCode(e.target.value); setErr(""); }}
                  placeholder="Ingresa el código" />
                <Btn onClick={s2} disabled={loading}>{loading ? "Verificando..." : "Verificar código"}</Btn>
              </>
            )}
            {step === 3 && (
              <>
                <Field label="Nueva contraseña" type="password" value={pw}
                  onChange={(e) => { setPw(e.target.value); setErr(""); }}
                  placeholder="Mínimo 6 caracteres" iconName="lock" />
                <Field label="Confirmar contraseña" type="password" value={pw2}
                  onChange={(e) => { setPw2(e.target.value); setErr(""); }}
                  placeholder="Repite la contraseña" iconName="lock" />
                <Btn onClick={s3} disabled={loading}>{loading ? "Guardando..." : "Guardar contraseña"}</Btn>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
