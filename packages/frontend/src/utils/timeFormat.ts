/*
 * Utilidades para formatear tiempo
 *
 * Teacher note:
 * - Separar formateo en una utilidad facilita testing
 * - Reutilizable en otros compoenentes (historial, estadísticas)
 * - Devuelve formato MM:SS (ej: 25:00, 05:30)
 */

/*
 * Formatea segundos a formato MM:SS
 *
 * @param totalSeconds - Total de segundos a formatear
 * @returns String en formato "MM:SS"
 *
 * @example
 * formatTime(125) // "02:05"
 * formatTime(3600) // "60:00"
 *
 * Teacher note:
 * - Math.floor() descarta decimales
 * - padStart() añade cero inicial si es menor a 10
 * - Divide entre 60 para convertir segundos a minutos
 */
export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

/*
 * Calcula el porcentaje de progreso del timer
 *
 * @param timeLeft - Segundos restantes
 * @param totalTime - Duración total de la sesión
 * @returns Porcentaje de progreso (0-100)
 *
 * Teacher note:
 * - Se usa para la barra cricular de progreso
 * - Invertido: 100% al inicio, 0% al final
 */
export function calculateProgress(timeLeft: number, totalTime: number): number {
  if (totalTime === 0) return 0;
  return ((totalTime - timeLeft) / totalTime) * 100;
}
