import { useEffect } from "react";
import "./Toast.css";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number; // en milisegundos
  onClose: () => void;
}

function Toast({
  message,
  type = "info",
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`toast toast-${type}`} role="alert">
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Cerrar">
        x
      </button>
    </div>
  );
}

export default Toast;
