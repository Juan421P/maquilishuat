import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Droplets, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import bg from "../assets/BG.png";
import "./Login.css";

export default function Login() {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(form.email, form.password);
    if (result.ok) {
      navigate("/dashboard");
    } else {
      setError(result.message || "Correo o contraseña incorrectos");
    }
  };

  return (
    <div className="auth-bg" style={{ backgroundImage: `url(${bg})` }}>
      <div className="auth-overlay" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon"><Droplets size={24} /></div>
          <div>
            <p className="logo-brand">Maquilishuat</p>
            <p className="logo-sub">S.A. de C.V.</p>
          </div>
        </div>

        <h2 className="auth-title">Bienvenido</h2>
        <p className="auth-desc">Panel de operaciones · Maquilishuat</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="auth-alert auth-alert--error">{error}</div>}

          <div className="field">
            <label>Correo electrónico</label>
            <div className="input-wrap">
              <Mail size={15} className="input-icon" />
              <input
                type="email" placeholder="correo@empresa.com"
                value={form.email}
                onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setError(""); }}
                autoComplete="email" required
              />
            </div>
          </div>

          <div className="field">
            <label>Contraseña</label>
            <div className="input-wrap">
              <Lock size={15} className="input-icon" />
              <input
                type={show ? "text" : "password"} placeholder="••••••••"
                value={form.password}
                onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError(""); }}
                autoComplete="current-password" required
              />
              <button type="button" className="eye-btn" onClick={() => setShow(s => !s)}>
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <Link to="/forgot-password" className="forgot-link">¿Olvidaste tu contraseña?</Link>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <><span className="spinner" /> Verificando...</> : <>Iniciar sesión <ArrowRight size={16} /></>}
          </button>
        </form>

        <p className="auth-switch">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
        <p className="auth-switch" style={{ marginTop: 6 }}>
          <Link to="/home" style={{ color: "var(--text-muted)", fontSize: 12 }}>← Volver al sitio</Link>
        </p>
      </div>
    </div>
  );
}
