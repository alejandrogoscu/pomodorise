import {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { ITask, TaskStatus } from "@pomodorise/shared";
import {
  getTasks,
  deleteTask,
  updateTaskStatus,
} from "../../services/taskService";
import TaskItem from "../TaskItem/TaskItem";
import TaskForm from "../TaskForm/TaskForm";
import Modal from "../Modal/Modal";
import { useToast } from "../../context/ToastContext";
import "./TaskList.css";

type UIFilterType = "all" | TaskStatus;

export interface TaskListHandle {
  loadTasks: () => Promise<void>;
}

interface TaskListProps {
  onTaskChange?: () => void;
}

const TaskList = forwardRef<TaskListHandle, TaskListProps>(
  ({ onTaskChange }, ref) => {
    const [tasks, setTasks] = useState<ITask[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<ITask[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeFilter, setActiveFilter] = useState<UIFilterType>("all");

    const [editingTask, setEditingTask] = useState<ITask | null>(null);
    const [showForm, setShowForm] = useState(false);

    const { showToast } = useToast();

    const loadTasks = useCallback(async () => {
      setIsLoading(true);
      setError("");
      try {
        const fetchedTasks = await getTasks();
        setTasks(fetchedTasks);
      } catch (err: any) {
        console.error("Error al cargar tareas:", err);
        setError(err.response?.data?.error || "Error al cargar tareas");
      } finally {
        setIsLoading(false);
      }
    }, []);

    useImperativeHandle(ref, () => ({
      loadTasks,
    }));

    useEffect(() => {
      loadTasks();
    }, [loadTasks]);

    useEffect(() => {
      if (activeFilter === "all") {
        setFilteredTasks(tasks);
      } else {
        setFilteredTasks(tasks.filter((task) => task.status === activeFilter));
      }
    }, [tasks, activeFilter]);

    const handleFilterChange = (newFilter: UIFilterType) => {
      setActiveFilter(newFilter);
    };

    const handleToggleComplete = async (
      taskId: string,
      newStatus: TaskStatus
    ) => {
      try {
        const updatedTask = await updateTaskStatus(taskId, newStatus);

        setTasks((prevTasks) =>
          prevTasks.map((task) => (task._id === taskId ? updatedTask : task))
        );
      } catch (err: any) {
        console.error("Error al actualizar tarea:", err);

        showToast(
          err.response?.data?.error ||
            "Error al actualizar la tarea. Intenta de nuevo.",
          "error"
        );
      }
    };

    const handleEdit = (task: ITask) => {
      setEditingTask(task);
      setShowForm(true);
    };

    const handleNewtask = () => {
      setEditingTask(null);
      setShowForm(true);
    };

    const handleTaskSuccess = (task: ITask) => {
      if (editingTask) {
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t._id === task._id ? task : t))
        );
      } else {
        setTasks((prevTasks) => [task, ...prevTasks]);
      }

      setShowForm(false);
      setEditingTask(null);

      onTaskChange?.();
    };

    const handleCancelForm = () => {
      setShowForm(false);
      setEditingTask(null);
    };

    const handleDelete = async (taskId: string, taskTitle: string) => {
      try {
        await deleteTask(taskId);

        setTasks((prevTasks) =>
          prevTasks.filter((task) => task._id !== taskId)
        );

        onTaskChange?.();

        showToast(`Tarea "${taskTitle}" eliminada correctamente`, "success");
      } catch (err: any) {
        console.error("Error al eliminar tarea:", err);

        showToast(
          err.response?.data?.error ||
            "Error al eliminar la tarea. Intenta de nuevo.",
          "error"
        );
      }
    };

    const getFilterCount = (filter: UIFilterType): number => {
      if (filter === "all") return tasks.length;
      return tasks.filter((task) => task.status === filter).length;
    };

    const getFilterLabel = (filter: UIFilterType): string => {
      switch (filter) {
        case "all":
          return "Todas";
        case TaskStatus.PENDING:
          return "Pendientes";
        case TaskStatus.IN_PROGRESS:
          return "En progreso";
        case TaskStatus.COMPLETED:
          return "Completadas";
        default:
          return filter;
      }
    };

    return (
      <div className="task-list-container">
        {/* Header con botón de nueva tarea */}
        <div className="task-list-header">
          <h2 className="task-list-title">Mis Tareas</h2>
          <button className="task-list-new-button" onClick={handleNewtask}>
            + Nueva tarea
          </button>
        </div>

        {/* Modal con TaskForm*/}
        <Modal
          isOpen={showForm}
          onClose={handleCancelForm}
          title={editingTask ? "Editar tarea" : "Nueva tarea"}
        >
          <TaskForm
            task={editingTask || undefined}
            onSuccess={handleTaskSuccess}
            onCancel={handleCancelForm}
          />
        </Modal>

        {/* Filtros */}
        <div className="task-list-filters">
          {(
            [
              "all",
              TaskStatus.PENDING,
              TaskStatus.IN_PROGRESS,
              TaskStatus.COMPLETED,
            ] as UIFilterType[]
          ).map((filter) => (
            <button
              key={filter}
              className={`filter-button ${
                activeFilter === filter ? "active" : ""
              }`}
              onClick={() => handleFilterChange(filter)}
            >
              {getFilterLabel(filter)} ({getFilterCount(filter)})
            </button>
          ))}
        </div>

        {/* Estados de carga y error */}
        {isLoading && (
          <div className="task-list-loading">
            <div className="spinner"></div>
            <p>Cargando tareas...</p>
          </div>
        )}

        {error && (
          <div className="task-list-error">
            <p>{error}</p>
            <button className="retry-button" onClick={loadTasks}>
              Reintentar
            </button>
          </div>
        )}

        {/* Lista de tareas */}
        {!isLoading && !error && (
          <div className="task-list-content">
            {filteredTasks.length === 0 ? (
              <div className="task-list-empty">
                <h3>
                  No hay tareas{" "}
                  {activeFilter !== "all" &&
                    getFilterLabel(activeFilter).toLowerCase()}
                </h3>
                <p>
                  {activeFilter === "all"
                    ? "Crea tu primera tarea para comenzar"
                    : "Cambia el filtro o crea una nueva tarea"}
                </p>
              </div>
            ) : (
              <div className="task-list-items">
                {filteredTasks.map((task) => (
                  <TaskItem
                    key={task._id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

TaskList.displayName = "TaskList";

export default TaskList;
