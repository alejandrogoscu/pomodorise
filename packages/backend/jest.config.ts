/*
 * Configuración de Jest para test del backend
 *
 * Teacher note:
 * - ts-jest permite ejecutar tests TypeScript sin compilar
 * - testEnvironment: 'node' es necesario para backend (no DOM)
 */
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/**/*.spec.ts",
    "!src/index.ts",
  ],
  coverageDirectory: "coverage",
  verbose: true,
};

export default config;
