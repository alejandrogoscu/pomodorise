/*
 * Servicio de tareas - centraliza llamadas a la API de tareas
 *
 * Teacher note:
 * - Separar lógica de API de componentes facilita testing
 * - Los servicios devuelven datos crudos, los componentes manejan el estado
 * - Todos los métodos son async (operaciones de red)
 *
 * Analogía: taskService es como un mensajero entre frontend y backend
 */

import api from "./api";
import {
  ITask,
  CreateTaskDTO,
  UpdateTaskDTO,
  TaskFilters,
  TaskStatus,
} from "@pomodorise/shared";

/*
 * Obtiene todas las tareas del usuario autenticado
 *
 * @param filters - Filtros opcionales (completed, limit, offset)
 * @returns Array de tareas
 *
 * @example
 * const tasks = await getTasks({completed: false, limit: 10})
 *
 * Teacher note:
 * - GET /api/tasks
 * - El token JWT se añade automáticamente en el interceptor de axios (api.ts)
 * - Backend valida el token y devuelve solo las tareas del usuario atenticado
 */
export const getTasks = async (filters?: TaskFilters): Promise<ITask[]> => {
  const params = new URLSearchParams();

  if (filters?.status) {
    params.append("status", filters.status);
  }

  if (filters?.limit) {
    params.append("limit", String(filters.limit));
  }

  if (filters?.offset) {
    params.append("offset", String(filters.offset));
  }

  const response = await api.get<{ data: ITask[] }>(
    `/api/tasks?${params.toString()}`
  );

  return response.data.data;
};

/*
 * Obtiene una tarea específica por ID
 *
 * @param taskId - ID de la tarea
 * @returns Tarea encontrada
 * @throws Error si la tarea no existe o no pertenece al usuario
 *
 * @example
 * const task = await getTaskById('60d5ec49f1a2c8b1f8e4e1a1')
 *
 * Teacher note:
 * - GET /api/tasks/:id
 * - Backend verifica que la tarea pertenece al usuario autenticado
 */
export const getTaskById = async (taskId: string): Promise<ITask> => {
  const response = await api.get<{ data: ITask }>(`/api/tasks/${taskId}`);
  return response.data.data;
};

/*
 * Crea una nueva tarea
 *
 * @param data - Datos de la nueva tarea
 * @returns Tarea creada (incluye _id generado por MongoDB)
 *
 * @exmaple
 * const newTask = await createTask({
 *    title: 'Estudiar React Hooks'
 *    estimatedPomodoros: 3
 * })
 *
 * Teacher note:
 * - POST /api/tasks
 * - Backend asigna automáticamente el userId del token JWT
 * - Devuelve la tarea con _id, timestamp y valores por defecto
 */
export const createTask = async (data: CreateTaskDTO): Promise<ITask> => {
  const response = await api.post<{ data: ITask }>("/api/tasks", data);
  return response.data.data;
};

/*
 * Actualiza una tarea existente
 *
 * @param taskId - ID de la tarea a actualizar
 * @param data - Campos a actualizar (solo los que cambian)
 * @returns Tarea actualizada
 *
 * @example
 * const updated = await updateTask('60d5ec49f1a2c8b1f8e4e1a1', {
 *    completed: true
 * });
 *
 * Teacher note:
 * - PUT /api/tasks/:id
 * - Solo enviar campos que cambian (eficiencia)
 * - Backend valida permisos (solo el dueño puede actualizar)
 */
export const updateTask = async (
  taskId: string,
  data: UpdateTaskDTO
): Promise<ITask> => {
  const response = await api.put<{ data: ITask }>(`/api/tasks/${taskId}`, data);
  return response.data.data;
};

/*
 * Elimina una tarea
 *
 * @param taskId - ID de la tarea a eliminar
 * @returns Mensaje de confirmación
 *
 * @example
 * await deleteTask('60d5ec49f1a2c8b1f8e4e1a1')
 *
 * Teacher note:
 * - DELETE /api/tasks/:id
 * - Eliminación permanente (no soft delete en esta versión)
 * - Backend verifica que la tarea pertenece al usuario
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  await api.delete(`/api/tasks/${taskId}`);
};

/**
 * Marca una tarea como completada o pendiente
 *
 * @param taskId - ID de la tarea
 * @param status - Nuevo estado (TaskStatus enum)
 * @returns Tarea actualizada
 *
 * Teacher note:
 * - Ahora usamos TaskStatus.COMPLETED o TaskStatus.PENDING
 * - Más flexible que un simple toggle booleano
 */
export const updateTaskStatus = async (
  taskId: string,
  status: TaskStatus
): Promise<ITask> => {
  return updateTask(taskId, { status });
};

/*
 * Marca una tarea como completada (helper)
 */
export const completeTask = async (taskId: string): Promise<ITask> => {
  return updateTaskStatus(taskId, TaskStatus.COMPLETED);
};

/*
 * Marca una tarea como pendiente (helper)
 */
export const markTaskPending = async (taskId: string): Promise<ITask> => {
  return updateTaskStatus(taskId, TaskStatus.PENDING);
};

/*
 * Incrementa el contador de pomodoros completados de una tarea
 *
 * @param taskId - ID de la tarea
 * @returns Tarea actualizada
 *
 * Teacher note:
 * - Se llamará desde el Timer cuando se complete una sesión
 * - Backend incrementa automáticamente completedPomodoros
 * - Endpoint: POST /api/tasks/:id/complete-pomodoro
 */
export const incrementTaskPomodoro = async (taskId: string): Promise<ITask> => {
  const response = await api.post<{ data: ITask }>(
    `/api/tasks/${taskId}/complete-pomodoro`
  );
  return response.data.data;
};
