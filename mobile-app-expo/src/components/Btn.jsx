import { Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { T, GRAD_COLORS } from "../utils/theme";

export default function Btn({ children, onPress, disabled, variant = "primary", style = {} }) {
  const base = {
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    opacity: disabled ? 0.6 : 1,
    ...style,
  };

  const textStyle = { fontSize: 15, fontWeight: "700" };

  if (variant === "primary") {
    return (
      <TouchableOpacity activeOpacity={0.85} disabled={disabled} onPress={onPress}>
        <LinearGradient
          colors={GRAD_COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={base}
        >
          <Text style={[textStyle, { color: "#fff" }]}>{children}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variants = {
    ghost: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.35)" },
    outline: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: T.purple },
    danger: { backgroundColor: T.red },
  };
  const colors = { ghost: "#fff", outline: T.purple, danger: "#fff" };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      style={[base, variants[variant]]}
    >
      <Text style={[textStyle, { color: colors[variant] }]}>{children}</Text>
    </TouchableOpacity>
  );
}
