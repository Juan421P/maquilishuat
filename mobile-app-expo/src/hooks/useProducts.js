import { useCallback, useEffect, useRef, useState } from "react";
import { productsAPI } from "../services/api";
import { getErrorMessage, isNetworkError } from "../utils/errors";

// Catálogo de productos desde la API, con estados de carga, error y
// recarga (pull-to-refresh, botón "Reintentar" y después de cada compra).
//
// `products`      → todos los productos (incluye agotados, los usa el carrito
//                    para detectar cambios de stock y precio)
// `available`     → solo los que tienen stock (lo que se muestra al cliente)
export function useProducts(enabled) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [offline, setOffline] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const requestRef = useRef(0);

  // Devuelve la lista nueva. El error siempre queda en `error`/`offline`
  // para la UI; con `throwOnError` además se relanza, para quien necesita
  // detenerse (p. ej. el checkout que revalida precio y stock).
  const load = useCallback(async ({ silent = false, throwOnError = false } = {}) => {
    const requestId = ++requestRef.current;
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const data = await productsAPI.getAll();
      const list = Array.isArray(data) ? data : [];
      if (requestId === requestRef.current) {
        setProducts(list);
        setLoaded(true);
        setOffline(false);
      }
      return list;
    } catch (e) {
      if (requestId === requestRef.current) {
        setError(getErrorMessage(e, "No se pudieron cargar los productos."));
        setOffline(isNetworkError(e));
      }
      if (throwOnError) throw e;
      return null;
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      requestRef.current++;
      setProducts([]);
      setLoaded(false);
      setError("");
      return;
    }
    load();
  }, [enabled, load]);

  const reload = useCallback(() => load(), [load]);
  const refresh = useCallback(() => load({ silent: true }), [load]);

  return {
    products,
    available: products.filter((p) => Number(p.stock) > 0),
    loading,
    refreshing,
    error,
    offline,
    loaded,
    load,
    reload,
    refresh,
  };
}
