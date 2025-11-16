import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()] as unknown as any,

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@pomodorise/shared": path.resolve(__dirname, "../shared/src"),
    },
  },

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

  build: {
    outDir: "dist",
    sourcemap: true,
  },

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
  },
});
