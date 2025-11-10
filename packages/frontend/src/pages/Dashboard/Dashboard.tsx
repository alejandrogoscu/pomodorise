// ...existing code...

import { useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useStats } from "../../hooks/useStats";
import { useNavigate } from "react-router-dom";
import UserProfile from "../../components/UserProfile/UserProfile";
import Timer, { TimerHandle } from "../../components/Timer/Timer";
import TaskList, { TaskListHandle } from "../../components/TaskList/TaskList"; //
import SessionsChart from "../../components/Stats/SessionsChart";
import StatsCard from "../../components/StatsCard/StatsCard";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { stats, isLoading: statsLoading, error: statsError } = useStats(); //
  const navigate = useNavigate();

  /*
   * Ref para acceder a TaskList y llamar a loadTasks
   *
   * Teacher note:
   * - Usar tipo TaskListHandle exportado desde TaskList
   * - React.RefObject<TaskListHandle> es el tipo correcto
   */
  const taskListRef = useRef<TaskListHandle>(null);
  const timerRef = useRef<TimerHandle>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /*
   * Callback cuando Timer completa un pomodoro work
   *
   * Teacher note:
   * - Timer notifica → Dashboard refresca TaskList
   * - Mantiene lista sincronizada con completedPomodoros actualizados
   */
  const handlePomodoroCompleted = () => {
    taskListRef.current?.loadTasks();
  };

  /*
   * Callback cuando TaskList crea/actualiza una tarea
   *
   * Teacher note:
   * - TaskList notifica -> Dashboard refresca selector de Timer
   * - Permite seleccionar tarea recién creada sin recargar página
   */
  const handleTaskListChange = () => {
    timerRef.current?.reloadTasks();
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1 className="dashboard-title">PomodoRise</h1>
        <div className="header-user">
          <span className="user-name">{user?.name || user?.email}</span>
          <button className="logout-button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-grid-profile">
          <UserProfile />
        </section>

        <section className="dashboard-grid-timer">
          <Timer ref={timerRef} onPomodoroCompleted={handlePomodoroCompleted} />
        </section>

        <section className="dashboard-grid-tasks">
          <TaskList ref={taskListRef} onTaskChange={handleTaskListChange} />
        </section>

        <section className="dashboard-grid-chart">
          {statsLoading ? (
            <div className="dashboard-loading-card">
              <div className="spinner" />
              <p>Cargando estadísticas...</p>
            </div>
          ) : statsError ? ( // 👈 Corregir nombre variable
            <div className="dashboard-error-card">
              <p>Error al cargar gráfico</p>
            </div>
          ) : (
            <SessionsChart data={stats?.sessionsPerDay || []} />
          )}
        </section>

        <section className="dashboard-grid-stats">
          {statsLoading ? (
            <div className="dashboard-loading-card">
              <div className="spinner" />
            </div>
          ) : statsError ? ( // 👈 Corregir nombre variable
            <div className="dashboard-error-card">
              <p>Error al cargar stats</p>
            </div>
          ) : stats ? (
            <>
              <StatsCard
                icon="🎯"
                label="Total sesiones"
                value={stats.totalSessions}
              />
              <StatsCard
                icon="⏱️"
                label="Minutos totales"
                value={stats.totalMinutes}
              />
              <StatsCard
                icon="⏲️"
                label="Pomodoros"
                value={stats.completedPomodoros}
              />
            </>
          ) : null}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
