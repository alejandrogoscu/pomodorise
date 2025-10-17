/*
 * Componente raíz con React Router, AuthContext y rutas protegidas
 *
 * Teacher note:
 * - BrowserRoute envuelve toda al app
 * - Routes define las rutas disponibles
 * - AuthProvider debe envolver BrowserRouter
 * - PrivateRoute redirige a /dashboard si ya hay sesión
 * - Esto crea un flujo natural: login -> dashboard -> logout -> login
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import PublicRoute from "./components/PublicRoute/PublicRoute";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta raíz redirige a login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rutas públicas (auth)
           *
           * Teacher note:
           * - PublicRoute redirige a /dashboard si ya hay sesión
           * - Esto evita que usuario autenticados vean login
           */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Rutas protegidas (requieren autenticación)
           *
           * Teacher note:
           * - PrivateRoute verifica autenticación antes de renderizar
           * - Si no hay sesión, redirige a /login
           */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Ruta 404 - no encontrada
           *
           * Teacher note:
           * - El asterisco(*) captura cualquier ruta no definida
           * - Redirige a /login por defecto
           * - En produccion, considerar una página 404 personalizada
           */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
