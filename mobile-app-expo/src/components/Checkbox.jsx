import { Text, TouchableOpacity, View } from "react-native";
import { T } from "../utils/theme";
import Ic from "./Ic";

// Casilla con etiqueta. `extra` se muestra al lado pero NO marca/desmarca
// la casilla (p. ej. el enlace "Términos y condiciones"), para que tocar el
// enlace no acepte ni rechace sin querer.
export default function Checkbox({ checked, onChange, label, extra, error }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
        <TouchableOpacity
          onPress={() => onChange(!checked)}
          activeOpacity={0.8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          accessibilityLabel={label}
          hitSlop={6}
          style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              borderWidth: 1.5,
              borderColor: error ? T.red : checked ? T.purple : T.border,
              backgroundColor: checked ? T.purple : T.surface,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {checked && <Ic n="check" size={14} color="#fff" />}
          </View>
          <Text style={{ fontSize: 13, color: T.text2 }}>{label}</Text>
        </TouchableOpacity>
        {extra ? <View style={{ marginLeft: 4 }}>{extra}</View> : null}
      </View>
      {error ? <Text style={{ fontSize: 12, color: T.red, marginTop: 4, marginLeft: 32 }}>{error}</Text> : null}
    </View>
  );
}
