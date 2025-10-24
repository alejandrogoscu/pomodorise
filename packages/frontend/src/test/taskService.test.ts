/*
 * Test del servicio
 *
 * Teacher note:
 * - Usamos mock de axios para evitar llamadas reales a la API
 * - Verificamos que los datos se formatean correctamente
 * - Importante: estos son test unitarios (no de integración)
 */

import { vi } from "vitest";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService";
import api from "../services/api";
import { TaskStatus } from "@pomodorise/shared";

// Mock del módulo api (ruta debe coincidir exactamente)
vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Tipado básico para el mock
const mockedApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

describe("taskService", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getTask", () => {
    test("debe obtener lista de tareas", async () => {
      const mockTasks = [
        {
          _id: "1",
          title: "Tarea 1",
          completed: false,
          estimatedPomodoros: 2,
          completedPomodoros: 0,
        },
      ];

      mockedApi.get.mockResolvedValueOnce({ data: { data: mockTasks } });

      const tasks = await getTasks();

      expect(mockedApi.get).toHaveBeenCalledWith("/tasks?");
      expect(tasks).toEqual(mockTasks);
    });

    test("debe aplicar filtros en query params", async () => {
      mockedApi.get.mockResolvedValueOnce({ data: { data: [] } });

      await getTasks({ completed: true, limit: 5 });

      expect(mockedApi.get).toHaveBeenLastCalledWith(
        expect.stringContaining("completed=true")
      );
      expect(mockedApi.get).toHaveBeenCalledWith(
        expect.stringContaining("limit=5")
      );
    });
  });

  describe("createTask", () => {
    test("debe crear una nueva tarea", async () => {
      const newTaskData = {
        title: "Nueva tarea",
        estimatedPomodoros: 3,
      };

      const mockCreatedTask = {
        _id: "2",
        ...newTaskData,
        completed: false,
        completedPomodoros: 0,
      };

      mockedApi.post.mockResolvedValueOnce({ data: { data: mockCreatedTask } });

      const task = await createTask(newTaskData);

      expect(mockedApi.post).toHaveBeenCalledWith("/tasks", newTaskData);
      expect(task).toEqual(mockCreatedTask);
    });
  });

  describe("updateTask", () => {
    test("debe actualizar una tarea", async () => {
      const taskId = "1";
      const updateData = { status: TaskStatus.COMPLETED };
      const mockUpdatedTask = {
        _id: taskId,
        title: "Tarea actualizada",
        status: TaskStatus.COMPLETED,
      };

      mockedApi.put.mockResolvedValueOnce({ data: { data: mockUpdatedTask } });

      const task = await updateTask(taskId, updateData);

      expect(mockedApi.put).toHaveBeenLastCalledWith(
        `/tasks/${taskId}`,
        updateData
      );
      expect(task.status).toBe(TaskStatus.COMPLETED);
    });
  });

  describe("deleteTask", () => {
    test("debe eliminar una tarea", async () => {
      const taskId = "1";
      mockedApi.delete.mockResolvedValueOnce({ data: {} });

      await deleteTask(taskId);

      expect(mockedApi.delete).toHaveBeenCalledWith(`/tasks/${taskId}`);
    });
  });
});
