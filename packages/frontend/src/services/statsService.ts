/*
 * Servicio de estadísticas - centraliza llamadas a la API de stats
 *
 * Teacher note:
 * - Separa lógica de red de componentes (facilita testing)
 * - Similar a taskService y sessionService
 * - Usa UserStats de shared (single source of truth)
 *
 * Analogía: statsService es como el mensajero que trae el reporte de desempeño
 */

import api from "./api";
import { UserStats } from "@pomodorise/shared";

/*
 * Obtiene las estadísticas del usuario autenticado
 *
 * @returns Estadísticas del usuario
 *
 * @example
 * const stats = await getUserStats();
 * console.log('Total sesiones:', stats.totalSessions);
 *
 * Teacher note:
 * - GET /api/stats
 * - Requiere token JWT (manejado por interceptor de axios)
 * - Backend calcula todo, frontend solo muestra
 * - UserStats garantiza que frontend y backend hablan el mismo "idioma"
 */
export const getUserStats = async (): Promise<UserStats> => {
  const response = await api.get<{ data: UserStats }>("/api/stats");
  return response.data.data;
};
