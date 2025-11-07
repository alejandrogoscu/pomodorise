/*
 * ToastContainer - Renderiza el stack de toasts en la esquina superior derecha
 *
 * Teacher note:
 * - Recibe la lista de toasts y la función para cerrarlos
 * - Usa el componente Toast individual para cada notificación
 * - Se posiciona con .toast-container
 */

import Toast from "./Toast";
import "./Toast.css";

export interface ToastNotification {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContainerProps {
  toasts: ToastNotification[];
  onClose: (id: string) => void;
}

const ToastContainer = ({ toasts, onClose }: ToastContainerProps) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onClose(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
