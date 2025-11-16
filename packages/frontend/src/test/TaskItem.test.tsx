import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TaskItem from "@/components/TaskItem/TaskItem";
import { ITask, TaskStatus, TaskPriority } from "@pomodorise/shared";

const mockTask: ITask = {
  _id: "123",
  title: "Test Task",
  description: "Test description",
  estimatedPomodoros: 4,
  completedPomodoros: 2,
  status: TaskStatus.PENDING,
  priority: TaskPriority.MEDIUM,
  userId: "user1",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("TaskItem", () => {
  test("debe renderizar la tarea correctamente", () => {
    render(<TaskItem task={mockTask} />);

    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
    expect(screen.getByText("2/4")).toBeInTheDocument();
  });

  test("debe mostrar checkbox sin marcar si task.status es PENDING", () => {
    render(<TaskItem task={mockTask} />);

    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  test("debe mostrar checkbox marcado si task.status es COMPLETED", () => {
    const completedTask = { ...mockTask, status: TaskStatus.COMPLETED };
    render(<TaskItem task={completedTask} />);

    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  test("debe calcular el progreso correctamente", () => {
    render(<TaskItem task={mockTask} />);

    const progressFill = document.querySelector(
      ".task-progress-fill"
    ) as HTMLElement;
    expect(progressFill.style.width).toBe("50%"); // 2/4 = 50%
  });

  test("debe llamar onToggleComplete al hacer click en checkbox", () => {
    const mockToggle = vi.fn();
    render(<TaskItem task={mockTask} onToggleComplete={mockToggle} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(mockToggle).toHaveBeenCalledWith("123", TaskStatus.COMPLETED);
  });

  test("debe alternar de COMPLETED a PENDING al hacer click", () => {
    const mockToggle = vi.fn();
    const completedTask = { ...mockTask, status: TaskStatus.COMPLETED };
    render(<TaskItem task={completedTask} onToggleComplete={mockToggle} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(mockToggle).toHaveBeenCalledWith("123", TaskStatus.PENDING);
  });

  test("debe llamar onEdit al hacer click en botón editar", () => {
    const mockEdit = vi.fn();
    render(<TaskItem task={mockTask} onEdit={mockEdit} />);

    const editButton = screen.getByLabelText("Editar tarea");
    fireEvent.click(editButton);

    expect(mockEdit).toHaveBeenCalledWith(mockTask);
  });

  test("debe mostrar confirmación y llamar onDelete al eliminar", () => {
    const mockDelete = vi.fn();
    global.confirm = vi.fn(() => true);

    render(<TaskItem task={mockTask} onDelete={mockDelete} />);

    const deleteButton = screen.getByLabelText("Eliminar tarea");
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalledWith('¿Eliminar "Test Task"?');
    expect(mockDelete).toHaveBeenCalledWith("123");
  });

  test("NO debe llamar onDelete si el usuario cancela confirmación", () => {
    const mockDelete = vi.fn();
    global.confirm = vi.fn(() => false);

    render(<TaskItem task={mockTask} onDelete={mockDelete} />);

    const deleteButton = screen.getByLabelText("Eliminar tarea");
    fireEvent.click(deleteButton);

    expect(global.confirm).toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });

  test("NO debe renderizar botones si no hay callbacks", () => {
    render(<TaskItem task={mockTask} />);

    expect(screen.queryByLabelText("Editar tarea")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Eliminar tarea")).not.toBeInTheDocument();
  });

  test("debe aplicar clase completed si task.status es COMPLETED", () => {
    const completedTask = { ...mockTask, status: TaskStatus.COMPLETED };
    const { container } = render(<TaskItem task={completedTask} />);

    const taskItem = container.querySelector(".task-item");
    expect(taskItem).toHaveClass("task-item-completed");
  });

  test("NO debe mostrar descripción si no existe", () => {
    const taskWithoutDescription = { ...mockTask, description: "" };
    render(<TaskItem task={taskWithoutDescription} />);

    expect(screen.queryByText("Test description")).not.toBeInTheDocument();
  });

  test("debe manejar progreso de 0%", () => {
    const taskNoProgress = { ...mockTask, completedPomodoros: 0 };
    render(<TaskItem task={taskNoProgress} />);

    const progressFill = document.querySelector(
      ".task-progress-fill"
    ) as HTMLElement;
    expect(progressFill.style.width).toBe("0%");
  });

  test("debe manejar progreso de 100%", () => {
    const taskComplete = { ...mockTask, completedPomodoros: 4 };
    render(<TaskItem task={taskComplete} />);

    const progressFill = document.querySelector(
      ".task-progress-fill"
    ) as HTMLElement;
    expect(progressFill.style.width).toBe("100%");
  });

  test("debe limitar progreso a 100% si completedPomodoros > estimatedPomodoros", () => {
    const taskOverComplete = { ...mockTask, completedPomodoros: 6 };
    render(<TaskItem task={taskOverComplete} />);

    const progressFill = document.querySelector(
      ".task-progress-fill"
    ) as HTMLElement;
    expect(progressFill.style.width).toBe("100%");
  });
});
