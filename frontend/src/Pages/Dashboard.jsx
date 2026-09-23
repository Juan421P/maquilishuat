import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Package, Users, TrendingUp, TrendingDown, Droplets, Clock, ChevronRight, Plus, FileText, AlertCircle } from "lucide-react";
import { productsAPI, clientsAPI, salesAPI } from "../services/api";
import "./Dashboard.css";

const QUICK_ACTIONS = [
  { icon: Plus,     label: "Nuevo pedido",    sub: "Registrar un pedido",     route: "/pedidos",   bg: "var(--brand-50)",   color: "var(--brand-700)" },
  { icon: Users,    label: "Ver clientes",     sub: "Gestión de clientes",     route: "/clientes",  bg: "var(--blue-50)",    color: "var(--blue-700)" },
  { icon: Package,  label: "Ver inventario",   sub: "Catálogo de productos",   route: "/productos", bg: "var(--purple-50)",  color: "var(--purple-600)" },
  { icon: FileText, label: "Ver informes",     sub: "Reportes y estadísticas", route: "/informes",  bg: "var(--green-50)",   color: "var(--green-700)" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ products: "—", clients: "—", sales: "—" });
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [products, clients, sales] = await Promise.allSettled([
          productsAPI.getAll(),
          clientsAPI.getAll(),
          salesAPI.getAll(),
        ]);
        setStats({
          products: products.status === "fulfilled" ? products.value.length : "—",
          clients: clients.status === "fulfilled" ? clients.value.length : "—",
          sales: sales.status === "fulfilled" ? sales.value.length : "—",
        });
        if (sales.status === "fulfilled") {
          setRecentSales(sales.value.slice(0, 5));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const now = new Date();
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const dia = DIAS[now.getDay()];
  const greeting = now.getHours() < 12 ? "Buenos días" : now.getHours() < 19 ? "Buenas tardes" : "Buenas noches";

  const STAT_CARDS = [
    { label: "Pedidos registrados", value: stats.sales,    icon: ShoppingCart, color: "pink" },
    { label: "Productos activos",   value: stats.products, icon: Package,      color: "purple" },
    { label: "Clientes",            value: stats.clients,  icon: Users,        color: "blue" },
    { label: "Módulo Activo",       value: "✓",            icon: Droplets,     color: "orange" },
  ];

  const fmtPago = (s) => ({ paid: "Pagado", pending: "Pendiente", partial: "Parcial" }[s] || s || "—");
  const BADGE_PAGO = { paid: "badge-green", pending: "badge-yellow", partial: "badge-blue" };

  return (
    <div className="dash">
      <div className="dash-welcome">
        <div>
          <h2 className="welcome-title">{greeting} — resumen del {dia} 📋</h2>
          <p className="welcome-sub">Panel de operaciones Maquilishuat S.A. de C.V.</p>
        </div>
        <div className="welcome-date">
          <Clock size={13} />
          <span>{now.toLocaleDateString("es-SV", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      </div>

      <div className="stat-grid">
        {STAT_CARDS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`stat-card stat-card--${color}`}>
            <div className="stat-icon-wrap"><Icon size={20} /></div>
            <div className="stat-body">
              <p className="stat-label">{label}</p>
              <p className="stat-value">{loading ? "..." : value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-row">
        <div className="dash-card" style={{ gridColumn: "1 / -1" }}>
          <div className="dash-card-header">
            <h3>Ventas recientes</h3>
            <a href="/pedidos" className="view-all">Ver todos →</a>
          </div>
          <div className="table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>ID</th><th>Dirección de entrega</th><th>Método pago</th><th>Estado</th><th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={5} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>Cargando...</td></tr>}
                {!loading && recentSales.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>No hay ventas registradas aún.</td></tr>
                )}
                {!loading && recentSales.map(r => (
                  <tr key={r._id}>
                    <td className="order-id">{r._id.slice(-6).toUpperCase()}</td>
                    <td>{r.delivery_address || "—"}</td>
                    <td>{r.payment_method || "—"}</td>
                    <td><span className={`badge ${BADGE_PAGO[r.payment_status] || "badge-yellow"}`}>{fmtPago(r.payment_status)}</span></td>
                    <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString("es-SV") : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="dash-card">
        <div className="dash-card-header">
          <h3>Acciones rápidas</h3>
        </div>
        <div className="quick-actions">
          {QUICK_ACTIONS.map(({ icon: Icon, label, sub, route, bg, color }) => (
            <div key={label} className="qa-item" onClick={() => navigate(route)}>
              <div className="qa-icon" style={{ background: bg, color }}>
                <Icon size={17} />
              </div>
              <div className="qa-text">
                <p className="qa-title">{label}</p>
                <p className="qa-sub">{sub}</p>
              </div>
              <ChevronRight size={15} className="qa-arrow" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
