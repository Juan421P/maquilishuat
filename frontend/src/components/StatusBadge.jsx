const VARIANT_CLASS = {
  green: "badge-green",
  yellow: "badge-yellow",
  red: "badge-red",
  blue: "badge-blue",
};

export default function StatusBadge({ variant, children }) {
  return <span className={`badge ${VARIANT_CLASS[variant] || "badge-yellow"}`}>{children}</span>;
}
