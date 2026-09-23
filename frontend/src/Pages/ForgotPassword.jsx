import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Droplets, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { authAPI } from "../services/api";
import bg from "../assets/BG.png";
import "./Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Ingresa tu correo electrónico"); return; }
    setLoading(true);
    try {
      await authAPI.requestRecovery(email);
      setSent(true);
    } catch (err) {
      // Por seguridad, mostramos éxito aunque el correo no exista
      setSent(true);
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
          <div>
            <p className="logo-brand">Maquilishuat</p>
            <p className="logo-sub">S.A. de C.V.</p>
          </div>
        </div>

        {!sent ? (
          <>
            <h2 className="auth-title">Olvidé mi contraseña</h2>
            <p className="auth-desc">Ingresa tu correo y te enviaremos un código para restablecerla.</p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {error && <div className="auth-alert auth-alert--error">{error}</div>}
              <div className="field">
                <label>Correo electrónico</label>
                <div className="input-wrap">
                  <Mail size={15} className="input-icon" />
                  <input
                    type="email" placeholder="correo@empresa.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    autoComplete="email"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : <>Enviar código <ArrowRight size={16} /></>}
              </button>
            </form>
          </>
        ) : (
          <div className="auth-success-state">
            <div className="auth-success-icon"><CheckCircle2 size={36} /></div>
            <h2 className="auth-title">Revisa tu correo</h2>
            <p className="auth-desc">
              Si el correo <strong>{email}</strong> está registrado, recibirás un código en los próximos minutos.
            </p>
            <button className="btn-primary" onClick={() => navigate("/reset-password")}>
              Ingresar código <ArrowRight size={16} />
            </button>
          </div>
        )}

        <p className="auth-switch">
          <Link to="/login" className="auth-back-link">
            <ArrowLeft size={13} /> Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
