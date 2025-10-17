/*
 * Servicio de autenticación
 *
 * Centraliza todas las peticiones relacionadas con auth
 *
 * Teacher note:
 * - Separa lógica de API de componentes y facilita testing
 * - Los sercicios devuelven datos crudos, el contexto maneja el estado
 * - AuthResponse viene de @pomodorise/shared
 */

import api from "./api";
import { RegisterDTO, LoginDTO, AuthResponse, IUser } from "@pomodorise/shared";

/*
 * Resgitra un nuevo usario
 *
 * @param data - Datos de registro (email, password, name)
 * @returns Datos del usuario y token JWT
 *
 * Teacher note:
 * - POST /api/auth/register
 * - El token se guarda en el localStorage desde el contexto
 */
export const register = async (data: RegisterDTO): Promise<AuthResponse> => {
  const response = await api.post<{ data: AuthResponse }>(
    "/auth/register",
    data
  );
  return response.data.data;
};

/*
 * Inicia sesión con email y contraseña
 *
 * @param data - Credenciales (email, password)
 * @returns Datos del usuario y token JWT
 *
 * Teacher note:
 * - POST /api/auth/login
 * - El backend valida contraseña con bcrypt y devuelve JWT
 */
export const login = async (data: LoginDTO): Promise<AuthResponse> => {
  const response = await api.post<{ data: AuthResponse }>("/auth/login", data);
  return response.data.data;
};

/*
 * Obtiene los datos del usuario autenticado
 *
 * @returns Datos del usuario actual
 *
 * Teacher note:
 * - GET /api/auth/me
 * - Requiere token en header Authorization (axios lo añade automáticamente)
 */
export const getCurrentUser = async (): Promise<IUser> => {
  const response = await api.get<{ data: IUser }>("/auth/me");
  return response.data.data;
};

/*
 * Cierra la sesión (limpia token)
 *
 * Teacher note:
 * - En este proyecto, logout es solo del lado del cliente
 * - En producción, considerar blacklist de tokens o tokens con TTL corto
 */
export const logout = (): void => {
  localStorage.removeItem("token");
};
