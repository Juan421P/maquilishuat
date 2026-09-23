import { Link } from "react-router-dom";
import { Droplets, ArrowLeft, Award, Users, MapPin, Heart } from "lucide-react";
import "./Home.css";

const VALORES = [
  { icon: Award,  label: "Calidad",     desc: "Agua purificada con controles estrictos para garantizar tu salud." },
  { icon: Users,  label: "Servicio",    desc: "Atención personalizada. Conocemos a nuestros clientes por nombre." },
  { icon: MapPin, label: "Puntualidad", desc: "Rutas fijas y horarios respetados. Tu pedido llega cuando lo necesitas." },
  { icon: Heart,  label: "Compromiso",  desc: "Más de 10 años sirviendo a familias y negocios de El Salvador." },
];

const MUNICIPIOS = [
  "San Salvador centro", "San Salvador norte y sur", "Soyapango",
  "Ilopango", "Ayutuxtepeque", "Mejicanos", "Antiguo Cuscatlán",
  "Santa Tecla", "Colón", "Armenia (La Libertad)",
];

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

export default function Nosotros() {
  return (
    <div className="public-page">
      <PubNav />

      <div className="pub-content-page">
        <Link to="/home" className="pub-back-link">
          <ArrowLeft size={13} /> Volver al inicio
        </Link>

        <h1>Sobre nosotros</h1>
        <p className="pub-page-subtitle">
          Más de una década llevando agua pura a los hogares y negocios de El Salvador.
        </p>

        <p>
          Empezamos en 2013 con dos rutas y una camioneta. Hoy cubrimos más de 15 colonias
          en el Área Metropolitana de San Salvador. El agua llega el mismo día, siempre.
        </p>

        <h2>Nuestra historia</h2>
        <p>
          Todo comenzó cuando el fundador notó que muchas familias en Soyapango y Mejicanos
          no tenían acceso fácil a agua purificada confiable. Con una pick-up, cuatro garrafones
          y mucha constancia, arrancó la primera ruta. Hoy operamos cinco rutas diarias con
          un equipo de más de 15 personas que conoce a sus clientes por nombre.
        </p>

        <h2>Lo que nos mueve</h2>
        <div className="pub-valores-grid">
          {VALORES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="pub-valor-card">
              <div className="pub-valor-icon"><Icon size={17} /></div>
              <p className="pub-valor-label">{label}</p>
              <p className="pub-valor-desc">{desc}</p>
            </div>
          ))}
        </div>

        <h2>Nuestro equipo</h2>
        <p>
          Contamos con repartidores comprometidos, un equipo de atención al cliente y personal
          de planta que asegura la purificación y el envasado bajo normas sanitarias vigentes.
          Cada persona conoce la importancia de lo que entrega.
        </p>

        <h2>Zona de cobertura</h2>
        <p>Actualmente atendemos los siguientes municipios:</p>
        <div className="pub-coverage-chips">
          {MUNICIPIOS.map(m => (
            <span key={m} className="pub-coverage-chip">{m}</span>
          ))}
        </div>
        <p>¿No estás en la lista? Escríbenos, seguimos creciendo.</p>

        <div style={{ marginTop: 32 }}>
          <Link to="/contacto" className="pub-btn-primary" style={{ display: "inline-flex" }}>
            Contáctanos →
          </Link>
        </div>
      </div>

      <footer className="pub-footer">
        <div className="pub-container">
          <span>© 2026 Maquilishuat S.A. de C.V.</span>
          <div className="pub-footer-links">
            <Link to="/terminos">Términos</Link>
            <Link to="/contacto">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
