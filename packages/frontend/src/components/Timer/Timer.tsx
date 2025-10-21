/*
 * Componente Timer - Interfaz visual del Pomodoro
 *
 * Teacher note:
 * - Componente presentacional (no maneja lógica de negocio)
 * - Usa el hook useTimer para obtener estado y acciones
 * - SVG para el círculo de progreso animado
 * - CSS separado para mantener componente limpio
 *
 * Analogía: El Timer es como un reloj en la pared (solo muestra)
 * mientras que useTimer es el mecanismo interno (hace funcionar)
 */

import { useTimer, TimerType } from "../../hooks/useTimer";
import { formatTime, calculateProgress } from "../../utils/timeFormat";
import "./Timer.css";

/*
 * Props del componente Timer
 */
interface TimerProps {
  onComplete?: (type: TimerType) => void; // Callback al completar sesión
}

/*
 * Componente Timer
 *
 * @param onComplete - Función a ejecutar cuando se completa una sesión
 *
 * Teacher note:
 * - onComplete se usará para notificaciones y guardar sesión en DB
 * - Por ahora es opcional (lo implementaremos en micro subfase 4.6)
 */
function Timer({ onComplete }: TimerProps) {
  const {
    timeLeft,
    totalTime,
    status,
    type,
    completedPomodoros,
    start,
    pause,
    reset,
    skip,
  } = useTimer();

  /*
   * Ejecutar callback cuando se completa
   *
   * Teacher note:
   * - useEffect vigilará cambios en status
   * - Si status === 'completed', ejecutamos onComplete
   * - Lo implementaremos cuando integremos con backend (mmicro-subfase 4.5)
   */

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
            {status === "running" && "En progreso"}
            {status === "paused" && "En pausa"}
            {status === "completed" && "¡Completado!"}
          </span>
        </div>
      </div>

      {/* Controles */}
      <div className="timer-controls">
        {/* Botón principal: Start/Pause según estado */}
        {status === "idle" || status === "completed" ? (
          <button className="timer-button timer-button-primary" onClick={start}>
            {status === "completed" ? "Reiniciar" : "Iniciar"}
          </button>
        ) : status === "running" ? (
          <button className="timer-button timer-button-warning" onClick={pause}>
            Pausar
          </button>
        ) : (
          <button className="timer-button timer-button-primary" onClick={start}>
            Continuar
          </button>
        )}

        {/* Botón Reset (solo visible si no está idle) */}
        {status !== "idle" && (
          <button
            className="timer-button timer-button-secondary"
            onClick={reset}
          >
            Reiniciar
          </button>
        )}

        {/* Botón Skip */}
        <button className="timer-button timer-button-secondary" onClick={skip}>
          Saltar
        </button>
      </div>

      {/* Indicador visual del estado */}
      <div className={`timer-indicator timer-indicator-${status}`}>
        {status === "running" && <span className="timer-pulse">●</span>}
      </div>
    </div>
  );
}

export default Timer;
