/*
 * Rutas de Tareas
 *
 * Define los endpoints para CRUD de tareas
 *
 * Teacher note:
 * - Todas las rutas requieren autenticación (middleware protect)
 * - Prefijo base: /api/tasks (se monta en index.ts)
 */

import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import {
  getTask,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  completePomodoro,
} from "../controllers/taskController";
import { protect } from "../middlewares/auth";

const router: ExpressRouter = Router();

// Todas las rutas requieren autenticación
router.use(protect);

/*
 * GET /api/tasks
 * Obtiene todas las tareas del usuario
 * Query params: ?status=prending&priority=high
 */
router.get("/", getTask);

/*
 * POST /api/tasks
 * Crea una nueva tarea
 * Body: CreateTaskDTO
 */
router.post("/", createTask);

/*
 * GET /api/tasks/:id
 * Obtiene una tarea específica
 */
router.get("/:id", getTaskById);

/*
 * PUT /api/tasks/:id
 * Actualiza una tarea
 * Body: UpdateTaskDTO
 */
router.put("/:id", updateTask);

/*
 * DELETE /api/tasks/:id
 * Elimina una tarea
 */
router.delete("/:id", deleteTask);

/*
 * PATCH /api/tasks/:id/complete-pomodoro
 * Marca un pomodoro como completado en la tarea
 *
 * Teacher note:
 * - Endpoint especializado para incrementar contador
 * - Evita tener que enviar todo el objeto en PUT
 */
router.patch("/:id/complete-pomodoro", completePomodoro);

export default router;
