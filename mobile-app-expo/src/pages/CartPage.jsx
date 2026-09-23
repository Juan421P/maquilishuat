import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Controller } from "react-hook-form";
import { T } from "../utils/theme";
import { formatPrice } from "../utils/format";
import { ADDRESS_MAX } from "../utils/validators";
import { useCheckoutForm } from "../hooks/useCheckoutForm";
import AppBar from "../layout/AppBar";
import Field from "../components/Field";
import Alert from "../components/Alert";
import Btn from "../components/Btn";
import Ic from "../components/Ic";
import QtyStepper from "../components/QtyStepper";

export default function CartPage({ cartState, shop, defaultAddress, onPurchased, onGoCatalog }) {
  const { cart, changeQty, removeItem, clearCart, reconcile } = cartState;
  const { control, errors, submit, loading, serverError, changes, dismissChanges, subtotal, shipping, total, metodos, rules } =
    useCheckoutForm({ cart, clearCart, reconcile, loadProducts: shop.load, onPurchased, defaultAddress });

  if (cart.length === 0) {
    return (
      <View style={{ flex: 1 }}>
        <AppBar title="Carrito" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: T.bg, padding: 32 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#fce7f3", alignItems: "center", justifyContent: "center" }}>
            <Ic n="bag" size={32} color={T.purple} />
          </View>
          <Text style={{ fontSize: 17, fontWeight: "800", color: T.text1 }}>Carrito vacío</Text>
          {changes.length > 0 ? (
            <Alert type="warn" msg={changes.join("\n")} />
          ) : (
            <Text style={{ fontSize: 14, color: T.textMut, textAlign: "center" }}>Agrega productos desde el catálogo</Text>
          )}
          <View style={{ width: "100%", maxWidth: 260 }}>
            <Btn variant="outline" onPress={onGoCatalog}>Ver catálogo</Btn>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <AppBar title="Mi carrito" />
      <ScrollView style={{ flex: 1, backgroundColor: T.bg }} contentContainerStyle={{ padding: 14 }} keyboardShouldPersistTaps="handled">
        {changes.length > 0 && (
          <View style={{ backgroundColor: "#fef9c3", borderColor: "#fde68a", borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <Text style={{ fontSize: 13, fontWeight: "800", color: "#a16207", marginBottom: 4 }}>Actualizamos tu carrito</Text>
            {changes.map((c, i) => (
              <Text key={i} style={{ fontSize: 12.5, color: "#a16207", lineHeight: 18 }}>• {c}</Text>
            ))}
            <Text style={{ fontSize: 12, color: "#a16207", marginTop: 6 }}>Revisa el total y vuelve a confirmar.</Text>
            <TouchableOpacity onPress={dismissChanges} style={{ marginTop: 6, alignSelf: "flex-start" }}>
              <Text style={{ fontSize: 12.5, color: "#a16207", fontWeight: "700" }}>Entendido</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ gap: 8, marginBottom: 14 }}>
          {cart.map((item) => {
            const atMax = Number.isFinite(item.stock) && item.qty >= item.stock;
            return (
              <View key={item.id} style={{ backgroundColor: T.surface, borderRadius: 12, borderWidth: 1, borderColor: T.border, padding: 13 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => shop.openProduct({ _id: item.id })}
                    accessibilityRole="button"
                    accessibilityLabel={`Ver ${item.nombre}`}
                    style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}
                  >
                    <View style={{ width: 42, height: 42, borderRadius: 9, backgroundColor: "#f3e8ff", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                      {item.imagen ? (
                        <Image source={{ uri: item.imagen }} style={{ width: 42, height: 42 }} />
                      ) : (
                        <Ic n="water" size={20} color={T.purple} />
                      )}
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: T.text1 }}>{item.nombre}</Text>
                      <Text style={{ fontSize: 12, color: T.textMut }}>
                        {formatPrice(item.precio)} c/u · {formatPrice(item.precio * item.qty)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <QtyStepper
                    value={item.qty}
                    max={Number.isFinite(item.stock) ? item.stock : Infinity}
                    minusRemoves
                    onDecrease={() => changeQty(item.id, -1)}
                    onIncrease={() => changeQty(item.id, 1)}
                  />
                  <TouchableOpacity
                    onPress={() => removeItem(item.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Quitar ${item.nombre} del carrito`}
                    hitSlop={6}
                    style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "#fff1f2", borderWidth: 1, borderColor: "#fecdd3", alignItems: "center", justifyContent: "center", marginLeft: 2 }}
                  >
                    <Ic n="trash" size={12} color={T.red} />
                  </TouchableOpacity>
                </View>
                {atMax && (
                  <Text style={{ fontSize: 11.5, color: T.amber, fontWeight: "700", marginTop: 6 }}>
                    Máximo disponible: {item.stock}
                  </Text>
                )}
              </View>
            );
          })}
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
                maxLength={ADDRESS_MAX}
                multiline
                error={errors.addr?.message}
                hint={defaultAddress && field.value === defaultAddress ? "Usamos la dirección de tu último pedido" : undefined}
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
                      accessibilityRole="radio"
                      accessibilityState={{ selected: field.value === m }}
                      style={{ flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center", backgroundColor: field.value === m ? T.purple : "#f3e8ff" }}
                    >
                      <Text style={{ fontSize: 11.5, fontWeight: "700", color: field.value === m ? "#fff" : T.purple }}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
            <Text style={{ fontSize: 11.5, color: T.textMut, marginTop: 8, lineHeight: 16 }}>
              El pago se coordina al momento de la entrega. Tu pedido quedará como "Pendiente" hasta que lo confirmemos.
            </Text>
          </View>
        </View>

        <View style={{ backgroundColor: T.surface, borderRadius: 12, borderWidth: 1, borderColor: T.border, padding: 14 }}>
          {[["Subtotal", formatPrice(subtotal)], ["Envío a domicilio", formatPrice(shipping)]].map(([l, v]) => (
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
            <Btn onPress={submit} disabled={loading}>{loading ? "Procesando pedido..." : `Confirmar pedido · ${formatPrice(total)}`}</Btn>
            <Text style={{ fontSize: 11, color: T.textMut, textAlign: "center", marginTop: 8 }}>
              Antes de confirmar revisamos precios y stock con el servidor.
            </Text>
          </View>
        </View>
        <View style={{ height: 14 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
