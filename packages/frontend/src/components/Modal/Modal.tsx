/*
 * Componente Modal- Ventana modal reutilizable con backdrop blur
 *
 * Teacher note:
 * - Componente presentacional que envuelve contenido arbitrario
 * - Backdrop con blur-effect (glassmorphism coherente con la app)
 * - Cierra con Escape, click fuera o botón close
 * - Portal de React para renderizar fuera del DOM hierarchy
 * - Bloquea scroll del body cuando está abierto
 *
 * Analogía: Modal es como una ventana emergente que "flota" sobre la página
 * y difumina el resto (como focus mode en apps modernas)
 */

import { useEffect, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";
import "./Modal.css";

/*
 * Props del componente Modal
 *
 * Teacher note:
 * - isOpen: controla visibilidad (controlado por padre)
 * - onClose: callback al cerrar (Escape, click fuera, botón X)
 * - children: contenido del modal
 * - title: título opcional en el header
 */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

/*
 * Componente Modal
 *
 * @example
 * <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Tarea">
 *   <TaskForm onSuccess={handleSuccess} onCancel={() => setShowModal(false)} />
 * </Modal>
 */
function Modal({ isOpen, onClose, children, title }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  /*
   * Bloquear scroll del body cuando el modal está abierto
   *
   * Teacher note:
   * - Previene scroll del contenido de fondo
   * - Cleanup para restaurar scroll al cerrar
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  /*
   * Manejar tecla Escape para cerrar
   *
   * Teacher note:
   * - UX estándar: Escape cierra modales
   * - Event listener solo cuando está abierto
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  /*
   * Manejar click en el backdrop (cerrar)
   *
   * Teacher note:
   * - Click en backdrop cierra modal
   * - Click en contenido NO cierra (stopPropagation)
   */
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  /*
   * No renderizar nada si no está abierto
   *
   * Teacher note:
   * - Evita animaciones innecesarias
   * - Portal solo monta cuando isOpen=true
   */
  if (!isOpen) return null;

  /*
   * Renderiza usando React Portal
   *
   * Teacher note:
   * - Portal renderiza fuera del DOM tree del componente padre
   * - Evita rpoblemas de z-index y overflow
   * - Modal siempre se renderiza en document.body
   */
  return createPortal(
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container" ref={modalRef}>
        {/* Header opcional con título y botón cerrar */}
        {title && (
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button
              className="modal-close-button"
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              x
            </button>
          </div>
        )}

        {/* Contenido del modal */}
        <div className="modal-content">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;
