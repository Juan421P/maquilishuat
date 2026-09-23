import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { reviewsAPI, salesAPI } from "../services/api";
import { getErrorMessage } from "../utils/errors";
import { useAuth } from "./AuthContext";

// ─────────────────────────────────────────────────────────────────────────
// Datos de la cuenta que varias pantallas necesitan a la vez: pedidos y
// reseñas del cliente. Se cargan una sola vez por sesión (y al refrescar),
// en vez de que cada tarjeta de producto pida /sales/mine y /reviews/mine
// por su cuenta (el backend limita a 100 requests cada 15 min por IP).
//
// También resuelve la regla del backend para reseñar: solo se puede
// calificar un producto que aparezca en alguna venta del cliente y que
// todavía no haya calificado.
// ─────────────────────────────────────────────────────────────────────────

const AccountDataContext = createContext(null);

const useResource = (fetcher, enabled) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const requestRef = useRef(0);

  const load = useCallback(async ({ silent = false } = {}) => {
    const id = ++requestRef.current;
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const result = await fetcher();
      if (id === requestRef.current) {
        setData(Array.isArray(result) ? result : []);
        setLoaded(true);
      }
    } catch (e) {
      if (id === requestRef.current) setError(getErrorMessage(e));
    } finally {
      if (id === requestRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [fetcher]);

  useEffect(() => {
    requestRef.current++;
    setData([]);
    setLoaded(false);
    setError("");
    if (enabled) load();
  }, [enabled, load]);

  return { data, loading, refreshing, error, loaded, load };
};

export function AccountDataProvider({ children }) {
  const { user } = useAuth();
  const enabled = !!user?.id;
  // La clave incluye el id: si cambia la cuenta, se recarga todo.
  const ordersFetcher = useCallback(() => salesAPI.getMine(), [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const reviewsFetcher = useCallback(() => reviewsAPI.getMine(), [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const orders = useResource(ordersFetcher, enabled);
  const reviews = useResource(reviewsFetcher, enabled);

  const purchasedIds = useMemo(() => {
    const ids = new Set();
    for (const sale of orders.data) {
      for (const item of sale.shopping_cart_id?.products || []) {
        const id = item.product_id?._id || item.product_id;
        if (id) ids.add(String(id));
      }
    }
    return ids;
  }, [orders.data]);

  const reviewsByProduct = useMemo(() => {
    const map = new Map();
    for (const r of reviews.data) {
      const id = r.product_id?._id || r.product_id;
      if (id) map.set(String(id), r);
    }
    return map;
  }, [reviews.data]);

  // Último domicilio usado, para no tener que escribirlo en cada compra.
  const lastAddress = orders.data[0]?.delivery_address || "";

  const value = {
    orders: orders.data,
    ordersLoading: orders.loading,
    ordersRefreshing: orders.refreshing,
    ordersError: orders.error,
    ordersLoaded: orders.loaded,
    reloadOrders: () => orders.load(),
    refreshOrders: () => orders.load({ silent: true }),

    myReviews: reviews.data,
    reviewsLoading: reviews.loading,
    reviewsRefreshing: reviews.refreshing,
    reviewsError: reviews.error,
    reviewsLoaded: reviews.loaded,
    reloadReviews: () => reviews.load(),
    refreshReviews: () => reviews.load({ silent: true }),

    lastAddress,
    hasPurchased: (productId) => purchasedIds.has(String(productId)),
    reviewFor: (productId) => reviewsByProduct.get(String(productId)) || null,
    eligibilityLoaded: orders.loaded && reviews.loaded,
  };

  return <AccountDataContext.Provider value={value}>{children}</AccountDataContext.Provider>;
}

export const useAccountData = () => useContext(AccountDataContext);
