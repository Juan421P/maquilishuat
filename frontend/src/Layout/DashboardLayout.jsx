import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import "./DashboardLayout.css";

export default function DashboardLayout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-right">
        <Header />
        <main className="layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
