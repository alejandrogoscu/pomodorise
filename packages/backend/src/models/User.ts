/*
 * Modelo de Usuario con Mongoose
 *
 * Define el esquema de datos para usuarios en MongoDB
 * Incluye: autenticación, gamificación (nivel, puntos y rachas) y timestamps
 *
 * Teacher note:
 * - Ahora importamos IUserDocument desde @pomodorise/shared
 * - Esto elimina duplicación y asegura consistencia con frontend
 * - El schema de Mongoose implementa la interface compartida
 */

import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcrypt";
import { IUserDocument } from "@pomodorise/shared";

/*
 * Interface que combina Document de Mongoose con IUserDocument
 *
 * Teacher note:
 * - Document añade métodos de Mongoose (_id como ObjectId, save(), etc)
 * - IUserDocument viene de shared y define la estructura de datos
 */
export interface IUser
  extends Omit<IUserDocument, "_id">,
    Document<Types.ObjectId> {
  // Document ya incluye _id como Types.ObjectId
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/*
 * Schema de Mongoose para User
 * Define la estructura de los documentos en la colección 'users'
 */
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Por favor ingresa un email válido",
      ],
    },

    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
      select: false, // No incluir password en queries por defecto
    },

    name: {
      type: String,
      trim: true,
      maxlength: [50, "El nombre no puede exceder 50 caracteres"],
    },

    // Gamificación
    level: {
      type: Number,
      default: 1,
      min: [1, "El nivel mínimo es 1"],
    },

    points: {
      type: Number,
      default: 0,
      min: [0, "Los puntos no pueden ser negativos"],
    },

    streak: {
      type: Number,
      default: 0,
      min: [0, "La racha no puede ser negativa"],
    },
  },
  {
    timestamps: true, // Crea automáticamente createdAt y updatedAt
  }
);

/*
 * Pre-save hook: hashea la contraseña antes de guardar
 *
 * Teacher note:
 * - Solo hashea si la contraseña fue modificada (evita re-hashear en updates)
 * - bcrypt.genSalt(10): genera un salt aleatorio (10 rondas de hashing)
 * - Mayor número de rondas = más seguro pero más lento
 */
UserSchema.pre<IUser>("save", async function (next) {
  // Si la contraseña no fue modificada, continuar sin hashear
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Generar salt (componente aleatorio para el hash)
    const salt = await bcrypt.genSalt(10);

    // Hashear la contraseña con el salt
    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (error) {
    next(error as Error);
  }
});

/*
 * Método de instancia: comparar contraseña ingresada con hash almacenado
 *
 * @param candidatePassword - Contraseña en texto plano del login
 * @returns Promise<boolean> - true si coinciden, false si no
 *
 * Teacher note:
 * - bcrypt.compare es seguro contra timing attacks
 * - No usar === porque compararía el hash directamente (inseguro)
 */
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

/*
 * Índices para optimizar queries
 *
 * Teacher note:
 * - Índice en email para búsquedas rápidas (login)
 * - MongoDB crea automáticamente índice en _id
 */
UserSchema.index({ email: 1 });

// Exportar el modelo
export default mongoose.model<IUser>("User", UserSchema);
