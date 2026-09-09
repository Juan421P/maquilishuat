import { useEffect, useState } from "react";
import { productsAPI } from "../services/api";

// Trae el catálogo de productos desde la API cuando hay un usuario logueado
// y descarta los que no tienen stock. Antes vivía como un useEffect suelto
// dentro de App.js.
export function useProducts(enabled) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    productsAPI
      .getAll()
      .then((data) => setProducts(data.filter((p) => p.stock > 0)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [enabled]);

  return { products, loading };
}
