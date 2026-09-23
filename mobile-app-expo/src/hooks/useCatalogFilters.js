import { useMemo, useState } from "react";

// Maneja el texto de búsqueda y la categoría seleccionada del catálogo, y
// deriva la lista de categorías disponibles y los productos filtrados.
export function useCatalogFilters(products) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");

  const categories = useMemo(
    () => ["Todas", ...new Set(products.map((p) => p.product_type).filter(Boolean))],
    [products]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return products.filter((p) => {
      const matchCategory = category === "Todas" || p.product_type === category;
      const matchQuery = (p.name || "").toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [products, query, category]);

  return { query, setQuery, category, setCategory, categories, filtered };
}
