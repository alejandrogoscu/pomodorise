/**
 * Utilidades para cálculo de puntos y gamificación
 *
 * Teacher note:
 * - Centraliza la lógica de puntos en un solo lugar
 * - Backend y frontend usan las mismas fórmulas
 * - Evita inconsistencias en cálculos
 */

/**
 * Calcula los puntos ganados por completar una sesión de Pomodoro
 *
 * @param duration - Duración de la sesión en minutos
 * @param type - Tipo de sesión (work, break, long_break)
 * @param streak - Racha actual del usuario (días consecutivos)
 * @returns Puntos ganados
 *
 * Teacher note:
 * - Pomodoros de trabajo dan más puntos que breaks
 * - La racha multiplica los puntos (incentivo)
 * - Formula: base_points * (1 + streak_bonus)
 */
export function calculateSessionPoints(
  duration: number,
  type: "work" | "break" | "long_break",
  streak: number = 0
): number {
  // Puntos base según tipo de sesión
  const basePoints: Record<typeof type, number> = {
    work: 10,
    break: 2,
    long_break: 5,
  };

  // Bonus por duración (1 punto extra por cada 5 minutos)
  const durationBonus = Math.floor(duration / 5);

  // Bonus por racha (10% más por cada día de racha, máximo 200%)
  const streakMultiplier = Math.min(1 + streak * 0.1, 3);

  // Cálculo final
  const points = (basePoints[type] + durationBonus) * streakMultiplier;

  return Math.round(points);
}

/**
 * Calcula el nivel basado en puntos totales
 *
 * @param points - Puntos totales del usuario
 * @returns Nivel actual
 *
 * Teacher note:
 * - Curva de experiencia: cada nivel requiere más puntos
 * - Formula: level = √(points / 100) + 1
 * - Nivel 1: 0-99 puntos, Nivel 2: 100-399, Nivel 3: 400-899, etc.
 */
export function calculateLevel(points: number): number {
  if (points < 0) return 1;

  // Formula de progresión exponencial suave
  const level = Math.floor(Math.sqrt(points / 100)) + 1;

  return level;
}

/**
 * Calcula puntos necesarios para el siguiente nivel
 *
 * @param currentLevel - Nivel actual del usuario
 * @returns Puntos totales necesarios para alcanzar el siguiente nivel
 */
export function pointsForNextLevel(currentLevel: number): number {
  const nextLevel = currentLevel + 1;

  // Invertir la formula de calculateLevel
  // nextLevel = √(points / 100) + 1
  // points = ((nextLevel - 1) ^ 2) * 100
  const pointsNeeded = Math.pow(nextLevel - 1, 2) * 100;

  return pointsNeeded;
}

/**
 * Calcula el progreso hacia el siguiente nivel (porcentaje)
 *
 * @param currentPoints - Puntos actuales del usuario
 * @param currentLevel - Nivel actual
 * @returns Porcentaje de progreso (0-100)
 */
export function calculateLevelProgress(
  currentPoints: number,
  currentLevel: number
): number {
  const pointsCurrentLevel = Math.pow(currentLevel - 1, 2) * 100;
  const pointsNextLevel = pointsForNextLevel(currentLevel);

  const pointsInCurrentLevel = currentPoints - pointsCurrentLevel;
  const pointsNeededForNextLevel = pointsNextLevel - pointsCurrentLevel;

  const progress = (pointsInCurrentLevel / pointsNeededForNextLevel) * 100;

  return Math.min(Math.max(Math.round(progress), 0), 100);
}

/**
 * Verifica si se debe actualizar la racha del usuario
 *
 * @param lastSessionDate - Fecha de la última sesión completada
 * @returns true si la racha continúa, false si se rompe
 *
 * Teacher note:
 * - Racha se mantiene si la última sesión fue ayer o hoy
 * - Se rompe si pasaron más de 24 horas
 */
export function shouldMaintainStreak(lastSessionDate: Date): boolean {
  const now = new Date();
  const last = new Date(lastSessionDate);

  // Normalizar a medianoche para comparar solo fechas
  now.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);

  const diffInDays = Math.floor(
    (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Racha continúa si la última sesión fue hoy o ayer
  return diffInDays <= 1;
}
