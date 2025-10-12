/*
 * Middleware de autenticación JWT
 *
 * Verifica que el token JWT sea válido y añade el usuario a req.user
 *
 * Teacher note:
 * - Este middleware se usa en rutas protegidas: app.get('/api/task', protect, getTask)
 * - Si el token es inválido o no existe, retorna 401 Unauthorized
 * - jwt.verify() lanza error si el token está expirado o es inválido
 */

import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest } from "../controllers/authController";

/*
 * Middleware que protege rutas verificando JWT
 *
 * @param req - Request de Express (extendido con AuthRequest)
 * @param res - Response de Express
 * @param next - Función para pasar al siguiente middleware
 *
 * Teacher note:
 * - El token se envía en el header: Authorization: Bearer <token>
 * - jwt.verify() decodifica el payload y verifica la firma
 */
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: "No autorizado. Token no proporcionado",
      });
      return;
    }

    // Extraer token (quitar 'Bearer ')
    const token = authHeader.split(" ")[1];

    // Verificar que JWT_SECRET existe
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET no está definido");
    }

    // Verificar y decodificar token
    // Teacher note: jwt.verify() lanza error si el token es inválido o expiró
    const decoded = jwt.verify(token, secret) as { id: string };

    // Buscar usuario en la BD
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).json({
        error: "Usuario no encontrado",
      });
      return;
    }

    // Añadir usuario al request para que esté disponible en el controlador
    req.user = user;

    // Pasar al siguiente middleware o controlador
    next();
  } catch (error) {
    console.error("❌ Error en el middleware protect:", error);

    // Detectar errores específicos de JWT
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: "Token invalido",
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: "Token expirado",
      });
      return;
    }

    res.status(500).json({
      error: "Error al verificar autenticación",
    });
  }
};
