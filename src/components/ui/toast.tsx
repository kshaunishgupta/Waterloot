"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

// --- Types ---

type ToastVariant = "default" | "success" | "error";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
}

// --- Context ---

const ToastContext = createContext<ToastContextValue | null>(null);

// --- Variant styles ---

const variantStyles: Record<ToastVariant, string> = {
  default: "border-neutral-700 bg-neutral-900",
  success: "border-green-800 bg-green-950",
  error: "border-red-800 bg-red-950",
};

const variantIconColors: Record<ToastVariant, string> = {
  default: "text-primary-400",
  success: "text-green-400",
  error: "text-red-400",
};

// --- Individual Toast ---

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const variant = t.variant || "default";

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(t.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [t.id, onDismiss]);

  return (
    <div
      role="alert"
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg",
        "animate-in slide-in-from-bottom-5 fade-in",
        "transition-all duration-300",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className={cn("mt-0.5 shrink-0", variantIconColors[variant])}>
          {variant === "success" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          )}
          {variant === "error" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
          {variant === "default" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <p
            className={cn(
              "text-sm font-semibold",
              variant === "error" ? "text-red-200" : "",
              variant === "success" ? "text-green-200" : "",
              variant === "default" ? "text-neutral-100" : ""
            )}
          >
            {t.title}
          </p>
          {t.description && (
            <p
              className={cn(
                "mt-1 text-sm",
                variant === "error" ? "text-red-300" : "",
                variant === "success" ? "text-green-300" : "",
                variant === "default" ? "text-neutral-400" : ""
              )}
            >
              {t.description}
            </p>
          )}
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={() => onDismiss(t.id)}
          className="shrink-0 p-1 text-neutral-400 transition-colors hover:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Dismiss"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// --- Provider ---

let toastCounter = 0;

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((input: ToastInput) => {
    const id = `toast-${++toastCounter}-${Date.now()}`;
    setToasts((prev) => [...prev, { ...input, id }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast container - bottom right */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// --- Hook ---

function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export { ToastProvider, useToast };
export type { Toast, ToastInput, ToastVariant };
