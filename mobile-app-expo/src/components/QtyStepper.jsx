import { Text, TouchableOpacity, View } from "react-native";
import { T } from "../utils/theme";
import Ic from "./Ic";

// Selector de cantidad −/+. El "+" se deshabilita al llegar al máximo
// (stock disponible) y el "−" al llegar al mínimo.
export default function QtyStepper({ value, onDecrease, onIncrease, min = 1, max = Infinity, size = 26, minusRemoves = false }) {
  const canDecrease = minusRemoves ? value > 0 : value > min;
  const canIncrease = value < max;

  const btn = (enabled, onPress, icon, label) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={!enabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !enabled }}
      hitSlop={8}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: enabled ? "#f3e8ff" : T.bg,
        borderWidth: 1,
        borderColor: enabled ? "#e9d5ff" : T.border,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ic n={icon} size={Math.round(size * 0.46)} color={enabled ? T.purple : T.textMut} />
    </TouchableOpacity>
  );

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      {btn(canDecrease, onDecrease, "minus", "Disminuir cantidad")}
      <Text
        accessibilityLabel={`Cantidad ${value}`}
        style={{ fontSize: size > 30 ? 17 : 14, fontWeight: "800", minWidth: 24, textAlign: "center", color: T.text1 }}
      >
        {value}
      </Text>
      {btn(canIncrease, onIncrease, "plus", canIncrease ? "Aumentar cantidad" : "Cantidad máxima alcanzada")}
    </View>
  );
}
