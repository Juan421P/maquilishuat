import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HOME_BY_ROLE = { Admin: "/dashboard", Client: "/catalogo" };

export default function ProtectedRoute({ role, children }) {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.userType !== role) {
    return <Navigate to={HOME_BY_ROLE[user.userType] || "/home"} replace />;
  }

  return children;
}
