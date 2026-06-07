import { useState, useEffect } from "react";
import { TrendingUp, ShoppingCart, Users, DollarSign, Download, RefreshCw } from "lucide-react";
import ProductIcon from "../components/ProductIcon";
import { salesAPI, clientsAPI, productsAPI } from "../services/api";
import "./OrderManagement.css";
import "./Informes.css";

const EMOJI_MAP = { garrafon: "🪣", garrafa: "🪣", galones: "🫙", galon: "🫙", bebida: "🍶", pack: "📦" };
function getEmoji(name = "") {
  const n = name.toLowerCase();
  for (const [k, e] of Object.entries(EMOJI_MAP)) if (n.includes(k)) return e;
  return "💧";
}

export default function Informes() {
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, c, p] = await Promise.allSettled([salesAPI.getAll(), clientsAPI.getAll(), productsAPI.getAll()]);
      if (s.status === "fulfilled") setSales(s.value);
      if (c.status === "fulfilled") setClients(c.value);
      if (p.status === "fulfilled") setProducts(p.value);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Agrupar ventas por mes (últimos 7 meses)
  const monthlyData = (() => {
    const months = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString("es-SV", { month: "short" });
      months[key] = { mes: key, ventas: 0 };
    }
    sales.forEach(s => {
      const d = new Date(s.createdAt);
      const key = d.toLocaleDateString("es-SV", { month: "short" });
      if (months[key]) months[key].ventas++;
    });
    return Object.values(months);
  })();

  const maxVentas = Math.max(...monthlyData.map(m => m.ventas), 1);
  const totalVentas = sales.length;
  const pagadas = sales.filter(s => s.payment_status === "paid").length;

  const productosTop = products.slice(0, 5).map(p => ({
    nombre: p.name,
    stock: p.stock || 0,
    icon: getEmoji(p.name),
  }));
  const maxStock = Math.max(...productosTop.map(p => p.stock), 1);

  const KPIS = [
    { icon: ShoppingCart, label: "Total de ventas",      val: totalVentas,                              color: "brand" },
    { icon: DollarSign,   label: "Ventas pagadas",       val: pagadas,                                  color: "green" },
    { icon: Users,        label: "Clientes registrados", val: clients.length,                           color: "blue" },
    { icon: TrendingUp,   label: "Productos en catálogo",val: products.length,                          color: "purple" },
  ];

  return (
    <div className="page">
      <div className="page-topbar">
        <p className="page-subtitle">Resumen de rendimiento y estadísticas del negocio.</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-add" style={{ background: "var(--gray-100)", color: "var(--text-secondary)" }} onClick={load}>
            <RefreshCw size={14} />
          </button>
          <button className="btn-add" style={{ background: "var(--ink-800)" }}>
            <Download size={15} /> Exportar
          </button>
        </div>
      </div>

      <div className="inf-kpi-grid">
        {KPIS.map(k => (
          <div key={k.label} className={`inf-kpi inf-kpi--${k.color}`}>
            <div className="inf-kpi-icon"><k.icon size={20} /></div>
            <div>
              <p className="inf-kpi-label">{k.label}</p>
              <p className="inf-kpi-val">{loading ? "..." : k.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="inf-two-col">
        <div className="inf-card">
          <p className="inf-card-title">Ventas por mes (últimos 7 meses)</p>
          {loading ? <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>Cargando...</div> : (
            <div className="inf-bars">
              {monthlyData.map((m, i) => (
                <div key={m.mes} className="inf-bar-col">
                  <div className="inf-bar-val">{m.ventas}</div>
                  <div className="inf-bar-track">
                    <div className="inf-bar" style={{
                      height: `${(m.ventas / maxVentas) * 100}%`,
                      background: i % 2 === 0 ? "linear-gradient(180deg,#5eead4,#0d9488)" : "linear-gradient(180deg,#2dd4bf,#0f766e)",
                    }} />
                  </div>
                  <div className="inf-bar-label">{m.mes}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="inf-card">
          <p className="inf-card-title">Estado de ventas</p>
          {loading ? <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>Cargando...</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 8 }}>
              {[
                { label: "Pagadas", count: sales.filter(s => s.payment_status === "paid").length, color: "#22c55e" },
                { label: "Pendientes", count: sales.filter(s => s.payment_status === "pending").length, color: "#f59e0b" },
                { label: "Parciales", count: sales.filter(s => s.payment_status === "partial").length, color: "#3b82f6" },
              ].map(item => (
                <div key={item.label} className="inf-product-row">
                  <div className="inf-product-info">
                    <p className="inf-product-name">{item.label}</p>
                    <div className="inf-product-bar-wrap">
                      <div className="inf-product-bar" style={{ width: `${totalVentas ? (item.count / totalVentas) * 100 : 0}%`, background: item.color }} />
                    </div>
                  </div>
                  <span className="inf-product-val">{item.count}</span>
                </div>
              ))}
              {sales.length === 0 && <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 16, fontSize: 13 }}>No hay ventas registradas aún.</p>}
            </div>
          )}
        </div>
      </div>

      <div className="inf-card">
        <p className="inf-card-title">Productos en inventario (por stock)</p>
        {loading ? <div style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>Cargando...</div> : (
          <div className="inf-products">
            {productosTop.length === 0 && <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 16, fontSize: 13 }}>No hay productos registrados.</p>}
            {productosTop.map(p => (
              <div key={p.nombre} className="inf-product-row">
                <div className="inf-product-icon-wrap">
                  <ProductIcon emoji={p.icon} size={22} color="var(--brand-600)" />
                </div>
                <div className="inf-product-info">
                  <p className="inf-product-name">{p.nombre}</p>
                  <div className="inf-product-bar-wrap">
                    <div className="inf-product-bar" style={{ width: `${(p.stock / maxStock) * 100}%` }} />
                  </div>
                </div>
                <span className="inf-product-val">{p.stock} uds.</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
