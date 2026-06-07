import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Droplets, ShoppingCart, Search, Check, AlertCircle } from "lucide-react";
import ProductIcon from "../components/ProductIcon";
import { productsAPI } from "../services/api";
import "./Home.css";

const EMOJI_MAP = {
  garrafon: "🪣", garrafa: "🪣", galones: "🫙", galon: "🫙",
  bebida: "🍶", saborizada: "🍶", pack: "📦", botella: "💧",
};

function getEmoji(product) {
  const name = (product.name + " " + (product.product_type || "")).toLowerCase();
  for (const [key, emoji] of Object.entries(EMOJI_MAP)) {
    if (name.includes(key)) return emoji;
  }
  return "💧";
}

export default function Catalogo() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cat, setCat] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [carrito, setCarrito] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("maq_carrito") || "[]"); } catch { return []; }
  });
  const [addedIds, setAddedIds] = useState({});

  useEffect(() => {
    productsAPI.getAll()
      .then(data => setProducts(data.filter(p => p.stock > 0)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const categorias = ["Todas", ...new Set(products.map(p => p.product_type).filter(Boolean))];

  const agregarAlCarrito = (producto) => {
    const updated = (() => {
      const existe = carrito.find(x => x.id === producto._id);
      if (existe) return carrito.map(x => x.id === producto._id ? { ...x, qty: x.qty + 1 } : x);
      return [...carrito, { id: producto._id, nombre: producto.name, precio: producto.price, emoji: getEmoji(producto), qty: 1 }];
    })();
    setCarrito(updated);
    sessionStorage.setItem("maq_carrito", JSON.stringify(updated));
    setAddedIds(a => ({ ...a, [producto._id]: true }));
    setTimeout(() => setAddedIds(a => ({ ...a, [producto._id]: false })), 1400);
  };

  const filtrados = products.filter(p => {
    const matchCat = cat === "Todas" || p.product_type === cat;
    const matchBusq = (p.name || "").toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBusq;
  });

  const totalCarrito = carrito.reduce((a, x) => a + x.qty, 0);

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
            <Link to="/carrito" className="pub-cart-btn">
              <ShoppingCart size={16} />
              Carrito {totalCarrito > 0 && <span style={{ background: "var(--brand-500)", color: "white", borderRadius: "99px", padding: "0 6px", fontSize: 10, fontWeight: 700 }}>{totalCarrito}</span>}
            </Link>
            <Link to="/login" className="pub-login-btn">Ingresar</Link>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "96px 24px 64px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(22px, 4vw, 30px)", fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>
            Catálogo de productos
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Agua purificada en todas las presentaciones. Entrega a domicilio disponible.</p>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius-md)", padding: "8px 13px", flex: 1, minWidth: 180 }}>
            <Search size={14} style={{ color: "var(--text-muted)" }} />
            <input placeholder="Buscar producto..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: 14, color: "var(--text-primary)", background: "transparent", width: "100%" }} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categorias.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding: "7px 14px", borderRadius: "var(--radius-full)", border: "1.5px solid", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                fontFamily: "var(--font-sans)", transition: "all 0.15s",
                borderColor: cat === c ? "var(--brand-400)" : "var(--gray-200)",
                background: cat === c ? "var(--brand-50)" : "white",
                color: cat === c ? "var(--brand-600)" : "var(--text-muted)",
              }}>{c === "Todas" ? "Todas" : c.charAt(0).toUpperCase() + c.slice(1)}</button>
            ))}
          </div>
        </div>

        {loading && <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)" }}>Cargando productos...</div>}
        {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px 16px", borderRadius: 8, marginBottom: 16 }}><AlertCircle size={14} style={{ display: "inline", marginRight: 6 }} />{error}</div>}

        {!loading && filtrados.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Sin resultados</p>
            <p style={{ fontSize: 13 }}>Intenta con otro nombre o categoría.</p>
          </div>
        )}

        {!loading && filtrados.length > 0 && (
          <div className="pub-products-grid">
            {filtrados.map(p => (
              <div key={p._id} className="pub-product-card">
                <div className="pub-product-icon-wrap">
                  {p.images && p.images.length > 0
                    ? <img src={p.images[0].image} alt={p.name} style={{ width: 52, height: 52, objectFit: "cover", borderRadius: 8 }} />
                    : <ProductIcon emoji={getEmoji(p)} size={34} color="var(--brand-600)" />
                  }
                </div>
                {p.product_type && <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: "var(--brand-400)" }}>{p.product_type}</span>}
                <h3 className="pub-product-name">{p.name}</h3>
                {p.description && <p className="pub-product-desc">{p.description}</p>}
                {p.size && <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Tamaño: {p.size}</p>}
                <div className="pub-product-footer">
                  <span className="pub-product-price">${(p.price || 0).toFixed(2)}</span>
                  <button
                    className={`pub-add-btn${addedIds[p._id] ? " added" : ""}`}
                    onClick={() => agregarAlCarrito(p)}
                    style={{ border: "none", cursor: "pointer" }}
                  >
                    {addedIds[p._id] ? <><Check size={13} /> Agregado</> : <><ShoppingCart size={13} /> Agregar</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalCarrito > 0 && (
          <div style={{ marginTop: 32, textAlign: "center" }}>
            <Link to="/carrito" className="pub-btn-primary" style={{ color: "var(--brand-600)", background: "white", border: "2px solid var(--brand-200)", boxShadow: "none" }}>
              <ShoppingCart size={16} /> Ver carrito ({totalCarrito} {totalCarrito === 1 ? "producto" : "productos"})
            </Link>
          </div>
        )}
      </div>

      <footer className="pub-footer">
        <div className="pub-container">
          <span>© 2026 Maquilishuat S.A. de C.V.</span>
          <div className="pub-footer-links">
            <Link to="/terminos">Términos y condiciones</Link>
            <Link to="/contacto">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
