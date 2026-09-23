import { useEffect, useState } from "react";
import { Image, RefreshControl, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { T } from "../utils/theme";
import { formatPrice } from "../utils/format";
import { productsAPI } from "../services/api";
import { getErrorMessage, isNetworkError } from "../utils/errors";
import AppBar from "../layout/AppBar";
import Btn from "../components/Btn";
import Ic from "../components/Ic";
import QtyStepper from "../components/QtyStepper";
import StateView from "../components/StateView";
import ProductReviews from "../components/ProductReviews";

function Gallery({ images }) {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState({});
  const size = Math.min(width, 520);
  const list = images.filter((img) => img?.image);

  if (list.length === 0) {
    return (
      <View style={{ height: 220, backgroundColor: "#f3e8ff", alignItems: "center", justifyContent: "center" }}>
        <Ic n="water" size={64} color={T.purple} />
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: "#f3e8ff" }}>
      <ScrollView
        horizontal
        pagingEnabled
        style={{ width: size, alignSelf: "center" }}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / size))}
      >
        {list.map((img, i) =>
          failed[i] ? (
            <View key={i} style={{ width: size, height: size * 0.75, alignItems: "center", justifyContent: "center" }}>
              <Ic n="water" size={64} color={T.purple} />
            </View>
          ) : (
            <Image
              key={i}
              source={{ uri: img.image }}
              style={{ width: size, height: size * 0.75 }}
              resizeMode="cover"
              accessibilityLabel={`Imagen ${i + 1} de ${list.length}`}
              onError={() => setFailed((f) => ({ ...f, [i]: true }))}
            />
          )
        )}
      </ScrollView>
      {list.length > 1 && (
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, paddingVertical: 8, position: "absolute", bottom: 4, left: 0, right: 0 }}>
          {list.map((_, i) => (
            <View key={i} style={{ width: i === index ? 16 : 7, height: 7, borderRadius: 4, backgroundColor: i === index ? T.purple : "rgba(255,255,255,0.8)" }} />
          ))}
        </View>
      )}
    </View>
  );
}

export default function ProductDetailPage({ productId, shop, onBack, onGoCart }) {
  const cached = shop.products.find((p) => p._id === productId) || null;
  const [product, setProduct] = useState(cached);
  const [loading, setLoading] = useState(!cached);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [offline, setOffline] = useState(false);
  const [qty, setQty] = useState(1);

  // Siempre se pide el producto al backend para tener stock y precio al día.
  const load = async (silent = false) => {
    if (silent) setRefreshing(true);
    else if (!product) setLoading(true);
    setError("");
    try {
      setProduct(await productsAPI.getById(productId));
      setOffline(false);
    } catch (e) {
      setError(getErrorMessage(e, "No se pudo cargar el producto"));
      setOffline(isNetworkError(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const stock = Number(product?.stock) || 0;
  const inCart = shop.qtyOf(productId);
  const maxAddable = Math.max(stock - inCart, 0);

  useEffect(() => {
    setQty((q) => Math.min(Math.max(q, 1), Math.max(maxAddable, 1)));
  }, [maxAddable]);

  let body;
  if (loading && !product) {
    body = <StateView loading message="Cargando producto..." />;
  } else if (!product) {
    body = <StateView error={error || "Producto no encontrado"} offline={offline} onRetry={() => load()} />;
  } else {
    const details = [
      ["Tipo", product.product_type],
      ["Sabor", product.flavor],
      ["Tamaño", product.size],
    ].filter(([, v]) => v);

    body = (
      <>
        <Gallery images={product.images || []} />
        <View style={{ padding: 18, gap: 14 }}>
          {error ? (
            <Text style={{ fontSize: 12.5, color: T.red }}>No se pudo actualizar: {error}</Text>
          ) : null}
          <View>
            <Text style={{ fontSize: 20, fontWeight: "800", color: T.text1 }}>{product.name}</Text>
            <Text style={{ fontSize: 24, fontWeight: "800", color: T.purpleDark, marginTop: 4 }}>{formatPrice(product.price)}</Text>
            <Text style={{ fontSize: 13, marginTop: 4, fontWeight: "700", color: stock === 0 ? T.red : stock <= 5 ? T.amber : T.green }}>
              {stock === 0 ? "Agotado" : stock <= 5 ? `¡Solo quedan ${stock}!` : `${stock} disponibles`}
            </Text>
          </View>

          {details.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {details.map(([label, value]) => (
                <View key={label} style={{ backgroundColor: "#f3e8ff", borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 }}>
                  <Text style={{ fontSize: 10.5, color: T.purple, fontWeight: "700", textTransform: "uppercase" }}>{label}</Text>
                  <Text style={{ fontSize: 13, color: T.purpleDark, fontWeight: "700" }}>{value}</Text>
                </View>
              ))}
            </View>
          )}

          {product.description ? (
            <View>
              <Text style={{ fontSize: 14, fontWeight: "800", color: T.text1, marginBottom: 4 }}>Descripción</Text>
              <Text style={{ fontSize: 13.5, color: T.text2, lineHeight: 20 }}>{product.description}</Text>
            </View>
          ) : null}

          <View style={{ backgroundColor: T.surface, borderWidth: 1, borderColor: T.border, borderRadius: 12, padding: 14, gap: 12 }}>
            {stock === 0 ? (
              <Text style={{ fontSize: 13.5, color: T.text3 }}>Este producto está agotado por ahora.</Text>
            ) : maxAddable === 0 ? (
              <>
                <Text style={{ fontSize: 13.5, color: T.text2 }}>
                  Ya tienes en tu carrito todas las unidades disponibles ({inCart}).
                </Text>
                <Btn variant="outline" onPress={onGoCart}>Ir al carrito</Btn>
              </>
            ) : (
              <>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: T.text1 }}>Cantidad</Text>
                    <Text style={{ fontSize: 11.5, color: T.textMut }}>
                      {inCart > 0 ? `${inCart} ya en tu carrito · puedes agregar ${maxAddable}` : `Máximo ${maxAddable}`}
                    </Text>
                  </View>
                  <QtyStepper
                    value={qty}
                    min={1}
                    max={maxAddable}
                    size={34}
                    onDecrease={() => setQty((q) => Math.max(q - 1, 1))}
                    onIncrease={() => setQty((q) => Math.min(q + 1, maxAddable))}
                  />
                </View>
                <Btn
                  onPress={() => {
                    shop.onAdd(product, qty);
                    setQty(1);
                  }}
                >
                  {`Agregar al carrito · ${formatPrice((Number(product.price) || 0) * qty)}`}
                </Btn>
              </>
            )}
          </View>

          <View>
            <Text style={{ fontSize: 14, fontWeight: "800", color: T.text1 }}>Reseñas</Text>
            <ProductReviews productId={product._id} showAll />
          </View>
        </View>
      </>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AppBar title={product?.name || "Producto"} onBack={onBack} cartCount={shop.cartCount} onCartPress={onGoCart} />
      <ScrollView
        style={{ flex: 1, backgroundColor: T.bg }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[T.purple]} tintColor={T.purple} />}
      >
        {body}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}
