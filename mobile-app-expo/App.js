import { useCallback, useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { ToastProvider } from "./src/components/Toast";
import { useCart } from "./src/hooks/useCart";
import { useProducts } from "./src/hooks/useProducts";
import { useAppNavigation } from "./src/hooks/useAppNavigation";
import { T } from "./src/utils/theme";

import BottomNav from "./src/layout/BottomNav";

import LoginPage from "./src/pages/LoginPage";
import RegisterPage from "./src/pages/RegisterPage";
import ForgotPage from "./src/pages/ForgotPage";
import HomePage from "./src/pages/HomePage";
import CatalogPage from "./src/pages/CatalogPage";
import CartPage from "./src/pages/CartPage";
import ProfilePage from "./src/pages/ProfilePage";
import OrderSuccessPage from "./src/pages/OrderSuccessPage";
import InfoHubPage from "./src/pages/InfoHubPage";
import SplashPage from "./src/pages/SplashPage";

// El splash nativo de Expo se queda visible hasta que llamemos
// SplashScreen.hideAsync(). Así evitamos el parpadeo en blanco entre que la
// app arranca y que sabemos si hay una sesión guardada, y le damos paso a
// nuestra propia pantalla de bienvenida (SplashPage) en vez del logo
// default de Expo.
SplashScreen.preventAutoHideAsync().catch(() => {});

function MobileApp() {
  const { user, ready, logout } = useAuth();
  const { cart, addToCart, changeQty, removeItem, clearCart, totalItems } = useCart();
  const { products } = useProducts(!!user);
  const nav = useAppNavigation();

  useEffect(() => {
    if (ready) {
      nav.setScreen(user ? "app" : "splash");
      SplashScreen.hideAsync().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const onLogout = async () => {
    await logout();
    nav.resetToSplash();
  };

  const onLayoutRootView = useCallback(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) {
    // Todavía no sabemos si hay sesión guardada: dejamos el splash nativo
    // visible (no renderizamos nada encima) en vez de mostrar un spinner
    // sobre un fondo distinto, para que la transición sea continua.
    return <View style={{ flex: 1, backgroundColor: T.sidebarDeep }} onLayout={onLayoutRootView} />;
  }

  if (nav.screen === "splash") {
    return (
      <SplashPage onLogin={() => nav.setScreen("login")} onRegister={() => nav.setScreen("register")} onInfo={nav.openInfo} />
    );
  }
  if (nav.screen === "login") {
    return (
      <LoginPage
        onSuccess={nav.onLoginSuccess}
        onRegister={() => nav.setScreen("register")}
        onForgot={() => nav.setScreen("forgot")}
        onBack={() => nav.setScreen("splash")}
      />
    );
  }
  if (nav.screen === "register") {
    return <RegisterPage onBack={() => nav.setScreen("login")} onSuccess={nav.onLoginSuccess} />;
  }
  if (nav.screen === "forgot") {
    return <ForgotPage onBack={() => nav.setScreen("login")} />;
  }
  if (nav.screen === "info") {
    return <InfoHubPage onBack={nav.closeInfo} />;
  }

  if (nav.screen === "app") {
    if (nav.orderOk) {
      return <OrderSuccessPage onContinue={nav.continueAfterOrder} />;
    }
    return (
      <View style={{ flex: 1, backgroundColor: T.surface }}>
        <View style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          {nav.tab === "home" && (
            <HomePage user={user} products={products} cart={cart} onAdd={addToCart} onGoCart={() => nav.setTab("cart")} onGoCatalog={() => nav.setTab("catalog")} />
          )}
          {nav.tab === "catalog" && (
            <CatalogPage products={products} cart={cart} onAdd={addToCart} onGoCart={() => nav.setTab("cart")} />
          )}
          {nav.tab === "cart" && (
            <CartPage cart={cart} changeQty={changeQty} removeItem={removeItem} clearCart={clearCart} onOrderSuccess={nav.completeOrder} />
          )}
          {nav.tab === "profile" && <ProfilePage user={user} onLogout={onLogout} onOpenInfo={nav.openInfo} />}
        </View>
        <BottomNav tab={nav.tab} setTab={nav.setTab} cartCount={totalItems} />
      </View>
    );
  }

  return null;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ToastProvider>
          <StatusBar style="light" />
          <MobileApp />
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
