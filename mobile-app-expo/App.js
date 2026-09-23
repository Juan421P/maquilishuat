import { useCallback, useEffect, useRef } from "react";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BackHandler, View } from "react-native";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { AccountDataProvider, useAccountData } from "./src/context/AccountDataContext";
import { ToastProvider, useToast } from "./src/components/Toast";
import { useCart } from "./src/hooks/useCart";
import { useProducts } from "./src/hooks/useProducts";
import { useAppNavigation } from "./src/hooks/useAppNavigation";
import { runBackHandlers } from "./src/utils/backRegistry";
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
import ProductDetailPage from "./src/pages/ProductDetailPage";
import OrderDetailPage from "./src/pages/OrderDetailPage";
import OrdersPage from "./src/pages/OrdersPage";
import EditProfilePage from "./src/pages/EditProfilePage";
import ChangePasswordPage from "./src/pages/ChangePasswordPage";
import DeleteAccountPage from "./src/pages/DeleteAccountPage";
import MyReviewsPage from "./src/pages/MyReviewsPage";

// El splash nativo de Expo se queda visible hasta que llamemos
// SplashScreen.hideAsync(). Así evitamos el parpadeo en blanco entre que la
// app arranca y que sabemos si hay una sesión guardada, y le damos paso a
// nuestra propia pantalla de bienvenida (SplashPage) en vez del logo
// default de Expo.
SplashScreen.preventAutoHideAsync().catch((e) => console.warn("SplashScreen", e));

