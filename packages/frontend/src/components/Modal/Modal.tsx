import { useEffect, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";
import "./Modal.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

function Modal({ isOpen, onClose, children, title }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container" ref={modalRef}>
        <button
          className="modal-close-button"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          x
        </button>
        {/* Header opcional con título y botón cerrar */}
        {title && (
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
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
