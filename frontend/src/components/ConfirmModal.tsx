import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
  type = "warning",
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const typeStyles = {
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    warning: "bg-amber-600 text-white hover:bg-amber-700",
    info: "bg-primary text-primary-foreground hover:bg-primary/90",
  };

  const iconColors = {
    danger: "text-destructive",
    warning: "text-amber-500",
    info: "text-primary",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full bg-muted/50 shrink-0 ${iconColors[type]}`}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{message}</p>
            </div>
            <button
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="bg-muted/50 px-6 py-4 flex items-center justify-end gap-3 border-t border-border">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-border bg-background hover:bg-muted transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${typeStyles[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
