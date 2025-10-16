/*
 * Componente raíz de la aplicación
 *
 * Teacher note:
 * - Ahora probamos importar tipos de @pomodorise/shared
 * - Verificamos que la instancia de Axios funciona
 */

import { useEffect, useState } from "react";
import { IUser, TaskStatus } from "@pomodorise/shared";
import api from "./services/api";

function App() {
  const [count, setCount] = useState(0);
  const [apiStatus, setApiStatus] = useState<string>("Verificando...");

  /*
   * Verificar conexión con backend
   *
   * Teacher note:
   * - useEffect se ejecuta después del primer render
   * - Hacemos una petición GET a /health para verificar backend que backend responde
   */
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await api.get("/health");
        setApiStatus(`✅ Backend conectado: ${response.data.message}`);
      } catch (error) {
        setApiStatus("❌ Backend no disponible (¿está corriendo en :4000?");
        console.error("Error al conectar con backend:", error);
      }
    };

    checkBackend();
  }, []);

  /*
   * Ejemplo de uso de tipos compartidos
   *
   * Teacher note:
   * - IUser viene de @pomodorise/shared
   * - TypeScript valida que los campos coinciden con la interface
   */
  const exampleUser: IUser = {
    _id: "123",
    email: "test@pomodorise.com",
    name: "Usuario de Prueba",
    level: 5,
    points: 1250,
    streak: 7,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1>🍅 PomodoRise</h1>
      <p>Pomodoro Timer con Gamificación</p>

      {/* Estado de conexión con backend */}
      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          backgroundColor: apiStatus.includes("✅") ? "#d4edda" : "#f8d7da",
          borderRadius: "8px",
        }}
      >
        <p style={{ margin: 0, color: "#000" }}>{apiStatus}</p>
      </div>

      {/* Botón de contador */}
      <div style={{ marginTop: "2rem" }}>
        <button
          onClick={() => setCount((count) => count + 1)}
          style={{
            padding: "1rem 2rem",
            fontSize: "1rem",
            cursor: "pointer",
            borderRadius: "8px",
            border: "2px solid #646cff",
            backgroundColor: "#646cff",
            color: "white",
          }}
        >
          Contador: {count}
        </button>
      </div>

      {/* Demostración de tipos compartidos */}
      <div
        style={{
          marginTop: "2rem",
          textAlign: "left",
          padding: "1rem",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          color: "#000",
        }}
      >
        <h3>Ejemplo de Usario (tipo compartido):</h3>
        <pre style={{ fontSize: "0.875rem" }}>
          {JSON.stringify(exampleUser, null, 2)}
        </pre>
        <p style={{ marginTop: "1rem", fontSize: "0.8875rem" }}>
          Estado de ejemplo: <strong>{TaskStatus.PENDING}</strong>
        </p>
      </div>

      <p style={{ marginTop: "2rem", color: "#888" }}>
        Frontend configurado correctamente ✅<br />
        Shared types funcionando ✅<br />
        Axios configurado ✅
      </p>
    </div>
  );
}

export default App;
