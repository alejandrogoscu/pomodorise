/*
 * Controlador de Sesiones (HTTP Layer)
 *
 * Teacher note:
 * - Los controladores solo manejan HTTP (request/response)
 * - La lógica de negocio está en sessionService
 * - Esto facilita testing y reutilización de código
 */

import { Response } from "express";
import { AuthRequest } from "./authController";
import { CreateSessionDTO } from "@pomodorise/shared";
import * as sessionService from "../services/sessionService";

/*
 * GET /api/sessions
 *
 * Obtiene el historial de sesiones del usuario autenticado
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
    const filters: { completed?: boolean } = {};
    if (req.query.completed !== undefined) {
      filters.completed = req.query.completed === "true";
    }

    const limit = parseInt(req.query.limit as string) || 50;

    // Usar SERVICE LAYER
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

/*
 * POST /api/sessions
 *
 * Crea una nueva sesión de Pomodoro
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

    // Usar SERVICE LAYER
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

    // Manejar errores específicos del service
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

/*
 * PATCH /api/sessions/:id/complete
 *
 * Marcar una sesión como completada y calcula puntos
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

    // Usar SERVICE LAYER
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

    // Manejar errores específicos del service
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

/*
 * GET /api/sessions/stats
 *
 * Obtiene estadísticas de sesiones del usuario
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

    // Usar SERVICE LAYER
    const stats = await sessionService.getSessionStats(req.user._id.toString());

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("❌ Error en getSessionStats:", error);
    res.status(500).json({
      error: "Error al obtener estadísticas",
    });
  }
};
