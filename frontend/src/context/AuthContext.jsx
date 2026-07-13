import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authAPI, setAuthInvalidHandler } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Se guarda en sessionStorage para que persista en la tab pero no entre sesiones
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("maq_user")); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const clearSession = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("maq_user");
  }, []);

  // El authCookie (compartido por el navegador entre tabs) es la fuente de verdad,
  // no el sessionStorage de esta tab. Si el backend rechaza la sesión (401/403 en
  // un endpoint protegido) limpiamos el estado local para que ProtectedRoute reaccione.
  useEffect(() => {
    setAuthInvalidHandler(clearSession);
    return () => setAuthInvalidHandler(null);
  }, [clearSession]);

  // Al montar, se confirma contra el backend que el authCookie sigue correspondiendo
  // al usuario cacheado (puede haber cambiado en otra tab, o haber expirado).
  useEffect(() => {
    authAPI.me()
      .then((result) => {
        setUser((prev) => {
          if (prev && prev.userType === result.userType) return prev;
          const u = { userType: result.userType };
          sessionStorage.setItem("maq_user", JSON.stringify(u));
          return u;
        });
      })
      .catch(() => clearSession());
  }, [clearSession]);

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
    clearSession();
  }, [clearSession]);

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
