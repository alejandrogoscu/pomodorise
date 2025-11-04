/*
 * Rutas de estadísticas
 *
 * Teacher note:
 * - Reutiliza sessionController.getSessionStats que ya existe
 * - No duplica lógica, solo expone endpoint adicional más semántico
 * - Requiere autenticación (middleware auth)
 */

import { Router } from "express";
import { getSessionStats } from "../controllers/sessionController";
import { protect } from "../middlewares/auth";

const router: Router = Router();

// Todas las rutas requieren autenticación
router.use(protect);

/*
 * GET /api/stats
 *
 * Obtiene estadísticas del usuario autenticado
 *
 * Teacher note:
 * - Alias más semántico de /api/sessions/stats
 * - Facilita escalabilidad (podemos añadir más stats aquí)
 * - Frontend solo debe importar de /api/stats
 *
 * Response:
 * {
 *   totalSessions: number,
 *   totalMinutes: number,
 *   completedPomodoros: number,
 *   averageSessionDuration: number,
 *   sessionsPerDay: { date: string, count: number }[],
 *   pointsEarned: number
 * }
 */
router.get("/", getSessionStats);

export default router;
