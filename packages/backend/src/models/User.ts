import mongoose, { Document, Schema, Types } from "mongoose";
import bcrypt from "bcrypt";
import { IUserDocument } from "@pomodorise/shared";

export interface IUser
  extends Omit<IUserDocument, "_id">,
    Document<Types.ObjectId> {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

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

    avatar: {
      type: String,
      required: [true, "El avatar avatar es obligatorio"],
      default: "https://i.imgur.com/blsTdRZ",
    },

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

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);

    next();
  } catch (error) {
    next(error as Error);
  }
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.index({ email: 1 });

export default mongoose.model<IUser>("User", UserSchema);
