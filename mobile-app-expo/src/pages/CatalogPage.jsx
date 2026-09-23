import { RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { T } from "../utils/theme";
import { useCatalogFilters } from "../hooks/useCatalogFilters";
import AppBar from "../layout/AppBar";
import ProductCard from "../components/ProductCard";
import StateView from "../components/StateView";
import Ic from "../components/Ic";

export default function CatalogPage({ shop, onGoCart }) {
  const { available, loading, error, offline, refreshing, refresh, reload, loaded, qtyOf, onAdd, openProduct, cartCount } = shop;
  const { query, setQuery, category, setCategory, categories, filtered } = useCatalogFilters(available);

  let content;
  if (loading && !loaded) {
    content = <StateView loading message="Cargando productos..." />;
  } else if (error && !loaded) {
    content = <StateView error={error} offline={offline} onRetry={reload} />;
  } else if (available.length === 0) {
    content = <StateView title="No hay productos disponibles" message="Desliza hacia abajo para actualizar." />;
  } else if (filtered.length === 0) {
    content = (
      <StateView
        icon="search"
        title="Sin resultados"
        message={query ? `No encontramos productos para "${query}".` : "No hay productos en esta categoría."}
        action={() => {
          setQuery("");
          setCategory("Todas");
        }}
        actionLabel="Limpiar filtros"
      />
    );
  } else {
    content = (
      <View style={{ gap: 8 }}>
        {filtered.map((p) => (
          <ProductCard key={p._id} product={p} qtyInCart={qtyOf(p._id)} onAdd={() => onAdd(p)} onOpen={() => openProduct(p)} />
        ))}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <AppBar title="Catálogo" cartCount={cartCount} onCartPress={onGoCart} />
      <View style={{ backgroundColor: T.surface, paddingHorizontal: 14, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: T.border }}>
        <View style={{ position: "relative", marginBottom: 10, justifyContent: "center" }}>
          <View style={{ position: "absolute", left: 10, zIndex: 1 }}>
            <Ic n="search" size={15} color={T.textMut} />
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar productos..."
            placeholderTextColor={T.textMut}
            accessibilityLabel="Buscar productos"
            returnKeyType="search"
            style={{
              paddingVertical: 9,
              paddingLeft: 34,
              paddingRight: 9,
              borderWidth: 1.5,
              borderColor: T.border,
              borderRadius: 9,
              fontSize: 14,
              backgroundColor: T.bg,
              color: T.text1,
            }}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingBottom: 10 }}>
          {categories.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setCategory(c)}
              accessibilityRole="button"
              accessibilityState={{ selected: category === c }}
              style={{
                paddingVertical: 5,
                paddingHorizontal: 13,
                borderRadius: 99,
                backgroundColor: category === c ? T.purple : "#f3e8ff",
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "700", color: category === c ? "#fff" : T.purple }}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor: T.bg }}
        contentContainerStyle={{ padding: 14 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[T.purple]} tintColor={T.purple} />}
      >
        {error && loaded ? (
          <TouchableOpacity onPress={refresh} style={{ backgroundColor: "#fff1f2", borderRadius: 8, padding: 10, marginBottom: 10 }}>
            <Text style={{ fontSize: 12.5, color: T.red }}>No se pudo actualizar: {error} Toca para reintentar.</Text>
          </TouchableOpacity>
        ) : null}
        {content}
        <View style={{ height: 14 }} />
      </ScrollView>
    </View>
  );
}
