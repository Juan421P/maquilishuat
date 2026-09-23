import { useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { T, GRAD_COLORS } from "../utils/theme";
import AppBar from "../layout/AppBar";
import Ic from "../components/Ic";
import Avatar from "../components/Avatar";
import StateView from "../components/StateView";
import { useAuth } from "../context/AuthContext";
import { useAccountData } from "../context/AccountDataContext";
import { useToast } from "../components/Toast";
import { getErrorMessage } from "../utils/errors";
import { confirmAction } from "../utils/confirm";
import {
  formatBirthdate,
  formatDate,
  formatPrice,
  orderNumber,
  PAYMENT_STATUS_COLOR,
  PAYMENT_STATUS_LABEL,
  saleTotal,
} from "../utils/format";

const MAX_ORDERS_PREVIEW = 5;


function MenuRow({ icon, label, sub, onPress, danger, last }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 13, borderBottomWidth: last ? 0 : 1, borderBottomColor: T.border }}
    >
      <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: danger ? "#fff1f2" : "#f3e8ff", alignItems: "center", justifyContent: "center" }}>
        <Ic n={icon} size={17} color={danger ? T.red : T.purple} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13.5, color: danger ? T.red : T.text1, fontWeight: "700" }}>{label}</Text>
        {sub ? <Text style={{ fontSize: 11.5, color: T.textMut }}>{sub}</Text> : null}
      </View>
      <Ic n="chevron" size={16} color={T.textMut} />
    </TouchableOpacity>
  );
}

