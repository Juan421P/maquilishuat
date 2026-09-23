import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Rect } from "react-native-svg";
import { T, GRAD_COLORS } from "../utils/theme";
import AppBar from "../layout/AppBar";
import ProductCard from "../components/ProductCard";
import StateView from "../components/StateView";

// `shop` lo arma App.js: catálogo, estados de carga y acciones del carrito.
export default function HomePage({ user, shop, onGoCart, onGoCatalog }) {
  const { available, loading, error, offline, refreshing, refresh, reload, loaded, qtyOf, onAdd, openProduct, cartCount } = shop;
  const firstName = (user?.name || user?.email?.split("@")[0] || "").split(" ")[0];

  return (
    <View style={{ flex: 1 }}>
      <AppBar cartCount={cartCount} onCartPress={onGoCart} />
      <ScrollView
        style={{ flex: 1, backgroundColor: T.bg }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[T.purple]} tintColor={T.purple} />}
      >
        <LinearGradient colors={GRAD_COLORS} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingHorizontal: 18, paddingBottom: 22 }}>
          <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" }}>
            Hola, {firstName} 👋
          </Text>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800", marginTop: 2 }}>¿Qué necesitas hoy?</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {["Entrega a domicilio", "100% purificada", "Sin químicos"].map((t) => (
              <View key={t} style={{ backgroundColor: "rgba(255,255,255,0.18)", paddingVertical: 3, paddingHorizontal: 10, borderRadius: 99 }}>
                <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>{t}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        <View style={{ padding: 18, paddingTop: 20 }}>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
            {[
              { icon: "grid", label: "Ver catálogo", action: onGoCatalog, bg: "#f3e8ff", ic: T.purple },
              { icon: "bag", label: "Mi carrito", action: onGoCart, bg: "#fce7f3", ic: T.pink, badge: cartCount },
            ].map(({ icon, label, action, bg, ic, badge }) => (
              <TouchableOpacity
                key={label}
                onPress={action}
                accessibilityRole="button"
                style={{ flex: 1, backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: 12, paddingVertical: 14, alignItems: "center", gap: 8 }}
              >
                <View>
                  <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={ic} strokeWidth={1.8}>
                      {icon === "grid" ? (
                        <>
                          <Rect x="3" y="3" width="8" height="8" />
                          <Rect x="13" y="3" width="8" height="8" />
                          <Rect x="3" y="13" width="8" height="8" />
                          <Rect x="13" y="13" width="8" height="8" />
                        </>
                      ) : (
                        <>
                          <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                          <Path d="M3 6h18" />
                          <Path d="M16 10a4 4 0 01-8 0" />
                        </>
                      )}
                    </Svg>
                  </View>
                  {badge > 0 && (
                    <View style={{ position: "absolute", top: -4, right: -6, minWidth: 18, height: 18, paddingHorizontal: 3, borderRadius: 9, backgroundColor: T.pink, alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ color: "#fff", fontSize: 9, fontWeight: "800" }}>{badge > 9 ? "9+" : badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 12, fontWeight: "700", color: T.text1 }}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ fontSize: 14, fontWeight: "800", color: T.text1, marginBottom: 12 }}>Productos destacados</Text>
          {loading && !loaded ? (
            <StateView loading message="Cargando productos..." compact />
          ) : error && !loaded ? (
            <StateView error={error} offline={offline} onRetry={reload} compact />
          ) : available.length === 0 ? (
            <StateView title="No hay productos disponibles" message="Vuelve más tarde o desliza hacia abajo para actualizar." compact />
          ) : (
            <View style={{ gap: 8 }}>
              {available.slice(0, 3).map((p) => (
                <ProductCard key={p._id} product={p} qtyInCart={qtyOf(p._id)} onAdd={() => onAdd(p)} onOpen={() => openProduct(p)} />
              ))}
            </View>
          )}
          {available.length > 3 && (
            <TouchableOpacity
              onPress={onGoCatalog}
              accessibilityRole="button"
              style={{ marginTop: 12, paddingVertical: 11, borderRadius: 10, backgroundColor: "#f3e8ff", alignItems: "center" }}
            >
              <Text style={{ color: T.purple, fontSize: 14, fontWeight: "700" }}>Ver todo el catálogo →</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}
