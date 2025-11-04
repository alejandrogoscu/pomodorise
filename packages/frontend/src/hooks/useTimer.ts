/*
 * Hook personalizado para gestión del Timer
 *
 * Teacher note:
 * - Maneja la creación y completado de sesiones en backend para todos los tipos.
 * - Usa sessionService para las llamadas a la API (separación de responsabilidades)
 * - Devuelve callbacks para notificar cambios (onComplete, onError)
 * - Separa lógica de UI (Timer.tsx solo renderiza)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import * as sessionService from "../services/sessionService";

/*
 * Tipo de sesión actual
 */
export type TimerType = "work" | "break" | "long_break";

/*
 * Estado del timer
 */
export type TimerStatus = "idle" | "running" | "paused" | "completed";

/*
 * Duración de cada tipo de sesión (en segundos)
 *
 * Teacher note:
 * - work: 25 minutos estándar de Pomodoro
 * - break: 5 minutos de descanso corto
 * - long_break: 15 minutos de descanso cada 4 pomodoros
 */
const DURATIONS: Record<TimerType, number> = {
  work: 25 * 60,
  break: 5 * 60,
  long_break: 15 * 60,
};

/*
 * Props opcionales para configurar el timer
 *
 * Teacher note:
 * - taskId: si el pomodo está asociado a una tarea
 * - onComplete: callback cuando se completa una sesión
 * - onSessionCreated: callback cuando se crea una sesión
 * - onError: callback para manejar errores de red
 */
export interface UseTimerOptions {
  taskId?: string;
  onComplete?: (result: {
    type: TimerType;
    pointsEarned: number;
    user: { level: number; points: number; streak: number };
  }) => void;
  onSessionCreated?: (sessionId: string) => void;
  onError?: (error: Error) => void;
}

/*
 * Hook useTimer con integración backend
 *
 * @param options - COnfiguración opcional (taskId, callbacks)
 * @returns Estado y métodos del timer
 *
 * Teacher note:
 * - Mantiene la misma API que antes
 * - Añade lógica de red sin afectar componentes existentes
 */
