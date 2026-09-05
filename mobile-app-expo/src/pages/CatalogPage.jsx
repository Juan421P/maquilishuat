import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { T } from "../utils/theme";
import AppBar from "../layout/AppBar";
import ProductCard from "../components/ProductCard";
import Ic from "../components/Ic";

export default function CatalogPage({ products, cart, onAdd, onGoCart }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Todas");
  const cartCount = cart.reduce((a, x) => a + x.qty, 0);

  const categories = ["Todas", ...new Set(products.map((p) => p.product_type).filter(Boolean))];
  const filtered = products.filter((p) => {
    const matchCat = cat === "Todas" || p.product_type === cat;
    const matchQ = (p.name || "").toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

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
              onPress={() => setCat(c)}
              style={{
                paddingVertical: 4,
                paddingHorizontal: 13,
                borderRadius: 99,
                backgroundColor: cat === c ? T.purple : "#f3e8ff",
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "700", color: cat === c ? "#fff" : T.purple }}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <ScrollView style={{ flex: 1, backgroundColor: T.bg }} contentContainerStyle={{ padding: 14 }}>
        <View style={{ gap: 8 }}>
          {filtered.map((p) => (
            <ProductCard key={p._id} product={p} inCart={!!cart.find((x) => x.id === p._id)} onAdd={() => onAdd(p)} />
          ))}
          {filtered.length === 0 && (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Ic n="search" size={36} color={T.border} />
              <Text style={{ marginTop: 10, fontSize: 14, color: T.textMut }}>Sin resultados</Text>
            </View>
          )}
        </View>
        <View style={{ height: 14 }} />
      </ScrollView>
    </View>
  );
}
