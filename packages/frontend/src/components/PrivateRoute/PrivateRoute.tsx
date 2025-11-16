import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./PrivateRoute.css";

interface PrivateRouteProps {
  children: React.ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="private-route-loading">
        <div className="spinner"></div>
        <p className="loading-text">Verificando sesión...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default PrivateRoute;
