import { Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GRAD_COLORS } from "../utils/theme";
import Ic from "../components/Ic";

export default function AuthHeader({ title, sub, onBack }) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={GRAD_COLORS}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 28 }}
    >
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          style={{
            alignSelf: "flex-start",
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: 10,
            paddingVertical: 8,
            paddingHorizontal: 14,
            marginBottom: 18,
          }}
        >
          <Ic n="back" size={15} color="rgba(255,255,255,0.9)" />
          <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: "600" }}>Volver</Text>
        </TouchableOpacity>
      )}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 13,
            backgroundColor: "rgba(255,255,255,0.2)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ic n="drop" size={24} color="#fff" />
        </View>
        <View>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>{title}</Text>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 }}>{sub}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}
