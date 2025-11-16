import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest } from "../controllers/authController";

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        error: "No autorizado. Token no proporcionado",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET no está definido");
    }

    const decoded = jwt.verify(token, secret) as { id: string };

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).json({
        error: "Usuario no encontrado",
      });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("❌ Error en el middleware protect:", error);

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
