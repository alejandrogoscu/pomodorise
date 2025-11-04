/*
 * Componente Timer - Interfaz visual del Pomodoro
 *
 * Teacher note:
 * - Componente presentacional (no maneja lógica de negocio) solo renderiza
 * - Usa el hook useTimer para obtener estado y acciones
 * - Usa callbacks para notificar eventos al componente padre
 * - SVG para el círculo de progreso animado
 * - CSS separado para mantener componente limpio
 *
 * Analogía: El Timer es como un reloj en la pared (solo muestra)
 * mientras que useTimer es el mecanismo interno (hace funcionar)
 */

import { useCallback, useState } from "react";
import { useTimer /* TimerType */ } from "../../hooks/useTimer";
import { useAuth } from "../../context/AuthContext";
import { formatTime, calculateProgress } from "../../utils/timeFormat";
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
 * Componente Timer
 *
 * Teacher note:
 * - Integra callbacks para manejar eventos de sesiones
 * - Muestra feedback visual durante creación de sesión (loading)
 * - Modifica cuando se completa una sesión (puntos, nivel, racha)
 */
function Timer() {
  const { updateUser } = useAuth();
  const [toast, setToast] = useState<ToastNotification | null>(null);

  /*
   * Callbacks para manejar eventos de sesiones
   *
   * Teacher note:
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
          message: `¡Sesión completada! +${result.pointsEarned} puntos. Nivel ${result.user.level} • Racha ${result.user.streak}`,
        });
      } else {
        setToast({
          type: "info",
          message: "Descanso completado. ¡Listo para continuar!",
        });
      }
    },
    [updateUser]
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
   * Inicializar hook con callbacks
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
        return "var(--color-primary)";
      case "break":
      case "long_break":
        return "var(--color-success)";
      default:
        return "var(--color-primary)";
    }
  };

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

      {/* Círculo de progreso SVG */}
      <div className="timer-circle-container">
        <svg
          className="timer-circle"
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
          <span className="timer time">{formatTime(timeLeft)}</span>
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
          >
            {status === "completed" ? "Reiniciar" : "Iniciar"}
          </button>
        ) : status === "running" ? (
          <button
            className="timer-button timer-button-warning"
            onClick={pause}
            disabled={isCreatingSession}
          >
            Pausar
          </button>
        ) : (
          <button
            className="timer-button timer-button-primary"
            onClick={start}
            disabled={isCreatingSession}
          >
            Continuar
          </button>
        )}

        {/* Botón Reset (solo visible si no está idle) */}
        {status !== "idle" && (
          <button
            className="timer-button timer-button-secondary"
            onClick={reset}
            disabled={isCreatingSession}
          >
            Reiniciar
          </button>
        )}

        {/* Botón Skip */}
        <button
          className="timer-button timer-button-secondary"
          onClick={skip}
          disabled={isCreatingSession}
        >
          Saltar
        </button>
      </div>

      {/* Indicador visual del estado */}
      <div className={`timer-indicator timer-indicator-${status}`}>
        {status === "running" && !isCreatingSession && (
          <span className="timer-pulse">●</span>
        )}
        {isCreatingSession && (
          <span className="timer-loading">Conectando con servidor...</span>
        )}
      </div>
    </div>
  );
}

export default Timer;
