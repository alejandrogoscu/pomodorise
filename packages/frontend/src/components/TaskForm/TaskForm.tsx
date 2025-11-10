/*
 * Componente TaskForm - Formulario para crear/editar tareas
 *
 * Teacher note:
 * - Componente controlado (useState para inputs)
 * - Modo dual: create (sin taskId) o edit (con taskId y datos iniciales)
 * - Validación básica en cliente (backend también valida)
 * - Maneja estados: idle, loading, error, success
 *
 * Analogía: TaskForm es como una solicitud de papel (formulario físico)
 * que validas antes de enviar al departamento correspondiente
 */

import { useState, FormEvent, useEffect, ChangeEvent } from "react";
import { ITask, CreateTaskDTO, UpdateTaskDTO } from "@pomodorise/shared";
import { createTask, updateTask } from "../../services/taskService";
import "./TaskForm.css";

/*
 * Props del componente TaskForm
 *
 * Teacher note:
 * - Si task existe, el formulario esta en modo "editar"
 * - onSuccess se llama después de crear/editar exitosamente
 * - onCancel permite cerrar el formulario sin guardar
 */
interface TasksFormProps {
  task?: ITask; // Si existe, modo editar
  onSuccess: (task: ITask) => void; // Callback después de crear/editar
  onCancel?: () => void; // Callback para cancelar
}

/*
 * Límite de caracteres para descripción y Limite  pomodoros
 *
 * Teacher note:
 * - Calculado para ~3-4 líneas de texto (80px de altura)
 * - Aproximadamente 15-20 caracteres por línea
 * - 200 caracteres = ~4 líneas cómodas
 */
const MAX_DESCRIPTION_LENGTH = 200;
const MIN_POMODOROS = 1;
const MAX_POMORODOS = 20;

/*
 * Componente TaskForm
 *
 * @example
 * // Modo crear
 * <TaskForm onSuccess={(task) => console.log('Creada:', task)} />
 *
 * @example
 * // Modo editar
 * <TaskForm
 *    task={existingTask}
 *    onSuccess={(task) => console.log('Actualizada:', task)}
 *    onCancel={() => setEditMode(false)}
 * />
 */
