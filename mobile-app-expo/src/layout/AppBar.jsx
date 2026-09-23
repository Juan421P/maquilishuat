import { Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { T, GRAD_COLORS } from "../utils/theme";
import Ic from "../components/Ic";

export default function AppBar({ title, cartCount, onCartPress }) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={GRAD_COLORS} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: insets.top }}>
      <View
        style={{
          paddingVertical: 14,
          paddingHorizontal: 18,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ic n="drop" size={18} color="#fff" />
          </View>
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "800" }}>{title || "Maquilishuat"}</Text>
        </View>
        {onCartPress && (
          <TouchableOpacity
            onPress={onCartPress}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ic n="bag" size={20} color="#fff" />
            {cartCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: T.pink,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>
                  {cartCount > 9 ? "9+" : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}
