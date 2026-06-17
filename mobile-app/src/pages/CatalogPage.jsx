import { useState } from "react";
import { T } from "../utils/theme";
import AppBar from "../layout/AppBar";
import ProductCard from "../components/ProductCard";
import Ic from "../components/Ic";

export default function CatalogPage({ products, cart, onAdd, onGoCart }) {
  const [query, setQuery] = useState("");
  const [cat,   setCat]   = useState("Todas");
  const cartCount = cart.reduce((a, x) => a + x.qty, 0);

  const categories = ["Todas", ...new Set(products.map((p) => p.product_type).filter(Boolean))];
  const filtered = products.filter((p) => {
    const matchCat = cat === "Todas" || p.product_type === cat;
    const matchQ   = (p.name || "").toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AppBar title="Catálogo" cartCount={cartCount} onCartPress={onGoCart} />
      <div style={{ background: T.surface, padding: "12px 14px 0", borderBottom: `1px solid ${T.border}` }}>
        {/* Search */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}>
            <Ic n="search" size={15} color={T.textMut} />
          </span>
          <input
            value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos..."
            style={{
              width: "100%", padding: "9px 9px 9px 34px",
              border: `1.5px solid ${T.border}`, borderRadius: 9, fontSize: 14,
              outline: "none", background: T.bg, color: T.text1, boxSizing: "border-box",
            }}
          />
        </div>
        {/* Category filters */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 10 }}>
          {categories.map((c) => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: "4px 13px", borderRadius: 99, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
              background: cat === c ? T.purple : "#f3e8ff",
              color:      cat === c ? "#fff"   : T.purple,
            }}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px", background: T.bg }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((p) => (
            <ProductCard key={p._id} product={p} inCart={!!cart.find((x) => x.id === p._id)} onAdd={() => onAdd(p)} />
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: T.textMut }}>
              <Ic n="search" size={36} color={T.border} />
              <p style={{ marginTop: 10, fontSize: 14 }}>Sin resultados</p>
            </div>
          )}
        </div>
        <div style={{ height: 14 }} />
      </div>
    </div>
  );
}
