import { useState, useEffect, useCallback } from "react";
import { getUserStats } from "../services/statsService";
import { UserStats } from "@pomodorise/shared";

interface UseStatsReturn {
  stats: UserStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

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

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}
