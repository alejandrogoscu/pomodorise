/*
 * Controlador de autenticación
 * Maneja registro, login y obtención de perfil de usuario
 *
 * Teacher note:
 * - JWT (JSON Web Token) es un estándar para autenticación stateless
 * - El token contriene el userId cifrado y firmado con JWT_SECRET
 * - No guardamos el token en la BD (el cliente lo alamacena)
 */

import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import User, { IUser } from "../models/User";

/*
 * Interface para extender Request con usuario autenticado
 *
 * Teacher note:
 * - Express no incluye 'user' por defecto en Request
 * - Esta interface se usa en el middleware de autenticación
 */
export interface AuthRequest extends Request {
  user?: IUser;
}

/*
 * Genera un token JWT firmado
 *
 * @param UserId - ID del usuario en MongoDB
 * @returns Token JWT válido por 7 días (configurable en .env)
 *
 * Teacher note:
 * - jwt.sign() toma un payload (datos) y lo cifra con JWT_SECRET
 * - El token NO es reversible sin la secret
 * - expiresIn puede ser: '7d', '24h', '1m', etc.
 */
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

/*
 * POST /api/auth/register
 * Registra un nuevo usuario
 *
 * Body esperado:
 * {
 *    "email": "user@example.com",
 *    "password": "password123",
 *    "name": "John Doe" (opcional)
 * }
 *
 * Teacher note:
 * - bcrypt hashea la contraseña automáticamente en el pre-save hook del modelo
 * - Validamos que el email no esté duplicado antes de crear
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Validación básica
    if (!email || !password) {
      res.status(400).json({
        error: "Email y password son obligatorios",
      });
      return;
    }

    // Verificar si el usuario existe
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({
        error: "El email ya está registrado",
      });
      return;
    }

    // Crear un nuevo usuario
    const user = await User.create({
      email,
      password,
      name,
    });

    // Genera token JWT
    const token = generateToken(user._id.toString());

    // Responder con usuario (sin password) y token
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

/*
 * POST /api/auth/login
 * Autentica un usuario existente
 *
 * Body esperado:
 * {
 *    "email": "user@example,com",
 *    "password": "password123",
 * }
 *
 * Teacher note:
 * - Usamos select('+password') porque password tiene 'select: false' en el schema
 * - comparePassword() usa bcrypt.compare() internamente
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validación básica
    if (!email || !password) {
      res.status(400).json({
        error: "Email y password son obligatorios",
      });
      return;
    }

    // Buscar usuario e incluir password (normalmente está oculta)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(401).json({
        error: "Credenciales inválidas",
      });
      return;
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        error: "Credenciales inválidas",
      });
      return;
    }

    // Generar token JWT
    const token = generateToken(user._id.toString());

    // Responder con token y datos del usuario
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

/*
 * GET /api/auth/me
 * Obtiene el perfil del usuario autenticado
 *
 * Headers requeridos:
 * Authorization: Bearer <token>
 *
 * Teacher note:
 * - Esta ruta requiere el middleware 'protect' (ver middlewares/auth.ts)
 * - req.user ya está disponible gracias al middleware
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // El middleware 'protect' ya añadió req.user
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
