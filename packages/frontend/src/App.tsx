/*
 * Componente raíz con React Router
 *
 * Teacher note:
 * - BrowserRoute envuelve toda al app
 * - Routes define las rutas disponibles
 * - Ruta raíz (/) redirige a /login por ahora
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta raíz redirige a login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rutas públicas (auth) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas (dashboard) */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Ruta 404 - no encontrada */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
