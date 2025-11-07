/*
 * ToastContext - Sistema centralizado de notificaciones
 *
 * Teacher note:
 * - Context API para compartir estado de toast entre componentes
 * - Los toasts se renderizan en el root de la app (fuera de containers con transform)
 * - Permite múltiples toasts simultaneos (stack)
 * - Auto-dismiss con timeouts individuales por toasts
 *
 * Analogía: Como un sistema de notificaciones del OS - aparece siempre en la misma posición
 * sin importar que app abrió la notificación
 */

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

/*
 * Tipo del contexto
 *
 * Teacher note:
 * - showToast: añade un nuevo toast al stack
 * - Internamente genera ID único y maneja auto-dismiss
 */
interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

/*
 * Crear contexto con valor undefined por defecto
 *
 * Teacher note:
 * - undefined obliga a usar el Provider (error si se usa fuera)
 * - Alternativa: valor por defecto dummy (menos seguro)
 */
const ToastContext = createContext<ToastContextType | undefined>(undefined);

/*
 * Hook personalizado para usar el contexto
 *
 * Teacher note:
 * - Patrón recomendado: encapsular useContext en custom hook
 * - Mejora: chequeo de undefined con mensaje de error claro
 *
 * @throws Error si se usa fuera del ToastProvider
 */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

/*
 * ToastProvider - Proveedor del contexto
 *
 * Teacher note:
 * - Mantiene array de toasts activos
 * - showToast añade toast con ID único
 * - removeToasts elimina toast por ID
 * - Auto-dismiss con setTimeout (5s por defecto)
 */
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  /*
   * Guardar ID único para toast
   * Teacher note:
   * - Date.now() + Math.random() es suficiente para IDs únicos
   * - Alternativa: librería uuid (más robusto)
   */
  const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  /*
   * Elimina toast por ID
   *
   * Teacher note:
   * - useCallback evita recrear función en cada render
   * - Útil para pasar a componentes hijos sin causar re-renders
   */
  const removeToasts = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /*
   * Mostrar nuevo toast
   * Teacher note:
   * - Añade toast al array
   * - Configura auto-dismiss con setTimeout
   * - Cleanup automático al desmontar (clearTimeout)
   */
  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      const id = generateId();
      const newToast: ToastNotification = { id, message, type };

      // Añadir toast al stack
      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss después de 5 segundos
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
