import { Link } from "react-router-dom";
import { Droplets, ShoppingCart, Phone, Star, ChevronRight, CheckCircle } from "lucide-react";
import ProductIcon from "../components/ProductIcon";
import bg from "../assets/BG.png";
import "./Home.css";

const FEATURED = [
  { icon:"🪣", nombre:"Garrafón 20 litros",    precio:"$5.00", desc:"El favorito de nuestros clientes. Entrega a domicilio incluida." },
  { icon:"🫙", nombre:"Manantial 5 galones",    precio:"$3.50", desc:"Ideal para oficinas y negocios pequeños." },
  { icon:"🧴", nombre:"Pack botellas 600ml ×6", precio:"$2.75", desc:"Perfecto para llevar. Seis unidades por paquete." },
  { icon:"💧", nombre:"Botella 1 litro",         precio:"$0.85", desc:"La opción individual para el día a día." },
];

const BENEFICIOS = [
  "Agua purificada con estándares de calidad",
  "Entrega a domicilio en San Salvador y alrededores",
  "Pedidos desde tu teléfono o en línea",
  "Atención personalizada y rutas fijas",
];

export default function Home() {
  return (
    <div className="public-page">
      <nav className="pub-nav">
        <div className="pub-nav-inner">
          <div className="pub-logo">
            <div className="pub-logo-icon"><Droplets size={18}/></div>
            <span className="pub-logo-name">Maquilishuat</span>
          </div>
          <div className="pub-nav-links">
            <Link to="/home">Inicio</Link>
            <Link to="/catalogo">Productos</Link>
            <Link to="/nosotros">Nosotros</Link>
            <Link to="/contacto">Contacto</Link>
          </div>
          <div className="pub-nav-actions">
            <Link to="/carrito" className="pub-cart-btn"><ShoppingCart size={15}/> Carrito</Link>
            <Link to="/login" className="pub-login-btn">Ingresar</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pub-hero" style={{ backgroundImage:`url(${bg})` }}>
        <div className="pub-hero-overlay"/>
        <div className="pub-hero-content">
          <span className="pub-hero-badge">🚚 Entrega lunes a sábado · Área Metropolitana</span>
          <h1 className="pub-hero-title">Tu garrafón llega<br/>antes del almuerzo</h1>
          <p className="pub-hero-sub">
            Servimos a San Salvador y alrededores desde hace más de 10 años.
            Pedidos por WhatsApp o en línea — sin filas, sin excusas.
          </p>
          <div className="pub-hero-btns">
            <Link to="/catalogo" className="pub-btn-primary">
              Ver precios y productos <ChevronRight size={15}/>
            </Link>
            <Link to="/contacto" className="pub-btn-ghost">Escribir al WhatsApp</Link>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="pub-section pub-beneficios">
        <div className="pub-container">
          <h2 className="pub-section-title">¿Por qué elegirnos?</h2>
          <div className="pub-checks">
            {BENEFICIOS.map(b => (
              <div key={b} className="pub-check-item">
                <CheckCircle size={17} className="pub-check-icon"/>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Productos destacados */}
      <section className="pub-section">
        <div className="pub-container">
          <div className="pub-section-header">
            <h2 className="pub-section-title" style={{marginBottom:0}}>Nuestros productos</h2>
            <Link to="/catalogo" className="pub-ver-mas">Ver catálogo completo →</Link>
          </div>
          <div className="pub-products-grid">
            {FEATURED.map(p => (
              <div key={p.nombre} className="pub-product-card">
                <div className="pub-product-icon-wrap">
                  <ProductIcon emoji={p.icon} size={36} color="var(--brand-600)"/>
                </div>
                <h3 className="pub-product-name">{p.nombre}</h3>
                <p className="pub-product-desc">{p.desc}</p>
                <div className="pub-product-footer">
                  <span className="pub-product-price">{p.precio}</span>
                  <Link to="/carrito" className="pub-add-btn">
                    <ShoppingCart size={12}/> Agregar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="pub-section pub-testimonios">
        <div className="pub-container">
          <h2 className="pub-section-title">Lo que dicen nuestros clientes</h2>
          <div className="pub-testi-grid">
            {[
              { stars:5, texto:"Llevo más de un año con ellos y nunca me han fallado. El garrafón llega siempre fresco.", nombre:"Ana Martínez, Antiguo Cuscatlán" },
              { stars:5, texto:"Súper fácil hacer el pedido. El repartidor siempre es amable y llega a tiempo.", nombre:"Juan Pérez, San Salvador" },
              { stars:4, texto:"Buen precio comparado con otras marcas. Lo recomiendo para oficinas.", nombre:"Luis Gómez, Santa Tecla" },
            ].map(t => (
              <div key={t.nombre} className="pub-testi-card">
                <div className="pub-testi-stars">
                  {[...Array(5)].map((_,i) => (
                    <Star key={i} size={13} fill={i < t.stars ? "currentColor" : "none"} stroke="currentColor"/>
                  ))}
                </div>
                <p>"{t.texto}"</p>
                <span className="pub-testi-name">— {t.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pub-cta">
        <div className="pub-container">
          <h2>¿Listo para hacer tu pedido?</h2>
          <p>Llámanos o escríbenos al WhatsApp. Atendemos de lunes a sábado de 7:00 a.m. a 5:00 p.m.</p>
          <div className="pub-hero-btns" style={{marginTop:28}}>
            <Link to="/contacto" className="pub-btn-primary" style={{background:"rgba(255,255,255,0.15)",backdropFilter:"blur(6px)",border:"1.5px solid rgba(255,255,255,0.3)"}}>
              Escribir al WhatsApp
            </Link>
            <Link to="/register" className="pub-btn-ghost">Crear cuenta gratis</Link>
          </div>
        </div>
      </section>

      <footer className="pub-footer">
        <div className="pub-container">
          <span>© 2026 Maquilishuat S.A. de C.V. · 7800-0000</span>
          <div className="pub-footer-links">
            <Link to="/terminos">Términos y condiciones</Link>
            <Link to="/contacto">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
