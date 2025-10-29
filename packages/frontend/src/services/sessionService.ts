/*
 * Servicio de sesiones - centraliza llamadas a la API de sesiones
 *
 * Teacher note:
 * - Similar a taskService, separa lógica de API de componentes
 * - Maneja creación, completado y obtención de sesiones
 * - Los tipos vienen de pomodorise/shared
 */

import api from "./api";
import { ISession, CreateSessionDTO } from "@pomodorise/shared";

/*
 * Crea una nueva sesión (iniciada pero no completada)
 *
 * @param data - Datos de la sesión (taskId opcional, duration, type)
 * @returns Sesión creada
 *
 * @example
 * const session = await createSession({
 *    duration: 25,
 *    type: 'work',
 *    taskId: '507f1f77bcf86cd799439011' // Opcional
 * })
 *
 * Teacher note:
 * - POST /api/sessions
 * - Se crea cuando el usuario inicia el timer
 * - pointsEarned será 0 hasta que se complete
 */
export const createSession = async (
  data: CreateSessionDTO
): Promise<ISession> => {
  const response = await api.post<{ data: ISession }>("/api/sessions", data);
  return response.data.data;
};

/*
 * Completa una sesión exitente y calcula puntos
 *
 * @param sessionId = ID de la sesión a completar
 * @returns Sesión completada con puntos + datos actualizados del usuario
 *
 * @example
 * const result = await completeSession('507f1f77bcf86cd799439011')
 * console.log('Puntos ganados:', result.pointsEarned)
 * console.log('Nuevo nivel:', result.user.level)
 *
 * Teacher note:
 * - PATCH /api/sessions/:id/complete
 * - Backend calcula puntos usando calculateSessionPoints() de shared
 * - Actualiza nivel, puntos y racha del usuario
 * - Si hay taskId, incrementa completedPomodoros de la tarea
 */
export const completeSession = async (
  sessionId: string
): Promise<{
  session: ISession;
  pointsEarned: number;
  user: { level: number; points: number; streak: number };
}> => {
  const response = await api.patch<{
    data: {
      session: ISession;
      pointsEarned: number;
      user: { level: number; points: number; streak: number };
    };
  }>(`/api/sessions/${sessionId}/complete`);
  return response.data.data;
};

/*
 * Obtiene el historial de sesiones del usuario
 *
 * @param filters - Filtros opcionales (completed, limit)
 * @returns Array de sesiones
 *
 * @example
 * const sessions = await getSessions({ completed: true, limit: 10 })
 *
 * Teacher note:
 * - GET /api/sessions?completed=true&limit=10
 * - Útil para mostrar historial y estadísticas
 * - Por ahora no lo usaremos (lo implementaremos en dashboard)
 */
export const getSessions = async (filters?: {
  completed?: boolean;
  limit?: number;
}): Promise<ISession[]> => {
  const params = new URLSearchParams();

  if (filters?.completed !== undefined) {
    params.append("completed", String(filters.completed));
  }

  if (filters?.limit) {
    params.append("limit", String(filters.limit));
  }

  const response = await api.get<{ data: ISession[] }>(
    `/api/sessions?${params.toString()}`
  );
  return response.data.data;
};
