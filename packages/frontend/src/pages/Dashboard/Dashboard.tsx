/*
 * Página del Dashboard - Hub principal de la aplicación
 *
 * Teacher note:
 * - Usa bento grid layout para organizar componentes por prioridad
 * - Integra useAuth() para datos del usuario y useStats() para estadísticas
 * - Componentes prioritarios: Timer, TaskList, UserProfile
 * - Componentes secundarios: SessionsChart, StatsCards
 * - Maneja estados de loading y error de forma centralizada
 *
 * Analogía: Dashboard es como el cockpit de un avión
 * (muestra todos los controles e indicadores importantes en un solo lugar)
 */

import { useAuth } from "../../context/AuthContext";
import { useStats } from "../../hooks/useStats";
import { useNavigate } from "react-router-dom";
import UserProfile from "../../components/UserProfile/UserProfile";
import Timer from "../../components/Timer/Timer";
import TaskList from "../../components/TaskList/TaskList";
import SessionsChart from "../../components/Stats/SessionsChart";
import StatsCard from "../../components/StatsCard/StatsCard";
import "./Dashboard.css";

/*
 * Componente Dashboard
 *
 * @returns Vista principal con todos los componentes organizados en bento grid
 *
 * Teacher note:
 * - useAuth() para obtener datos del usuario y logout
 * - useStats() para obtener estadísticas (loading, error, refetch)
 * - Grid CSS con áreas nombradas para layout flexible
 */
const Dashboard = () => {
  const { user, logout } = useAuth();
  const { stats, isLoading: statsLoading, error: StatsError } = useStats();
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
      {/* Header con info del usuario y logout */}
      <header className="dashboard-header">
        <h1 className="dashboard-title">PomodoRise</h1>
        <div className="header-user">
          <span className="user-name">{user?.name || user?.email}</span>
          <button className="logout-button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Contenido principal con bento grid */}
      <main className="dashboard-content">
        {/* ÁREA 1: UserProfile (prioridad alta) */}
        <section className="dashboard-grid-profile">
          <UserProfile />
        </section>

        {/* ÁREA 2: Timer (prioridad alta) */}
        <section className="dashboard-grid-timer">
          <Timer />
        </section>

        {/* ÁREA 3: TaskList (prioridad alta) */}
        <section className="dashboard-grid-tasks">
          <TaskList />
        </section>

        {/* ÁREA 4: SessionsChart (secundario) */}
        <section className="dashboard-grid-chart">
          {statsLoading ? (
            <div className="dashboard-loading-card">
              <div className="spinner" />
              <p>Cargando estadísticas...</p>
            </div>
          ) : StatsError ? (
            <div className="dashboard-error-card">
              <p>Error al cargar gráfico</p>
            </div>
          ) : (
            <SessionsChart data={stats?.sessionsPerDay || []} />
          )}
        </section>

        {/* ÁREA 5: StatsCards grid (secundario) */}
        <section className="dashboard-grid-stats">
          {statsLoading ? (
            <div className="dashboard-loading-card">
              <div className="spinner" />
            </div>
          ) : StatsError ? (
            <div className="dashboard-error-card">
              <p>Error al cargar stats</p>
            </div>
          ) : stats ? (
            <>
              <StatsCard
                icon="🎯"
                label="Total sesiones"
                value={stats.totalSessions}
                color="primary"
              />
              <StatsCard
                icon="⏱️"
                label="Minutos totales"
                value={stats.totalMinutes}
                color="success"
              />
              <StatsCard
                icon="🍅"
                label="Pomodoros"
                value={stats.completedPomodoros}
                color="warning"
              />
              <StatsCard
                icon="⭐"
                label="Puntos ganados"
                value={stats.pointsEarned}
                color="info"
              />
            </>
          ) : null}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
