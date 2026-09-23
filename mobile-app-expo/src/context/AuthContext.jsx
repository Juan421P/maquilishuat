import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, clientsAPI, tokenStore, setUnauthorizedHandler } from "../services/api";
import { ApiError } from "../utils/errors";
import { decodeJwtPayload } from "../utils/jwt";
import { cartStorageKey, LEGACY_CART_KEY } from "../hooks/useCart";

const AuthContext = createContext(null);
const USER_KEY = "maq_user";

export const CLIENT_ONLY_MESSAGE =
  "Esta app es solo para clientes. Si eres administrador, ingresa desde el panel web.";

// Normaliza el perfil que devuelve el backend (login o GET /clients/:id).
const toUser = (data, fallback = {}) => ({
  id: data?.id || data?._id || fallback.id,
  name: data?.name ?? fallback.name ?? "",
  lastname: data?.lastname ?? fallback.lastname ?? "",
  email: data?.email ?? fallback.email ?? "",
  birthdate: data?.birthdate ?? fallback.birthdate ?? null,
  picture: data?.picture ?? fallback.picture ?? null,
  userType: "Client",
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  // Se incrementa cada vez que la sesión expira (401): App.js lo observa
  // para llevar al login y mostrar el aviso.
  const [sessionExpiredCount, setSessionExpiredCount] = useState(0);
  const expiringRef = useRef(false);
  const userRef = useRef(null);
  userRef.current = user;

  const persistUser = useCallback(async (u) => {
    setUser(u);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
  }, []);

  const clearSession = useCallback(async () => {
    setUser(null);
    await Promise.all([tokenStore.clear(), AsyncStorage.removeItem(USER_KEY)]);
  }, []);

  // Trae el perfil actualizado del backend. Si el token ya no sirve, el
  // request devuelve 401 y el handler global cierra la sesión.
  const refreshProfile = useCallback(async (current) => {
    const base = current || user;
    if (!base?.id) return null;
    const data = await clientsAPI.getById(base.id);
    const fresh = toUser(data, base);
    await persistUser(fresh);
    return fresh;
  }, [user, persistUser]);

  // Handler global para 401 en requests autenticados.
  useEffect(() => {
    setUnauthorizedHandler(async () => {
      // Varias requests pueden fallar a la vez: solo la primera cierra la
      // sesión (si ya no hay usuario, no hay nada que expirar).
      if (expiringRef.current || !userRef.current) return;
      expiringRef.current = true;
      try {
        userRef.current = null;
        await clearSession();
        setSessionExpiredCount((n) => n + 1);
      } finally {
        expiringRef.current = false;
      }
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  // Al abrir la app, revisamos si ya había una sesión guardada.
  useEffect(() => {
    (async () => {
      let restored = null;
      try {
        // El carrito viejo era compartido por todas las cuentas del
        // teléfono: se descarta.
        await AsyncStorage.removeItem(LEGACY_CART_KEY);
        const [storedUser, token] = await Promise.all([AsyncStorage.getItem(USER_KEY), tokenStore.get()]);
        if (token) {
          const payload = decodeJwtPayload(token);
          const stored = storedUser ? JSON.parse(storedUser) : {};
          if (payload?.userType === "Client" && payload?.id) {
            restored = toUser({ ...stored, id: stored.id || payload.id }, stored);
            setUser(restored);
          } else {
            // Token de admin (versiones anteriores lo permitían) o corrupto.
            await clearSession();
          }
        } else if (storedUser) {
          await AsyncStorage.removeItem(USER_KEY);
        }
      } catch (e) {
        console.warn("No se pudo leer la sesión guardada", e);
        await clearSession().catch((err) => console.warn("No se pudo limpiar la sesión", err));
      } finally {
        setReady(true);
      }
      // Valida el token con el backend y actualiza nombre, foto, etc. Si no
      // hay conexión se mantiene la sesión guardada; si el token venció, el
      // handler de 401 lleva al login.
      if (restored) {
        refreshProfile(restored).catch((e) => {
          if (!(e instanceof ApiError && e.status === 401)) {
            console.warn("No se pudo actualizar el perfil:", e.message);
          }
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authAPI.login(email, password);
    if (data.userType !== "Client") {
      // La app es solo para clientes: no se guarda el token y se cierra la
      // cookie de sesión que el backend pudo haber dejado.
      await authAPI.logout().catch((e) => console.warn("Logout tras rechazo de admin:", e.message));
      throw new ApiError(CLIENT_ONLY_MESSAGE, { status: 403, code: "NOT_A_CLIENT" });
    }
    if (!data.token) {
      throw new ApiError("El servidor no devolvió una sesión válida. Inténtalo de nuevo.");
    }
    await tokenStore.set(data.token);
    const payload = decodeJwtPayload(data.token);
    const u = toUser(data.user || {}, { id: payload?.id, email });
    await persistUser(u);
    return u;
  }, [persistUser]);

  const logout = useCallback(async () => {
    const current = user;
    try {
      await authAPI.logout();
    } catch (e) {
      // Sin conexión igual se cierra la sesión local.
      console.warn("Logout sin respuesta del servidor:", e.message);
    }
    // Al cerrar sesión a propósito se borra el carrito de esa cuenta.
    if (current?.id) await AsyncStorage.removeItem(cartStorageKey(current.id));
    await clearSession();
  }, [user, clearSession]);

  // Después de eliminar la cuenta: la sesión ya no existe en el backend.
  const forgetAccount = useCallback(async () => {
    if (user?.id) await AsyncStorage.removeItem(cartStorageKey(user.id));
    await clearSession();
  }, [user, clearSession]);

  const updateUser = useCallback(async (data) => {
    if (!user) return;
    await persistUser(toUser(data, user));
  }, [user, persistUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        forgetAccount,
        updateUser,
        refreshProfile,
        isLoggedIn: !!user,
        ready,
        sessionExpiredCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
