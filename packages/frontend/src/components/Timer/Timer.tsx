/*
 * Componente Timer - Interfaz visual del Pomodoro
 *
 * Teacher note:
 * - Componente presentacional (no maneja lógica de negocio) solo renderiza
 * - Usa el hook useTimer para obtener estado y acciones
 * - Usa callbacks para notificar eventos al componente padre
 * - SVG para el círculo de progreso animado
 * - CSS separado para mantener componente limpio
 * - Selector de tarea para vincular sesiones con tareas
 *
 * Analogía: El Timer es como un reloj en la pared (solo muestra)
 * mientras que useTimer es el mecanismo interno (hace funcionar)
 */

import { useCallback, useState, useEffect } from "react";
import { useTimer } from "../../hooks/useTimer";
import { useAuth } from "../../context/AuthContext";
import { formatTime, calculateProgress } from "../../utils/timeFormat";
import { getTasks } from "../../services/taskService";
import { ITask, TaskStatus } from "@pomodorise/shared";
import Toast from "../Toast/Toast";
import "./Timer.css";

/*
 * Tipo para notificaciones Toast
 */
interface ToastNotification {
  message: string;
  type: "success" | "error" | "info";
}

/*
 * Props del componente Timer
 *
 * Teacher note:
 * - onPomodoroCompleted: callback cuando se completa un pomodoro work
 * - Permite al Dashboard refrescar TaskList sin acoplar componentes
 */
interface TimerProps {
  onPomodoroCompleted?: () => void;
}

/*
 * Componente Timer
 *
 * Teacher note:
 * - Integra callbacks para manejar eventos de sesiones
 * - Muestra feedback visual durante creación de sesión (loading)
 * - Notifica cuando se completa una sesión (puntos, nivel, racha)
 * - Carga tareas activas para vincular con sesiones
 * - Recibe callback para notificar al Dashboard
 */
