import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Droplets, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, AlertTriangle, KeyRound } from "lucide-react";
import { authAPI } from "../services/api";
import bg from "../assets/BG.png";
import "./Login.css";

function usePasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "" };
  let s = 0;
  if (password.length >= 8) s++;
  if (/[A-Z]/.test(password)) s++;
  if (/[0-9]/.test(password)) s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  const labels = ["", "Muy débil", "Débil", "Media", "Fuerte"];
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];
  return { score: s, label: labels[s], color: colors[s] };
}

export default function ResetPassword() {
  const [step, setStep] = useState(1); // 1=code, 2=new password
  const [recoveryCode, setRecoveryCode] = useState("");
  const [form, setForm] = useState({ nueva: "", confirmar: "" });
  const [show, setShow] = useState({ nueva: false, confirmar: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const strength = usePasswordStrength(form.nueva);

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!recoveryCode.trim()) { setError("Ingresa el código"); return; }
    setLoading(true);
    setError("");
    try {
      await authAPI.verifyRecovery(recoveryCode);
      setStep(2);
    } catch (err) {
      setError(err.message || "Código inválido o expirado");
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    if (form.nueva.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    if (form.nueva !== form.confirmar) return "Las contraseñas no coinciden";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    setError("");
    try {
      await authAPI.newPassword(form.nueva, form.confirmar);
      setDone(true);
    } catch (err) {
      setError(err.message || "Error al restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg" style={{ backgroundImage: `url(${bg})` }}>
      <div className="auth-overlay" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon"><Droplets size={28} /></div>
          <div><p className="logo-brand">Maquilishuat</p><p className="logo-sub">S.A. de C.V.</p></div>
        </div>

        {done ? (
          <div className="auth-success-state">
            <div className="auth-success-icon"><CheckCircle2 size={36} /></div>
            <h2 className="auth-title">¡Listo!</h2>
            <p className="auth-desc">Tu contraseña ha sido restablecida correctamente.</p>
            <button className="btn-primary" onClick={() => navigate("/login")}>
              Ir al inicio de sesión
            </button>
          </div>
        ) : step === 1 ? (
          <>
            <h2 className="auth-title">Ingresa el código</h2>
            <p className="auth-desc">Revisa tu correo y escribe el código de recuperación que te enviamos.</p>
            <form className="auth-form" onSubmit={handleVerifyCode} noValidate>
              {error && <div className="auth-alert auth-alert--error"><AlertTriangle size={14} /> {error}</div>}
              <div className="field">
                <label>Código de recuperación</label>
                <div className="input-wrap">
                  <KeyRound size={15} className="input-icon" />
                  <input
                    type="text" placeholder="Ej: a1b2c3"
                    value={recoveryCode}
                    onChange={e => { setRecoveryCode(e.target.value); setError(""); }}
                    autoComplete="one-time-code"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : <>Verificar código</>}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="auth-title">Nueva contraseña</h2>
            <p className="auth-desc">Elige una contraseña segura para tu cuenta.</p>
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {error && <div className="auth-alert auth-alert--error"><AlertTriangle size={14} /> {error}</div>}

              <div className="field">
                <label>Nueva contraseña</label>
                <div className="input-wrap">
                  <Lock size={15} className="input-icon" />
                  <input
                    type={show.nueva ? "text" : "password"} placeholder="Mínimo 8 caracteres"
                    value={form.nueva}
                    onChange={e => { setForm(f => ({ ...f, nueva: e.target.value })); setError(""); }}
                    autoComplete="new-password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShow(s => ({ ...s, nueva: !s.nueva }))}>
                    {show.nueva ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {form.nueva && (
                  <div className="pw-strength-bar">
                    <div className="pw-strength-track">
                      <div className="pw-strength-fill" style={{ width: `${strength.score * 25}%`, background: strength.color }} />
                    </div>
                    <span className="pw-strength-label" style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                )}
              </div>

              <div className="field">
                <label>Confirmar contraseña</label>
                <div className={`input-wrap${form.confirmar && form.nueva !== form.confirmar ? " input-wrap--error" : ""}`}>
                  <Lock size={15} className="input-icon" />
                  <input
                    type={show.confirmar ? "text" : "password"} placeholder="Repite la contraseña"
                    value={form.confirmar}
                    onChange={e => { setForm(f => ({ ...f, confirmar: e.target.value })); setError(""); }}
                    autoComplete="new-password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShow(s => ({ ...s, confirmar: !s.confirmar }))}>
                    {show.confirmar ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : <>Restablecer contraseña</>}
              </button>
            </form>
          </>
        )}

        <p className="auth-switch">
          <Link to="/login" className="auth-back-link"><ArrowLeft size={13} /> Volver al inicio de sesión</Link>
        </p>
      </div>
    </div>
  );
}
