/*
 * Context de Autenticación
 *
 * Proporciona estado global del usuario autenticado
 *
 * Teacher note:
 * - Context API es la forma nativa de React para estado global
 * - Para apps más grandes, considerar Zustand o Redux
 * - Este contexto se usa en toda la app via useAuth()
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { IUser } from "@pomodorise/shared";
import * as authService from "../services/authService";

/*
 * Interface del contexto de autenticación
 *
 * Teacher note:
 * - Define qué datos y funciones estarán disponibles globalmente
 * - isLoading: útil para mostrar spinners durante verificación de token
 */
interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<IUser>) => void;
}

/*
 * Crear el contexto con valor por defecto undefined
 *
 * Teacher note:
 * - undefined obliga a usar el Provider (evita bugs)
 * - El valor real se proporciona en AuthProvider
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/*
 * Props del AuthProvider
 */
interface AuthProviderProps {
  children: ReactNode;
}

/*
 * Provider del contexto de autenticación
 *
 * Teacher note:
 * - Envuelve la app en App.tsx
 * - Maneja el estado del usuario y las operaciones de auth
 * - useEffect inicial verifica si hay token guardado
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /*
   * Al montar el componente, verificar si hay sesión activa
   *
   * Teacher note:
   * - Si hay token en localStorage, intentar obtener datos del usuario
   * - Si el token expiró, el interceptor de axios redirige a /login
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          // Token inválido o expirado
          console.error("Error al verificar sesión:", error);
          localStorage.removeItem("token");
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  /*
   * Inicia sesión
   *
   * @param email - Email del usuario
   * @param password - Contraseña
   *
   * Teacher note:
   * - Llama al servicio de auth
   * - Guardar el token en localStorage
   * - Actualiza el estado con los datos del usuario
   */
  const handleLogin = async (
    email: string,
    password: string
  ): Promise<void> => {
    try {
      const response = await authService.login({ email, password });

      // Guardar token en localStorage
      localStorage.setItem("token", response.token);

      // Actualizar estado del usuario
      setUser(response.user);
    } catch (error) {
      // Propaga error para que el componente lo maneje
      throw error;
    }
  };

  /*
   * Registra un nuevo usuario
   *
   * @param email - Email del usuario
   * @param password - Contraseña
   * @param name - Nombre opcional
   *
   * Teacher note:
   * - Similar a login, pero a /register
   * - Después del registro, el usuario ya está autenticado
   */
  const handleRegister = async (
    email: string,
    password: string,
    name?: string
  ): Promise<void> => {
    try {
      const response = await authService.register({ email, password, name });

      localStorage.setItem("token", response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  /*
   * Cierra la sesión
   *
   * Teacher note:
   * - Limpia el token de localStorage
   * - Resetea el estado del usuario a null
   * - No requiere llamada al backend (stateless JWT)
   */
  const handleLogout = (): void => {
    authService.logout();
    setUser(null);
  };

  /*
   * Actualiza datos del usuario en el estado
   *
   * @params updates - Objeto parcial con campos a actualizar
   *
   * Teacher note:
   * - Útil cuando el backend devuelve datos actualizados (puntos, nivel, racha)
   * - Evita hacer una petición adicional solo para refrescar el usuario
   * - Se usa después de completar una sesión de Pomodoro
   */
  const handleUpdateUser = (updates: Partial<IUser>): void => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  /*
   * Valor del contexto que se pasa a los hijos
   *
   * Teacher note:
   * - isAuthenticated es un helper derivado de user !== null
   * - Facilita condicionales en componentes
   */
  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateUser: handleUpdateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/*
 * Hook personalizado para acceder al contexto de auth
 *
 * @returns Contexto de autenticación
 * @throws Error si se usa fuera del AuthProvider
 *
 * Teacher note:
 * - Este hook simplifica el uso del contexto
 * - En lugar de: useCOntext(AuthContext)
 * - Se usa: useAuth()
 * - El error ayuda a detectar bugs de configuración
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}
