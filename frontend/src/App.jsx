import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./Layout/DashboardLayout";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import Dashboard from "./Pages/Dashboard";
import Pedidos from "./Pages/OrderManagement";
import Productos from "./Pages/ProductsManagement";
import Clientes from "./Pages/Clients";
import Rutas from "./Pages/Rutas";
import Pagos from "./Pages/Pagos";
import Informes from "./Pages/Informes";
import Configuracion from "./Pages/Configuracion";
import Home from "./Pages/Home";
import Nosotros from "./Pages/Nosotros";
import Contacto from "./Pages/Contacto";
import Terminos from "./Pages/Terminos";
import Catalogo from "./Pages/Catalogo";
import Carrito from "./Pages/Carrito";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Páginas públicas */}
        <Route path="/home"     element={<Home />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/carrito"  element={<Carrito />} />

        {/* Auth */}
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        {/* Panel admin */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"    element={<Dashboard />} />
          <Route path="pedidos"      element={<Pedidos />} />
          <Route path="productos"    element={<Productos />} />
          <Route path="clientes"     element={<Clientes />} />
          <Route path="rutas"        element={<Rutas />} />
          <Route path="pagos"        element={<Pagos />} />
          <Route path="informes"     element={<Informes />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
