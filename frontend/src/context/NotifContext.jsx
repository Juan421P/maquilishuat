import { createContext, useContext, useState } from "react";

const NotifCtx = createContext(null);

// notificaciones de demo — en un sistema real vendrían del servidor con WebSockets o polling
const INITIAL = [
  { id:1, tipo:"pedido",  titulo:"Nuevo pedido recibido",     desc:"Juan Pérez – Garrafón 20L ×5",    tiempo:"hace 5 min",  leido:false, icon:"🛒" },
  { id:2, tipo:"pago",    titulo:"Pago confirmado",            desc:"María López pagó $55.00",           tiempo:"hace 18 min", leido:false, icon:"💳" },
  { id:3, tipo:"pedido",  titulo:"Pedido entregado",           desc:"Carlos Rivera – Garrafón 20L ×2",  tiempo:"hace 1h",     leido:false, icon:"✅" },
  { id:4, tipo:"cliente", titulo:"Nuevo cliente registrado",   desc:"Ana Martínez se registró",          tiempo:"hace 2h",     leido:true,  icon:"👤" },
  { id:5, tipo:"sistema", titulo:"Stock bajo",                 desc:"Garrafón 20L – pocas unidades",     tiempo:"hace 3h",     leido:true,  icon:"⚠️" },
];

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
