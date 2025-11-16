import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../PrivateRoute/PrivateRoute.css"; // Reutiliza estilos del loading

interface PublicRouteProps {
  children: React.ReactNode;
}

function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="private-route-loading">
        <div className="spinner"></div>
        <p className="loading-text">Cargando...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export default PublicRoute;
