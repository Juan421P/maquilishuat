import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, TrendingUp, X, AlertCircle, RefreshCw } from "lucide-react";
import ProductIcon from "../components/ProductIcon";
import { productsAPI } from "../services/api";
import "./ProductsManagement.css";
import "./OrderManagement.css";

const ICON_OPTIONS = [
  { emoji: "🪣", label: "Garrafón" },
  { emoji: "🫙", label: "5 galones" },
  { emoji: "💧", label: "Botella 1L" },
  { emoji: "🧴", label: "Pack x6" },
  { emoji: "🍶", label: "Bebida" },
  { emoji: "📦", label: "Caja" },
];

const TIPOS = ["garrafon", "botella", "bebida", "pack", "otro"];

function Toggle({ on, onChange }) {
  return (
    <button className={`toggle ${on ? "on" : "off"}`} onClick={() => onChange(!on)}>
      <span className="toggle-thumb" />
    </button>
  );
}

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(
    product
      ? {
          nombre: product.name || "",
          precio: product.price ?? "",
          stock: product.stock ?? "",
          tipo: product.product_type || "botella",
          sabor: product.flavor || "",
          tamanio: product.size || "",
          descripcion: product.description || "",
          disponible: true,
          icon: "🪣",
          images: null,
        }
      : { nombre: "", precio: "", stock: "", tipo: "botella", sabor: "", tamanio: "", descripcion: "", disponible: true, icon: "🪣", images: null }
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.nombre.trim()) { setErr("El nombre es obligatorio"); return; }
    if (form.precio === "" || isNaN(Number(form.precio))) { setErr("El precio es obligatorio"); return; }
    if (form.stock === "" || isNaN(Number(form.stock))) { setErr("El stock es obligatorio"); return; }
    setSaving(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("name", form.nombre);
      fd.append("price", parseFloat(form.precio));
      fd.append("stock", parseInt(form.stock));
      fd.append("product_type", form.tipo);
      if (form.sabor) fd.append("flavor", form.sabor);
      if (form.tamanio) fd.append("size", form.tamanio);
      if (form.descripcion) fd.append("description", form.descripcion);
      if (form.images) {
        Array.from(form.images).forEach(f => fd.append("images", f));
      }
      if (product) {
        await productsAPI.update(product._id, fd);
      } else {
        await productsAPI.create(fd);
      }
      onSave();
    } catch (e) {
      setErr(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{product ? "Editar producto" : "Nuevo producto"}</h3>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        {err && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "8px 12px", borderRadius: 6, fontSize: 13, marginBottom: 10 }}><AlertCircle size={13} style={{ display: "inline", marginRight: 6 }} />{err}</div>}
        <div className="modal-grid">
          <div className="field" style={{ gridColumn: "1/-1" }}>
            <label>Nombre del producto</label>
            <input value={form.nombre} onChange={set("nombre")} placeholder="Ej: Garrafón 20L" required />
          </div>
          <div className="field">
            <label>Precio ($)</label>
            <input type="number" step="0.01" min="0" value={form.precio} onChange={set("precio")} placeholder="0.00" />
          </div>
          <div className="field">
            <label>Stock</label>
            <input type="number" min="0" value={form.stock} onChange={set("stock")} placeholder="0" />
          </div>
          <div className="field">
            <label>Tipo</label>
            <select value={form.tipo} onChange={set("tipo")}>
              {TIPOS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Sabor (opcional)</label>
            <input value={form.sabor} onChange={set("sabor")} placeholder="Ej: Menta" />
          </div>
          <div className="field">
            <label>Tamaño (opcional)</label>
            <input value={form.tamanio} onChange={set("tamanio")} placeholder="Ej: 20L" />
          </div>
          <div className="field" style={{ gridColumn: "1/-1" }}>
            <label>Descripción</label>
            <input value={form.descripcion} onChange={set("descripcion")} placeholder="Descripción breve" />
          </div>
          <div className="field" style={{ gridColumn: "1/-1" }}>
            <label>Imágenes del producto</label>
            <input type="file" accept="image/*" multiple onChange={e => setForm(f => ({ ...f, images: e.target.files }))} />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Máximo 5 imágenes. Se reemplazarán las actuales al editar.</span>
          </div>
          <div className="field" style={{ gridColumn: "1/-1" }}>
            <label>Ícono visual</label>
            <div className="icon-picker">
              {ICON_OPTIONS.map(opt => (
                <button key={opt.emoji} type="button"
                  className={`icon-picker-item ${form.icon === opt.emoji ? "selected" : ""}`}
                  onClick={() => setForm(f => ({ ...f, icon: opt.emoji }))} title={opt.label}>
                  <ProductIcon emoji={opt.emoji} size={22} color="currentColor" />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Guardando...</> : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await productsAPI.getAll();
      setProducts(data);
    } catch (e) {
      setError(e.message || "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter(p =>
    (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSaved = () => {
    setModal(null);
    load();
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await productsAPI.delete(id);
      setDeleteId(null);
      load();
    } catch (e) {
      alert(e.message || "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  };

  // Ícono representativo según el tipo de producto
  const getIcon = (p) => {
    const t = (p.product_type || "").toLowerCase();
    if (t.includes("garrafon") || t.includes("garrafón")) return "🪣";
    if (t.includes("galon") || t.includes("galón")) return "🫙";
    if (t.includes("bebida")) return "🍶";
    if (t.includes("pack")) return "📦";
    return "💧";
  };

  return (
    <div className="page">
      <div className="page-topbar">
        <p className="page-subtitle">Gestiona el catálogo de productos y su disponibilidad.</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-add" style={{ background: "var(--gray-100)", color: "var(--text-secondary)" }} onClick={load}>
            <RefreshCw size={14} />
          </button>
          <button className="btn-add" onClick={() => setModal({ product: null })}>
            <Plus size={15} /> Nuevo producto
          </button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={14} />
          <input placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading && <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)" }}><span className="spinner" style={{ display: "inline-block" }} /> Cargando...</div>}
      {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px 16px", borderRadius: 8, marginBottom: 16 }}><AlertCircle size={14} style={{ display: "inline", marginRight: 6 }} />{error} — <button style={{ textDecoration: "underline", background: "none", border: "none", color: "#dc2626", cursor: "pointer" }} onClick={load}>Reintentar</button></div>}

      {!loading && (
        <div className="products-grid">
          {filtered.length === 0 && (
            <p style={{ color: "var(--text-muted)", textAlign: "center", gridColumn: "1/-1", padding: "48px 0" }}>
              {products.length === 0 ? "No hay productos registrados aún." : "No se encontraron productos."}
            </p>
          )}
          {filtered.map(p => (
            <div key={p._id} className="product-card">
              <div className="product-card-header">
                <div className="product-icon-wrap">
                  <ProductIcon emoji={getIcon(p)} size={28} color="var(--brand-600)" />
                </div>
                <span className={`badge ${p.stock > 0 ? "badge-green" : "badge-yellow"}`}>
                  {p.stock > 0 ? `Stock: ${p.stock}` : "Sin stock"}
                </span>
              </div>
              <div>
                <p className="product-name">{p.name}</p>
                <p className="product-price">${(p.price || 0).toFixed(2)}</p>
                {p.product_type && <p className="product-sold" style={{ textTransform: "capitalize" }}>{p.product_type}{p.flavor ? ` · ${p.flavor}` : ""}{p.size ? ` · ${p.size}` : ""}</p>}
                {p.description && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{p.description}</p>}
              </div>
              <div className="product-card-footer">
                <div className="product-actions">
                  <button className="act-btn act-edit" title="Editar" onClick={() => setModal({ product: p })}>
                    <Pencil size={13} />
                  </button>
                  <button className="act-btn act-del" title="Eliminar" onClick={() => setDeleteId(p._id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && <ProductModal product={modal.product} onClose={() => setModal(null)} onSave={handleSaved} />}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-card confirm" onClick={e => e.stopPropagation()}>
            <h3>¿Eliminar producto?</h3>
            <p>Esta acción eliminará también las imágenes del servidor y es irreversible.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteId(null)}>Cancelar</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteId)} disabled={deleting}>
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
