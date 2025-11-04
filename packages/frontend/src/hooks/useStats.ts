/*
 * Hook personalizado para estadísticas del usuario
 *
 * Teacher note:
 * - Maneja loading, error y datos
 * - Separa lógica de UI (componente solo renderiza)
 * - Expone refetch() para actualizar manualmente
 * - Facilita testing (mock del hook, no del componente)
 *
 * Analogía: useStats es como un gerente que pide reportes al mensajero (statService)
 * y los mantiene actualizados para mostrárselos al jefe (componente)
 */

import { useState, useEffect, useCallback } from "react";
import { getUserStats } from "../services/statsService";
import { UserStats } from "@pomodorise/shared";

/*
 * Estado del hook useStats
 *
 * Teacher note:
 * - stats: datos del usuario (null si aún no cargo)
 * - isLoading: true durante la petición HTTP
 * - error: guarda el error si algo falla
 * - refetch: funcion para recargar manualmente
 */
interface UseStatsReturn {
  stats: UserStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/*
 * Hook useStats
 *
 * @returns Estado de las estadísticas (stats, loading, error, refetch)
 *
 * @example
 * function Dashboard() {
 *    const { stats, isLoading, error, refetch } = useState();
 *
 *    if (isLoading) return <p>Cargando...</p>;
 *    if (error) return <p>Error: {error.message}</p>
 *
 *    return <div>Total sesiones: {stats?.totalSessions}</div>
 * }
 *
 * Teacher note:
 * - Se ejecuta automáticamente al montar el componente (useEffect con [])
 * - refetch() permite actualizar después de completar una sesión
 * - Error handling básico (se puede mejorar con toast global)
 */
export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /*
   * Obtener estadísticas del backend
   *
   * Teacher note:
   * - Función async para poder usar await
   * - Maneja estados de loading y error
   * - useCallback para evitar recrear la función en cada render
   */
  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getUserStats();
      setStats(data);
    } catch (err: any) {
      console.error("❌ Error al cargar estadísticas:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /*
   * Cargar stats al montar el componente
   *
   * Teacher note:
   * - useEffect con array vacío [] se ejecuta solo una vez (al montar)
   * - Similar al patrón en AuthContext para getCurrentUser
   */
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}
