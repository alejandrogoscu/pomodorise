import {
  useCallback,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useTimer } from "../../hooks/useTimer";
import { useAuth } from "../../context/AuthContext";
import { formatTime, calculateProgress } from "../../utils/timeFormat";
import { getTasks } from "../../services/taskService";
import { ITask, TaskStatus } from "@pomodorise/shared";
import { useToast } from "../../context/ToastContext";
import "./Timer.css";

interface TimerProps {
  onPomodoroCompleted?: () => void;
}

export interface TimerHandle {
  reloadTasks: () => Promise<void>;
}

const Timer = forwardRef<TimerHandle, TimerProps>(
  ({ onPomodoroCompleted }, ref) => {
    const { updateUser } = useAuth();
    const { showToast } = useToast();

    const [activeTasks, setActiveTasks] = useState<ITask[]>([]);
    const [selectedTaskId, setSelectedTaskId] = useState<string>("");
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);

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

        if (selectedTaskId && !active.find((t) => t._id === selectedTaskId)) {
          setSelectedTaskId("");
        }
      } catch (error) {
        console.error("Error al cargar tareas:", error);

        showToast("Error al cargar tareas disponibles", "error");
      } finally {
        setIsLoadingTasks(false);
      }
    }, [selectedTaskId, showToast]);

    useImperativeHandle(ref, () => ({
      reloadTasks: loadActiveTasks,
    }));

    useEffect(() => {
      loadActiveTasks();
    }, [loadActiveTasks]);

    const handleComplete = useCallback(
      (result: {
        type: "work" | "break" | "long_break";
        pointsEarned: number;
        user: { level: number; points: number; streak: number };
      }) => {
        updateUser({
          level: result.user.level,
          points: result.user.points,
          streak: result.user.streak,
        });

        if (result.type === "work") {
          showToast(
            `¡Sesión completada! +${result.pointsEarned} puntos. Nivel ${result.user.level} • Racha ${result.user.streak}. ¡Sigue así!`,
            "success"
          );

          loadActiveTasks();

          onPomodoroCompleted?.();
        } else if (result.type === "break") {
          showToast(
            `¡Descanso corto completado! +${result.pointsEarned} puntos.`,
            "info"
          );
        } else {
          showToast(
            `¡Descanso largo completado! +${result.pointsEarned} puntos. ¡Excelente trabajo!`,
            "info"
          );
        }
      },
      [updateUser, loadActiveTasks, onPomodoroCompleted, showToast]
    );

    const handleSessionCreated = useCallback((sessionId: string) => {
      console.log("Sesión creada:", sessionId);
    }, []);

    const handleError = useCallback(
      (error: Error) => {
        console.error("❌ Error en sesión:", error.message);
        showToast(`Error: ${error.message}`, "error");
      },
      [showToast]
    );

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

    const radius = 120; // radio del círculo en píxeles
    const circumference = 2 * Math.PI * radius;
    const progress = calculateProgress(timeLeft, totalTime);
    const dashoffset = circumference - (progress / 100) * circumference;

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

    const shouldPulse = status === "running" && !isCreatingSession;

    return (
      <div className="timer-container">
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
            disabled={
              isLoadingTasks ||
              isCreatingSession ||
              status === "running" ||
              type !== "work"
            }
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
            className={`timer-circle ${
              shouldPulse ? "timer-circle-pulse" : ""
            }`}
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
              {status === "running" &&
                isCreatingSession &&
                "Guardando sesión..."}
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
);

Timer.displayName = "Timer";

export default Timer;
