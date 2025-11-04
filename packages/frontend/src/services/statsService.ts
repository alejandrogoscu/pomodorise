/*
 * Servicio de estadísticas - llamadas a API
 *
 * Teacher note:
 * - Separa lógica de red de componentes
 * - Similar a taskService y sessionService
 * - Centraliza endpoint /api/stats
 * - Importa UserStats de shared (no duplica tipo)
 */

import api from "./api";
import { UserStats } from "@pomodorise/shared";

/*
 * Obtiene las estadísticas del usuario atenticado
 *
 * @returns Estadísticas del usuario
 *
 * Teacher note:
 * - GET /api/stats
 * - Requiere token en headers (manejado por interceptor de axios)
 * - UserStats garantiza que frontend y backend hablan en el mismo "idioma"
 */
export const getUserStats = async (): Promise<UserStats> => {
  const response = await api.get<{ data: UserStats }>("/api/stats");
  return response.data.data;
};
