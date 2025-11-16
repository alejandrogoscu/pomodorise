import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TaskList from "@/components/TaskList/TaskList";
import * as taskService from "../services/taskService";
import { ITask, TaskStatus, TaskPriority } from "@pomodorise/shared";

vi.mock("../services/taskService");
const mockedTaskService = taskService as any;

vi.mock("../TaskItem/TaskItem", () => ({
  __esModule: true,
  default: ({ task, onToggleComplete, onDelete }: any) => (
    <div data-testid="task-item">
      <span>{task.title}</span>
      <input
        type="checkbox"
        role="checkbox"
        checked={task.status === TaskStatus.COMPLETED}
        onChange={() =>
          onToggleComplete(
            task._id,
            task.status === TaskStatus.COMPLETED
              ? TaskStatus.PENDING
              : TaskStatus.COMPLETED
          )
        }
      />
      <button aria-label="Eliminar tarea" onClick={() => onDelete(task._id)}>
        Eliminar
      </button>
    </div>
  ),
}));

vi.mock("../TaskForm/TaskForm", () => ({
  __esModule: true,
  default: ({ onCancel }: any) => (
    <div>
      <h3>Nueva tarea</h3>
      <button onClick={onCancel}>Cancelar</button>
    </div>
  ),
}));

const mockTasks: ITask[] = [
  {
    _id: "1",
    userId: "user1",
    title: "Tarea pendiente",
    description: "Descripción pendiente",
    status: TaskStatus.PENDING,
    priority: TaskPriority.HIGH,
    estimatedPomodoros: 3,
    completedPomodoros: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "2",
    userId: "user1",
    title: "Tarea en progreso",
    description: "",
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    estimatedPomodoros: 2,
    completedPomodoros: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "3",
    userId: "user1",
    title: "Tarea completada",
    description: "",
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.LOW,
    estimatedPomodoros: 1,
    completedPomodoros: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("TaskList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("debe mostrar loading al cargar tareas", () => {
    mockedTaskService.getTasks.mockReturnValue(new Promise(() => {})); // Never resolves

    render(<TaskList />);

    expect(screen.getByText("Cargando tareas...")).toBeInTheDocument();
    expect(document.querySelector(".spinner")).toBeInTheDocument();
  });

  test("debe cargar y mostrar tareas correctamente", async () => {
    mockedTaskService.getTasks.mockResolvedValueOnce(mockTasks);

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText("Tarea pendiente")).toBeInTheDocument();
      expect(screen.getByText("Tarea en progreso")).toBeInTheDocument();
      expect(screen.getByText("Tarea completada")).toBeInTheDocument();
    });
  });

  test("debe mostrar error si falla la carga", async () => {
    mockedTaskService.getTasks.mockRejectedValueOnce(
      new Error("Network error")
    );

    render(<TaskList />);

    await waitFor(() => {
      expect(
        screen.getByText(/error al cargar las tareas/i)
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Reintentar")).toBeInTheDocument();
  });

  test("debe filtrar tareas por estado", async () => {
    mockedTaskService.getTasks.mockResolvedValueOnce(mockTasks);

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText("Tarea pendiente")).toBeInTheDocument();
    });

    const pendingButton = screen.getByText(/Pendientes \(1\)/);
    fireEvent.click(pendingButton);

    await waitFor(() => {
      expect(screen.getByText("Tarea pendiente")).toBeInTheDocument();
      expect(screen.queryByText("Tarea en progreso")).not.toBeInTheDocument();
      expect(screen.queryByText("Tarea completada")).not.toBeInTheDocument();
    });

    const completedButton = screen.getByText(/Completadas \(1\)/);
    fireEvent.click(completedButton);

    await waitFor(() => {
      expect(screen.getByText("Tarea completada")).toBeInTheDocument();
      expect(screen.queryByText("Tarea pendiente")).not.toBeInTheDocument();
    });
  });

  test("debe mostrar empty state cuando no hay tareas", async () => {
    mockedTaskService.getTasks.mockResolvedValueOnce([]);

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText(/No hay tareas/i)).toBeInTheDocument();
    });
  });

  test("debe mostrar botón de nueva tarea", async () => {
    mockedTaskService.getTasks.mockResolvedValueOnce(mockTasks);

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText("+ Nueva tarea")).toBeInTheDocument();
    });
  });

  test("debe mostrar formulario al hacer click en nueva tarea", async () => {
    mockedTaskService.getTasks.mockResolvedValueOnce(mockTasks);

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText("+ Nueva tarea")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("+ Nueva tarea"));

    await waitFor(() => {
      expect(screen.getByText("Nueva tarea")).toBeInTheDocument();
    });
  });

  test("debe actualizar tarea al toggle complete", async () => {
    const updatedTask = { ...mockTasks[0], status: TaskStatus.COMPLETED };
    mockedTaskService.getTasks.mockResolvedValueOnce(mockTasks);
    mockedTaskService.updateTaskStatus.mockResolvedValueOnce(updatedTask);

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText("Tarea pendiente")).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]); // toggle

    await waitFor(() => {
      expect(mockedTaskService.updateTaskStatus).toHaveBeenCalledWith(
        "1",
        TaskStatus.COMPLETED
      );
    });
  });

  test("debe mostrar confirmación al eliminar tarea", async () => {
    mockedTaskService.getTasks.mockResolvedValueOnce(mockTasks);
    mockedTaskService.deleteTask.mockResolvedValueOnce(undefined);
    global.confirm = vi.fn(() => true);

    render(<TaskList />);

    await waitFor(() => {
      expect(screen.getByText("Tarea pendiente")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText("Eliminar tarea");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockedTaskService.deleteTask).toHaveBeenCalledWith("1");
    });
  });
});
