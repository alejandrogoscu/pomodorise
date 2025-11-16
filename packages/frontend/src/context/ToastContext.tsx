import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import ToastContainer, {
  ToastNotification,
} from "../components/Toast/ToastContainer";

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const removeToasts = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      const id = generateId();
      const newToast: ToastNotification = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToasts(id);
      }, 5000);
    },
    [removeToasts]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* ToastContainer renderizara los toasts */}
      <ToastContainer toasts={toasts} onClose={removeToasts} />
    </ToastContext.Provider>
  );
};
