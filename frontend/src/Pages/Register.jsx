import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Droplets, Mail, Lock, User, Calendar, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { authAPI } from "../services/api";
import bg from "../assets/BG.png";
import "./Login.css";

export default function Register() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(1); // 1=form, 2=verify
  const [form, setForm] = useState({ name: "", lastname: "", email: "", password: "", birth: "" });
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  const set = k => e => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: "" }));
    setApiError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "El nombre es obligatorio";
    if (!form.lastname.trim()) errs.lastname = "El apellido es obligatorio";
    if (!form.email.trim()) errs.email = "El correo es obligatorio";
    if (form.password.length < 8) errs.password = "Mínimo 8 caracteres";
    if (!form.birth) errs.birth = "La fecha es obligatoria";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError("");
    try {
      await authAPI.register(form.name, form.lastname, form.birth, form.email, form.password);
      toast.info("Te enviamos un código de verificación a tu correo");
      setStep(2);
    } catch (err) {
      const msg = err.message || "Error al registrar";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim()) { setApiError("Ingresa el código de verificación"); return; }
    setLoading(true);
    setApiError("");
    try {
      await authAPI.verifyRegister(code);
      toast.success("Cuenta verificada, ya puedes iniciar sesión");
      navigate("/login");
    } catch (err) {
      const msg = err.message || "Código inválido";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
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
          <div className="auth-success-icon" style={{ color: "var(--brand-500)", width: 52, height: 52, borderRadius: "50%", background: "var(--brand-50)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckCircle2 size={28} />
          </div>
          <h2 className="auth-title">Verifica tu correo</h2>
          <p className="auth-desc">Hemos enviado un código a <strong>{form.email}</strong>. Ingrésalo abajo.</p>
          <form className="auth-form" onSubmit={handleVerify} noValidate>
            {apiError && <div className="auth-alert auth-alert--error">{apiError}</div>}
            <div className="field">
              <label>Código de verificación</label>
              <div className="input-wrap">
                <input
                  type="text" placeholder="Ej: a1b2c3"
                  value={code}
                  onChange={e => { setCode(e.target.value); setApiError(""); }}
                  autoComplete="one-time-code"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : <>Verificar cuenta <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-bg" style={{ backgroundImage: `url(${bg})` }}>
      <div className="auth-overlay" />
      <div className="auth-card auth-card--wide">
        <div className="auth-logo">
          <div className="logo-icon"><Droplets size={28} /></div>
          <div>
            <p className="logo-brand">Maquilishuat</p>
            <p className="logo-sub">S.A. de C.V.</p>
          </div>
        </div>

        <h2 className="auth-title">Crear cuenta</h2>
        <p className="auth-desc">Completa los campos para registrarte</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {apiError && <div className="auth-alert auth-alert--error">{apiError}</div>}

          <div className="reg-row">
            <div className="field">
              <label>Nombre</label>
              <div className={`input-wrap${errors.name ? " input-wrap--error" : ""}`}>
                <User size={15} className="input-icon" />
                <input type="text" placeholder="Tu nombre" value={form.name} onChange={set("name")} autoComplete="given-name" />
              </div>
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>
            <div className="field">
              <label>Apellido</label>
              <div className={`input-wrap${errors.lastname ? " input-wrap--error" : ""}`}>
                <User size={15} className="input-icon" />
                <input type="text" placeholder="Tu apellido" value={form.lastname} onChange={set("lastname")} autoComplete="family-name" />
              </div>
              {errors.lastname && <span className="field-error">{errors.lastname}</span>}
            </div>
          </div>

          <div className="reg-row">
            <div className="field">
              <label>Fecha de nacimiento</label>
              <div className={`input-wrap input-wrap--date${errors.birth ? " input-wrap--error" : ""}`}>
                <Calendar size={15} className="input-icon" />
                <input type="date" value={form.birth} onChange={set("birth")} style={{ minWidth: 0 }} />
              </div>
              {errors.birth && <span className="field-error">{errors.birth}</span>}
            </div>
          </div>

          <div className="field">
            <label>Correo electrónico</label>
            <div className={`input-wrap${errors.email ? " input-wrap--error" : ""}`}>
              <Mail size={15} className="input-icon" />
              <input type="email" placeholder="correo@empresa.com" value={form.email} onChange={set("email")} autoComplete="email" />
            </div>
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="field">
            <label>Contraseña</label>
            <div className={`input-wrap${errors.password ? " input-wrap--error" : ""}`}>
              <Lock size={15} className="input-icon" />
              <input
                type={show ? "text" : "password"} placeholder="Mínimo 8 caracteres"
                value={form.password} onChange={set("password")} autoComplete="new-password"
              />
              <button type="button" className="eye-btn" onClick={() => setShow(s => !s)}>
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : <>Crear cuenta <ArrowRight size={16} /></>}
          </button>
        </form>

        <p className="auth-switch">
          ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
