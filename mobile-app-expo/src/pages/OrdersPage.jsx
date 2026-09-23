import { useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { T } from "../utils/theme";
import AppBar from "../layout/AppBar";
import Ic from "../components/Ic";
import StateView from "../components/StateView";
import { useAccountData } from "../context/AccountDataContext";
import { formatDate, formatPrice, orderNumber, PAYMENT_STATUS_COLOR, PAYMENT_STATUS_LABEL, saleTotal } from "../utils/format";

// Lista completa de pedidos del cliente (el perfil muestra solo los últimos).
export default function OrdersPage({ onBack, onOpenOrder, onGoCatalog }) {
  const account = useAccountData();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await account.refreshOrders();
    setRefreshing(false);
  };

  let body;
  if (account.ordersLoading && !account.ordersLoaded) {
    body = <StateView loading message="Cargando pedidos..." />;
  } else if (account.ordersError && !account.ordersLoaded) {
    body = <StateView error={account.ordersError} onRetry={account.reloadOrders} />;
  } else if (account.orders.length === 0) {
    body = <StateView title="Todavía no tienes pedidos" message="Explora el catálogo y haz tu primer pedido." action={onGoCatalog} actionLabel="Ver catálogo" />;
  } else {
    body = (
      <View style={{ gap: 8 }}>
        {account.orders.map((p) => {
          const color = PAYMENT_STATUS_COLOR[p.payment_status] || PAYMENT_STATUS_COLOR.pending;
          const products = p.shopping_cart_id?.products || [];
          const names = products.map((x) => `${x.product_id?.name || "Producto"} ×${x.amount}`).join(", ");
          return (
            <TouchableOpacity
              key={p._id}
              onPress={() => onOpenOrder(p._id)}
              accessibilityRole="button"
              style={{ backgroundColor: T.surface, borderRadius: 12, borderWidth: 1, borderColor: T.border, padding: 13, gap: 6 }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 13.5, fontWeight: "800", color: T.text1 }}>Pedido {orderNumber(p._id)}</Text>
                <View style={{ backgroundColor: color.bg, paddingVertical: 3, paddingHorizontal: 10, borderRadius: 99 }}>
                  <Text style={{ color: color.color, fontSize: 10.5, fontWeight: "700" }}>{PAYMENT_STATUS_LABEL[p.payment_status] || p.payment_status || "—"}</Text>
                </View>
              </View>
              <Text numberOfLines={2} style={{ fontSize: 12, color: T.text3 }}>{names || "Sin productos"}</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 11.5, color: T.textMut }}>{formatDate(p.createdAt)} · {p.payment_method || "—"}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: "800", color: T.purpleDark }}>{formatPrice(saleTotal(p))}</Text>
                  <Ic n="chevron" size={14} color={T.textMut} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AppBar title="Mis pedidos" onBack={onBack} />
      <ScrollView
        style={{ flex: 1, backgroundColor: T.bg }}
        contentContainerStyle={{ padding: 14 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[T.purple]} tintColor={T.purple} />}
      >
        {body}
      </ScrollView>
    </View>
  );
}
