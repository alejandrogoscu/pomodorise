/*
 * Página del Dashboard (usando contexto de auth)
 *
 * Teacher note:
 * - Ahora usamos useAuth() para obtener datos del usuario
 * - logout() viene del contexto (no necesitamos implementarlo aqui)
 */

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /*
   * Manejar cierre de sesión
   *
   * Teacher note:
   * - logout() limpia el estado y localStorage
   * - navigate() redirige a login después de cerrar sesión
   */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dasboard</h1>

        <div className="header-user">
          <span className="user-name">{user?.name || user?.email}</span>

          <button className="logout-button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-card">
          <h2>Hola, {user?.name || "Usuario"}</h2>

          <div className="user-stats">
            <div className="stat-item">
              <span className="stat-label">Nivel</span>
              <span className="stat-value">{user?.level}</span>
            </div>

            <div className="stat-item">
              <span className="stat-label">Puntos</span>
              <span className="stat-value">{user?.points}</span>
            </div>

            <div className="stat-item">
              <span className="stat-label">Racha</span>
              <span className="stat-value">{user?.streak}</span>
            </div>
          </div>

          <p style={{ marginTop: "2rem", color: "#666" }}>
            Dashboard en construcción...
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
