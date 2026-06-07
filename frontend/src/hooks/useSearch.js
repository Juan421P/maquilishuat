import { useState, useCallback } from "react";

// hook sencillo de búsqueda — lo uso en varias páginas para no repetir el mismo useState
export function useSearch(items, keys) {
  const [query, setQuery] = useState("");

  // filtramos por cualquiera de las keys que recibimos
  const filtered = query.trim() === ""
    ? items
    : items.filter(item =>
        keys.some(key =>
          String(item[key] ?? "").toLowerCase().includes(query.toLowerCase())
        )
      );

  const clear = useCallback(() => setQuery(""), []);

  return { query, setQuery, filtered, clear };
}
