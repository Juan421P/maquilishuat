import { Text, View } from "react-native";
import { T } from "../utils/theme";
import Btn from "../components/Btn";
import Ic from "../components/Ic";
import { formatPrice, orderNumber, saleTotal } from "../utils/format";

// `order` es la venta que devolvió el backend (número, total con envío, etc.).
export default function OrderSuccessPage({ order, onContinue, onViewOrder }) {
  const hasOrder = !!order?._id;
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: "#fff", gap: 14 }}>
      <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center" }}>
        <Ic n="ok" size={40} color={T.green} />
      </View>
      <Text style={{ fontSize: 22, fontWeight: "800", color: T.text1 }}>¡Pedido confirmado!</Text>
      {hasOrder && (
        <View style={{ backgroundColor: T.bg, borderRadius: 12, borderWidth: 1, borderColor: T.border, paddingVertical: 12, paddingHorizontal: 18, alignItems: "center", gap: 2 }}>
          <Text style={{ fontSize: 13, color: T.text3 }}>Pedido {orderNumber(order._id)}</Text>
          <Text style={{ fontSize: 20, fontWeight: "800", color: T.purpleDark }}>{formatPrice(saleTotal(order))}</Text>
          <Text style={{ fontSize: 12, color: T.textMut }}>Pago {order.payment_method ? `en ${order.payment_method.toLowerCase()}` : ""} · Pendiente</Text>
        </View>
      )}
      <Text style={{ fontSize: 14, color: T.textMut, maxWidth: 260, textAlign: "center", lineHeight: 22 }}>
        Tu pedido fue registrado. Nos pondremos en contacto para coordinar la entrega.
      </Text>
      <View style={{ width: "100%", marginTop: 4, gap: 10 }}>
        {hasOrder && <Btn onPress={() => onViewOrder(order)}>Ver mi pedido</Btn>}
        <Btn variant={hasOrder ? "outline" : "primary"} onPress={onContinue}>Seguir comprando</Btn>
      </View>
    </View>
  );
}
