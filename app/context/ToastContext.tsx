import {
  createContext,
  useState,
  useContext,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { Toast } from "~/components/ui/Toast";

type ToastType = "success" | "danger" | "warning";

interface ToastState {
  show: boolean;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "success",
  });
  const timeoutRef = useRef<number | null>(null);

  const showToast = useCallback((type: ToastType, message: string) => {
    // Limpa qualquer timeout anterior para evitar sobreposição
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast({ show: true, type, message });

    // Define um novo timeout para esconder o toast
    timeoutRef.current = window.setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
      timeoutRef.current = null;
    }, 5000); // Esconde após 5 segundos
  }, []);

  const handleClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToast((prev) => ({ ...prev, show: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed top-5 right-5 z-50">
        <Toast
          show={toast.show}
          type={toast.type}
          message={toast.message}
          onClose={handleClose}
        />
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
