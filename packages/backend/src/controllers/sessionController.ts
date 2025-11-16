import { Response } from "express";
import { AuthRequest } from "./authController";
import { CreateSessionDTO, UserStats } from "@pomodorise/shared";
import * as sessionService from "../services/sessionService";

export const getSessions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const filters: { completed?: boolean } = {};
    if (req.query.completed !== undefined) {
      filters.completed = req.query.completed === "true";
    }

    const limit = parseInt(req.query.limit as string) || 50;

    const sessions = await sessionService.getUserSessions(
      req.user._id.toString(),
      filters,
      limit
    );

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    console.error("❌ Error en getSessions:", error);
    res.status(500).json({ error: "Error al obtener sesiones" });
  }
};

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

    if (!sessionData.duration || !sessionData.type) {
      res.status(400).json({
        error: "Campos obligatorios: duration, type",
      });
      return;
    }

    const session = await sessionService.createSession(
      req.user._id.toString(),
      sessionData
    );

    res.status(201).json({
      success: true,
      message: "Sesión iniciada",
      data: session,
    });
  } catch (error: any) {
    console.error("❌ Error en createSession:", error);

    if (error.message.includes("Tarea no encontrada")) {
      res.status(404).json({ error: error.message });
      return;
    }

    res.status(500).json({
      error: "Error al crear sesión",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const completeSession = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const result = await sessionService.completeSession(
      req.params.id,
      req.user._id.toString()
    );

    res.status(200).json({
      success: true,
      message: "¡Sesión completada!",
      data: {
        session: result.session,
        pointsEarned: result.session.pointsEarned,
        user: result.user,
      },
    });
  } catch (error: any) {
    console.error("❌ Error en completeSession:", error);

    if (
      error.message.includes("no encontrada") ||
      error.message.includes("sin permisos")
    ) {
      res.status(404).json({ error: error.message });
      return;
    }

    if (error.message.includes("ya está completada")) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(500).json({
      error: "Error al completar sesión",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getSessionStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "No autenticado" });
      return;
    }

    const sessions = await sessionService.getUserSessions(
      req.user._id.toString(),
      { completed: true }
    );

    const totalSessions = sessions.length;

    const totalMinutes = sessions.reduce(
      (sum, session) => sum + session.duration,
      0
    );

    const completedPomodoros = sessions.filter(
      (session) => session.type === "work"
    ).length;

    const averageSessionDuration =
      totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    const pointsEarned = sessions.reduce(
      (sum, session) => sum + (session.pointsEarned || 0),
      0
    );

    const sessionsPerDayMap = new Map<string, number>();

    sessions.forEach((session) => {
      const dateStr = session.startedAt.toISOString().split("T")[0];
      const currentCount = sessionsPerDayMap.get(dateStr) || 0;
      sessionsPerDayMap.set(dateStr, currentCount + 1);
    });

    const sessionsPerDay = Array.from(sessionsPerDayMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const stats: UserStats = {
      totalSessions,
      totalMinutes,
      completedPomodoros,
      averageSessionDuration,
      sessionsPerDay,
      pointsEarned,
    };

    res.status(200).json({
      succes: true,
      data: stats,
    });
  } catch (error) {
    console.error("❌ Error al obtener estadísticas:", error);
    res.status(500).json({
      error: "Error al obtener estadísticas",
    });
  }
};
