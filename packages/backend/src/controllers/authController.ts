import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import User, { IUser } from "../models/User";

export interface AuthRequest extends Request {
  user?: IUser;
}

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET no está definido en las variables de entorno");
  }

  return jwt.sign(
    { id: userId }, // Payload (datos del usuario)
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as SignOptions // Forzar el tipado correcto
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: "Email y password son obligatorios",
      });
      return;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({
        error: "El email ya está registrado",
      });
      return;
    }

    const user = await User.create({
      email,
      password,
      name,
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        level: user.level,
        points: user.points,
        streak: user.streak,
      },
    });
  } catch (error) {
    console.error("❌ Error en register:", error);
    res.status(500).json({
      error: "Error al registrar usuario",
      details:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: "Email y password son obligatorios",
      });
      return;
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(401).json({
        error: "Credenciales inválidas",
      });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        error: "Credenciales inválidas",
      });
      return;
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        level: user.level,
        points: user.points,
        streak: user.streak,
      },
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({
      error: "Error al iniciar sesión",
      details:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "No autenticado",
      });
      return;
    }

    res.status(200).json({
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        level: req.user.level,
        points: req.user.points,
        streak: req.user.streak,
      },
    });
  } catch (error) {
    console.error("❌ Error en getMe:", error);
    res.status(500).json({
      error: "Error al obtener el perfil",
    });
  }
};
