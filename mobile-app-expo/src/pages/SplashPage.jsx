import { Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GRAD_SIDEBAR_COLORS, GRAD_COLORS } from "../utils/theme";
import Ic from "../components/Ic";
import Btn from "../components/Btn";

export default function SplashPage({ onLogin, onRegister, onInfo }) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={GRAD_SIDEBAR_COLORS} style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 36 }}>
        <LinearGradient
          colors={GRAD_COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 88,
            height: 88,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 22,
          }}
        >
          <Ic n="drop" size={42} color="#fff" />
        </LinearGradient>
        <Text style={{ color: "#fff", fontSize: 32, fontWeight: "800", marginBottom: 6 }}>Maquilishuat</Text>
        <Text
          style={{
            color: "rgba(216,180,254,0.8)",
            fontSize: 13,
            fontWeight: "600",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 28,
          }}
        >
          S.A. de C.V.
        </Text>
        <Text
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 15,
            lineHeight: 24,
            maxWidth: 280,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Agua purificada de calidad, directo a tu puerta en El Salvador.
        </Text>
        <View style={{ flexDirection: "row", gap: 5, marginBottom: 8 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Ic key={i} n="star" size={15} color="#f59e0b" />
          ))}
        </View>
        <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>+500 clientes satisfechos</Text>
      </View>
      <View style={{ paddingHorizontal: 28, paddingBottom: insets.bottom + 32, gap: 12 }}>
        <Btn onPress={onLogin}>Iniciar sesión</Btn>
        <Btn variant="ghost" onPress={onRegister}>
          Crear cuenta nueva
        </Btn>
        <TouchableOpacity onPress={onInfo} style={{ alignItems: "center", marginTop: 6 }}>
          <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12.5, fontWeight: "600" }}>
            Sobre nosotros · Contacto · Términos
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
