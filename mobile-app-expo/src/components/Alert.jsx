import { Text, View } from "react-native";
import { T } from "../utils/theme";

export default function Alert({ msg, type = "error" }) {
  if (!msg) return null;
  const styles = {
    error: { bg: "#fff1f2", color: T.red, border: "#fecdd3" },
    ok: { bg: "#f0fdf4", color: T.green, border: "#bbf7d0" },
    warn: { bg: "#fef9c3", color: T.amber, border: "#fde68a" },
  };
  const s = styles[type] || styles.error;
  return (
    <View
      style={{
        paddingVertical: 10,
        paddingHorizontal: 13,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: s.bg,
        borderWidth: 1,
        borderColor: s.border,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: "500", color: s.color }}>{msg}</Text>
    </View>
  );
}
