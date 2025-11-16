import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosError,
} from "axios";

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

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

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
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
