import { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, tokenStore } from "../services/api";

const AuthContext = createContext(null);
const USER_KEY = "maq_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Al abrir la app, revisamos si ya había una sesión guardada.
  useEffect(() => {
    (async () => {
      try {
        const [storedUser, token] = await Promise.all([
          AsyncStorage.getItem(USER_KEY),
          tokenStore.get(),
        ]);
        if (storedUser && token) setUser(JSON.parse(storedUser));
      } catch {
        // ignore
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    await authAPI.login(email, password);
    const u = { email };
    setUser(u);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore network errors on logout
    }
    setUser(null);
    await AsyncStorage.removeItem(USER_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