export function useTimer(options: UseTimerOptions = {}) {
  const { taskId, onComplete, onSessionCreated, onError } = options;

  // Estado del timer
  const [timeLeft, setTimeLeft] = useState<number>(DURATIONS.work);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [type, setType] = useState<TimerType>("work");
  const [completedPomodoros, setCompletedPomodoros] = useState<number>(0);

  // Estado para integración con backend
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState<boolean>(false);

  // Referencia al intervalo
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /*
   * Calcula duración total de la sesión actual
   *
   * Teacher note:
   * - Necesario para enviar al backend
   * - Se usa en createSession y para el círculo de progreso
   */
  const totalTime = DURATIONS[type];

  /*
   * Limpiar intervalo al desmontar
   */
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  /*
   * Crear sesión en el backend cuando se inicia el timer
   *
   * Teacher note:
   * - Crea sesión para todos los tipos (work, break, long_break)
   * - Usa sessionService.createSession() para separar lógica de red
   * - Backend calcula puntos según el tipo usando score.ts
   * - Esto gamifica también los descansos (2 puntos break, 5 puntos long_break)
   */
  const createSessionInBackend = useCallback(async () => {
    try {
      setIsCreatingSession(true);

      const session = await sessionService.createSession({
        duration: Math.floor(totalTime / 60), // Convertir segundos a minutos
        type,
        taskId, // Puede ser undefined si no hay tarea
      });

      setCurrentSessionId(session._id);

      // Notificar al componente padre
      if (onSessionCreated) {
        onSessionCreated(session._id);
      }

      setStatus("running");
    } catch (error: any) {
      console.error("❌ Error al crear sesión:", error);

      if (onError) {
        onError(
          new Error(
            error.response?.data?.error ||
              "Error al crear sesión en el servidor"
          )
        );
      }
    } finally {
      setIsCreatingSession(false);
    }
  }, [type, totalTime, taskId, onSessionCreated, onError]);

  /*
   * Completar sesión en el backend cuando finaliza el timer
   *
   * Teacher note:
   * - Completa sesiones de todos los tipos
   * - Obtiene puntos ganados y datos actualizados del usuario
   * - Limpia el sessionId después de completar
   */
  const completeSessionInBackend = useCallback(async () => {
    if (!currentSessionId) return;

    try {
      const result = await sessionService.completeSession(currentSessionId);

      console.log("Session completada:", {
        puntos: result.pointsEarned,
        nivel: result.user.level,
        racha: result.user.streak,
      });

      // Notificar completado
      if (onComplete) {
        onComplete({
          type,
          pointsEarned: result.pointsEarned,
          user: result.user,
        });
      }

      // Limpiar sessionId
      setCurrentSessionId(null);
    } catch (error: any) {
      console.error("❌ Error al completar sesión:", error);

      if (onError) {
        onError(
          new Error(
            error.response?.data?.error ||
              "Error al completar sesión en el servidor"
          )
        );
      }
    }
  }, [currentSessionId, type, onComplete, onError]);

  /*
   * Iniciar o reanudar el timer
   *
   * Teacher note:
   * - Si es la primera vez (idle), crea sesión en el backend
   * - Si está pausado, solo reanuda (no crea otra sesión)
   */
  const start = useCallback(() => {
    // Si está idle, crear sesión en backend
    if (status === "idle") {
      createSessionInBackend();
    }

    setStatus("running");
  }, [status, createSessionInBackend]);

  /*
   * Pausar el timer
   */
  const pause = useCallback(() => {
    setStatus("paused");
  }, []);

  /*
   * Resetear el timer
   *
   * Teacher note:
   * - Limpia sessionId (sesión cancelada, no se completa)
   * - Vuelve al estado inicial
   */
  const reset = useCallback(() => {
    setStatus("idle");
    setType("work");
    setTimeLeft(DURATIONS.work);
    setCurrentSessionId(null);
  }, []);

  /*
   * Manejar completado de sesión y cambio de tipo
   *
   * Teacher note:
   * - Después de 4 pomodoros -> descanso largo
   * - De lo contrario: work -> break -> work
   */
  const handleSessionComplete = useCallback(() => {
    if (type === "work") {
      // Incrementar contador de pomodoros completados
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);

      // Después de 4 pomodoros -> long_break
      if (newCount % 4 === 0) {
        setType("long_break");
        setTimeLeft(DURATIONS.long_break);
      } else {
        setType("break");
        setTimeLeft(DURATIONS.break);
      }
    } else {
      // Después de break -> volver a work
      setType("work");
      setTimeLeft(DURATIONS.work);
    }

    setStatus("idle");
  }, [type, completedPomodoros]);

  /*
   * Saltar al siguiente tipo de sesión
   */
  const skip = useCallback(() => {
    handleSessionComplete();
  }, [handleSessionComplete]);

  /*
   * Efecto: countdown del timer
   *
   * Teacher note:
   * - Ahora completa sesión en backend cuando llega a 0
   * - Espera a que se complete antes de cambiar de tipo
   */
  useEffect(() => {
    if (status === "running" && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (status === "running" && timeLeft === 0) {
      console.log(
        "Timer terminado intentando completar session:",
        currentSessionId
      );
      // Timer completado
      setStatus("completed");

      // Completar sesión en backend (async, no bloqueante)
      completeSessionInBackend();

      // Auto-cambio de tipo después de 2 segundos
      setTimeout(() => {
        handleSessionComplete();
      }, 2000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status, timeLeft, completeSessionInBackend, handleSessionComplete]);

  return {
    // Estado del timer
    timeLeft,
    totalTime,
    status,
    type,
    completedPomodoros,

    // Estados de backend
    currentSessionId,
    isCreatingSession,

    // Acciones
    start,
    pause,
    reset,
    skip,
  };
}
