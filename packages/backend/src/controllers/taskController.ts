/*
 * Controlador de Tareas (CRUD completo)
 *
 * Maneja la lógica de negocio para crear, leer, actualizar y eliminar tareas
 *
 * Teacher note:
 * - Todas las rutas requieren autenticación (middleware protect)
 * - Solo se permite acceso a tareas del usuario autenticado
 * - Usamos tipos de @pomodorise/shared para DTOs
 */

import { Response } from "express";
import Task from "../models/Task";
import { AuthRequest } from "./authController";
import { CreateTaskDTO, UpdateTaskDTO, TaskStatus } from "@pomodorise/shared";

/*
 * Constantes de validación
 *
 * Teacher note:
 * - Centralizadas para fácil modificación
 * - Coherentes con frontend (MIN_POMODOROS, MAX_POMODOROS)
 */
const MIN_POMODOROS = 1;
const MAX_POMODOROS = 20;

/*
 * Función auxiliar para validar y parsear pomodoros
 *
 * Teacher note:
 * - Acepta string (del frontend) o number (por retrocompatibilidad)
 * - Valida rango y tipo
 * - Devuelve número válido o lanza error descriptivo
 *
 * @param value - valor a validar (string | number)
 * @param fieldName - nombre del campo para mensaje de error
 * @throw Error si valor inválido
 * @returns number validado
 */
function validateAndParsePomodoros(
  value: any,
  fieldName: string = "estimatedPomodoros"
): number {
  const numValue = typeof value === "string" ? parseInt(value, 10) : value;

  if (typeof numValue !== "number" || isNaN(numValue)) {
    throw new Error(
      `${fieldName} debe ser un número válido (recibido: ${typeof value})`
    );
  }

  if (!Number.isInteger(numValue)) {
    throw new Error(`${fieldName} debe ser un número entero`);
  }

  if (numValue < MIN_POMODOROS) {
    throw new Error(
      `${fieldName} debe ser al menos ${MIN_POMODOROS} (recibido: ${numValue})`
    );
  }

  if (numValue > MAX_POMODOROS) {
    throw new Error(
      `${fieldName} no puede exceder ${MAX_POMODOROS} (recibido: ${numValue})`
    );
  }

  return numValue;
}

/*
 * GET /api/tasks
 * Obtiene todas las tareas del usuario autenticado
 *
 * Query params opcionales:
 * - status: filtrar por estado (pending, in_progress, completed)
 * - priority: filtra por prioridad (low, medium, high)
 *
 * Teacher note:
 * - Usamos lean() para obtener objetos JS planos (más rápido)
 * - El virtual 'progress' se incluye automáticamente con toJSON
 */
export const getTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    // Contruir filtros dinámicos
    const filters: any = { userId: req.user._id };

    if (req.query.status) {
      filters.status = req.query.status;
    }

    if (req.query.priority) {
      filters.priority = req.query.priority;
    }

    // Obtener tareas con filtros y ordenar por fecha de creación
    const tasks = await Task.find(filters)
      .sort({ createdAt: -1 }) // más recientes primero
      .lean();

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("❌ Error en getTasks:", error);
    res.status(500).json({
      error: "Error al obtener tareas",
      details:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

/*
 * GET /api/tasks/:id
 * Obtiene una tarea específica por ID
 *
 * Teacher note:
 * - Verificamos que la tarea pertenezca al usuario autenticado
 * - Devolvemos 404 si no existe o 403 si pertenece a otro usuario
 */
export const getTaskById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404).json({ error: "Tarea no encontrada" });
      return;
    }

    // Verifica que la tarea pertenece al usuario
    if (task.userId.toString() !== req.user._id.toString()) {
      res
        .status(403)
        .json({ error: "No autorizado para acceder a esta tarea" });
      return;
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    console.error("❌ Error en getTaskById:", error);
    res.status(500).json({
      error: "Error al obtener la tarea",
    });
  }
};

/*
 * POST /api/tasks
 * Crea una nueva tarea
 *
 * Body esperado: CreateTaskDTO
 * {
 *    "title": "Estudiar TypeScript",
 *    "desciption": "Repasar generics y tipos avanzados",
 *    "priority": "high",
 *    "estimatedPomodoros": 4,
 *    "dueDate": "2025-10-20T00:00:00.000Z"
 * }
 */
