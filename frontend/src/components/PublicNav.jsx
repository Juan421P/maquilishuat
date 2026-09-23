import { Link, useNavigate } from "react-router-dom";
import { Droplets, ShoppingCart, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function PublicNav({ cartCount }) {
  const { isLoggedIn, isClient, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/home");
  };

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
          {isLoggedIn && isClient && <Link to="/mis-pedidos">Mis pedidos</Link>}
        </div>
        <div className="pub-nav-actions">
          {cartCount !== undefined && (
            <Link to="/carrito" className="pub-cart-btn">
              <ShoppingCart size={16} />
              Carrito {cartCount > 0 && <span style={{ background: "var(--brand-500)", color: "white", borderRadius: "99px", padding: "0 6px", fontSize: 10, fontWeight: 700 }}>{cartCount}</span>}
            </Link>
          )}
          {isLoggedIn && isClient ? (
            <button onClick={handleLogout} className="pub-login-btn" style={{ display: "flex", alignItems: "center", gap: 6, border: "none", cursor: "pointer" }}>
              <LogOut size={14} /> Salir
            </button>
          ) : (
            <Link to="/login" className="pub-login-btn">Ingresar</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