function Timer({ onPomodoroCompleted }: TimerProps) {
  const { updateUser } = useAuth();
  const [toast, setToast] = useState<ToastNotification | null>(null);

  /*
   * Estado para selector de tareas
   *
   * Teacher note:
   * - activeTasks: solo tareas pendientes o en progreso
   * - selectedTaskId: tarea actualmente seleccionada
   * - isLoadingTask: feedback visual durante carga
   */
  const [activeTasks, setActiveTasks] = useState<ITask[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  /*
   * Carga tareas activas
   *
   * Teacher note:
   * - Extraida a funcion para poder reutilizar después de completar pomodoro
   * - Las tareas completadas no aparecen en el selector
   * - Mantiene la tarea seleccionada si sigue activa
   */
  const loadActiveTasks = useCallback(async () => {
    setIsLoadingTasks(true);

    try {
      const allTasks = await getTasks();
      const active = allTasks.filter(
        (task) =>
          task.status === TaskStatus.PENDING ||
          task.status === TaskStatus.IN_PROGRESS
      );
      setActiveTasks(active);

      // Si la tarea seleccionada ya no está activa (se completó), limpiar selección
      if (selectedTaskId && !active.find((t) => t._id === selectedTaskId)) {
        setSelectedTaskId("");
      }
    } catch (error) {
      console.error("Error al cargar tareas:", error);
      setToast({
        type: "error",
        message: "Error al cargar tareas disponibles",
      });
    } finally {
      setIsLoadingTasks(false);
    }
  }, [selectedTaskId]);

  /*
   * Cargar tareas al montar componente
   */
  useEffect(() => {
    loadActiveTasks();
  }, [loadActiveTasks]);

  /*
   * Callbacks para manejar eventos de sesiones
   *
   * Teacher note:
   * - Después de completar "work" -> recarga tareas
   * - onComplete: ejecutado cuando se completa una sesión de trabajo
   * - onSessionCreated: ejecutado cuando se crea una sesión en backend
   * - onError: maneja errores de red
   */
  const handleComplete = useCallback(
    (result: {
      type: "work" | "break" | "long_break";
      pointsEarned: number;
      user: { level: number; points: number; streak: number };
    }) => {
      // Actualizar contexto de usuario con nuevos valores
      updateUser({
        level: result.user.level,
        points: result.user.points,
        streak: result.user.streak,
      });

      // Mostrar notificación según tipo de sesión
      if (result.type === "work") {
        setToast({
          type: "success",
          message: `¡Sesión completada! +${result.pointsEarned} puntos. Nivel ${result.user.level} • Racha ${result.user.streak}. ¡Sigue así!`,
        });

        // recargar tareas para actualizar selector
        loadActiveTasks();

        // Notificar al Dashboard para refrescar TaskList
        onPomodoroCompleted?.();
      } else if (result.type === "break") {
        setToast({
          type: "info",
          message: `¡Descanso corto completado! +${result.pointsEarned} puntos.`,
        });
      } else {
        // Long_break
        setToast({
          type: "info",
          message: `¡Descanso largo completado! +${result.pointsEarned} puntos. ¡Excelente trabajo!`,
        });
      }
    },
    [updateUser, loadActiveTasks, onPomodoroCompleted]
  );

  const handleSessionCreated = useCallback((sessionId: string) => {
    console.log("Sesión creada:", sessionId);
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error("❌ Error en sesión:", error.message);
    setToast({
      type: "error",
      message: `Error: ${error.message}`,
    });
  }, []);

  /*
   * Inicializar hook con callbacks y taskId seleccionado
   *
   * Teacher note:
   * - Pasamos selectedTaskId o undefined si no hay selección
   * - useTimer se encargará de enviarlo al backend al crear sesión
   */
  const {
    timeLeft,
    totalTime,
    status,
    type,
    completedPomodoros,
    isCreatingSession,
    start,
    pause,
    reset,
    skip,
  } = useTimer({
    taskId: selectedTaskId || undefined,
    onComplete: handleComplete,
    onSessionCreated: handleSessionCreated,
    onError: handleError,
  });

  /*
   * Calcular progreso para el círculo SVG
   *
   * Teacher note:
   * - circumference: perímetro del círculo (2πr)
   * - dashoffset: controla cuánto del trazo se dibuja
   * - Invertimos el cálculo para que progrese visualmente
   */
  const radius = 120; // radio del círculo en píxeles
  const circumference = 2 * Math.PI * radius;
  const progress = calculateProgress(timeLeft, totalTime);
  const dashoffset = circumference - (progress / 100) * circumference;

  /*
   * Obtener texto según tipo de sesión
   *
   * Teacher note:
   * - Mensaje descriptivo para el usuario
   * - Más claro que solo mostrar "work", "break"
   */
  const getTypeLabel = (): string => {
    switch (type) {
      case "work":
        return "Tiempo de trabajo";
      case "break":
        return "Descanso corto";
      case "long_break":
        return "Descanso largo";
      default:
        return "Pomodoro";
    }
  };

  /*
   * Obtener color del círculo según tipo
   *
   * Teacher note:
   * - Variables CSS definidas en :root
   * - Feedback visual: trabajo (primario), descanso (éxito)
   */
  const getCircleColor = (): string => {
    switch (type) {
      case "work":
        return "var(--color-accent)";
      case "break":
      case "long_break":
        return "var(--color-hover)";
      default:
        return "var(--color-accent)";
    }
  };

  /*
   * Determinar si aplicar efecto pulse al círculo
   *
   * Teacher note:
   * - Solo cuando está corriendo y no está guardando sesión
   * - Feedback visual sutil de que el timer está activo
   */
  const shouldPulse = status === "running" && !isCreatingSession;

  return (
    <div className="timer-container">
      {/* Notificación Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header con tipo de sesión y contador de pomodoros */}
      <div className="timer-header">
        <h2 className="timer-type">{getTypeLabel()}</h2>
        <span className="timer-pomodoros">
          {completedPomodoros} completados
        </span>
      </div>

      {/* Selector de tarea */}
      <div className="timer-task-selector">
        <label htmlFor="task-select" className="timer-task-label">
          Vincular tarea
        </label>
        <select
          id="task-select"
          className="timer-task-select"
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
          disabled={isLoadingTasks || isCreatingSession || status === "running"}
        >
          <option value="">Sin tarea</option>
          {isLoadingTasks ? (
            <option disabled>Cargando tareas...</option>
          ) : activeTasks.length === 0 ? (
            <option disabled>No hay tareas activas</option>
          ) : (
            activeTasks.map((task) => (
              <option key={task._id} value={task._id}>
                {task.title} ({task.completedPomodoros}/{" "}
                {task.estimatedPomodoros})
              </option>
            ))
          )}
        </select>
      </div>

      {/* Círculo de progreso SVG con efecto pulse */}
      <div className="timer-circle-container">
        <svg
          className={`timer-circle ${shouldPulse ? "timer-circle-pulse" : ""}`}
          viewBox="0 0 300 300"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Círculo de fondo (gris claro) */}
          <circle
            className="timer-circle-bg"
            cx="150"
            cy="150"
            r={radius}
            fill="none"
            stroke="var(--color-gray-200)"
            strokeWidth="12"
          />

          {/* Círculo de progreso (animado) */}
          <circle
            className="timer-circle-progress"
            cx="150"
            cy="150"
            r={radius}
            fill="none"
            stroke={getCircleColor()}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            transform="rotate(-90 150 150)" // Empezar desde arriba
          />
        </svg>

        {/* Tiempo en el centro del cículo */}
        <div className="timer-display">
          <span className="timer-time">{formatTime(timeLeft)}</span>
          <span className="timer-status-text">
            {status === "idle" && "Listo para empezar"}
            {status === "running" && !isCreatingSession && "En progreso"}
            {status === "running" && isCreatingSession && "Guardando sesión..."}
            {status === "paused" && "En pausa"}
            {status === "completed" && "¡Completado!"}
          </span>
        </div>
      </div>

      {/* Controles */}
      <div className="timer-controls">
        {/* Botón principal: Start/Pause según estado */}
        {status === "idle" || status === "completed" ? (
          <button
            className="timer-button timer-button-primary"
            onClick={start}
            disabled={isCreatingSession}
            aria-label={status === "completed" ? "Reiniciar" : "Iniciar"}
          >
            {status === "completed" ? "⏮" : "▶"}
          </button>
        ) : status === "running" ? (
          <button
            className="timer-button timer-button-warning"
            onClick={pause}
            disabled={isCreatingSession}
            aria-label="Pausar"
          >
            ⏸
          </button>
        ) : (
          <button
            className="timer-button timer-button-primary"
            onClick={start}
            disabled={isCreatingSession}
            aria-label="Reanudar"
          >
            ▶
          </button>
        )}

        {/* Botón Reset (solo visible si no está idle) */}
        {status !== "idle" && (
          <button
            className="timer-button timer-button-secondary"
            onClick={reset}
            disabled={isCreatingSession}
            aria-label="Reiniciar"
          >
            ⏮
          </button>
        )}

        {/* Botón Skip */}
        <button
          className="timer-button timer-button-secondary"
          onClick={skip}
          disabled={isCreatingSession}
          aria-label="Saltar"
        >
          ⏭
        </button>
      </div>

      {/* Indicador visual del estado */}
      <div className={`timer-indicator timer-indicator-${status}`}>
        {isCreatingSession && (
          <span className="timer-loading">Conectando con servidor...</span>
        )}
      </div>
    </div>
  );
}

export default Timer;
