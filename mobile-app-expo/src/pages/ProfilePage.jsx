import { useState, useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { T, GRAD_COLORS } from "../utils/theme";
import AppBar from "../layout/AppBar";
import Ic from "../components/Ic";
import { salesAPI } from "../services/api";
import { formatPrice } from "../utils/format";

const ESTADOS_PAGO_LABEL = { pending: "Pendiente", paid: "Pagado", partial: "Parcial" };
const PAGO_COLOR = {
  paid: { bg: "#dcfce7", color: "#16a34a" },
  partial: { bg: "#fef9c3", color: "#a16207" },
  pending: { bg: "#fee2e2", color: "#dc2626" },
};

export default function ProfilePage({ user, onLogout, onOpenInfo }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    salesAPI.getMine().then(setPedidos).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <AppBar title="Mi cuenta" />
      <ScrollView style={{ flex: 1, backgroundColor: T.bg }}>
        <LinearGradient colors={GRAD_COLORS} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 24, paddingBottom: 32, alignItems: "center" }}>
          <View style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
            <Ic n="user" size={32} color="#fff" />
          </View>
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "800" }}>{user.email?.split("@")[0]}</Text>
          <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2 }}>{user.email}</Text>
          <View style={{ backgroundColor: "rgba(255,255,255,0.2)", paddingVertical: 3, paddingHorizontal: 14, borderRadius: 99, marginTop: 10 }}>
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>Cliente activo</Text>
          </View>
        </LinearGradient>

        <View style={{ padding: 18 }}>
          <View style={{ backgroundColor: T.surface, borderRadius: 12, borderWidth: 1, borderColor: T.border, overflow: "hidden", marginBottom: 14 }}>
            {[
              { icon: "mail", label: "Correo", val: user.email },
              { icon: "user", label: "Tipo de cuenta", val: "Cliente" },
            ].map(({ icon, label, val }, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 13, borderBottomWidth: i === 0 ? 1 : 0, borderBottomColor: T.border }}>
                <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: "#f3e8ff", alignItems: "center", justifyContent: "center" }}>
                  <Ic n={icon} size={17} color={T.purple} />
                </View>
                <View>
                  <Text style={{ fontSize: 11, color: T.textMut, fontWeight: "600" }}>{label}</Text>
                  <Text style={{ fontSize: 13, color: T.text1, fontWeight: "600" }}>{val}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ backgroundColor: T.surface, borderRadius: 12, borderWidth: 1, borderColor: T.border, padding: 13, marginBottom: 14 }}>
            <Text style={{ fontSize: 13, fontWeight: "800", color: T.text1, marginBottom: 10 }}>Mis pedidos</Text>
            {loading && <Text style={{ fontSize: 12, color: T.textMut }}>Cargando...</Text>}
            {!loading && pedidos.length === 0 && (
              <Text style={{ fontSize: 12, color: T.textMut }}>Todavía no tienes pedidos.</Text>
            )}
            {!loading && pedidos.length > 0 && (
              <View style={{ gap: 8 }}>
                {pedidos.map((p) => {
                  const color = PAGO_COLOR[p.payment_status] || PAGO_COLOR.pending;
                  const total = p.shopping_cart_id?.total_with_discount ?? p.shopping_cart_id?.total ?? 0;
                  return (
                    <View key={p._id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: T.border }}>
                      <View>
                        <Text style={{ fontSize: 12.5, fontWeight: "700", color: T.text1 }}>#{p._id.slice(-6).toUpperCase()}</Text>
                        <Text style={{ fontSize: 11, color: T.textMut }}>{formatPrice(total)}</Text>
                      </View>
                      <View style={{ backgroundColor: color.bg, paddingVertical: 3, paddingHorizontal: 10, borderRadius: 99 }}>
                        <Text style={{ color: color.color, fontSize: 10.5, fontWeight: "700" }}>
                          {ESTADOS_PAGO_LABEL[p.payment_status] || p.payment_status || "—"}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={onOpenInfo}
            style={{ backgroundColor: "#fdf4ff", borderRadius: 12, borderWidth: 1, borderColor: "#f5d0fe", padding: 14, marginBottom: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
          >
            <View style={{ flexDirection: "row", gap: 10, flex: 1 }}>
              <Ic n="drop" size={18} color={T.purple} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: T.purpleDark, marginBottom: 2 }}>Maquilishuat S.A. de C.V.</Text>
                <Text style={{ fontSize: 12, color: T.purpleMid, lineHeight: 18 }}>
                  Agua purificada con entrega a domicilio en El Salvador. Toca para ver Nosotros, Contacto y Términos.
                </Text>
              </View>
            </View>
            <Ic n="arrow" size={16} color={T.purple} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onLogout}
            style={{ paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: "#fecdd3", backgroundColor: "#fff1f2", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <Ic n="logout" size={18} color={T.red} />
            <Text style={{ color: T.red, fontSize: 15, fontWeight: "700" }}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}
