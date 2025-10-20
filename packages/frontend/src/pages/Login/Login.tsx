/*
 * Página de Login
 *
 * Teacher note:
 * - Usa useState para manejar inputs y errores
 * - Integra con AuthContext para login
 * - Validación básica antes de enviar (email format, passwors length)
 * - Muestra loading en botón durante petición
 * - Redirige a /dashboard después de login exitoso
 */

import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";
import "../Form.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Estado del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estado de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Errores de validación por campo
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  /*
   * Validar campos del formulario
   *
   * Teacher note:
   * - Validación básica en el cliente (UX)
   * - El backend también valida (seguridad)
   * - Regex simple para email (no 100% preciso, pero suficiente)
   */
  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = "El email es obligatorio";
    } else if (!emailRegex.test(email)) {
      errors.email = "Email inválido";
    }

    // Validar password
    if (!password) {
      errors.password = "La contraseña es obligatoria";
    } else if (password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /*
   * Manejar submit del formulario
   * Teacher note:
   * - preventDefault() evita recarga de página
   * - Validamos antes de hacer la petición
   * - Usamos try/catch para errores de red o del backend
   * - Mostramos mensajes de error amigables al usuario
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Limpiar errores previos
    setError("");
    setFieldErrors({});

    // Validar formulario
    if (!validateForm) {
      return;
    }

    setIsLoading(true);

    try {
      // Llamar al contexto de auth (que llama al servicio)
      await login(email, password);

      // Si llega aquí, login exitoso -> redirigir a dashboard
      navigate("/dashboard");
    } catch (err: any) {
      // Maneja errores del backend
      console.error("Error en login:", err);

      // Mostrar mensaje de error amigable
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status === 401) {
        setError("Email o contraseña incorrectos");
      } else if (err.response?.status >= 500) {
        setError("Error del servidor. Intenta más tarde");
      } else {
        setError("Error de conexión. Verifica tu internet");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">PomodoRise</h1>
        <p className="login-subtitle">Inicia sesión para continuar</p>

        {/* Mensaje de error general */}
        {error && <div className="form-alert error">{error}</div>}

        <form className="form" onSubmit={handleSubmit}>
          {/* Campo Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`form-input ${fieldErrors.email ? "error" : ""}`}
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            {fieldErrors.email && (
              <span className="form-error">{fieldErrors.email}</span>
            )}
          </div>

          {/* Campo Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className={`form-input ${fieldErrors.password ? "error" : ""}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            {fieldErrors.password && (
              <span className="form-error">{fieldErrors.password}</span>
            )}
          </div>

          {/* Batón Submit */}
          <button type="submit" className="form-button" disabled={isLoading}>
            {isLoading && <div className="button-spinner"></div>}
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        {/* Link a registro */}
        <div className="form-footer">
          ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
