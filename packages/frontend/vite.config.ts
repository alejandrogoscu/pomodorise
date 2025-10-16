/*
 * Configuración de Vite para desarrollo y build
 *
 * Teacher note:
 * - Vite usa esbuild para compilar TypeScript (mucho más rápido que tsc)
 * - Los alias deben coincidir con los paths del tsconfig.json
 * - El proxy evita problemas de CORS en desarrollo
 */

/*
 * Configuración de Vite para desarrollo y build
 */
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()] as unknown as any,

  /*
   * Alias para imports limpios
   *
   * Teacher note:
   * - '@/' apunta a src/ (evita ../../../)
   * - '@pomodorise/shared' apunta al paquete shared del monorepo
   */
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@pomodorise/shared": path.resolve(__dirname, "../shared/src"),
    },
  },

  /*
   * Servidor de desarrollo
   *
   * Teacher note:
   * - proxy: redirige /api/* al backend para evitar CORS
   * - En producción, nginx/traefik hace este trabajo
   */
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  /*
   * Configuración de build
   *
   * Teacher note:
   * - outDir: carpeta de salida (dist/)
   * - sourcemap: útil para debugging en producción
   */
  build: {
    outDir: "dist",
    sourcemap: true,
  },

  /*
   * Configuración de Vitest (testing)
   *
   * Teacher note:
   * - globals: permite usar expect() sin importarlo
   * - environment: 'jsdom' simula el DOM para tests de React
   */
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts", // Archivo de setup (lo crearemos después)
  },
});
