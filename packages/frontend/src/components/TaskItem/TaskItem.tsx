import { ITask, TaskPriority, TaskStatus } from "@pomodorise/shared";
import "./TaskItem.css";

interface TaskItemProps {
  task: ITask;
  onToggleComplete?: (taskId: string, newStatus: TaskStatus) => void;
  onEdit?: (task: ITask) => void;
  onDelete?: (taskId: string, taskTitle: string) => void;
}

function TaskItem({ task, onToggleComplete, onEdit, onDelete }: TaskItemProps) {
  const isCompleted = task.status === TaskStatus.COMPLETED;

  const progressPercentage =
    task.estimatedPomodoros > 0
      ? Math.min((task.completedPomodoros / task.estimatedPomodoros) * 100, 100)
      : 0;

  const handleToggleComplete = () => {
    if (onToggleComplete) {
      const newStatus = isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED;
      onToggleComplete(task._id, newStatus);
    }
  };

  const getPriorityClass = (): string => {
    switch (task.priority) {
      case TaskPriority.HIGH:
        return "task-priority-high";
      case TaskPriority.MEDIUM:
        return "task-priority-medium";
      case TaskPriority.LOW:
        return "task-priority-low";
      default:
        return "";
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task._id, task.title);
    }
  };
  return (
    <div
      className={`task-item ${
        isCompleted ? "task-item-completed" : ""
      } ${getPriorityClass()}`}
    >
      {/* Checkbox para marcar como completada */}
      <div className="task-item-checkbox">
        <input
          type="checkbox"
          id={`task-${task._id}`}
          checked={isCompleted}
          onChange={handleToggleComplete}
          disabled={!onToggleComplete}
          className="task-checkbox"
        />
        <label
          htmlFor={`task-${task._id}`}
          className="task-checkbox-label"
        ></label>
      </div>

      {/* Contenido principal de la tarea */}
      <div className="task-item-content">
        {/* Título con indicador de prioridad */}
        <h4 className="task-item-title">{task.title}</h4>
        {task.priority !== TaskPriority.MEDIUM && (
          <span className={`task-priority-badge ${getPriorityClass()}`}>
            {task.priority === TaskPriority.HIGH ? "🔴" : "🟢"}
          </span>
        )}

        {/* Descripción si existe */}
        {task.description && (
          <p className="task-item-description">{task.description}</p>
        )}

        {/* Progreso de pomodoros */}
        <div className="task-item-progress">
          <div className="task-progress-bar">
            <div
              className="task-progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="task-progress-text">
            {`${task.completedPomodoros}/${task.estimatedPomodoros}`}
          </span>
        </div>
      </div>

      {/* Acciones (editar y eliminar) */}
      <div className="task-item-actions">
        {onEdit && (
          <button
            className="task-action-button task-action-edit"
            onClick={handleEdit}
            title="Editar tarea"
            aria-label="Editar tarea"
          >
            <svg
              width={22}
              height={22}
              fill="var(--color-accent)"
              aria-hidden="true"
            >
              <use href="/icons.svg#icon-edit" />
            </svg>
          </button>
        )}

        {onDelete && (
          <button
            className="task-action-button task-action-delete"
            onClick={handleDelete}
            title="Eliminar tarea"
            aria-label="Eliminar tarea"
          >
            <svg
              width={22}
              height={22}
              fill="var(--color-accent)"
              aria-hidden="true"
            >
              <use href="/icons.svg#icon-delete" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskItem;
