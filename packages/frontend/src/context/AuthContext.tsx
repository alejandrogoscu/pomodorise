import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { IUser } from "@pomodorise/shared";
import * as authService from "../services/authService";

interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<IUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error("Error al verificar sesión:", error);
          localStorage.removeItem("token");
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const handleLogin = async (
    email: string,
    password: string
  ): Promise<void> => {
    try {
      const response = await authService.login({ email, password });

      localStorage.setItem("token", response.token);

      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

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

  const handleLogout = (): void => {
    authService.logout();
    setUser(null);
  };

  const handleUpdateUser = (updates: Partial<IUser>): void => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}
