/*
 * Rutas de Sesiones
 *
 * Define los endpoints para crear, completar y consultar sesiones
 *
 * Teacher note:
 * - Todas las rutas requieren autenticación (middleware protect)
 * - Prefijo base: /api/sessions (se monta en index.ts)
 */

import { Router } from "express";
import {
  getSessions,
  createSession,
  completeSession,
  getSessionStats,
} from "../controllers/sessionController";
import { protect } from "../middlewares/auth";

const router: Router = Router();

// Todas las rutas requieren autenticación
router.use(protect);

/*
 * GET /api/sessions
 * Obtiene el historial de sesiones del usuario
 * Query params: ?completed=true&limit=50
 */
router.get("/", getSessions);

/*
 * POST /api/sessions
 * Crea una nueva sesión (iniciada pero no completada)
 * Body: CreateSessionDTO
 */
router.post("/", createSession);

/*
 * PATCH /api/sessions/:id/complete
 * Marca una sesión como completada y calcula puntos
 *
 * Teacher note:
 * - Endpoint crítico: actualiza puntos, nivel, racha y tarea
 * - Considera usar transacciones para garantizar atomicidad
 */
router.patch("/:id/complete", completeSession);

/*
 * GET /api/sessions/stats
 * Obtiene estadísticas agregadas de sesiones
 */
router.get("/stats", getSessionStats);

export default router;
