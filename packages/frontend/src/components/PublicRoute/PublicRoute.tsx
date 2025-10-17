/*
 * PublicRoute - Componente para rutas públicas con redirección
 *
 * Redirige a /dashboard si el usuario ya está autenticado
 *
 * Teacher note:
 * - Este componente es el opuesto de PrivateRoute
 * - Útil para /login y /register: si ya tienes sesion, te manda al dashboard
 * - Evita que usuarios autenticados vean páginas de login innecesariamente
 *
 * Analogía: Una pierta que dice "Si ya tienes llave, pasa directo al edificio"
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../PrivateRoute/PrivateRoute.css"; // Reutiliza estilos del loading

/*
 * Props del compoenente PublicRoute
 */
interface PublicRouteProps {
  children: React.ReactNode;
}

/*
 * Componente que maneja rutas públicas con redirección condicional
 *
 * @params children - Componente hijo (Login, Register)
 * @returns Redirige a /dashboard si autenticado, o renderiza children
 *
 * Teacher note:
 * - Si isAuthenticated es true, el usuario no debería ver login
 * - Esto mejora UX ecitando confusión
 */
function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  /*
   * Mostrar loading mientras se verifica
   *
   * Teacher note:
   * - Importante para evitar flash de login antes de redirigir a dashboard
   */
  if (isLoading) {
    return (
      <div className="private-route-loading">
        <div className="spinner"></div>
        <p className="loading-text">Cargando...</p>
      </div>
    );
  }

  /*
   * Si ya está autenticado, redirigir a dashboard
   *
   * Teacher note:
   * - No tiene sentido mostrar login a alguien que ya tiene sesión
   * - replace=true evita que el botón "atrás" vuelve a login
   */
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  /*
   * Si no está autenticado, mostrar la página pública (Login/Register)
   */
  return <>{children}</>;
}

export default PublicRoute;
