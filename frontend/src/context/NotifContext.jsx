import { createContext, useContext, useState } from "react";

const NotifCtx = createContext(null);

// sin notificaciones de demo por defecto — en un sistema real vendrían del servidor con WebSockets o polling
const INITIAL = [];

export function NotifProvider({ children }) {
  const [notifs, setNotifs] = useState(INITIAL);

  const marcarLeido = id => setNotifs(ns => ns.map(n => n.id === id ? { ...n, leido: true } : n));
  const marcarTodos = () => setNotifs(ns => ns.map(n => ({ ...n, leido: true })));
  const eliminar = id => setNotifs(ns => ns.filter(n => n.id !== id));
  const unread = notifs.filter(n => !n.leido).length;

  return (
    <NotifCtx.Provider value={{ notifs, marcarLeido, marcarTodos, eliminar, unread }}>
      {children}
    </NotifCtx.Provider>
  );
}

export const useNotifs = () => useContext(NotifCtx);
