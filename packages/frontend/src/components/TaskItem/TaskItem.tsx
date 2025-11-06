/*
 * Componente TaskItem - Representación individual de una tarea
 *
 * Teacher note:
 * - Componente presentacional (recibe datos y callbacks como props)
 * - No maneja estado interno de la tarea (lo hace el padre: TaskList)
 * - Acciones: toggle complete, edit, delete
 * - Progreso visual: completedPomodoros / estimatedPomodoros
 *
 * Analogía: TaskItem es como una tarjeta en un tablero Kanban
 * (muestra info y acciones, pero el tablero controla la lista)
 */

import { ITask, TaskPriority, TaskStatus } from "@pomodorise/shared";
import "./TaskItem.css";

/*
 * Props del componente TaskItem
 *
 * Teacher note:
 * - task: datos de la tarea a mostrar
 * - onToggleComplete: callback al marcar/descmarcar como completada
 * - onEdit: callback al hacer click en editar
 * - onDelete: callback al hacer click en eliminar
 * - Todos los callbacks son opcionales (permite TaskItem de solo lectura)
 */
interface TaskItemProps {
  task: ITask;
  onToggleComplete?: (taskId: string, newStatus: TaskStatus) => void;
  onEdit?: (task: ITask) => void;
  onDelete?: (taskId: string, taskTitle: string) => void;
}

/*
 * Componente TaskItem
 *
 * @example
 * <TaskITem
 *    task={myTask}
 *    onToggleComplete={(id, completed) => handleToggle(id, completed)}
 *    onEdit={(task) => setEditingTask(task)}
 *    onDelete={(id) => handleDelete(id)}
 * />
 */
function TaskItem({ task, onToggleComplete, onEdit, onDelete }: TaskItemProps) {
  /*
   * Determinar si la tarea está completada
   *
   * Teacher note:
   * - Ahora comparamos con TaskStatus.COMPLETED
   * - Más explícito y type-safe
   */
  const isCompleted = task.status === TaskStatus.COMPLETED;

  /*
   * Calcular porcentaje de progreso
   *
   * Teacher note:
   * - Divide pomodoros completados entre estimados
   * - Si estimatedPomodoros es 0, devolver 0 (evitar división por 0)
   * - Se usa para la barra de progreso visual
   */
  const progressPercentage =
    task.estimatedPomodoros > 0
      ? Math.min((task.completedPomodoros / task.estimatedPomodoros) * 100, 100)
      : 0;

  /*
   * Manejar toggle de completado
   *
   * Teacher note:
   * - Si está completada, volver a PENDING
   * - Si está pendiente o en progreso, marcar como COMPLETED
   */
  const handleToggleComplete = () => {
    if (onToggleComplete) {
      const newStatus = isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED;
      onToggleComplete(task._id, newStatus);
    }
  };

  /*
   * Obtener clase CSS según prioridad
   */
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

  /*
   * Manejar click en editar
   */
  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
  };

  /*
   * Manejar click en eliminar
   */
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
            ✏️
          </button>
        )}

        {onDelete && (
          <button
            className="task-action-button task-action-delete"
            onClick={handleDelete}
            title="Eliminar tarea"
            aria-label="Eliminar tarea"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskItem;
