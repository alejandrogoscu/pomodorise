/*
 * Barrel export para el paquete @pomodorise/shared
 *
 * Exporta todos los tipos, interfaces y utilidades compartidas
 *
 * Teacher note:
 * - Este archivo actúa como punto de entrada único
 * - Simplifica imports: `import { IUser } from '@pomodorise/shared'`
 * - Em lugar de: `import { IUser } from '@pomodorise/shared/types'`
 */

// Exportar todos los tipos
export * from "./types";

// Exportar utilidades
export * from "./utils/score";
