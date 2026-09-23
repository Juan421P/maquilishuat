import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { T } from "../utils/theme";
import { LinearGradient } from "expo-linear-gradient";
import Ic from "./Ic";
import ProductReviews from "./ProductReviews";
import { formatPrice } from "../utils/format";

// Tarjeta del catálogo.
// - Tocar la tarjeta abre el detalle del producto.
// - El botón "+" agrega 1 unidad; si ya está en el carrito muestra cuántas
//   hay (antes mostraba un ✓ y al tocarlo sumaba otra sin avisar).
// - Al llegar al stock disponible el botón se deshabilita ("Máx.").
export default function ProductCard({ product, qtyInCart = 0, onAdd, onOpen }) {
  const [expanded, setExpanded] = useState(false);
  const imageUrl = product.images?.[0]?.image;
  const [imageFailed, setImageFailed] = useState(false);
  const stock = Number(product.stock) || 0;
  const atMax = qtyInCart >= stock;
  const lowStock = stock > 0 && stock <= 5;

  return (
    <View style={{ backgroundColor: T.surface, borderRadius: 12, borderWidth: 1, borderColor: T.border, padding: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <TouchableOpacity
          onPress={onOpen}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Ver detalle de ${product.name}`}
          style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}
        >
          <View
            style={{
              width: 52,
              height: 52,
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
                style={{ width: 52, height: 52 }}
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
            <Text numberOfLines={1} style={{ fontSize: 11, color: T.textMut, marginTop: 1 }}>
              {[product.product_type, product.size].filter(Boolean).join(" · ")}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 2 }}>
              <Text style={{ fontSize: 16, fontWeight: "800", color: T.purpleDark }}>{formatPrice(product.price)}</Text>
              <Text style={{ fontSize: 11, color: lowStock ? T.amber : T.textMut, fontWeight: lowStock ? "700" : "400" }}>
                {lowStock ? `¡Quedan ${stock}!` : `${stock} disp.`}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onAdd}
          disabled={atMax}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={atMax ? `Ya tienes el máximo disponible de ${product.name}` : `Agregar ${product.name} al carrito`}
          accessibilityState={{ disabled: atMax }}
          style={{ alignItems: "center" }}
        >
          {atMax ? (
            <View style={{ width: 40, height: 36, borderRadius: 10, backgroundColor: T.bg, borderWidth: 1, borderColor: T.border, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 10.5, fontWeight: "800", color: T.textMut }}>Máx.</Text>
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
          {qtyInCart > 0 && (
            <Text style={{ fontSize: 10.5, fontWeight: "700", color: T.purple, marginTop: 3 }}>{qtyInCart} en carrito</Text>
          )}
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={() => setExpanded((e) => !e)}
        accessibilityRole="button"
        style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8, alignSelf: "flex-start", paddingVertical: 2 }}
      >
        <Text style={{ color: T.textMut, fontSize: 11.5 }}>Reseñas {expanded ? "▴" : "▾"}</Text>
      </TouchableOpacity>
      {expanded && <ProductReviews productId={product._id} />}
    </View>
  );
}
