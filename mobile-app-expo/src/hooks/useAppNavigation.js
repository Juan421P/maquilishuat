import { useState } from "react";

// Maneja qué pantalla/tab se muestra. Antes vivía como un manojo de
// useState sueltos directamente en App.js.
export function useAppNavigation(initialScreen = "splash") {
  const [screen, setScreen] = useState(initialScreen);
  const [prevScreen, setPrevScreen] = useState(initialScreen);
  const [tab, setTab] = useState("home");
  const [orderOk, setOrderOk] = useState(false);

  const goTo = (next) => setScreen(next);

  const openInfo = () => {
    setPrevScreen(screen);
    setScreen("info");
  };
  const closeInfo = () => setScreen(prevScreen);

  const onLoginSuccess = () => {
    setScreen("app");
    setTab("home");
  };

  const resetToSplash = () => {
    setScreen("splash");
    setTab("home");
  };

  const completeOrder = () => setOrderOk(true);
  const continueAfterOrder = () => {
    setOrderOk(false);
    setTab("catalog");
  };

  return {
    screen,
    setScreen: goTo,
    tab,
    setTab,
    orderOk,
    openInfo,
    closeInfo,
    onLoginSuccess,
    resetToSplash,
    completeOrder,
    continueAfterOrder,
  };
}
