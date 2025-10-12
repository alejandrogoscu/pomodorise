/*
 * Tests de autenticación
 *
 * Teacher note:
 * - Usamos supertest para hacer peticiones HTTP a la app sin levantar servidor
 * - En tests de integración usaríamos mongodb-memory-server para BD en memoria
 * - Por ahora mockeamos el modelo User
 */

import request from "supertest";
import app from "../index";
import User from "../models/User";

// Mockear conexión a BD (no queremos conectar a BD real en tests)
jest.mock("../config/db", () => ({
  connectDB: jest.fn(),
}));

// Mockear modelo User
jest.mock("../models/User");

describe("Auth Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("Debería registrar un nuevo usuario", async () => {
      const mockUser = {
        _id: "123",
        email: "test@test.com",
        name: "Test User",
        level: 1,
        points: 0,
        streak: 0,
        save: jest.fn(),
      };

      // Mockear User.findOne para simular que el usuario no existe
      (User.findOne as jest.Mock).mockResolvedValue(null);

      // Mockear User.create para devolver usuario mockeado
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).post("/api/auth/register").send({
        email: "test@test.com",
        password: "password123",
        name: "Test User",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      expect(response.body.user.email).toBe("test@test.com");
    });

    it("Debería fallas si el email ya existe", async () => {
      // Mockear User.findOne para simular que el usuario ya existe
      (User.findOne as jest.Mock).mockResolvedValue({
        email: "test@test.com",
      });

      const response = await request(app).post("/api/auth/register").send({
        email: "test@test.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("ya está registrado");
    });
  });

  describe("POST /api/auth/login", () => {
    it("Debería autenticar con credenciales válidas", async () => {
      const mockUser = {
        _id: "123",
        email: "test@test.com",
        name: "Test User",
        level: 1,
        points: 0,
        streak: 0,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      // Mockear búsqueda de usuario
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const response = await request(app).post("/api/auth/login").send({
        email: "test@test.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
    });

    it("Debería fallas con credenciales inválidas", async () => {
      // Usuario no encontrado
      (User.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const response = await request(app).post("/api/auth/login").send({
        email: "test@test.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain("Credenciales inválidas");
    });
  });
});
