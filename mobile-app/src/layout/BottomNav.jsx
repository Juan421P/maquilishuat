import { T, GRAD } from "../utils/theme";
import Ic from "../components/Ic";

const NAV_ITEMS = [
  { id: "home",    icon: "home",  label: "Inicio"   },
  { id: "catalog", icon: "grid",  label: "Catálogo" },
  { id: "cart",    icon: "bag",   label: "Carrito"  },
  { id: "profile", icon: "user",  label: "Cuenta"   },
];

export default function BottomNav({ tab, setTab, cartCount }) {
  return (
    <div style={{
      background: T.surface,
      borderTop: `1px solid ${T.border}`,
      display: "flex", flexShrink: 0,
      // safe area para iPhones con home indicator
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {NAV_ITEMS.map((item) => {
        const active = tab === item.id;
        const badge  = item.id === "cart" ? cartCount : 0;
        return (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            style={{
              flex: 1, padding: "10px 0 8px", border: "none", background: "none",
              cursor: "pointer", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 3, minHeight: 56,
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <div style={{ position: "relative" }}>
              <Ic n={item.icon} size={24} color={active ? T.purple : T.textMut} />
              {badge > 0 && (
                <span style={{
                  position: "absolute", top: -4, right: -6, width: 16, height: 16,
                  borderRadius: "50%", background: T.pink, color: "#fff",
                  fontSize: 9, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </div>
            <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? T.purple : T.textMut }}>
              {item.label}
            </span>
            {active && <div style={{ width: 20, height: 2, borderRadius: 2, background: GRAD }} />}
          </button>
        );
      })}
    </div>
  );
}
