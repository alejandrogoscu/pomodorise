/*
 * PrivateRoute - Componente de orden superior (HOC)
 *
 * Protege Rutas que requieren autenticación
 *
 * Teacher note:
 * - Un HOC (Hight Order Component) es un patrón que envuelve otro componente
 * - PrivateRoute verifica si el usuario está autenticado antes de renderizar
 * - Si no está autenticado, redirige a /login
 * - Durante la verificación inicial, muestra un loading spinner
 *
 * Analogía: Un guardia de seguridad que verifica tu identificación
 * antes de dejarte entrar a un edificio privado
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./PrivateRoute.css";

/*
 * Props del componente PrivateRoute
 */
interface PrivateRouteProps {
  children: React.ReactNode;
}

/*
 * Componente que protege rutas privadas
 *
 * @param children - Componente hijo a renderizar si está autenticado
 * @returns Redirige a /login si no autenticado, muestra loading miestras verifica o renderiza children
 *
 * Teacher note:
 * - isLoading: true mientras se verifica si hay token en el localStorage
 * - isAuthenticated: true si el usuario tiene sesión válida
 * - El flujo es: Loading -> Auth check -> Render o Redirect
 */
function PrivateRoute({ children }: PrivateRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  /*
   * Mostrar spinner mientras se verifica el token
   *
   * Teacher note:
   * - Esto evita el 'flash' de contenido no autorizado
   * - El AuthContext hace la verificación en su useEffect inicial
   */
  if (isLoading) {
    return (
      <div className="private-route-loading">
        <div className="spinner"></div>
        <p className="loading-text">Verificando sesión...</p>
      </div>
    );
  }

  /*
   * Si no está autenticado, redirigir a login
   *
   * Teacher note:
   * - Navigate con replace=true previene volver atrás con botón del navegador
   * - Esto evita quedar atrapado en un loop de redirección
   */
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  /*
   * Si está autenticado, renderizar el componente hijo
   *
   * Teacher note:
   * - children puede ser cualquier compoenente (Dashboard, Settings, etc.)
   * - Este patrón se llama "render props" o "children as function"
   */
  return <>{children}</>;
}

export default PrivateRoute;
