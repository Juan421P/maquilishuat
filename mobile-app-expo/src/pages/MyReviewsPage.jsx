import { useState } from "react";
import { Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { T } from "../utils/theme";
import AppBar from "../layout/AppBar";
import Ic from "../components/Ic";
import StateView from "../components/StateView";
import { useAccountData } from "../context/AccountDataContext";
import { formatDate } from "../utils/format";

export default function MyReviewsPage({ onBack, onOpenProduct, onGoCatalog }) {
  const account = useAccountData();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await account.refreshReviews();
    setRefreshing(false);
  };

  let body;
  if (account.reviewsLoading && !account.reviewsLoaded) {
    body = <StateView loading message="Cargando reseñas..." />;
  } else if (account.reviewsError && !account.reviewsLoaded) {
    body = <StateView error={account.reviewsError} onRetry={account.reloadReviews} />;
  } else if (account.myReviews.length === 0) {
    body = (
      <StateView
        icon="star"
        title="Todavía no has publicado reseñas"
        message="Después de comprar un producto podrás calificarlo desde su detalle o desde tus pedidos."
        action={onGoCatalog}
        actionLabel="Ver catálogo"
      />
    );
  } else {
    body = (
      <View style={{ gap: 8 }}>
        {account.myReviews.map((r) => {
          const product = r.product_id && typeof r.product_id === "object" ? r.product_id : null;
          const image = product?.images?.[0]?.image;
          return (
            <TouchableOpacity
              key={r._id}
              disabled={!product}
              onPress={() => product && onOpenProduct(product._id)}
              accessibilityRole="button"
              style={{ backgroundColor: T.surface, borderRadius: 12, borderWidth: 1, borderColor: T.border, padding: 13, flexDirection: "row", gap: 12 }}
            >
              <View style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: "#f3e8ff", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {image ? <Image source={{ uri: image }} style={{ width: 48, height: 48 }} /> : <Ic n="water" size={22} color={T.purple} />}
              </View>
              <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                <Text numberOfLines={1} style={{ fontSize: 13.5, fontWeight: "800", color: T.text1 }}>
                  {product?.name || "Producto no disponible"}
                </Text>
                <View style={{ flexDirection: "row", gap: 2 }} accessibilityLabel={`${r.rating} de 5 estrellas`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Ic key={n} n="star" size={13} color={n <= r.rating ? T.purple : T.border} />
                  ))}
                </View>
                {r.comment ? <Text style={{ fontSize: 12.5, color: T.text2, lineHeight: 18 }}>{r.comment}</Text> : null}
                <Text style={{ fontSize: 11, color: T.textMut }}>{formatDate(r.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AppBar title="Mis reseñas" onBack={onBack} />
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
