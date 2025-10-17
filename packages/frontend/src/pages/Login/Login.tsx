/*
 * Página de Login (esqueleto)
 *
 * Teacher note:
 * - Por ahora solo renderiza un título
 * - En la siguiente micro-subfase añadiremos el formulario
 */

import "./Login.css";

const Login = () => {
  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">PomodoRise</h1>
        <p className="login-subtitle">Inicia seisón para continuar</p>
        {/* Formulario se añadirá en micro-subfase 3.6.4 */}
      </div>
    </div>
  );
};

export default Login;
