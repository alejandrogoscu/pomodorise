/*
 * Página del Dashboard (esqueleto)
 *
 * Teacher note:
 * - Esta página estará protegida (requiere autenticación)
 * - Por ahora solo muestra un mensaje de bienvenida
 */

import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <button className="logout-button">Cerrar sesión</button>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-card">
          <h2>Bienvenido a PomodoRise</h2>
          <p>Dashboard en contrucción...</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
