import { useState } from "react";
import { Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { T } from "../utils/theme";
import AppBar from "../layout/AppBar";
import Ic from "../components/Ic";
import StateView from "../components/StateView";
import { useAccountData } from "../context/AccountDataContext";
import {
  formatDateTime,
  formatPrice,
  orderNumber,
  PAYMENT_STATUS_COLOR,
  PAYMENT_STATUS_LABEL,
  round2,
  saleTotal,
} from "../utils/format";

function Row({ label, value, strong }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 7, gap: 12 }}>
      <Text style={{ fontSize: strong ? 15.5 : 13.5, color: strong ? T.text1 : T.text3, fontWeight: strong ? "800" : "400" }}>{label}</Text>
      <Text style={{ fontSize: strong ? 15.5 : 13.5, color: strong ? T.purpleDark : T.text2, fontWeight: strong ? "800" : "600", flexShrink: 1, textAlign: "right" }}>
        {value}
      </Text>
    </View>
  );
}

function Card({ title, children }) {
  return (
    <View style={{ backgroundColor: T.surface, borderRadius: 12, borderWidth: 1, borderColor: T.border, padding: 14, marginBottom: 12 }}>
      {title ? <Text style={{ fontSize: 13.5, fontWeight: "800", color: T.text1, marginBottom: 10 }}>{title}</Text> : null}
      {children}
    </View>
  );
}

export default function OrderDetailPage({ orderId, onBack, onOpenProduct }) {
  const account = useAccountData();
  const [refreshing, setRefreshing] = useState(false);
  const order = account.orders.find((o) => o._id === orderId) || null;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([account.refreshOrders(), account.refreshReviews()]);
    setRefreshing(false);
  };

  let body;
  if (!order && (account.ordersLoading || account.ordersRefreshing || !account.ordersLoaded)) {
    body = <StateView loading message="Cargando pedido..." />;
  } else if (!order && account.ordersError) {
    body = <StateView error={account.ordersError} onRetry={account.reloadOrders} />;
  } else if (!order) {
    body = <StateView title="Pedido no encontrado" message="Puede que ya no esté disponible." action={onBack} actionLabel="Volver" />;
  } else {
    const cart = order.shopping_cart_id || {};
    const products = cart.products || [];
    const subtotal = cart.total ?? products.reduce((a, x) => a + (x.subtotal || 0), 0);
    const discount = cart.discount || 0;
    // Ventas antiguas (antes de que el backend guardara el envío) no traen
    // shipping_cost: no se inventa un monto.
    const hasShipping = typeof order.shipping_cost === "number";
    const color = PAYMENT_STATUS_COLOR[order.payment_status] || PAYMENT_STATUS_COLOR.pending;

    body = (
      <View style={{ padding: 14 }}>
        <Card>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: "800", color: T.text1 }}>Pedido {orderNumber(order._id)}</Text>
              <Text style={{ fontSize: 12.5, color: T.textMut, marginTop: 2 }}>{formatDateTime(order.createdAt)}</Text>
            </View>
            <View style={{ backgroundColor: color.bg, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 99 }}>
              <Text style={{ color: color.color, fontSize: 11.5, fontWeight: "700" }}>
                Pago: {PAYMENT_STATUS_LABEL[order.payment_status] || order.payment_status || "—"}
              </Text>
            </View>
          </View>
          {order.payment_status === "pending" && (
            <Text style={{ fontSize: 12, color: T.text3, marginTop: 10, lineHeight: 17 }}>
              Nos pondremos en contacto para coordinar la entrega y el pago.
            </Text>
          )}
        </Card>

        <Card title="Entrega y pago">
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
            <Ic n="map" size={16} color={T.purple} />
            <Text style={{ flex: 1, fontSize: 13.5, color: T.text2, lineHeight: 19 }}>{order.delivery_address || "—"}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Ic n="bag" size={16} color={T.purple} />
            <Text style={{ flex: 1, fontSize: 13.5, color: T.text2 }}>Método de pago: {order.payment_method || "—"}</Text>
          </View>
        </Card>

        <Card title={`Productos (${products.length})`}>
          {products.length === 0 && <Text style={{ fontSize: 13, color: T.textMut }}>Sin productos registrados.</Text>}
          {products.map((item, i) => {
            const p = item.product_id && typeof item.product_id === "object" ? item.product_id : null;
            const pid = p?._id || item.product_id;
            const unit = item.amount ? round2((item.subtotal || 0) / item.amount) : 0;
            const review = pid ? account.reviewFor(pid) : null;
            const image = p?.images?.[0]?.image;
            return (
              <TouchableOpacity
                key={i}
                disabled={!p}
                onPress={() => p && onOpenProduct(pid)}
                accessibilityRole="button"
                style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: i < products.length - 1 ? 1 : 0, borderBottomColor: T.border }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: "#f3e8ff", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  {image ? <Image source={{ uri: image }} style={{ width: 40, height: 40 }} /> : <Ic n="water" size={18} color={T.purple} />}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: T.text1 }}>
                    {p?.name || "Producto no disponible"}
                  </Text>
                  <Text style={{ fontSize: 11.5, color: T.textMut }}>
                    {item.amount} × {formatPrice(unit)}
                  </Text>
                  {p && (
                    <Text style={{ fontSize: 11, marginTop: 2, color: review ? T.green : T.purple, fontWeight: "700" }}>
                      {review ? `Calificado ${"★".repeat(review.rating)}` : "Calificar producto →"}
                    </Text>
                  )}
                </View>
                <Text style={{ fontSize: 13, fontWeight: "700", color: T.text1 }}>{formatPrice(item.subtotal)}</Text>
              </TouchableOpacity>
            );
          })}
        </Card>

        <Card title="Resumen">
          <Row label="Subtotal" value={formatPrice(subtotal)} />
          {discount > 0 && <Row label="Descuento" value={`−${formatPrice(discount)}`} />}
          <Row label="Envío a domicilio" value={hasShipping ? formatPrice(order.shipping_cost) : "No registrado"} />
          <View style={{ borderTopWidth: 1, borderTopColor: T.border, paddingTop: 9, marginTop: 2 }}>
            <Row label="Total" value={formatPrice(saleTotal(order))} strong />
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AppBar title={order ? `Pedido ${orderNumber(order._id)}` : "Pedido"} onBack={onBack} />
      <ScrollView
        style={{ flex: 1, backgroundColor: T.bg }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[T.purple]} tintColor={T.purple} />}
      >
        {body}
      </ScrollView>
    </View>
  );
}
