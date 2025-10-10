/* 
 * Punto de entrada del servidor Express
 * Este archivo inicializa el servidor HTTP y carga configuración básica

 * Teacher note: Este es el primer archivo que se ejecuta cuando se inicia el backend
 * Aquí configuramos middleware global (cors, helmet, morgan) antes de las rutas
*/

import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Carga variables de entorno desde .env
dotenv.config();

// Crea instancia de Express
const app: Application = express();

// Puerto del servidor (por defecto 4000)
const PORT = process.env.PORT || 4000;

// ====================================
// MIDDLEWARE GLOBAL
// ====================================

/*
 * CORS - Permite peticiones desde el frontend
 * En desarrollo: acepta peticiones de localhost:5173 (Vite)
 * En producción: deberías configurar origins específicas
 */
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:5173",
    credentials: true,
  })
);

/*
 * Helmet - Añade headers de seguridad HTTP
 * Protege contra vulnerabilidades comunes (XSS, clickjacking, etc.)
 */
app.use(helmet());

/*
 * Morgan - Logger de peticiones HTTP
 * Formato 'dev': muestra método, URL, status y tiempo de respuesta
 * Ejemplo: GET /api/users 200 15.234 ms
 */
app.use(morgan("dev"));

/*
 * Express JSON parser
 * Convierte el body de las peticiones a objetos JavaScript
 */
app.use(express.json());

/*
 * Express URL-encoded parser
 * Permite recibir datos de formularios HTML
 */
app.use(express.urlencoded({ extended: true }));

// ====================================
// RUTAS
// ====================================

/*
 * Ruta de prueba para verificar que el servidor funciona
 * GET /health -> { status: "ok", timestamp: "..."}
 */
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "PomodoRise API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

/*
 * Ruta raíz - mensaje de bienvenida
 */
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to PomodoRise API",
    version: "1.0.0",
    documentation: "/api-docs",
  });
});

// ====================================
// MANEJO DE ERRORES
// ====================================

/*
 * Ruta no encontrada - 404
 * Se ejecuta cuando ninguna ruta coincide
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
  });
});

/*
 * Manejador de errores global
 * Captura todos los errores que ocurran en la app
 *
 * Teacher note: El parámetro next es obligatorio aunque no se use,
 * porque Express reconoce error handlers por tener 4 parametros
 */
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

/*
 * Inicia el servidor HTTP
 * Escucha en el puerto configurado (por defecto 4000)
 */
app.listen(PORT, () => {
  console.log(`
    ╔═══════════════════════════════════════╗
    ║   🍅 PomodoRise API Server            ║
    ║   🚀 Running on port ${PORT}             ║
    ║   📍 http://localhost:${PORT}            ║
    ║   🌍 Environment: ${process.env.NODE_ENV || "development"}         ║
    ╚═══════════════════════════════════════╝
    `);
});

// Exportar app para tests
export default app;
