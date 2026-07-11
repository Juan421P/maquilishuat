import { createContext, useContext, useState, useCallback } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Se guarda en sessionStorage para que persista en la tab pero no entre sesiones
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("maq_user")); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const result = await authAPI.login(email, password);
      // El backend usa cookie httpOnly, guardamos solo datos básicos en memoria
      const u = { email, userType: result.userType };
      setUser(u);
      sessionStorage.setItem("maq_user", JSON.stringify(u));
      return { ok: true, userType: result.userType };
    } catch (err) {
      return { ok: false, message: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    setUser(null);
    sessionStorage.removeItem("maq_user");
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isLoggedIn: !!user,
      isAdmin: user?.userType === "Admin",
      isClient: user?.userType === "Client",
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
