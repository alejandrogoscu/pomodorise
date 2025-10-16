/*
 * Componente raíz de la aplicación
 *
 * Teacher note:
 * - Por ahora solo renderiza un mensaje de bienvenida
 * - En las siguientes subfases añadiremos Router y páginas
 */

import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

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

      <p style={{ marginTop: "2rem", color: "#888" }}>
        Frontend configurado correctamente ✅
      </p>
    </div>
  );
}

export default App;
