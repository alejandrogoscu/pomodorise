/*
 * Controlador de Sesiones
 *
 * Maneja la lógica de negocio
 *
 * Teacher note:
 * - Al completar una sesión se calculan puntos usando utils de shared
 * - Se actualiza el nivel, puntos y racha del usuario
 * - Si la sesión está vinculada a una tarea, se incrementa su contador
 */

import { Response } from "express";
import Session from "../models/Session";
import User from "../models/User";
import Task from "../models/Task";
import { AuthRequest } from "./authController";
import { CreateSessionDTO } from "@pomodorise/shared";
import {
  calculateSessionPoints,
  calculateLevel,
  shouldMaintainStreak,
  TaskStatus,
} from "@pomodorise/shared";

/*
 * GET /api/sessions
 * Obtiene el historial de sesiones del usuario autenticado
 *
 * Query params opcionales:
 * - completed: filtrar solo completadas (true/false)
 * - limit: número máximo de resultados (default: 50)
 *
 * Teacher note:
 * - Ordenamos por fecha descendente (más recientes primero)
 * - Usamos populate para incluir datos de la tarea asociada
 */
export const getSessions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    // Construir filtros
    const filters: any = { userId: req.user._id };

    if (req.query.completed !== undefined) {
      filters.completed = req.query.completed === "true";
    }

    // Límite de resultados
    const limit = parseInt(req.query.limit as string) || 50;

    // Obtener sesiones con datos de tarea
    const sessions = await Session.find(filters)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("taskId", "title status") // Incluir título y estado de la tarea
      .lean();

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    console.error("❌ Error en getSessions:", error);
    res.status(500).json({
      error: "Error al obtener sesiones",
    });
  }
};

/*
 * POST /api/sessions
 * Crea una nueva sesión de Pomodoro (iniciada pero no completada)
 *
 * Body esperado: CreateSessionDTO
 * {
 *    "taskId": "optional-task-id",
 *    "duration": 25,
 *    "type": "work"
 * }
 *
 * Teacher note:
 * - La sesión se crea en estado 'no completada'
 * - Los puntos se calculan cuando se marca como completada
 */
export const createSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const sessionData: CreateSessionDTO = req.body;

    // Validación básica
    if (!sessionData.duration || !sessionData.type) {
      res.status(400).json({
        error: "Campos obligatorios: duration, type",
      });
      return;
    }

    // Verificar que la tarea existe y pertenece al usuario (si se proporciona)
    if (sessionData.taskId) {
      const task = await Task.findOne({
        _id: sessionData.taskId,
        userId: req.user._id,
      });

      if (!task) {
        res.status(404).json({
          error: "Tarea no encontrada o no autorizada",
        });
        return;
      }
    }

    // Crea sesión
    const session = await Session.create({
      userId: req.user._id,
      taskId: sessionData.taskId || undefined,
      duration: sessionData.duration,
      type: sessionData.type,
      completed: false,
      pointsEarned: 0,
      startedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Sesión iniciada",
      data: session,
    });
  } catch (error) {
    console.error("❌ Error en createSession:", error);
    res.status(500).json({
      error: "Error al crear sesión",
      details:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

/*
 * PATCH /api/sessions/:id/complete
 * Marca una sesión como completada y calcula puntos
 *
 * Teacher note:
 * - Calcula puntos usando la utilidad de shared
 * - Actualiza nivel y racha del usuario
 * - Si hay tarea asociada, incrementa su contador de pomodoros
 * - Usa transacciones para garantizar atomicidad (opcional pero recomendado)
 */
export const completeSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    // Buscar sesión
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      res.status(404).json({ error: "Sesión no encontrada" });
      return;
    }

    if (session.completed) {
      res.status(400).json({ error: "La sesión ya está completada" });
      return;
    }

    // Obtener usuario actual para calcular puntos con racha
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    // Calcular puntos usando la utilidad shared
    const points = calculateSessionPoints(
      session.duration,
      session.type,
      user.streak
    );

    // Marcar sesión como completada
    session.completed = true;
    session.completedAt = new Date();
    session.pointsEarned = points;
    await session.save();

    // Actualizar puntos del usuario
    user.points += points;

    // Actualiza racha del usuario
    // Teacher note: Verificamos la última sesión completada
    const lastCompletedSession = await Session.findOne({
      userId: user._id,
      completed: true,
      _id: { $ne: session._id }, // Excluir la sesión actual
    }).sort({ completedAt: -1 });

    if (lastCompletedSession && lastCompletedSession.completedAt) {
      if (shouldMaintainStreak(lastCompletedSession.completedAt)) {
        user.streak += 1;
      } else {
        user.streak = 1; // Resetear racha
      }
    } else {
      user.streak = 1; // Primera sesión
    }

    // Actualiza nivel basado en puntos totales
    user.level = calculateLevel(user.points);

    await user.save();

    // Si hay tarea asociada, incremetar su contador
    if (session.taskId) {
      const task = await Task.findById(session.taskId);

      if (task) {
        task.completedPomodoros += 1;

        // Actualizar estado de la tarea si es necesario
        if (
          task.completedPomodoros >= task.estimatedPomodoros &&
          task.status !== TaskStatus.COMPLETED
        ) {
          task.status = TaskStatus.COMPLETED;
        } else if (task.status === TaskStatus.PENDING) {
          task.status = TaskStatus.IN_PROGRESS;
        }

        await task.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Sesión completada",
      data: {
        session,
        pointsEarned: points,
        user: {
          level: user.level,
          points: user.points,
          streak: user.streak,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error en completeSession:", error);
    res.status(500).json({
      error: "Error al completar sesión",
      details:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

/*
 * GET /api/sessions/stats
 * Obtiene estadísticas de sesiones del usuario
 *
 * Devuelve:
 * - Total de sesiones completadas
 * - Puntos totales ganados
 * - Racha actual
 * - Sesiones por tipo (work, break, long_break)
 *
 * Teacher note:
 * - Usar agregaciones de MongoDB para calcular estadísticas eficientemente
 */
export const getSessionStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    // Agregación para estadísticas
    const stats = await Session.aggregate([
      { $match: { userId: req.user._id, completed: true } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          totalPoints: { $sum: "$pointsEarned" },
          totalDuration: { $sum: "$duration" },
        },
      },
    ]);

    // Obtener datos del usuario
    const user = await User.findById(req.user._id).select(
      "level points streak"
    );

    res.status(200).json({
      success: true,
      data: {
        user,
        sessionStats: stats,
      },
    });
  } catch (error) {
    console.error("❌ Error en getSessionStats:", error);
    res.status(500).json({
      error: "Error al obtener estadísticas",
    });
  }
};
