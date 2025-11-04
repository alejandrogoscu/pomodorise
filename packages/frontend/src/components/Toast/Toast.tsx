/*
 * Componente Toast - Sistema de notificaciones
 *
 * Teacher note:
 * - Muestra notificaciones temporales al usuario
 * - Se posiciona fixed en la esquina superior derecha
 * - Auto-desaparece después de 3 segundos
 * - Tipos: success, error, info
 *
 * Analogía: Como las notificaciones del sistema operativo
 */

import { useEffect } from "react";
import "./Toast.css";

/*
 * Props del componente Toast
 */
interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number; // en milisegundos
  onClose: () => void;
}

/*
 * Componente Toast
 *
 * Teacher note:
 * - useEffect con timeout para auto-cerrar
 * - Cleanup del timeout al desmontar componente
 */
function Toast({
  message,
  type = "info",
  duration = 3000,
  onClose,
}: ToastProps) {
  /*
   * Auto-cerrar después de duration
   *
   * Teacher note:
   * - setTimeout devuelve un ID que guardamos
   * - clearTimeout en cleanup evita memory leaks
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    // Cleanup: limpiar timer si el componente se desmonta antes
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  /*
   * Obtener icono según tipo
   */
  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "info":
      default:
        return "ℹ";
    }
  };

  return (
    <div className={`toast toast-${type}`} role="alert">
      <span className="toast-icon">{getIcon()}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Cerrar">
        x
      </button>
    </div>
  );
}

export default Toast;
