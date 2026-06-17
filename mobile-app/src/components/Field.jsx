import { T } from "../utils/theme";
import Ic from "./Ic";

export default function Field({
  label, type = "text", value, onChange, placeholder,
  iconName, right, error, autoComplete,
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && (
        <label style={{
          fontSize: 11, fontWeight: 700, textTransform: "uppercase",
          letterSpacing: "0.6px", color: T.text3, display: "block", marginBottom: 5,
        }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {iconName && (
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }}>
            <Ic n={iconName} size={16} color={T.textMut} />
          </span>
        )}
        <input
          type={type} value={value} onChange={onChange}
          placeholder={placeholder} autoComplete={autoComplete}
          style={{
            width: "100%",
            padding: `11px ${right ? 44 : 12}px 11px ${iconName ? 38 : 12}px`,
            border: `1.5px solid ${error ? T.red : T.border}`,
            borderRadius: 10, fontSize: 14, outline: "none",
            background: T.surface, color: T.text1,
            boxSizing: "border-box", fontFamily: "inherit",
          }}
        />
        {right && (
          <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)" }}>
            {right}
          </span>
        )}
      </div>
      {error && <p style={{ fontSize: 12, color: T.red, marginTop: 3 }}>{error}</p>}
    </div>
  );
}
