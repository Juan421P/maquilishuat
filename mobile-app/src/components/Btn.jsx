import { GRAD } from "../utils/theme";
import { T } from "../utils/theme";

export default function Btn({ children, onClick, disabled, variant = "primary", style = {} }) {
  const variants = {
    primary: { background: GRAD, color: "#fff", border: "none" },
    ghost:   { background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,0.35)" },
    outline: { background: "transparent", color: T.purple, border: `1.5px solid ${T.purple}` },
    danger:  { background: T.red, color: "#fff", border: "none" },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        width: "100%", padding: "13px 16px", borderRadius: 12,
        fontSize: 15, fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        opacity: disabled ? 0.6 : 1, transition: "opacity 0.15s",
        fontFamily: "inherit",
        ...variants[variant], ...style,
      }}
    >
      {children}
    </button>
  );
}
