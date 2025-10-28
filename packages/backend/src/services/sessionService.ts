/*
 * Service Layer para Sesiones
 *
 * Teacher note:
 * - Separa lógica de negocio de HTTP (controladores)
 * - Facilita testing (no necesitas Express para probar lógica)
 * - Usa utils de shared para calcular puntos (DRY)
 * - Centraliza transacciones y updates relacionados
 *
 * Analogía: sessionService es como el gerente de un gimnasio
 * (registra entrenamientos, actualiza membresías, calcula recompensas)
 */

import Session, { ISessionDocument } from "../models/Session";
import User from "../models/User";
import Task from "../models/Task";
import { CreateSessionDTO, TaskStatus } from "@pomodorise/shared";
import {
  calculateSessionPoints,
  calculateLevel,
  shouldMaintainStreak,
} from "@pomodorise/shared";
import { Types } from "mongoose";

/*
 * Crea una nueva sesión
 *
 * @param userId - ID del usuario
 * @param sessionData - Datos de la sesión (CreateSessionDTO)
 * @returns Sesión creada
 *
 * Teacher note:
 * - La sesión se crea en estado "no completada"
 * - Los puntos se calculan cuando se marca como completada
 */
export const createSession = async (
  userId: string,
  sessionData: CreateSessionDTO
): Promise<ISessionDocument> => {
  // Validar que la tarea existe y pertenece al usuario (si se proporciona)
  if (sessionData.taskId) {
    const task = await Task.findOne({
      _id: new Types.ObjectId(sessionData.taskId),
      userId: new Types.ObjectId(userId),
    });

    if (!task) {
      throw new Error("Tarea no encontrada o sin permisos");
    }
  }

  const session = new Session({
    userId: new Types.ObjectId(userId),
    taskId: sessionData.taskId
      ? new Types.ObjectId(sessionData.taskId)
      : undefined,
    duration: sessionData.duration,
    type: sessionData.type,
    completed: false,
    pointsEarned: 0,
    startedAt: new Date(),
  });

  await session.save();
  return session;
};

/*
 * Completar una sesión existente
 *
 * @param sessionId - ID de la sesión
 * @param userId - ID del usuario (para verificar permisos)
 * @returns Sesión actualizada con puntos + datos del usuario
 *
 * Teacher note:
 * - Marca la sesión como completada
 * - Calcula puntos usando calculateSessionPoints() de shared
 * - Actualiza puntos, nivel y racha del usuario
 * - Si hay taskId, incrementa completedPomodoros y actualiza estado
 */
export const completeSession = async (
  sessionId: string,
  userId: string
): Promise<{
  session: ISessionDocument;
  user: { level: number; points: number; streak: number };
}> => {
  // Buscar sesión y verificar permisos
  const session = await Session.findOne({
    _id: new Types.ObjectId(sessionId),
    userId: new Types.ObjectId(userId),
  });

  if (!session) {
    throw new Error("Sesión no encontrada o sin permisos");
  }

  if (session.completed) {
    throw new Error("La sesión ya está completada");
  }

  // Obtener usuario para calcular puntos con racha
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  // Usar utilidad de shared (no duplica lógica)
  const points = calculateSessionPoints(
    session.duration,
    session.type,
    user.streak
  );

  // Marca sesión como completada
  session.completed = true;
  session.completedAt = new Date();
  session.pointsEarned = points;
  await session.save();

  // Actualizar puntos del usuario
  user.points += points;

  // Actualizar racha del usuario
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

  // Usar utilidad shared para calcular nivel
  user.level = calculateLevel(user.points);

  await user.save();

  // Si hay tarea asociada, incrementar completedPomodoros
  if (session.taskId) {
    const task = await Task.findById(session.taskId);

    if (task) {
      task.completedPomodoros += 1;

      // Actualizar estado de la tarea automáticamente
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

  return {
    session,
    user: {
      level: user.level,
      points: user.points,
      streak: user.streak,
    },
  };
};

/*
 * Obtener sesiones del usuario (con paginación)
 *
 * @param userId - ID del usuario
 * @param filters - Filtros opcionales (completed)
 * @param limit - Número máximo de sesiones
 * @returns Array de sesiones
 */
export const getUserSessions = async (
  userId: string,
  filters?: { completed?: boolean },
  limit: number = 50
): Promise<ISessionDocument[]> => {
  const query: any = { userId: new Types.ObjectId(userId) };

  if (filters?.completed !== undefined) {
    query.completed = filters.completed;
  }

  return Session.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("taskId", "title status")
    .exec();
};

/*
 * Obtener estadísticas de las sesiones
 *
 * param userId - ID del usuario
 * @returns Objeto con estadístcas agregadas
 */
export const getSessionStats = async (userId: string) => {
  const stats = await Session.aggregate([
    {
      $match: {
        userId: new Types.ObjectId(userId),
        completed: true,
      },
    },
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
  const user = await User.findById(userId).select("level points streak");

  return {
    user,
    sessionStats: stats,
  };
};
