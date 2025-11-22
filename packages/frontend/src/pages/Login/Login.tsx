import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PomodoriseLogo from "/PomodoriseLogo.webp";
import "./Login.css";
import "../Form.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = "El email es obligatorio";
    } else if (!emailRegex.test(email)) {
      errors.email = "Email inválido";
    }

    if (!password) {
      errors.password = "La contraseña es obligatoria";
    } else if (password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setFieldErrors({});

    if (!validateForm) {
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);

      navigate("/dashboard");
    } catch (err: any) {
      console.error("Error en login:", err);

      if (err.code === "ECONNABORTED") {
        setError(
          "El servidor está tardando en responder. Por favor, intenta de nuevo en unos segundos"
        );
      } else if (err.response?.data?.error) {
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
        <div className="login-header">
          <img
            className="login-logo"
            src={PomodoriseLogo}
            alt="PomodoRise Logo"
          />
          <h1 className="login-title">PomodoRise</h1>
        </div>
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