export const createTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const taskData: CreateTaskDTO = req.body;

    // Validación básica (en producción usar Zod o Joi)
    if (!taskData.title || !taskData.estimatedPomodoros) {
      res.status(400).json({
        error: "Campos obligatorios: title, estimatedPomodoros",
      });
      return;
    }

    if (taskData.estimatedPomodoros === undefined) {
      res.status(400).json({
        error: 'El campo "estimatedPomodoros" es obligatorio',
      });
      return;
    }

    /*
     * Validar y parsear estimatedPomodoros
     */
    let validatedPomodoros: number;
    try {
      validatedPomodoros = validateAndParsePomodoros(
        taskData.estimatedPomodoros,
        "estimatedPomodoros"
      );
    } catch (validationError: any) {
      res.status(400).json({
        error: validationError.message,
      });
      return;
    }

    // Crea tarea asociada al usuario autenticado
    const task = await Task.create({
      title: taskData.title.trim(),
      description: taskData.description?.trim(),
      priority: taskData.priority,
      estimatedPomodoros: validatedPomodoros,
      dueDate: taskData.dueDate,
      userId: req.user._id,
      status: TaskStatus.PENDING,
      completedPomodoros: 0,
    });

    res.status(201).json({
      success: true,
      message: "Tarea creada exitosamente",
      data: task,
    });
  } catch (error) {
    console.error("❌ Error en createTask:", error);
    res.status(500).json({
      error: "Error al crear la tarea",
      details:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

/*
 * PUT /api/tasks/:id
 * Actualiza una tarea existente
 *
 * Body esperado: UpdateTaskDTO (todos los campos opcionales)
 *
 * Teacher note:
 * - Solo permite actualizar tareas del usuario autenticado
 * - Usa findOneAndUpdate para atomicidad
 */
export const updateTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const updates: UpdateTaskDTO = req.body;

    // Si se actualiza estimatedPomodoros, validar y pasear
    if (updates.estimatedPomodoros !== undefined) {
      try {
        updates.estimatedPomodoros = validateAndParsePomodoros(
          updates.estimatedPomodoros,
          "estimatedPomodoros"
        );
      } catch (validationError: any) {
        res.status(400).json({
          error: validationError.message,
        });
        return;
      }
    }

    // Buscar y actualizar solo si pertenece al usuario
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true } // new: devuelve doc actualizado
    );

    if (!task) {
      res.status(404).json({
        error: "Tarea no encontrada o no autorizada",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Tarea actualizada exitosamente",
      data: task,
    });
  } catch (error) {
    console.error("❌ Error en updateTask:", error);
    res.status(500).json({
      error: "Error al actualizar la tarea",
      details:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

/*
 * DELETE /api/tasks/:id
 * Elimina una tarea
 *
 * Teacher note:
 * - Soft delete recomendado en producción (campo deletedAt)
 * - Aquí hacemos hard delete por simplicidad
 */
export const deleteTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      res.status(404).json({
        error: "Tarea no encontrada o no autorizada",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Tarea eliminada exitosamente",
    });
  } catch (error) {
    console.error("❌ Error en deleteTaks:", error);
    res.status(500).json({
      error: "Error al eleminar la tarea",
    });
  }
};

/*
 * PATCH /api/tasks/:id/complete-pomodoro
 * Incrementa el contador de pomodoros completados
 *
 * Teacher note:
 * - Endpoint específico para evitar sobrescribir otros campos
 * - Si completedPomodoros == estimatedPomodoros, cambia status a COMPLETED
 */
export const completePomodoro = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      res.status(404).json({ error: "Tarea no encontrada" });
      return;
    }

    // Incrementar pomodoros completados
    task.completedPomodoros += 1;

    // Si alcanzó el estimado, marcar como completada
    if (task.completedPomodoros >= task.estimatedPomodoros) {
      task.status = TaskStatus.COMPLETED;
    } else if (task.status === TaskStatus.PENDING) {
      task.status = TaskStatus.IN_PROGRESS;
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: "Pomodoro completado",
      data: task,
    });
  } catch (error) {
    console.error("❌ Error en completePomodoro:", error);
    res.status(500).json({
      error: "Error al completar pomodoro",
    });
  }
};
