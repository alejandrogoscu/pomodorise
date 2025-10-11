/*
 * Configuración de conexión a MongoDB con Mongoose
 *
 * Este módulo exporta una función que conecta a la base de datos
 * Mongoose es un ODM (Object Document Mapper) que facilita trabajar con MongoDB
 *
 * Teacher note:
 * - Mongoose añade validaciones, esquemas y tipado sobre MongoDB
 * - Las opciones de conexión previenen warnings deprecados
 */

import mongoose from "mongoose";

/*
 * Conecta a MongoDB usando la URI del archivo .env
 *
 * @throws Error si no se puede conectar
 * @returns Promise<void>
 */
export const connectDB = async (): Promise<void> => {
  try {
    const DB_URI = process.env.DB_URI;

    // Validar que la URI existe
    if (!DB_URI) {
      throw new Error(
        "❌ DB_URI no está definida en las variables de entorno." +
          "Revisa tu archivo .env y asegúrate de que contiene DB_URI"
      );
    }

    // Teacher note: mongoose.connect retorna una Promise
    // El objeto connection tiene información útil sobre la conexión
    const conn = await mongoose.connect(DB_URI);

    console.log(`
      ===================================================== 
        ✅ MongoDB Connected                                
        📍 Host: ${conn.connection.host} 
        🗄️  Database: ${conn.connection.name}.                          
      ===================================================== 
      `);
  } catch (error) {
    // Teacher note: En producción, considera usar un logger profesional (Winston, Pino)
    console.error("❌ Error al conectar a MongoDB:", error);

    // Salir del proceso con código de error
    // En producción, un process manager (PM", Docker) reiniciará el servidor
    process.exit(1);
  }
};

/*
 * Manejo de eventos de conexión de Mongoose
 *
 * Teacher note: Estos listeners ayudan a debuggear problemas de conexión
 * en desarrollo y monitorear la salud de la DB en producción
 */
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnect", () => {
  console.log("Mongoose disconnected from MongoDB");
});

// Graceful shutdown: cerrar conexión cuando el proceso se cierra
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🛑 Mongoose connection closed due to app termination");
  process.exit(0);
});
