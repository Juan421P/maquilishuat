import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { T } from "../utils/theme";
import Ic from "./Ic";

// Estados de una pantalla o sección que carga datos:
//   <StateView loading />                               → spinner
//   <StateView error="..." onRetry={reload} />          → error + Reintentar
//   <StateView empty title="..." message="..." />       → estado vacío
// `offline` cambia el ícono y el texto cuando no hay conexión.
export default function StateView({
  loading,
  error,
  offline,
  onRetry,
  icon = "package",
  title,
  message,
  action,
  actionLabel,
  compact = false,
}) {
  const pad = compact ? 16 : 36;

  if (loading) {
    return (
      <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: pad, gap: 10 }} accessibilityLiveRegion="polite">
        <ActivityIndicator color={T.purple} />
        <Text style={{ fontSize: 13, color: T.textMut }}>{message || "Cargando..."}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ alignItems: "center", paddingVertical: pad, paddingHorizontal: 20, gap: 8 }} accessibilityLiveRegion="polite">
        <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: "#fff1f2", alignItems: "center", justifyContent: "center" }}>
          <Ic n={offline ? "wifiOff" : "alert"} size={24} color={T.red} />
        </View>
        <Text style={{ fontSize: 15, fontWeight: "800", color: T.text1, textAlign: "center" }}>
          {title || (offline ? "Sin conexión" : "No se pudo cargar")}
        </Text>
        <Text style={{ fontSize: 13, color: T.text3, textAlign: "center", lineHeight: 19 }}>{error}</Text>
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            accessibilityRole="button"
            style={{ marginTop: 6, flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 9, paddingHorizontal: 18, borderRadius: 10, backgroundColor: "#f3e8ff" }}
          >
            <Ic n="refresh" size={15} color={T.purple} />
            <Text style={{ color: T.purple, fontWeight: "700", fontSize: 14 }}>Reintentar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={{ alignItems: "center", paddingVertical: pad, paddingHorizontal: 20, gap: 8 }}>
      <Ic n={icon} size={36} color={T.border} />
      {title ? <Text style={{ fontSize: 15, fontWeight: "800", color: T.text2, textAlign: "center" }}>{title}</Text> : null}
      {message ? <Text style={{ fontSize: 13, color: T.textMut, textAlign: "center", lineHeight: 19 }}>{message}</Text> : null}
      {action && actionLabel ? (
        <TouchableOpacity onPress={action} accessibilityRole="button" style={{ marginTop: 6, paddingVertical: 9, paddingHorizontal: 18, borderRadius: 10, backgroundColor: "#f3e8ff" }}>
          <Text style={{ color: T.purple, fontWeight: "700", fontSize: 14 }}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
