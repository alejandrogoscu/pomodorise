import api from "./api";
import {
  ITask,
  CreateTaskDTO,
  UpdateTaskDTO,
  TaskFilters,
  TaskStatus,
} from "@pomodorise/shared";

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

export const getTaskById = async (taskId: string): Promise<ITask> => {
  const response = await api.get<{ data: ITask }>(`/api/tasks/${taskId}`);
  return response.data.data;
};

export const createTask = async (data: CreateTaskDTO): Promise<ITask> => {
  const response = await api.post<{ data: ITask }>("/api/tasks", data);
  return response.data.data;
};

export const updateTask = async (
  taskId: string,
  data: UpdateTaskDTO
): Promise<ITask> => {
  const response = await api.put<{ data: ITask }>(`/api/tasks/${taskId}`, data);
  return response.data.data;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  await api.delete(`/api/tasks/${taskId}`);
};

export const updateTaskStatus = async (
  taskId: string,
  status: TaskStatus
): Promise<ITask> => {
  return updateTask(taskId, { status });
};

export const completeTask = async (taskId: string): Promise<ITask> => {
  return updateTaskStatus(taskId, TaskStatus.COMPLETED);
};

export const markTaskPending = async (taskId: string): Promise<ITask> => {
  return updateTaskStatus(taskId, TaskStatus.PENDING);
};

export const incrementTaskPomodoro = async (taskId: string): Promise<ITask> => {
  const response = await api.post<{ data: ITask }>(
    `/api/tasks/${taskId}/complete-pomodoro`
  );
  return response.data.data;
};
