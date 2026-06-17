import { T } from "../utils/theme";

export default function Alert({ msg, type = "error" }) {
  if (!msg) return null;
  const styles = {
    error: { bg: "#fff1f2", color: T.red,   border: "#fecdd3" },
    ok:    { bg: "#f0fdf4", color: T.green, border: "#bbf7d0" },
    warn:  { bg: "#fef9c3", color: T.amber, border: "#fde68a" },
  };
  const s = styles[type] || styles.error;
  return (
    <div style={{
      padding: "10px 13px", borderRadius: 8, marginBottom: 12,
      fontSize: 13, fontWeight: 500,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {msg}
    </div>
  );
}
