/*
 * Tipos y enums compartidos entre backend y frontend
 *
 * Teacher note:
 * - Estos tipos son la 'fuente de verdad' del dominio de la aplicación
 * - Backend usa estos tipos para validación con Zod
 * - Frontend los usa para tipar respuestas de la API
 * - Evitan duplicación y errores de sincronización
 */

/*
 * Enum para estados de las tareas
 *
 * Teacher note:
 * - Un enum es un conjunto fijo de valores posibles
 * - TypeScript lo convierte en string literals en runtime
 */
export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

/*
 * Enum para prioridades de tareas
 */
export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

/*
 * Enum para tipos de tareas
 */
export enum TaskType {
  WORK = "work",
  SHORT_BREAK = "short_break",
  LONG_BREAK = "long_break",
}

/*
 * Interface base para Usuario
 *
 * Teacher note:
 * - Omite detalles de implementación de Mongoose (save, remove, etc)
 * - Frontend NO necesita estos métodos
 * - _id como string porque frontend trabaja con strings, no ObjectId
 */
export interface IUser {
  _id: string; // En frontend será string, en backend ObjectId
  email: string;
  name?: string;
  level: number;
  points: number;
  streak: number;
  createdAt: Date;
  updatedAt: Date;
}

/*
 * Interface para Tareas
 *
 * Teacher note:
 * - userId como string para simplificar en frontend
 * - Backend lo convertirá a ObjectId cuando sea necesario
 */
export interface ITask {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedPomodoros: number;
  completedPomodoros: number;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/*
 * Interface para Sesiones de Pomodoro
 *
 * Teacher note:
 * - Registra cada sesión completada
 * - Se usa para calcular puntos, rachas y estadísticas
 */
export interface ISession {
  _id: string;
  userId: string;
  taskId?: string; // Opcional: puede ser una sesión sin tarea asignada
  duration: number;
  type: TaskType;
  completed: boolean;
  pointsEarned: number;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/*
 * DTOs (Data Transfer Objects) para requests del frontend
 *
 * Teacher note:
 * - Estos tipos representan la estructura de datos en requests HTTP
 * - Separan el modelo de BD de lo que el usuario envía
 */
export interface RegisterDTO {
  email: string;
  password: string;
  name?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority: TaskPriority;
  estimatedPomodoros: number;
  dueDate?: Date;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  estimatedPomodoros?: number;
  completedPomodoros?: number;
  dueDate?: Date;
}

export interface CreateSessionDTO {
  taskId?: string;
  duration: number;
  type: TaskType;
}

/*
 * Tipos para respuestas de la API
 *
 * Teacher note:
 * - Envuelven los datos en un formato consistente
 * - Facilitan manejo de errores en frontend
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  user: IUser;
  token: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
