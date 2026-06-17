import { createContext, useContext, useState, useCallback } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("maq_user"));
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email, password) => {
    await authAPI.login(email, password);
    const u = { email };
    setUser(u);
    sessionStorage.setItem("maq_user", JSON.stringify(u));
    return u;
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    setUser(null);
    sessionStorage.removeItem("maq_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
