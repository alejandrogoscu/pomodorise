/*
 * Rutas de autenticación
 *
 * Define los endpoints para registro, login y perfil
 *
 * Teacher note:
 * - Router de Express permite modularizar rutas
 * - Estas rutas se montan en /api/auth (ver index.ts)
 */

import { Router } from "express";
import { register, login, getMe } from "../controllers/authController";
import { protect } from "../middlewares/auth";

const router: Router = Router();

/*
 * POST /api/auth/register
 * Registra un nuevo usuario
 *
 * body: { email, password, name? }
 * Response: { token, user }
 */
router.post("/register", register);

/*
 * POST /api/auth/login
 * Autentica un usuario existente
 *
 * Body: { email, password }
 * Response: { token, user }
 */
router.post("/login", login);

/*
 * GET /api/auth/me
 * Obtiene el perfil del usuario autenticado
 *
 * Headers: Authorization: Bearer <token>
 * Response: { user }
 *
 * Teacher note: Requiere middleware 'protect'
 */
router.get("/me", protect, getMe);

export default router;