function TaskForm({ task, onSuccess, onCancel }: TasksFormProps) {
  // Determinar si estamos editando o creando
  const isEditMode = Boolean(task);

  // Estado del formulario
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(
    task?.estimatedPomodoros.toString() || "1"
  );

  // Estado de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Errores de validación por campo
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    estimatedPomodoros?: string;
  }>({});

  /*
   * Efecto para actualizar campos cuando cambia task (modo editar)
   *
   * Teacher note:
   * - Necesario si el componente ya está montado y recibe un task diferente
   * - Ejemplo: editar tarea A, luego editar tarea B sin desmontar
   */
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setEstimatedPomodoros(task.estimatedPomodoros.toString());
    }
  }, [task]);

  /*
   * Manejar cambio en textarea con validaciones
   *
   * Teacher note:
   * - Limita caracteres al máximo definido
   * - Previene tabs excesivos (máximo 2 consecutivos)
   * - Reemplaza múltiples espacios por uno solo
   */
  const HandleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    let value = e.target.value;

    // Limitar a MAX_DESCRIPTION_LENGTH caracteres
    if (value.length > MAX_DESCRIPTION_LENGTH) {
      value = value.slice(0, MAX_DESCRIPTION_LENGTH);
    }

    // Prevenir tabs excesivos (máximo 2 tabs consecutivos)
    value = value.replace(/\n{3,}/g, "\n\n");

    // Remplazar múltiples espacios por uno solo
    value = value.replace(/  +/g, " ");

    setDescription(value);
  };

  /*
   * Validar input de pomodoros (solo números)
   *
   * Teacher note:
   * - Acepta solo dígitos (regex /^\d*$/)
   * - Permite string vacío temporalmente (validación al submit)
   * - Bloquea letras, símbolos, decímales
   */
  const handlePomodorosChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "" || /^\d+$/.test(value)) {
      const numValue = parseInt(value, 10);

      if (!isNaN(numValue)) {
        if (numValue <= MAX_POMORODOS) {
          setEstimatedPomodoros(value);
        }
      } else {
        setEstimatedPomodoros(value);
      }
    }
  };

  /*
   * Validar campos del formulario
   *
   * Teacher note:
   * - Validaciónen cliente para UX (feedback inmediato)
   * - Backend también valida (seguridad)
   * - Reglas: title no vacío, pomodoros entre 1-20
   */
  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};

    // Validar título
    if (!title.trim()) {
      errors.title = "El título es obligatorio";
    } else if (title.length > 100) {
      errors.title = "El título no puede exceder 100 caracteres";
    }

    // Validara pomodoros estimados
    const pomodorosNum = parseInt(estimatedPomodoros, 10);

    if (estimatedPomodoros === "" || isNaN(pomodorosNum)) {
      errors.estimatedPomodoros = "Los pomodoros estimados son obligatorios";
    } else if (pomodorosNum < MIN_POMODOROS) {
      errors.estimatedPomodoros = `Mínimo ${MIN_POMODOROS} pomodoro`;
    } else if (pomodorosNum > MAX_POMORODOS) {
      errors.estimatedPomodoros = `Máximo ${MAX_POMORODOS} pomodoros`;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /*
   * Manejar submit del formulario
   *
   * Teacher note:
   * - Distingue entre crear y actualizar según isEditMode
   * - Llama al servicio correspondiente (createTask o updateTask)
   * - Maneja errores de red y del backend
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Limpiar errores previos
    setError("");
    setFieldErrors({});

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const pomodorosNum = parseInt(estimatedPomodoros, 10);
      let savedTask: ITask;

      if (isEditMode && task) {
        // Modo editar: solo enviar campos que cambiaron
        const updates: UpdateTaskDTO = {};
        if (title !== task.title) updates.title = title;
        if (description !== task.description) updates.description = description;
        if (pomodorosNum !== task.estimatedPomodoros) {
          updates.estimatedPomodoros = pomodorosNum;
        }

        savedTask = await updateTask(task._id, updates);
      } else {
        // Modo crear: enviar todos los campos
        const newTaskData: CreateTaskDTO = {
          title: title.trim(),
          description: description.trim() || undefined,
          estimatedPomodoros: pomodorosNum,
        };

        savedTask = await createTask(newTaskData);
      }

      // Éxito: limpiar formulario y llamar callback
      setTitle("");
      setDescription("");
      setEstimatedPomodoros("1");
      onSuccess(savedTask);
    } catch (err: any) {
      console.error("Error al guardar tarea:", err);

      // Mostrar mensaje de error amigable
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status >= 500) {
        setError("Error del servidor. Intenta más tarde");
      } else {
        setError("Error al guardar la tarea. Verifica tu conexión");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * Manejar cancelación
   */
  const handleCancel = () => {
    // Limpiar formulario
    setTitle("");
    setDescription("");
    setEstimatedPomodoros("1");
    setError("");
    setFieldErrors({});

    // LLamar callback si existe
    if (onCancel) {
      onCancel();
    }
  };

  /*
   * Determinar si se acerca al límite
   *
   * Teacher note:
   * - Feedback visual para usuario
   * - Cambia color del contador a warning
   */
  const isNearLimit = description.length > MAX_DESCRIPTION_LENGTH * 0.8;

  return (
    <div className="task-form-container">
      <h3 className="task-form-title">
        {isEditMode ? "Editar tarea" : "Nueva tarea"}
      </h3>

      {/* Mensaje de error general */}
      {error && <div className="form-alert error">{error}</div>}

      <form className="task-form" onSubmit={handleSubmit}>
        {/* Campo Título */}
        <div className="form-group">
          <label htmlFor="task-title" className="form-label">
            Título
          </label>
          <input
            id="task-title"
            type="text"
            className={`form-input ${fieldErrors.title ? "error" : ""}`}
            placeholder="Ej: Estudiar TypeScript"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
            maxLength={100}
          />
          {fieldErrors.title && (
            <span className="form-error">{fieldErrors.title}</span>
          )}
        </div>

        {/* Campo Descripción (opcional) con contador */}
        <div className="form-group">
          <label htmlFor="task-description" className="form-label">
            Descripción (opcional)
          </label>
          <div className="textarea-wrapper">
            <textarea
              id="task-description"
              className="form-textarea"
              placeholder="Añade detalles sobre la tarea..."
              value={description}
              onChange={HandleDescriptionChange}
              disabled={isLoading}
              rows={3}
              maxLength={MAX_DESCRIPTION_LENGTH}
            />
            {/* Contador de caracteres */}
            <span
              className={`textarea-counter ${isNearLimit ? "warning" : ""}`}
            >
              {description.length}/{MAX_DESCRIPTION_LENGTH}
            </span>
          </div>
        </div>

        {/* Campo Pomodoros estimados */}
        <div className="form-group">
          <label htmlFor="task-pomodoros" className="form-label">
            Pomodoros estimados
          </label>
          <input
            id="task-pomodoros"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className={`form-input ${
              fieldErrors.estimatedPomodoros ? "error" : ""
            }`}
            placeholder={`Entre ${MIN_POMODOROS} y ${MAX_POMORODOS}`}
            value={estimatedPomodoros}
            onChange={handlePomodorosChange}
            disabled={isLoading}
            autoComplete="off"
          />
          {fieldErrors.estimatedPomodoros && (
            <span className="form-error">{fieldErrors.estimatedPomodoros}</span>
          )}
        </div>

        {/* Botones */}
        <div className="task-form-actions">
          <button
            type="submit"
            className="form-button form-button-primary"
            disabled={isLoading}
          >
            {isLoading && <div className="button-spinner"></div>}
            {isLoading
              ? "Guardando..."
              : isEditMode
              ? "Actualizar"
              : "Crear tarea"}
          </button>

          {onCancel && (
            <button
              type="button"
              className="form-button form-button-secondary"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default TaskForm;
