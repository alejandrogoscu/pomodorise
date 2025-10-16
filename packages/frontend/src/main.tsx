/*
 * Punto de entrada de la aplicación React
 *
 * Teacher note:
 * - Este archivo monta el componente App en el DOM
 * - React 18 usa createRoot (antes era ReactDOM.render)
 * - StrictMode ayuda a detectar problemas en desarrollo
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // Estilos globales (lo crearemos después)

/*
 * Montar aplicación en el elemento #root
 *
 * Teacher note:
 * - getElementById devuelve HTMLElement | null
 * - El '!' le dice a TypeScript que estamos seguros de que existe
 */
const rootElement = document.getElementById("root")!;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
