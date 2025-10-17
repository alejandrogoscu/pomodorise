/*
 * Servicio de autenticación
 *
 * Centraliza todas las peticiones relacionadas con auth
 *
 * Teacher note:
 * - Separa lógica de API de componentes y facilita testing
 * - Los sercicios devuelven datos crudos, el contexto maneja el estado
 * - AuthResponse viene de @pomodorise/shared
 */

import api from "./api";
import { RegisterDTO, LoginDTO, AuthResponse, IUser } from "@pomodorise/shared";
