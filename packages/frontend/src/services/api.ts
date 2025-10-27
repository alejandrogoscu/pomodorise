/*
 * Configuración de Axios para comunicarse con el backend
 *
 * Teacher note:
 * - Axios es un cliente HTTP más cómodo que fetch
 * - Los interceptors permiten añadir tokens automáticamente
 * - Centralizamos la URL base para facilitar cambios
 */

import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";

/*
 * Instancia de Axios configurada con URL base
 *
 * Teacher note:
 * - import.meta.env solo funciona en Vite (no en Node)
 * - VITE_API_URL se lee del archivo .env
 * - timeout: 10s (ajustar según necesidad)
 */
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/*
 * Interceptor de peticiones: añade token JWT si existe
 *
 * Teacher note:
 * - El token se guarda en localStorage después del login
 * - Se añade automáticamente el header Authorization
 * - Formato: "Bearer <token>"
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/*
 * Interceptor de respuestas: maneja errores globalmente
 *
 * Teacher note:
 * - 401: token inválido o expirado -> redirigir a login
 * - 401: sin permisos -> monstrar mensaje
 * - 500: error del servidor -> mostrar mensaje genérico
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        // Token inválido o expirado
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      if (status === 403) {
        console.error("No tienes permisos para realizar esta acción");
      }

      if (status === 500) {
        console.error("Error del servidor. Intenta más tarde");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
