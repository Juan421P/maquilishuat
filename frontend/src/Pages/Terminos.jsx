import { Link } from "react-router-dom";
import { Droplets, ArrowLeft } from "lucide-react";
import "./Home.css";

export default function Terminos() {
  return (
    <div className="public-page">
      <nav className="pub-nav">
        <div className="pub-nav-inner">
          <div className="pub-logo">
            <div className="pub-logo-icon"><Droplets size={20} /></div>
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

      <div className="pub-content-page">
        <Link to="/home" className="pub-back-link">
          <ArrowLeft size={14} /> Volver al inicio
        </Link>

        <h1>Términos y condiciones</h1>
        <p className="pub-page-subtitle">Última actualización: abril 2026</p>

        <p>
          Al utilizar los servicios de <strong>Maquilishuat S.A. de C.V.</strong> —ya sea mediante
          pedidos en línea, por teléfono o en persona— aceptas los presentes términos y condiciones.
          Te pedimos que los leas con atención.
        </p>

        <h2>1. Sobre el servicio</h2>
        <p>
          Maquilishuat ofrece distribución de agua purificada en presentaciones de garrafón, botella
          y pack. Los pedidos se procesan de lunes a sábado de 7:00 a.m. a 5:00 p.m. No se garantiza
          entrega en festivos sin coordinación previa.
        </p>

        <h2>2. Pedidos y entregas</h2>
        <ul>
          <li>Los pedidos deben confirmarse antes de las 3:00 p.m. para incluirse en la ruta del mismo día.</li>
          <li>Las entregas se realizan dentro de las zonas de cobertura. Consulta disponibilidad.</li>
          <li>En caso de ausencia del cliente, el repartidor puede dejar el pedido con un vecino autorizado.</li>
          <li>Nos reservamos el derecho de reagendar pedidos en caso de condiciones climáticas adversas.</li>
        </ul>

        <h2>3. Precios y pagos</h2>
        <p>
          Los precios publicados incluyen el costo del producto y pueden variar según zona y volumen.
          Aceptamos efectivo, transferencia bancaria y tarjeta de débito/crédito. Los pagos en línea
          se procesan a través de plataformas seguras y no almacenamos datos de tarjetas.
        </p>

        <h2>4. Devoluciones</h2>
        <p>
          Si recibes un producto en mal estado o equivocado, contáctanos dentro de las 24 horas
          siguientes a la entrega. Repondremos el producto sin costo adicional. No se aceptan
          devoluciones por cambio de parecer una vez entregado el pedido.
        </p>

        <h2>5. Uso de datos personales</h2>
        <p>
          Los datos que nos proporcionas (nombre, dirección, teléfono, correo) se usan exclusivamente
          para procesar y entregar tus pedidos, y para comunicarnos contigo. No vendemos ni
          compartimos tu información con terceros.
        </p>

        <h2>6. Responsabilidad</h2>
        <p>
          Maquilishuat no se responsabiliza por daños derivados de un uso incorrecto del producto
          o por demoras causadas por factores ajenos a nuestra operación (tráfico, cierre de vías,
          desastres naturales, etc.).
        </p>

        <h2>7. Cambios en estos términos</h2>
        <p>
          Podemos actualizar estos términos en cualquier momento. La versión vigente siempre estará
          disponible en esta página. El uso continuado del servicio implica la aceptación de los
          cambios.
        </p>

        <h2>8. Contacto</h2>
        <p>
          Para consultas sobre estos términos: <strong>legal@maquilishuat.com</strong> o llámanos
          al <strong>2222-0000</strong>.
        </p>
      </div>

      <footer className="pub-footer">
        <div className="pub-container">
          <span>© 2026 Maquilishuat S.A. de C.V.</span>
          <div className="pub-footer-links">
            <Link to="/home">Inicio</Link>
            <Link to="/contacto">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
