import { useCallback, useState } from "react";

// Maneja qué pantalla/tab se muestra. Antes vivía como un manojo de
// useState sueltos directamente en App.js.
//
// - `screen`: flujo principal (splash, login, register, forgot, info, app)
// - `tab`: pestaña de la barra inferior dentro de "app"
// - `stack`: pantallas secundarias abiertas encima de las pestañas
//   (detalle de producto, detalle de pedido, editar perfil, ...). Permite
//   que el botón atrás vuelva a la pantalla anterior en vez de cerrar la app.
export function useAppNavigation(initialScreen = "splash") {
  const [screen, setScreen] = useState(initialScreen);
  const [prevScreen, setPrevScreen] = useState(initialScreen);
  const [tab, setTabState] = useState("home");
  const [stack, setStack] = useState([]);
  const [order, setOrder] = useState(null); // venta recién creada → pantalla de éxito

  const goTo = useCallback((next) => {
    setStack([]);
    setScreen(next);
  }, []);

  const setTab = useCallback((next) => {
    setStack([]);
    setTabState(next);
  }, []);

  const openInfo = useCallback(() => {
    setPrevScreen(screen);
    setScreen("info");
  }, [screen]);
  const closeInfo = useCallback(() => setScreen(prevScreen), [prevScreen]);

  const push = useCallback((name, params = {}) => setStack((s) => [...s, { name, params }]), []);
  const pop = useCallback(() => setStack((s) => s.slice(0, -1)), []);

  const onLoginSuccess = useCallback(() => {
    setStack([]);
    setOrder(null);
    setScreen("app");
    setTabState("home");
  }, []);

  const resetToSplash = useCallback(() => {
    setStack([]);
    setOrder(null);
    setScreen("splash");
    setTabState("home");
  }, []);

  const toLogin = useCallback(() => {
    setStack([]);
    setOrder(null);
    setScreen("login");
    setTabState("home");
  }, []);

  const completeOrder = useCallback((sale) => {
    setStack([]);
    setOrder(sale || {});
  }, []);
  const continueAfterOrder = useCallback(() => {
    setOrder(null);
    setTabState("catalog");
  }, []);
  const viewOrderAfterPurchase = useCallback((sale) => {
    setOrder(null);
    setTabState("profile");
    setStack(sale?._id ? [{ name: "orderDetail", params: { orderId: sale._id } }] : []);
  }, []);

  // Navegación general del botón atrás. Devuelve false si no hay a dónde
  // volver (el sistema cierra/minimiza la app, comportamiento normal de
  // Android en la pantalla inicial).
  const goBack = useCallback(() => {
    if (screen === "app") {
      if (order) {
        continueAfterOrder();
        return true;
      }
      if (stack.length > 0) {
        pop();
        return true;
      }
      if (tab !== "home") {
        setTabState("home");
        return true;
      }
      return false;
    }
    if (screen === "login") {
      setScreen("splash");
      return true;
    }
    if (screen === "register" || screen === "forgot") {
      setScreen("login");
      return true;
    }
    if (screen === "info") {
      setScreen(prevScreen);
      return true;
    }
    return false;
  }, [screen, order, stack.length, tab, prevScreen, pop, continueAfterOrder]);

  return {
    screen,
    setScreen: goTo,
    tab,
    setTab,
    stack,
    top: stack[stack.length - 1] || null,
    push,
    pop,
    order,
    orderOk: !!order,
    openInfo,
    closeInfo,
    onLoginSuccess,
    resetToSplash,
    toLogin,
    completeOrder,
    continueAfterOrder,
    viewOrderAfterPurchase,
    goBack,
  };
}
