import { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator } from "react-native";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { ToastProvider } from "./src/components/Toast";
import { useCart } from "./src/hooks/useCart";
import { productsAPI } from "./src/services/api";
import { T } from "./src/utils/theme";

import BottomNav from "./src/layout/BottomNav";

import SplashPage from "./src/pages/SplashPage";
import LoginPage from "./src/pages/LoginPage";
import RegisterPage from "./src/pages/RegisterPage";
import ForgotPage from "./src/pages/ForgotPage";
import HomePage from "./src/pages/HomePage";
import CatalogPage from "./src/pages/CatalogPage";
import CartPage from "./src/pages/CartPage";
import ProfilePage from "./src/pages/ProfilePage";
import OrderSuccessPage from "./src/pages/OrderSuccessPage";
import InfoHubPage from "./src/pages/InfoHubPage";

function MobileApp() {
  const { user, ready, logout } = useAuth();
  const { cart, addToCart, changeQty, removeItem, clearCart, totalItems } = useCart();

  const [screen, setScreen] = useState("splash");
  const [prevScreen, setPrevScreen] = useState("splash");
  const [tab, setTab] = useState("home");
  const [products, setProducts] = useState([]);
  const [orderOk, setOrderOk] = useState(false);

  useEffect(() => {
    if (ready) setScreen(user ? "app" : "splash");
  }, [ready]);

  useEffect(() => {
    if (user) {
      productsAPI.getAll().then((data) => setProducts(data.filter((p) => p.stock > 0))).catch(() => {});
    }
  }, [user]);

  const onLoginSuccess = () => { setScreen("app"); setTab("home"); };
  const onLogout = async () => { await logout(); setScreen("splash"); setTab("home"); };
  const openInfo = () => { setPrevScreen(screen); setScreen("info"); };
  const closeInfo = () => setScreen(prevScreen);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: T.sidebarDeep }}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  if (screen === "splash") return <SplashPage onLogin={() => setScreen("login")} onRegister={() => setScreen("register")} onInfo={openInfo} />;
  if (screen === "login") return <LoginPage onSuccess={onLoginSuccess} onRegister={() => setScreen("register")} onForgot={() => setScreen("forgot")} onBack={() => setScreen("splash")} />;
  if (screen === "register") return <RegisterPage onBack={() => setScreen("login")} onSuccess={onLoginSuccess} />;
  if (screen === "forgot") return <ForgotPage onBack={() => setScreen("login")} />;
  if (screen === "info") return <InfoHubPage onBack={closeInfo} />;

  if (screen === "app") {
    if (orderOk) {
      return <OrderSuccessPage onContinue={() => { setOrderOk(false); setTab("catalog"); }} />;
    }
    return (
      <View style={{ flex: 1, backgroundColor: T.surface }}>
        <View style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          {tab === "home" && (
            <HomePage user={user} products={products} cart={cart} onAdd={addToCart} onGoCart={() => setTab("cart")} onGoCatalog={() => setTab("catalog")} />
          )}
          {tab === "catalog" && (
            <CatalogPage products={products} cart={cart} onAdd={addToCart} onGoCart={() => setTab("cart")} />
          )}
          {tab === "cart" && (
            <CartPage cart={cart} changeQty={changeQty} removeItem={removeItem} clearCart={clearCart} onOrderSuccess={() => setOrderOk(true)} />
          )}
          {tab === "profile" && <ProfilePage user={user} onLogout={onLogout} onOpenInfo={openInfo} />}
        </View>
        <BottomNav tab={tab} setTab={setTab} cartCount={totalItems} />
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
