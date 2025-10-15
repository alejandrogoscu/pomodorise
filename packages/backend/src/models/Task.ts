/*
 * Modelo de Tarea con Mongoose
 *
 * Define el esquema de datos para tareas en MongoDB
 * Incluye: título, descripción, estado, prioridad, pomodoros y fechas
 *
 * Teacher note:
 * - Importamos tipos desde @pomodorise/shared para evitar duplicación
 * - El schema implementa ITask pero con ObjectId en _id y userId
 * - Mongoose convierte automáticamente _id a string en JSON
 */

import mongoose, { Document, Schema, Types } from "mongoose";
import { ITask, TaskStatus, TaskPriority } from "@pomodorise/shared";

/*
 * Interface que combina Document de Mongoose con ITask
 *
 * Teacher note:
 * - Omitimos _id y userId de ITask porque Mongoose los maneja como ObjectId
 * - Document añade métodos de Mongoose (save, remove, etc)
 */
export interface ITaskDocument extends Omit<ITask, "_id" | "userId">, Document {
  userId: Types.ObjectId; // En BD es ObjectId, en API se convierte a string
}

/*
 * Schema ed Mongoose para Task
 * Define la estructura de los documentos en la colección 'task'
 */
const TaskSchema = new Schema<ITaskDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Relación con modelo User
      required: [true, "El userId es obligatorio"],
      index: true, // Índice para búsquedas rápidas por usuario
    },

    title: {
      type: String,
      required: [true, "El título es obligatorio"],
      trim: true,
      maxlength: [100, "El título no puede exceder 100 caracteres"],
    },

    description: {
      type: String,
      trim: true,
      maxLength: [500, "La descripción no puede exceder 500 caracteres"],
    },

    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.PENDING,
    },

    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },

    estimatedPomodoros: {
      type: Number,
      required: [true, "Los pomodoros estimados son obligatorios"],
      min: [1, "Debe haber al menos 1 pomodoro estimado"],
      max: [20, "No se pueden estimar más de 20 pomodoros"],
    },

    completedPomodoros: {
      type: Number,
      default: 0,
      min: [0, "Los pomodoros completados no pueden ser negativos"],
    },

    dueDate: {
      type: Date,
      validate: {
        validator: function (value: Date) {
          // La fecha de vencimiento debe ser futura
          return !value || value > new Date();
        },
        message: "La fecha de vencimiento debe ser futura",
      },
    },
  },
  {
    timestamps: true, // Crea automáticamente createdAt y updatedAt
  }
);

/*
 * Índices compuestos para optimizar queries
 *
 * Teacher note:
 * - Búsquedas frecuentes: tareas por usuario y estado
 * - El orden importa: userId primero poque siempre filtramos por usuario
 */
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, dueDate: 1 });

/*
 * Virtual para calcular el progreso de la tarea (porcentaje)
 *
 * Teacher note:
 * - Los virtuals NO se guardan en BD, se calculan al consultar
 * - Para incluirlos en JSON: schema.set('toJSON', { virtuals: true })
 */
TaskSchema.virtual("progress").get(function () {
  if (this.estimatedPomodoros === 0) return 0;
  return Math.round((this.completedPomodoros / this.estimatedPomodoros) * 100);
});

// Incluir virtuals en JSON y toObject
TaskSchema.set("toJSON", { virtuals: true });
TaskSchema.set("toObject", { virtuals: true });

// Exportar el modelo
export default mongoose.model<ITaskDocument>("Task", TaskSchema);
