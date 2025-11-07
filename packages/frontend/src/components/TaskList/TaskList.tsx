/*
 * Componente TaskList - Lista completa de tareas con filtros
 *
 * Teacher note:
 * - Componente inteligente (maneja estado y llamadas API)
 * - Compone TaskItem (presentacional) y TaskForm (para editar)
 * - Filtros por TaskStatus: pending, in_progress, completed, all
 * - Empty states para UX clara (sin tareas, loading, error)
 * - Expone loadTasks() al Dashboard mediante forwardRef
 * - NUEVO: Sistema Toast para notificaciones (reemplaza alert)
 *
 * Analogía: TaskList es como un tablero Kanban que organiza tarjetas
 */

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
import { useToast } from "../../context/ToastContext";
import "./TaskList.css";

/*
 * Tipo para los filtros de UI (incluye 'all' que no existe en TaskFilters)
 *
 * Teacher note:
 * - 'all' es un concepto de UI (mostrar todas las tareas)
 * - En la API no hay filtro 'all', simplemente no enviamos status
 * - Separamos el tipo de UI del tipo de API
 */
type UIFilterType = "all" | TaskStatus;

/*
 * Métodos expuestos al componente padre (Dashboard)
 *
 * Teacher note:
 * - Permite al Dashboard llamar a loadTasks() imperativamente
 * - Patrón útil para comunicación entre hermanos vía padre
 */
export interface TaskListHandle {
  loadTasks: () => Promise<void>;
}

/*
 * Props del componente TaskList
 *
 * Teacher note:
 * - onTaskChange: callback cuando se crea/actualiza/elimina una tarea
 * - Permite notificar al Dashboard para refrescar Timer
 */
interface TaskListProps {
  onTaskChange?: () => void;
}

/*
 * Componente TaskList con ref forwarding
 *
 * Teacher note:
 * - forwardRef permite exponer métodos al padre
 * - useImperativeHandle define qué métodos son públicos
 */
const TaskList = forwardRef<TaskListHandle, TaskListProps>(
  ({ onTaskChange }, ref) => {
    // Estado de las tareas
    const [tasks, setTasks] = useState<ITask[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<ITask[]>([]);

    // Estado de UI
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeFilter, setActiveFilter] = useState<UIFilterType>("all");

    // Estado de edición
    const [editingTask, setEditingTask] = useState<ITask | null>(null);
    const [showForm, setShowForm] = useState(false);

    const { showToast } = useToast();

    /*
     * Cargar tareas desde el backend
     *
     * Teacher note:
     * - Función extraída para reutilizar desde useEffect y desde ref
     * - useCallback evita recreación en cada render
     * - Carga todas las tareas y luego filtra en cliente (listas pequeñas)
     */
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

    /*
     * Exponer loadTasks al componente padre
     *
     * Teacher note:
     * - Dashboard puede llamar: taskListRef.current.loadTasks()
     * - Útil para refrescar tras eventos externos (ej: completar pomodoro)
     */
    useImperativeHandle(ref, () => ({
      loadTasks,
    }));

    /*
     * Cargar tareas al montar el componente
     */
    useEffect(() => {
      loadTasks();
    }, [loadTasks]);

    /*
     * Aplicar filtro cuando cambian tareas o filtro activo
     */
    useEffect(() => {
      if (activeFilter === "all") {
        setFilteredTasks(tasks);
      } else {
        setFilteredTasks(tasks.filter((task) => task.status === activeFilter));
      }
    }, [tasks, activeFilter]);

    /*
     * Manejar cambio de filtro
     */
    const handleFilterChange = (newFilter: UIFilterType) => {
      setActiveFilter(newFilter);
    };

    /*
     * Manejar toggle de completado
     *
     * Teacher note:
     * - ACTUALIZADO: Ahora usa Toast en lugar de alert()
     */
    const handleToggleComplete = async (
      taskId: string,
      newStatus: TaskStatus
    ) => {
      try {
        const updatedTask = await updateTaskStatus(taskId, newStatus);

        // Actualizar tarea en el estado local
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task._id === taskId ? updatedTask : task))
        );

        // Mostrar Toast de éxito (opcional, depende de la UX deseada)
        // setToast({
        //   type: "success",
        //   message: `Tarea ${newStatus === TaskStatus.COMPLETED ? 'completada' : 'actualizada'}`,
        // });
      } catch (err: any) {
        console.error("Error al actualizar tarea:", err);

        // ❌ Mostrar Toast de error en lugar de alert()
        showToast(
          err.response?.data?.error ||
            "Error al actualizar la tarea. Intenta de nuevo.",
          "error"
        );
      }
    };

    /*
     * Manejar click en editar
     */
    const handleEdit = (task: ITask) => {
      setEditingTask(task);
      setShowForm(true);
    };

    /*
     * Manejar éxito al crear/editar tarea
     */
    const handleTaskSuccess = (task: ITask) => {
      if (editingTask) {
        // Actualizar tarea existente
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t._id === task._id ? task : t))
        );
      } else {
        // Añadir nueva tarea al inicio
        setTasks((prevTasks) => [task, ...prevTasks]);
      }

      // Cerrar formulario
      setShowForm(false);
      setEditingTask(null);

      // 🔄 Notificar cambio para refrescar Timer
      onTaskChange?.();
    };

    /*
     * Manejar cancelación de formulario
     */
    const handleCancelForm = () => {
      setShowForm(false);
      setEditingTask(null);
    };

    /*
     * Manejar eliminación de tarea
     *
     * Teacher note:
     * - ACTUALIZADO: Ahora recibe taskTitle y muestra Toast
     * - Reemplaza alert() por sistema Toast no bloqueante
     */
    const handleDelete = async (taskId: string, taskTitle: string) => {
      try {
        await deleteTask(taskId);

        // Eliminar tarea del estado local
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task._id !== taskId)
        );

        // 🔄 Notificar cambio para refrescar Timer
        onTaskChange?.();

        // 🎉 Mostrar Toast de éxito
        showToast(`Tarea "${taskTitle}" eliminada correctamente`, "success");
      } catch (err: any) {
        console.error("Error al eliminar tarea:", err);

        // ❌ Mostrar Toast de error
        showToast(
          err.response?.data?.error ||
            "Error al eliminar la tarea. Intenta de nuevo.",
          "error"
        );
      }
    };

    /*
     * Obtener contador de tareas por filtro
     */
    const getFilterCount = (filter: UIFilterType): number => {
      if (filter === "all") return tasks.length;
      return tasks.filter((task) => task.status === filter).length;
    };

    /*
     * Obtener label del filtro
     */
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
          {!showForm && (
            <button
              className="task-list-new-button"
              onClick={() => setShowForm(true)}
            >
              + Nueva tarea
            </button>
          )}
        </div>

        {/* Formulario de creación/edición (condicional) */}
        {showForm && (
          <div className="task-form-wrapper">
            <TaskForm
              task={editingTask || undefined}
              onSuccess={handleTaskSuccess}
              onCancel={handleCancelForm}
            />
          </div>
        )}

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
              // Empty state
              <div className="task-list-empty">
                <p className="empty-icon">📝</p>
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
              // Lista de TaskItem
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
