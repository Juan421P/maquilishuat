import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Controller } from "react-hook-form";
import { T } from "../utils/theme";
import { formatPrice } from "../utils/format";
import { useCheckoutForm } from "../hooks/useCheckoutForm";
import AppBar from "../layout/AppBar";
import Field from "../components/Field";
import Alert from "../components/Alert";
import Btn from "../components/Btn";
import Ic from "../components/Ic";

export default function CartPage({ cart, changeQty, removeItem, clearCart, onOrderSuccess }) {
  const { control, errors, submit, loading, serverError, subtotal, shipping, total, metodos, rules } =
    useCheckoutForm({ cart, clearCart, onOrderSuccess });

  if (cart.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        <AppBar title="Carrito" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: T.bg, padding: 32 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#fce7f3", alignItems: "center", justifyContent: "center" }}>
            <Ic n="bag" size={32} color={T.purple} />
          </View>
          <Text style={{ fontSize: 17, fontWeight: "800", color: T.text1 }}>Carrito vacío</Text>
          <Text style={{ fontSize: 14, color: T.textMut, textAlign: "center" }}>Agrega productos desde el catálogo</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AppBar title="Mi carrito" />
      <ScrollView style={{ flex: 1, backgroundColor: T.bg }} contentContainerStyle={{ padding: 14 }}>
        <View style={{ gap: 8, marginBottom: 14 }}>
          {cart.map((item) => (
            <View key={item.id} style={{ backgroundColor: T.surface, borderRadius: 12, borderWidth: 1, borderColor: T.border, padding: 13, flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 42, height: 42, borderRadius: 9, backgroundColor: "#f3e8ff", alignItems: "center", justifyContent: "center" }}>
                <Ic n="water" size={20} color={T.purple} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: T.text1 }}>{item.nombre}</Text>
                <Text style={{ fontSize: 12, color: T.textMut }}>{formatPrice(item.precio)} c/u</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <TouchableOpacity onPress={() => changeQty(item.id, -1)} style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: "#f3e8ff", borderWidth: 1, borderColor: "#e9d5ff", alignItems: "center", justifyContent: "center" }}>
                  <Ic n="minus" size={12} color={T.purple} />
                </TouchableOpacity>
                <Text style={{ fontSize: 14, fontWeight: "800", minWidth: 20, textAlign: "center", color: T.text1 }}>{item.qty}</Text>
                <TouchableOpacity onPress={() => changeQty(item.id, 1)} style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: "#f3e8ff", borderWidth: 1, borderColor: "#e9d5ff", alignItems: "center", justifyContent: "center" }}>
                  <Ic n="plus" size={12} color={T.purple} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeItem(item.id)} style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: "#fff1f2", borderWidth: 1, borderColor: "#fecdd3", alignItems: "center", justifyContent: "center", marginLeft: 4 }}>
                  <Ic n="trash" size={11} color={T.red} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={{ backgroundColor: T.surface, borderRadius: 12, borderWidth: 1, borderColor: T.border, padding: 14, marginBottom: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: "800", color: T.text1, marginBottom: 12 }}>Datos de entrega</Text>
          <Controller
            control={control}
            name="addr"
            rules={rules.addr}
            render={({ field }) => (
              <Field
                label="Dirección"
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Col. San Benito, Av. La Revolución #25"
                iconName="map"
                error={errors.addr?.message}
              />
            )}
          />
          <View>
            <Text style={{ fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6, color: T.text3, marginBottom: 7 }}>
              Método de pago
            </Text>
            <Controller
              control={control}
              name="metodo"
              render={({ field }) => (
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {metodos.map((m) => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => field.onChange(m)}
                      style={{ flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: "center", backgroundColor: field.value === m ? T.purple : "#f3e8ff" }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: "700", color: field.value === m ? "#fff" : T.purple }}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>
        </View>

        <View style={{ backgroundColor: T.surface, borderRadius: 12, borderWidth: 1, borderColor: T.border, padding: 14 }}>
          {[["Subtotal", formatPrice(subtotal)], ["Envío", formatPrice(shipping)]].map(([l, v]) => (
            <View key={l} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 7 }}>
              <Text style={{ fontSize: 13.5, color: T.text3 }}>{l}</Text>
              <Text style={{ fontSize: 13.5, color: T.text3 }}>{v}</Text>
            </View>
          ))}
          <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: T.border, paddingTop: 9, marginTop: 4 }}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: T.text1 }}>Total</Text>
            <Text style={{ fontSize: 16, fontWeight: "800", color: T.purpleDark }}>{formatPrice(total)}</Text>
          </View>
          <View style={{ marginTop: 12 }}>
            <Alert msg={serverError} />
            <Btn onPress={submit} disabled={loading}>{loading ? "Procesando..." : "Confirmar pedido"}</Btn>
          </View>
        </View>
        <View style={{ height: 14 }} />
      </ScrollView>
    </View>
  );
}
