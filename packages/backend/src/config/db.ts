import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const DB_URI = process.env.DB_URI;

    if (!DB_URI) {
      throw new Error(
        "❌ DB_URI no está definida en las variables de entorno." +
          "Revisa tu archivo .env y asegúrate de que contiene DB_URI"
      );
    }

    const conn = await mongoose.connect(DB_URI);

    console.log(`
      ===================================================== 
        ✅ MongoDB Connected                                
        📍 Host: ${conn.connection.host} 
        🗄️  Database: ${conn.connection.name}.                          
      ===================================================== 
      `);
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error);

    process.exit(1);
  }
};

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnect", () => {
  console.log("Mongoose disconnected from MongoDB");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🛑 Mongoose connection closed due to app termination");
  process.exit(0);
});