function MobileApp() {
  const { user, ready, logout, sessionExpiredCount } = useAuth();
  const account = useAccountData();
  const toast = useToast();
  const cartState = useCart(user?.id || null);
  const productsState = useProducts(!!user);
  const nav = useAppNavigation();
  const lastExpiredRef = useRef(0);

  useEffect(() => {
    if (ready) {
      nav.setScreen(user ? "app" : "splash");
      SplashScreen.hideAsync().catch((e) => console.warn("SplashScreen", e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // Sesión expirada (401 en cualquier request autenticado): AuthContext ya
  // borró la sesión; aquí se lleva al login y se avisa.
  useEffect(() => {
    if (sessionExpiredCount > lastExpiredRef.current) {
      lastExpiredRef.current = sessionExpiredCount;
      nav.toLogin();
      toast?.error("Tu sesión ha expirado. Inicia sesión nuevamente.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionExpiredCount]);

  // Cada vez que llega el catálogo, el carrito se sincroniza con los precios
  // y el stock reales. Si algo cambió, se avisa.
  useEffect(() => {
    if (!productsState.loaded || !cartState.hydrated) return;
    const changes = cartState.reconcile(productsState.products);
    if (changes.length > 0) {
      toast?.info(changes.length === 1 ? changes[0] : "Actualizamos tu carrito con los precios y el stock actuales.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productsState.products, productsState.loaded, cartState.hydrated]);

  // Botón atrás de Android: primero las acciones propias de cada pantalla
  // (paso anterior de un formulario, cerrar modal...) y luego la navegación
  // general. En la pantalla inicial devuelve false y el sistema cierra la app.
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => runBackHandlers() || nav.goBack());
    return () => sub.remove();
  }, [nav.goBack]); // eslint-disable-line react-hooks/exhaustive-deps

  const onLogout = async () => {
    await logout();
    nav.resetToSplash();
  };

  const onAdd = useCallback((product, qty = 1) => {
    const r = cartState.addToCart(product, qty);
    if (r.added > 0 && r.limited) {
      toast?.info(`Agregamos ${r.added}. Llegaste al máximo disponible (${r.qty}).`);
    } else if (r.added > 0) {
      toast?.success(`${product.name} agregado${r.qty > 1 ? ` (${r.qty} en el carrito)` : ""}`);
    } else {
      toast?.info(`Ya tienes todas las unidades disponibles de ${product.name}.`);
    }
  }, [cartState.addToCart, toast]); // eslint-disable-line react-hooks/exhaustive-deps

  const onPurchased = useCallback((sale) => {
    nav.completeOrder(sale);
    // Stock y pedidos cambiaron: se recargan en segundo plano.
    productsState.refresh();
    account.refreshOrders();
  }, [nav.completeOrder, productsState.refresh, account.refreshOrders]); // eslint-disable-line react-hooks/exhaustive-deps

  const onLayoutRootView = useCallback(() => {
    if (ready) SplashScreen.hideAsync().catch((e) => console.warn("SplashScreen", e));
  }, [ready]);

  if (!ready) {
    // Todavía no sabemos si hay sesión guardada: dejamos el splash nativo
    // visible (no renderizamos nada encima) en vez de mostrar un spinner
    // sobre un fondo distinto, para que la transición sea continua.
    return <View style={{ flex: 1, backgroundColor: T.sidebarDeep }} onLayout={onLayoutRootView} />;
  }

  // "app" sin usuario solo puede pasar un instante mientras se navega tras
  // cerrar sesión / eliminar la cuenta: se muestra la bienvenida.
  if (nav.screen === "splash" || (nav.screen === "app" && !user)) {
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
    return (
      <RegisterPage
        onBack={() => nav.setScreen("login")}
        onSuccess={nav.onLoginSuccess}
        onAccountCreated={() => nav.setScreen("login")}
      />
    );
  }
  if (nav.screen === "forgot") {
    return <ForgotPage onBack={() => nav.setScreen("login")} />;
  }
  if (nav.screen === "info") {
    return <InfoHubPage onBack={nav.closeInfo} />;
  }

  if (nav.screen === "app" && user) {
    if (nav.orderOk) {
      return (
        <OrderSuccessPage
          order={nav.order}
          onContinue={nav.continueAfterOrder}
          onViewOrder={nav.viewOrderAfterPurchase}
        />
      );
    }

    // Todo lo que las pantallas de compra necesitan del catálogo y el carrito.
    const shop = {
      ...productsState,
      qtyOf: cartState.qtyOf,
      onAdd,
      openProduct: (p) => nav.push("product", { productId: p._id }),
      cartCount: cartState.totalItems,
    };
    const goCart = () => nav.setTab("cart");
    const goCatalog = () => nav.setTab("catalog");
    const openProductById = (productId) => nav.push("product", { productId });

    // Pantallas secundarias encima de las pestañas (sin barra inferior).
    const top = nav.top;
    if (top) {
      switch (top.name) {
        case "product":
          return <ProductDetailPage productId={top.params.productId} shop={shop} onBack={nav.pop} onGoCart={goCart} />;
        case "orderDetail":
          return <OrderDetailPage orderId={top.params.orderId} onBack={nav.pop} onOpenProduct={openProductById} />;
        case "orders":
          return <OrdersPage onBack={nav.pop} onOpenOrder={(id) => nav.push("orderDetail", { orderId: id })} onGoCatalog={goCatalog} />;
        case "editProfile":
          return <EditProfilePage onBack={nav.pop} />;
        case "changePassword":
          return <ChangePasswordPage onBack={nav.pop} />;
        case "deleteAccount":
          return <DeleteAccountPage onBack={nav.pop} onDeleted={nav.resetToSplash} />;
        case "myReviews":
          return <MyReviewsPage onBack={nav.pop} onOpenProduct={openProductById} onGoCatalog={goCatalog} />;
        default:
          break;
      }
    }

    return (
      <View style={{ flex: 1, backgroundColor: T.surface }}>
        <View style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          {nav.tab === "home" && <HomePage user={user} shop={shop} onGoCart={goCart} onGoCatalog={goCatalog} />}
          {nav.tab === "catalog" && <CatalogPage shop={shop} onGoCart={goCart} />}
          {nav.tab === "cart" && (
            <CartPage
              cartState={cartState}
              shop={shop}
              defaultAddress={account.lastAddress}
              onPurchased={onPurchased}
              onGoCatalog={goCatalog}
            />
          )}
          {nav.tab === "profile" && (
            <ProfilePage
              onLogout={onLogout}
              onOpenInfo={nav.openInfo}
              onOpenOrder={(id) => nav.push("orderDetail", { orderId: id })}
              onOpenAllOrders={() => nav.push("orders")}
              onNavigate={(name) => nav.push(name)}
            />
          )}
        </View>
        <BottomNav tab={nav.tab} setTab={nav.setTab} cartCount={cartState.totalItems} />
      </View>
    );
  }

  return null;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AccountDataProvider>
          <ToastProvider>
            <StatusBar style="light" />
            <MobileApp />
          </ToastProvider>
        </AccountDataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
