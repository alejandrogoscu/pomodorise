import { Response } from "express";
import Task from "../models/Task";
import { AuthRequest } from "./authController";
import { CreateTaskDTO, UpdateTaskDTO, TaskStatus } from "@pomodorise/shared";

const MIN_POMODOROS = 1;
const MAX_POMODOROS = 20;

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

export const getTask = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const filters: any = { userId: req.user._id };

    if (req.query.status) {
      filters.status = req.query.status;
    }

    if (req.query.priority) {
      filters.priority = req.query.priority;
    }

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

    task.completedPomodoros += 1;

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
