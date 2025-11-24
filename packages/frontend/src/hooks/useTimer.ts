import { useState, useEffect, useRef, useCallback } from "react";
import * as sessionService from "../services/sessionService";
import { playSound, preloadSound } from "../utils/audio";

export type TimerType = "work" | "break" | "long_break";

export type TimerStatus = "idle" | "running" | "paused" | "completed";

const DURATIONS: Record<TimerType, number> = {
  work: 25 * 60,
  break: 5 * 60,
  long_break: 15 * 60,
};

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

export function useTimer(options: UseTimerOptions = {}) {
  const { taskId, onComplete, onSessionCreated, onError } = options;

  const [timeLeft, setTimeLeft] = useState<number>(DURATIONS.work);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [type, setType] = useState<TimerType>("work");
  const [completedPomodoros, setCompletedPomodoros] = useState<number>(0);

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalTime = DURATIONS[type];

  useEffect(() => {
    preloadSound("pomodoro-complete");
    preloadSound("break-complete");
  });

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const createSessionInBackend = useCallback(async () => {
    try {
      setIsCreatingSession(true);

      const session = await sessionService.createSession({
        duration: Math.floor(totalTime / 60), // Convertir segundos a minutos
        type,
        taskId,
      });

      setCurrentSessionId(session._id);

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

  const completeSessionInBackend = useCallback(async () => {
    if (!currentSessionId) return;

    try {
      const result = await sessionService.completeSession(currentSessionId);

      try {
        const soundType =
          type === "work" ? "pomodoro-complete" : "break-complete";
        await playSound(soundType);
      } catch (audioError) {
        console.warn("⚠️ No se pudo reproducir el sonido:", audioError);
      }

      if (onComplete) {
        onComplete({
          type,
          pointsEarned: result.pointsEarned,
          user: result.user,
        });
      }

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

  const start = useCallback(() => {
    if (status === "idle") {
      createSessionInBackend();
    }

    setStatus("running");
  }, [status, createSessionInBackend]);

  const pause = useCallback(() => {
    setStatus("paused");
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setType("work");
    setTimeLeft(DURATIONS.work);
    setCurrentSessionId(null);
  }, []);

  const handleSessionComplete = useCallback(() => {
    if (type === "work") {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);

      if (newCount % 4 === 0) {
        setType("long_break");
        setTimeLeft(DURATIONS.long_break);
      } else {
        setType("break");
        setTimeLeft(DURATIONS.break);
      }
    } else {
      setType("work");
      setTimeLeft(DURATIONS.work);
    }

    setStatus("idle");
  }, [type, completedPomodoros]);

  const skip = useCallback(() => {
    handleSessionComplete();
  }, [handleSessionComplete]);

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

      setStatus("completed");

      completeSessionInBackend();

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
    timeLeft,
    totalTime,
    status,
    type,
    completedPomodoros,

    currentSessionId,
    isCreatingSession,

    start,
    pause,
    reset,
    skip,
  };
}
