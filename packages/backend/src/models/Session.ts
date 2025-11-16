import mongoose, { Document, Schema, Types } from "mongoose";
import { ISession } from "@pomodorise/shared";

export interface ISessionDocument
  extends Omit<ISession, "_id" | "userId" | "taskId">,
    Document {
  userId: Types.ObjectId;
  taskId?: Types.ObjectId; // Opcional: puede ser una sesión de práctica
}

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
          if (!value) return true;
          return value > this.startedAt;
        },
        message: "La fecha de finalización debe ser posterior al inicio",
      },
    },
  },
  {
    timestamps: true,
  }
);

SessionSchema.virtual("actualDuration").get(function () {
  if (!this.completedAt) return null;
  const diffMs = this.completedAt.getTime() - this.startedAt.getTime();
  return Math.round(diffMs / 1000 / 60); // Convertir a minutos
});

SessionSchema.set("toJSON", { virtuals: true });
SessionSchema.set("toObject", { virtuals: true });

SessionSchema.index({ userId: 1, createdAt: -1 });
SessionSchema.index({ userId: 1, completed: 1 });

export default mongoose.model<ISessionDocument>("Session", SessionSchema);
