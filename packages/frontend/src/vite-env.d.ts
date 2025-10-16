/// <reference types="vite/client" />

/*
 * Declaraciones de tipos para Vite
 *
 * Teacher note:
 * - Este archivo le dice a TypeScript que confíe en los tipos de Vite
 * - Permite usar import.meta.env con autocompletado
 */

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Añadir más variables de entorno aquí según sea necesario
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
