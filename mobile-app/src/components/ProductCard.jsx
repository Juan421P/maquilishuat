import { T, GRAD } from "../utils/theme";
import Ic from "./Ic";
import { formatPrice } from "../utils/format";

export default function ProductCard({ product, inCart, onAdd }) {
  return (
    <div style={{
      background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`,
      padding: "13px 14px", display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 10,
        background: "linear-gradient(135deg,#f3e8ff,#e9d5ff)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Ic n="water" size={24} color={T.purple} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: T.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {product.name}
        </p>
        {product.product_type && (
          <p style={{ fontSize: 11, color: T.textMut, marginTop: 1 }}>{product.product_type}</p>
        )}
        <p style={{ fontSize: 16, fontWeight: 800, color: T.purpleDark, marginTop: 2 }}>
          {formatPrice(product.price)}
        </p>
      </div>
      <button
        onClick={onAdd}
        style={{
          width: 36, height: 36, borderRadius: 10, border: "none", cursor: "pointer",
          background: inCart ? T.purple : GRAD,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}
      >
        <Ic n={inCart ? "check" : "plus"} size={16} color="#fff" />
      </button>
    </div>
  );
}
