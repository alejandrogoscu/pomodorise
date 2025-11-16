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

export const createSession = async (
  userId: string,
  sessionData: CreateSessionDTO
): Promise<ISessionDocument> => {
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

export const completeSession = async (
  sessionId: string,
  userId: string
): Promise<{
  session: ISessionDocument;
  user: { level: number; points: number; streak: number };
}> => {
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

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  const points = calculateSessionPoints(
    session.duration,
    session.type,
    user.streak
  );

  session.completed = true;
  session.completedAt = new Date();
  session.pointsEarned = points;
  await session.save();

  user.points += points;

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

  user.level = calculateLevel(user.points);

  await user.save();

  if (session.taskId) {
    const task = await Task.findById(session.taskId);

    if (task) {
      task.completedPomodoros += 1;

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

  const user = await User.findById(userId).select("level points streak");

  return {
    user,
    sessionStats: stats,
  };
};
