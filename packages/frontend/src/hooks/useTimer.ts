/*
 * Hook personalizado para manejar la lógica del Timer de Pomodoro
 *
 * Teacher note:
 * - Este hook NO renderiza UI, solo maneja estado y lógica
 * - Usa useEffect para el intervalo de cuenta regresiva
 * - Devuelve funciones y estado para que el componente las use
 */

import { useState, useEffect, useRef, useCallback } from "react";

/*
 * Tipos de sesión de Pomodoro
 */
export type TimerType = "work" | "break" | "long_break";

/*
 * Estados del timer
 */
export type TimerStatus = "idle" | "running" | "paused" | "completed";

/*
 * Configuración del timer (en minutos)
 *
 * Teacher note:
 * - Valores por defecto según técnica Pomodoro clásica
 * - 25 min trabajo, 5 min descanso corto, 15 min descanso largo
 */
interface TimerConfig {
  work: number;
  break: number;
  longBreak: number;
  longBreakInterval: number; // Cada cuántos pomodoros hacer descanso largo
}

const DEFAULT_CONFIG: TimerConfig = {
  work: 25,
  break: 5,
  longBreak: 15,
  longBreakInterval: 4,
};

/*
 * Interface de retorno del hook
 */
interface UseTimerReturn {
  // Estado
  timeLeft: number; // Segundos restantes
  totalTime: number; // Duración total de la sesión actual (segundos)
  status: TimerStatus;
  type: TimerType;
  completedPomodoros: number;

  // Acciones
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void; // Saltar al siguiente tipo (work -> break, etc.)

  // Configuración
  setConfig: (config: Partial<TimerConfig>) => void;
}

/*
 * Hook useTimer
 *
 * @params initialType - Tipo inicial del timer (por defecto "work")
 * @returns Estado y funciones del timer
 *
 * Teacher note:
 * - useRef para el intervalo evita re-renders innecesarios
 * - useCallback para evitar recrear funciones en cada render
 * - El timer cuenta en segundos para mayor precisión
 */
export function useTimer(initialType: TimerType = "work"): UseTimerReturn {
  // Configuración del timer
  const [config, setConfigState] = useState<TimerConfig>(DEFAULT_CONFIG);

  // Estado del timer
  const [type, setType] = useState<TimerType>(initialType);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [timeLeft, setTimeLeft] = useState(config.work * 60); // Convertir minutos a segundos
  const [totalTime, setTotalTime] = useState(config.work * 60);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  // Referencia al intervalo (no causa re-render)
  const intervalRef = useRef<number | null>(null);

  /*
   * Actualizar configuración del timer
   *
   * Teacher note:
   * - Permite personalizar duraciones desde componente padre
   * - Resetea el timer para aplicar nueva configuración
   */
  const setConfig = useCallback((newConfig: Partial<TimerConfig>) => {
    setConfigState((prev) => ({ ...prev, ...newConfig }));
  }, []);

  /*
   * Calcular duración según tipo de sesión
   *
   * Teacher note:
   * - Determina si el próximo break es corto o largo
   * - Cada 4 pomodoros -> long break
   */
  const getDuration = useCallback(
    (sessionType: TimerType): number => {
      switch (sessionType) {
        case "work":
          return config.work * 60;
        case "break":
          return config.break * 60;
        case "long_break":
          return config.longBreak * 60;
        default:
          return config.work * 60;
      }
    },
    [config]
  );

  /*
   * Iniciar el timer
   * Teacher note:
   * - Si está en pausa, continúa desde donde se pausó
   * - Si está completado o idle, reinicia
   */
  const start = useCallback(() => {
    if (status === "running") return; // Ya está corriendo

    setStatus("running");
  }, [status]);

  /*
   * Pausar el timer
   */
  const pause = useCallback(() => {
    if (status !== "running") return;

    setStatus("paused");

    // Limpiar intervalo
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [status]);

  /*
   * Resetear el timer al inicio de la seisón actual
   */
  const reset = useCallback(() => {
    setStatus("idle");
    setTimeLeft(getDuration(type));

    // Limpiar intervalo
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [type, getDuration]);

  /*
   * Saltar al siguiente tipo de sesión
   *
   * Teacher note:
   * - work -> break (o long_break si corresponde)
   * - break/long_break -> work
   * - Incrementa contador de pomodoros completados
   */
  const skip = useCallback(() => {
    let nextType: TimerType;

    if (type === "work") {
      // incrementar pomodoros completados
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);

      // Determina si es descanso largo o corto
      nextType =
        newCount % config.longBreakInterval === 0 ? "long_break" : "break";
    } else {
      // Después de cualquier break, volver a work
      nextType = "work";
    }

    const duration = getDuration(nextType);
    setType(nextType);
    setTimeLeft(duration);
    setTotalTime(duration);
    setStatus("idle");

    // Limpiar intervalo
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [type, completedPomodoros, config.longBreakInterval, getDuration]);

  /*
   * Efecto que maneja la cuenta regresiva
   *
   * Teacher note:
   * - Se ejecuta cada segundo cuando status === 'running'
   * - Decrementa timeLeft hasta llegar a 0
   * - Al completar, cambia status a 'completed'
   * - Limpia el intervalo al desmontar o cambiar estado
   */
  useEffect(() => {
    if (status !== "running") {
      // Limpiar intervalo si no está corriendo
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Crear intervalo que se ejecuta cada segundo
    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer completado
          setStatus("completed");

          // Limpiar intervalo
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    // Cleanup: limpiar intervalo al desmontar o cambiar dependencias
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status]);

  /*
   * Efecto para actualizar totalTime cuando cambia el tipo
   *
   * Teacher note:
   * - totalTime se usa para calcular el progreso (timeleft / totalTime)
   */
  useEffect(() => {
    const duration = getDuration(type);
    setTotalTime(duration);
    setTimeLeft(duration);
  }, [type, getDuration]);

  return {
    // Estado
    timeLeft,
    totalTime,
    status,
    type,
    completedPomodoros,

    // Acciones
    start,
    pause,
    reset,
    skip,

    // Configuración
    setConfig,
  };
}