export default function ProfilePage({ onLogout, onOpenInfo, onOpenOrder, onOpenAllOrders, onNavigate }) {
  const { user, refreshProfile } = useAuth();
  const account = useAccountData();
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshProfile(), account.refreshOrders(), account.refreshReviews()]);
    } catch (e) {
      toast?.error(getErrorMessage(e, "No se pudo actualizar tu perfil"));
    } finally {
      setRefreshing(false);
    }
  };

  const confirmLogout = async () => {
    const yes = await confirmAction({
      title: "Cerrar sesión",
      message: "¿Seguro que quieres cerrar sesión? Se vaciará tu carrito en este teléfono.",
      confirmText: "Cerrar sesión",
      destructive: true,
    });
    if (yes) onLogout();
  };

  const fullName = [user?.name, user?.lastname].filter(Boolean).join(" ") || user?.email?.split("@")[0];
  const orders = account.orders;

  return (
    <View style={{ flex: 1 }}>
      <AppBar title="Mi cuenta" />
      <ScrollView
        style={{ flex: 1, backgroundColor: T.bg }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[T.purple]} tintColor={T.purple} />}
      >
        <LinearGradient colors={GRAD_COLORS} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 24, paddingBottom: 32, alignItems: "center" }}>
          <View style={{ marginBottom: 10 }}>
            <Avatar uri={user?.picture} name={user?.name} lastname={user?.lastname} />
          </View>
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "800" }}>{fullName}</Text>
          <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 }}>{user?.email}</Text>
          <View style={{ backgroundColor: "rgba(255,255,255,0.2)", paddingVertical: 3, paddingHorizontal: 14, borderRadius: 99, marginTop: 10 }}>
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>Cliente</Text>
          </View>
        </LinearGradient>

        <View style={{ padding: 18 }}>
          <View style={{ backgroundColor: T.surface, borderRadius: 12, borderWidth: 1, borderColor: T.border, overflow: "hidden", marginBottom: 14 }}>
            {[
              { icon: "user", label: "Nombre", val: [user?.name, user?.lastname].filter(Boolean).join(" ") || "—" },
              { icon: "mail", label: "Correo", val: user?.email },
              { icon: "calendar", label: "Fecha de nacimiento", val: formatBirthdate(user?.birthdate) },
            ].map(({ icon, label, val }, i, arr) => (
              <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 13, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: T.border }}>
                <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: "#f3e8ff", alignItems: "center", justifyContent: "center" }}>
                  <Ic n={icon} size={17} color={T.purple} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: T.textMut, fontWeight: "600" }}>{label}</Text>
                  <Text style={{ fontSize: 13, color: T.text1, fontWeight: "600" }}>{val}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ backgroundColor: T.surface, borderRadius: 12, borderWidth: 1, borderColor: T.border, padding: 13, marginBottom: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <Text style={{ fontSize: 13.5, fontWeight: "800", color: T.text1 }}>Mis pedidos</Text>
              {orders.length > MAX_ORDERS_PREVIEW && (
                <TouchableOpacity onPress={onOpenAllOrders}>
                  <Text style={{ fontSize: 12.5, color: T.purple, fontWeight: "700" }}>Ver todos ({orders.length})</Text>
                </TouchableOpacity>
              )}
            </View>
            {account.ordersLoading && !account.ordersLoaded ? (
              <StateView loading compact message="Cargando pedidos..." />
            ) : account.ordersError && !account.ordersLoaded ? (
              <StateView error={account.ordersError} onRetry={account.reloadOrders} compact />
            ) : orders.length === 0 ? (
              <StateView compact icon="package" title="Todavía no tienes pedidos" message="Cuando compres, aquí verás el detalle y el estado de cada pedido." />
            ) : (
              <View>
                {orders.slice(0, MAX_ORDERS_PREVIEW).map((p, i, arr) => {
                  const color = PAYMENT_STATUS_COLOR[p.payment_status] || PAYMENT_STATUS_COLOR.pending;
                  const items = p.shopping_cart_id?.products?.reduce((a, x) => a + (x.amount || 0), 0) || 0;
                  return (
                    <TouchableOpacity
                      key={p._id}
                      onPress={() => onOpenOrder(p._id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Pedido ${orderNumber(p._id)}, ${formatPrice(saleTotal(p))}`}
                      style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: T.border, gap: 8 }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12.5, fontWeight: "700", color: T.text1 }}>Pedido {orderNumber(p._id)}</Text>
                        <Text style={{ fontSize: 11, color: T.textMut }}>
                          {formatDate(p.createdAt)} · {items} producto{items === 1 ? "" : "s"} · {formatPrice(saleTotal(p))}
                        </Text>
                      </View>
                      <View style={{ backgroundColor: color.bg, paddingVertical: 3, paddingHorizontal: 10, borderRadius: 99 }}>
                        <Text style={{ color: color.color, fontSize: 10.5, fontWeight: "700" }}>
                          {PAYMENT_STATUS_LABEL[p.payment_status] || p.payment_status || "—"}
                        </Text>
                      </View>
                      <Ic n="chevron" size={14} color={T.textMut} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            {account.ordersError && account.ordersLoaded ? (
              <Text style={{ fontSize: 11.5, color: T.red, marginTop: 6 }}>No se pudo actualizar: {account.ordersError}</Text>
            ) : null}
          </View>

          <View style={{ backgroundColor: T.surface, borderRadius: 12, borderWidth: 1, borderColor: T.border, overflow: "hidden", marginBottom: 14 }}>
            <MenuRow icon="edit" label="Editar perfil" sub="Nombre, apellido, fecha y foto" onPress={() => onNavigate("editProfile")} />
            <MenuRow icon="lock" label="Cambiar contraseña" onPress={() => onNavigate("changePassword")} />
            <MenuRow icon="star" label="Mis reseñas" sub={account.reviewsLoaded ? `${account.myReviews.length} publicada(s)` : undefined} onPress={() => onNavigate("myReviews")} />
            <MenuRow icon="drop" label="Maquilishuat" sub="Nosotros, contacto y términos" onPress={onOpenInfo} last />
          </View>

          <TouchableOpacity
            onPress={confirmLogout}
            accessibilityRole="button"
            style={{ paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: "#fecdd3", backgroundColor: "#fff1f2", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}
          >
            <Ic n="logout" size={18} color={T.red} />
            <Text style={{ color: T.red, fontSize: 15, fontWeight: "700" }}>Cerrar sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onNavigate("deleteAccount")} accessibilityRole="button" style={{ alignItems: "center", paddingVertical: 8 }}>
            <Text style={{ color: T.textMut, fontSize: 12.5, textDecorationLine: "underline" }}>Eliminar mi cuenta</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}
