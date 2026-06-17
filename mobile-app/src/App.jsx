import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useCart } from "./hooks/useCart";
import { productsAPI } from "./services/api";

import PhoneShell       from "./layout/PhoneShell";
import BottomNav        from "./layout/BottomNav";

import SplashPage       from "./pages/SplashPage";
import LoginPage        from "./pages/LoginPage";
import RegisterPage     from "./pages/RegisterPage";
import ForgotPage       from "./pages/ForgotPage";
import HomePage         from "./pages/HomePage";
import CatalogPage      from "./pages/CatalogPage";
import CartPage         from "./pages/CartPage";
import ProfilePage      from "./pages/ProfilePage";
import OrderSuccessPage from "./pages/OrderSuccessPage";

// Font loader
const _link = document.createElement("link");
_link.rel  = "stylesheet";
_link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap";
document.head.appendChild(_link);

// Global reset — only run once
const _style = document.createElement("style");
_style.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: 'Poppins', sans-serif; -webkit-font-smoothing: antialiased; }
  input, button, select, textarea { font-family: inherit; }
  button { -webkit-tap-highlight-color: transparent; }
  ::-webkit-scrollbar { width: 0; }
`;
document.head.appendChild(_style);

function MobileApp() {
  const { user, login, logout } = useAuth();
  const { cart, addToCart, changeQty, removeItem, clearCart, totalItems } = useCart();

  const [screen,   setScreen]   = useState(user ? "app" : "splash");
  const [tab,      setTab]      = useState("home");
  const [products, setProducts] = useState([]);
  const [orderOk,  setOrderOk]  = useState(false);

  useEffect(() => {
    if (user) {
      productsAPI.getAll()
        .then((data) => setProducts(data.filter((p) => p.stock > 0)))
        .catch(() => {});
    }
  }, [user]);

  const onLoginSuccess = () => { setScreen("app"); setTab("home"); };
  const onLogout = async () => {
    await logout();
    setScreen("splash");
    setTab("home");
  };

  const renderContent = () => {
    if (screen === "splash")   return <SplashPage   onLogin={() => setScreen("login")} onRegister={() => setScreen("register")} />;
    if (screen === "login")    return <LoginPage    onSuccess={onLoginSuccess} onRegister={() => setScreen("register")} onForgot={() => setScreen("forgot")} onBack={() => setScreen("splash")} />;
    if (screen === "register") return <RegisterPage onBack={() => setScreen("login")} onSuccess={onLoginSuccess} />;
    if (screen === "forgot")   return <ForgotPage   onBack={() => setScreen("login")} />;

    if (screen === "app") {
      if (orderOk) {
        return <OrderSuccessPage onContinue={() => { setOrderOk(false); setTab("catalog"); }} />;
      }
      return (
        <>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
            {tab === "home"    && <HomePage    user={user} products={products} cart={cart} onAdd={addToCart} onGoCart={() => setTab("cart")} onGoCatalog={() => setTab("catalog")} />}
            {tab === "catalog" && <CatalogPage products={products} cart={cart} onAdd={addToCart} onGoCart={() => setTab("cart")} />}
            {tab === "cart"    && <CartPage    cart={cart} changeQty={changeQty} removeItem={removeItem} clearCart={clearCart} onOrderSuccess={() => setOrderOk(true)} />}
            {tab === "profile" && <ProfilePage user={user} onLogout={onLogout} />}
          </div>
          <BottomNav tab={tab} setTab={setTab} cartCount={totalItems} />
        </>
      );
    }
  };

  return <PhoneShell>{renderContent()}</PhoneShell>;
}

export default function App() {
  return (
    <AuthProvider>
      <MobileApp />
    </AuthProvider>
  );
}
