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
