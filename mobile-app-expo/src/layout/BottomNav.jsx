import { Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { T, GRAD_COLORS } from "../utils/theme";
import Ic from "../components/Ic";

const NAV_ITEMS = [
  { id: "home", icon: "home", label: "Inicio" },
  { id: "catalog", icon: "grid", label: "Catálogo" },
  { id: "cart", icon: "bag", label: "Carrito" },
  { id: "profile", icon: "user", label: "Cuenta" },
];

export default function BottomNav({ tab, setTab, cartCount }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        backgroundColor: T.surface,
        borderTopWidth: 1,
        borderTopColor: T.border,
        flexDirection: "row",
        paddingBottom: insets.bottom,
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = tab === item.id;
        const badge = item.id === "cart" ? cartCount : 0;
        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => setTab(item.id)}
            style={{ flex: 1, paddingVertical: 10, alignItems: "center", gap: 3, minHeight: 56 }}
          >
            <View>
              <Ic n={item.icon} size={24} color={active ? T.purple : T.textMut} />
              {badge > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -6,
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: T.pink,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 9, fontWeight: "800" }}>
                    {badge > 9 ? "9+" : badge}
                  </Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 11, fontWeight: active ? "700" : "500", color: active ? T.purple : T.textMut }}>
              {item.label}
            </Text>
            {active && (
              <LinearGradient
                colors={GRAD_COLORS}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: 20, height: 2, borderRadius: 2 }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
