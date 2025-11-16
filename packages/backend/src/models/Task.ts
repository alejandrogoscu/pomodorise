import mongoose, { Document, Schema, Types } from "mongoose";
import { ITask, TaskStatus, TaskPriority } from "@pomodorise/shared";

export interface ITaskDocument extends Omit<ITask, "_id" | "userId">, Document {
  userId: Types.ObjectId; // En BD es ObjectId, en API se convierte a string
}

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
          return !value || value > new Date();
        },
        message: "La fecha de vencimiento debe ser futura",
      },
    },
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, dueDate: 1 });

TaskSchema.virtual("progress").get(function () {
  if (this.estimatedPomodoros === 0) return 0;
  return Math.round((this.completedPomodoros / this.estimatedPomodoros) * 100);
});

TaskSchema.set("toJSON", { virtuals: true });
TaskSchema.set("toObject", { virtuals: true });

export default mongoose.model<ITaskDocument>("Task", TaskSchema);
