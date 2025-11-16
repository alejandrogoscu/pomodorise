import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Register.css";
import "../Form.css";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    canfirmPassword?: string;
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
      errors.password = "La contraseña debe de tener al menos 6 caracteres";
    }

    if (!confirmPassword) {
      errors.canfirmPassword = "Confirma tu contraseña";
    } else if (password !== confirmPassword) {
      errors.canfirmPassword = "Las contraseñas no coinciden";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, name || undefined);

      navigate("/dashboard");
    } catch (err: any) {
      console.error("Error en registro:", err);

      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status === 409) {
        setError("Este email ya está registrado");
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
    <div className="register-page">
      <div className="register-container">
        <h1 className="register-title">PomodoRise</h1>
        <p className="register-subtitle">Crea tu cuenta</p>

        {/* Mensaje de error general */}
        {error && <div className="form-alert error">{error}</div>}

        <form className="form" onSubmit={handleSubmit}>
          {/* Campo Name (opcional) */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* Campo Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`form-input ${fieldErrors.email ? error : ""}`}
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
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            {fieldErrors.password && (
              <span className="form-error">{fieldErrors.password}</span>
            )}
          </div>

          {/* Campo ConfirmPassword */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirma contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={`form-input ${
                fieldErrors.canfirmPassword ? "error" : ""
              }`}
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
            {fieldErrors && (
              <span className="form-error">{fieldErrors.canfirmPassword}</span>
            )}
          </div>

          {/* Botón Submit */}
          <button className="form-button" type="submit" disabled={isLoading}>
            {isLoading && <div className="button-spinner"></div>}
            {isLoading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        {/* Link a login */}
        <div className="form-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
