import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/task";
import sessionRoutes from "./routes/sessions";
import statsRoutes from "./routes/stats";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const app: Application = express();

const PORT = process.env.PORT || 4000;

// ====================================
// CONEXIÓN A BASE DE DATOS
// ====================================

connectDB();

// ====================================
// MIDDLEWARE GLOBAL
// ====================================

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:5173",
    credentials: true,
  })
);

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ====================================
// RUTAS
// ====================================

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "PomodoRise API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to PomodoRise API",
    version: "1.0.0",
    documentation: "/api-docs",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/tasks", taskRoutes);

app.use("/api/sessions", sessionRoutes);

app.use("/api/stats", statsRoutes);

// ====================================
// MANEJO DE ERRORES
// ====================================

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ Error:", err.message);
  console.error("Stack:", err.stack);

  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
});

// ====================================
// INICIAR SERVIDOR
// ====================================

app.listen(PORT, () => {
  console.log(`
    =====================================================
      🍅 PomodoRise API Server           
      🚀 Running on port ${PORT}             
      📍 http://localhost:${PORT}            
      🌍 Environment: ${process.env.NODE_ENV || "development"}         
    =====================================================
    `);
});

export default app;
