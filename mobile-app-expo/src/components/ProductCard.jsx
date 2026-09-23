import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { T } from "../utils/theme";
import { LinearGradient } from "expo-linear-gradient";
import Ic from "./Ic";
import ProductReviews from "./ProductReviews";
import { formatPrice } from "../utils/format";

export default function ProductCard({ product, inCart, onAdd }) {
  const [expanded, setExpanded] = useState(false);
  const imageUrl = product.images?.[0]?.image;
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <View style={{ backgroundColor: T.surface, borderRadius: 12, borderWidth: 1, borderColor: T.border, padding: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            backgroundColor: "#f3e8ff",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {imageUrl && !imageFailed ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: 48, height: 48 }}
              resizeMode="cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <Ic n="water" size={24} color={T.purple} />
          )}
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "700", color: T.text1 }}>
            {product.name}
          </Text>
          {product.product_type ? (
            <Text style={{ fontSize: 11, color: T.textMut, marginTop: 1 }}>{product.product_type}</Text>
          ) : null}
          <Text style={{ fontSize: 16, fontWeight: "800", color: T.purpleDark, marginTop: 2 }}>
            {formatPrice(product.price)}
          </Text>
        </View>
        <TouchableOpacity onPress={onAdd} activeOpacity={0.85}>
          {inCart ? (
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: T.purple,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ic n="check" size={16} color="#fff" />
            </View>
          ) : (
            <LinearGradient
              colors={[T.pink, T.purple, T.cyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" }}
            >
              <Ic n="plus" size={16} color="#fff" />
            </LinearGradient>
          )}
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={() => setExpanded((e) => !e)}
        style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 }}
      >
        <Text style={{ color: T.textMut, fontSize: 11 }}>Reseñas {expanded ? "▴" : "▾"}</Text>
      </TouchableOpacity>
      {expanded && <ProductReviews productId={product._id} />}
    </View>
  );
}
