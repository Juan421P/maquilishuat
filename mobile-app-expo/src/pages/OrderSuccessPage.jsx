import { Text, View } from "react-native";
import { T } from "../utils/theme";
import Btn from "../components/Btn";
import Ic from "../components/Ic";

export default function OrderSuccessPage({ onContinue }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: "#fff", gap: 14 }}>
      <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center" }}>
        <Ic n="ok" size={40} color={T.green} />
      </View>
      <Text style={{ fontSize: 22, fontWeight: "800", color: T.text1 }}>¡Pedido confirmado!</Text>
      <Text style={{ fontSize: 14, color: T.textMut, maxWidth: 240, textAlign: "center", lineHeight: 22 }}>
        Tu pedido fue registrado. Nos pondremos en contacto para coordinar la entrega.
      </Text>
      <View style={{ width: "100%", marginTop: 4 }}>
        <Btn onPress={onContinue}>Seguir comprando</Btn>
      </View>
    </View>
  );
}
