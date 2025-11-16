export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

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

export interface IUserDocument {
  _id: string;
  email: string;
  password: string; // Hash, nunca texto plano
  name?: string;
  level: number;
  points: number;
  streak: number;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface UserStats {
  totalSessions: number;
  totalMinutes: number;
  completedPomodoros: number;
  averageSessionDuration: number;
  sessionsPerDay: Array<{ date: string; count: number }>;
  pointsEarned: number;
}

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

export interface ISession {
  _id: string;
  userId: string;
  taskId?: string; // Opcional: puede ser una sesión sin tarea asignada
  duration: number; // Duración en minutos (25 para pomodoro estándar)
  type: "work" | "break" | "long_break";
  completed: boolean;
  pointsEarned: number;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

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
  priority?: TaskPriority;
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
  type: "work" | "break" | "long_break";
}

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

export interface TaskFilters {
  status?: TaskStatus;
  limit?: number;
  offset?: number;
}
