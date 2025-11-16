import { useState, FormEvent, useEffect, ChangeEvent } from "react";
import { ITask, CreateTaskDTO, UpdateTaskDTO } from "@pomodorise/shared";
import { createTask, updateTask } from "../../services/taskService";
import "./TaskForm.css";

interface TasksFormProps {
  task?: ITask; // Si existe, modo editar
  onSuccess: (task: ITask) => void; // Callback después de crear/editar
  onCancel?: () => void; // Callback para cancelar
}

const MAX_DESCRIPTION_LENGTH = 200;
const MIN_POMODOROS = 1;
const MAX_POMORODOS = 20;

function TaskForm({ task, onSuccess, onCancel }: TasksFormProps) {
  const isEditMode = Boolean(task);

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(
    task?.estimatedPomodoros.toString() || "1"
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    estimatedPomodoros?: string;
  }>({});

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setEstimatedPomodoros(task.estimatedPomodoros.toString());
    }
  }, [task]);

  const HandleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    let value = e.target.value;

    if (value.length > MAX_DESCRIPTION_LENGTH) {
      value = value.slice(0, MAX_DESCRIPTION_LENGTH);
    }

    value = value.replace(/\n{3,}/g, "\n\n");

    value = value.replace(/  +/g, " ");

    setDescription(value);
  };

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

  const validateForm = (): boolean => {
    const errors: typeof fieldErrors = {};

    if (!title.trim()) {
      errors.title = "El título es obligatorio";
    } else if (title.length > 100) {
      errors.title = "El título no puede exceder 100 caracteres";
    }

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const pomodorosNum = parseInt(estimatedPomodoros, 10);
      let savedTask: ITask;

      if (isEditMode && task) {
        const updates: UpdateTaskDTO = {};
        if (title !== task.title) updates.title = title;
        if (description !== task.description) updates.description = description;
        if (pomodorosNum !== task.estimatedPomodoros) {
          updates.estimatedPomodoros = pomodorosNum;
        }

        savedTask = await updateTask(task._id, updates);
      } else {
        const newTaskData: CreateTaskDTO = {
          title: title.trim(),
          description: description.trim() || undefined,
          estimatedPomodoros: pomodorosNum,
        };

        savedTask = await createTask(newTaskData);
      }

      setTitle("");
      setDescription("");
      setEstimatedPomodoros("1");
      onSuccess(savedTask);
    } catch (err: any) {
      console.error("Error al guardar tarea:", err);

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

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setEstimatedPomodoros("1");
    setError("");
    setFieldErrors({});

    if (onCancel) {
      onCancel();
    }
  };

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
