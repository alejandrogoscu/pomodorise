/*
 * Modelo de Sesión con Mongoose
 *
 * Define el esquema de datos para sesiones de Pomodoro en MongoDB
 * Incluye: duración, tipo (work/break), puntos ganados y referencias a usuario/tarea
 * Los puntos se calcuclan en sessionService usando utils de shared
 *
 * Teacher note:
 * - El modelo solo define estructura de datos
 * - La lógica de negocio (calcular puntos) va en el service layer
 * - Esto facilita testing y reutilización
 */
import mongoose, { Document, Schema, Types } from "mongoose";
import { ISession } from "@pomodorise/shared";

/*
 * Interface que combina Document de Mongoose con Isession
 *
 * Teacher note:
 * - Omitimos _id, userId y taskId de ISession porque Mongoose los maneja como ObjectId
 * - taskId es opcional: permite sesiones sin tarea asignada
 */
export interface ISessionDocument
  extends Omit<ISession, "_id" | "userId" | "taskId">,
    Document {
  userId: Types.ObjectId;
  taskId?: Types.ObjectId; // Opcional: puede ser una sesión de práctica
}

/*
 * Schema de Mongoose para Session
 * Define la estructura de los documentos en la colección 'sessions'
 */
const SessionSchema = new Schema<ISessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "El userId es obligatorio"],
      index: true, // Índice para búsquedas rápidas por usuario
    },

    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: false, // Opcional: sesiones sin tarea asignada
    },

    duration: {
      type: Number,
      required: [true, "La duración es obligatoria"],
      min: [1, "La duración mínima es 1 minuto"],
      max: [120, "La duración máxima es 120 minutos"],
    },

    type: {
      type: String,
      enum: ["work", "break", "long_break"],
      required: [true, "El tipo de sesión es obligatorio"],
    },

    completed: {
      type: Boolean,
      default: false,
    },

    pointsEarned: {
      type: Number,
      default: 0,
      min: [0, "Los puntos no pueden ser negativos"],
    },

    startedAt: {
      type: Date,
      required: [true, "La fecha de inicio es obligatoria"],
      default: Date.now,
    },

    completedAt: {
      type: Date,
      validate: {
        validator: function (value: Date | undefined) {
          // Si hay completedAt, debe ser posterior a startedAt
          if (!value) return true;
          return value > this.startedAt;
        },
        message: "La fecha de finalización debe ser posterior al inicio",
      },
    },
  },
  {
    timestamps: true, // Crea automáticamente createdAt y updatedAt
  }
);

/*
 * Virtual para calcular la duración real de la sesión
 *
 * Teacher note:
 * - Útil para verificar si la sesión duró lo planificado
 * - Solo funciona si la sesión tiene completedAt
 */
SessionSchema.virtual("actualDuration").get(function () {
  if (!this.completedAt) return null;
  const diffMs = this.completedAt.getTime() - this.startedAt.getTime();
  return Math.round(diffMs / 1000 / 60); // Convertir a minutos
});

// Incluir virtuals en JSON
SessionSchema.set("toJSON", { virtuals: true });
SessionSchema.set("toObject", { virtuals: true });

/*
 * Índices compuestos para queries optimizadas
 *
 * Teacher note:
 * - userId + createdAt: para listar sesiones recientes de un usuario
 * - userId + completed: para calcular sesiones completadas
 */
SessionSchema.index({ userId: 1, createdAt: -1 });
SessionSchema.index({ userId: 1, completed: 1 });

// Exportar el modelo
export default mongoose.model<ISessionDocument>("Session", SessionSchema);
