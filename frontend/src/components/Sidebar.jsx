import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ShoppingCart, Package, Users,
  MapPin, CreditCard, BarChart3, Settings, LogOut, Droplets, Globe
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/pedidos",   icon: ShoppingCart,    label: "Pedidos" },
  { to: "/productos", icon: Package,         label: "Productos" },
  { to: "/clientes",  icon: Users,           label: "Clientes" },
  { to: "/rutas",     icon: MapPin,          label: "Rutas" },
  { to: "/pagos",     icon: CreditCard,      label: "Pagos" },
  { to: "/informes",  icon: BarChart3,       label: "Informes" },
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className={`sidebar${open ? " open" : ""}`}>
      <div className="sidebar-brand">
        <div className="brand-icon"><Droplets size={20} /></div>
        <div className="brand-text">
          <span className="brand-name">Maquilishuat</span>
          <span className="brand-sub">S.A. de C.V.</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-label">Menú principal</p>
        {NAV.map(({ to, icon: Icon, label, badge, urgent }) => (
          <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) =>
            `nav-link${isActive ? " active" : ""}`
          }>
            <Icon size={16} />
            <span>{label}</span>
            {badge && <span className={`nav-badge${urgent ? " urgent" : ""}`}>{badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/home" className="nav-link nav-link--sm" onClick={onClose}>
          <Globe size={15} /><span>Sitio público</span>
        </NavLink>
        <NavLink to="/configuracion" className="nav-link nav-link--sm" onClick={onClose}>
          <Settings size={15} /><span>Configuración</span>
        </NavLink>
        <button className="nav-link nav-link--sm nav-link--logout" onClick={handleLogout}>
          <LogOut size={15} /><span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
