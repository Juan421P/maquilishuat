import { useState } from "react";
import { Link } from "react-router-dom";
import { Droplets, ArrowLeft, Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";
import "./Home.css";

function PubNav() {
  return (
    <nav className="pub-nav">
      <div className="pub-nav-inner">
        <div className="pub-logo">
          <div className="pub-logo-icon"><Droplets size={18} /></div>
          <span className="pub-logo-name">Maquilishuat</span>
        </div>
        <div className="pub-nav-links">
          <Link to="/home">Inicio</Link>
          <Link to="/catalogo">Productos</Link>
          <Link to="/nosotros">Nosotros</Link>
          <Link to="/contacto">Contacto</Link>
        </div>
        <div className="pub-nav-actions">
          <Link to="/login" className="pub-login-btn">Ingresar</Link>
        </div>
      </div>
    </nav>
  );
}

const INFO = [
  {
    icon: Phone, label: "Teléfono",
    lines: ["2222-0000", "WhatsApp disponible"],
  },
  {
    icon: Mail, label: "Correo",
    lines: ["pedidos@maquilishuat.com"],
  },
  {
    icon: MapPin, label: "Dirección",
    lines: ["Col. Escalón, San Salvador", "Solo con cita previa"],
  },
  {
    icon: Clock, label: "Horario",
    lines: ["Lun – Sáb: 7:00 a.m. – 5:00 p.m.", "Domingos cerrado"],
  },
];

export default function Contacto() {
  const [form, setForm] = useState({ nombre: "", email: "", asunto: "", mensaje: "" });
  const [enviado, setEnviado] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    setEnviado(true);
  };

  return (
    <div className="public-page">
      <PubNav />

      <div className="pub-contact-page">
        <Link to="/home" className="pub-back-link">
          <ArrowLeft size={13} /> Volver al inicio
        </Link>

        <h1>Contáctanos</h1>
        <p className="pub-page-subtitle">
          ¿Tienes preguntas o quieres hacer un pedido? Te respondemos en menos de 24 horas.
        </p>

        <div className="pub-contact-grid">
          {/* Form / sent state */}
          {enviado ? (
            <div className="pub-sent-state">
              <div className="pub-sent-icon">
                <CheckCircle2 size={32} />
              </div>
              <h2>¡Mensaje recibido!</h2>
              <p>
                Gracias por escribirnos, <strong>{form.nombre || "visitante"}</strong>.
                Te contactaremos a la brevedad posible.
              </p>
              <button
                className="pub-reset-btn"
                onClick={() => { setEnviado(false); setForm({ nombre: "", email: "", asunto: "", mensaje: "" }); }}
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form className="pub-form" onSubmit={handleSubmit}>
              <div className="pub-form-row">
                <div className="field">
                  <label>Tu nombre</label>
                  <input type="text" placeholder="Juan Pérez" value={form.nombre} onChange={set("nombre")} required />
                </div>
                <div className="field">
                  <label>Correo electrónico</label>
                  <input type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={set("email")} required />
                </div>
              </div>
              <div className="field">
                <label>Asunto</label>
                <select value={form.asunto} onChange={set("asunto")} required>
                  <option value="">Selecciona un tema...</option>
                  <option value="pedido">Quiero hacer un pedido</option>
                  <option value="info">Información sobre productos</option>
                  <option value="ruta">Consulta sobre rutas de entrega</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="field">
                <label>Mensaje</label>
                <textarea
                  placeholder="Cuéntanos en qué te podemos ayudar..."
                  value={form.mensaje} onChange={set("mensaje")} required
                />
              </div>
              <button type="submit" className="pub-submit-btn">
                <Send size={14} /> Enviar mensaje
              </button>
            </form>
          )}

          {/* Contact info */}
          <div className="pub-contact-info">
            <h2>Información de contacto</h2>
            {INFO.map(({ icon: Icon, label, lines }) => (
              <div key={label} className="pub-contact-item">
                <div className="pub-contact-item-icon"><Icon size={16} /></div>
                <div className="pub-contact-item-text">
                  <strong>{label}</strong>
                  {lines.map((l, i) => (
                    <span key={i} className={i > 0 ? "pub-contact-hint" : ""}>{l}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="pub-footer">
        <div className="pub-container">
          <span>© 2026 Maquilishuat S.A. de C.V.</span>
          <div className="pub-footer-links">
            <Link to="/terminos">Términos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
