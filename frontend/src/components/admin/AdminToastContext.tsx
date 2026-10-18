"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface AdminToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

export function useAdminToast(): AdminToastContextValue {
  const ctx = useContext(AdminToastContext);
  if (!ctx) {
    throw new Error("useAdminToast must be used within an AdminToastProvider");
  }
  return ctx;
}

interface AdminToastProviderProps {
  children: React.ReactNode;
}

export function AdminToastProvider({ children }: AdminToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "success", duration: number = 3500) => {
      setToasts((prev) => {
        // Prevent stacking duplicate toasts with identical message and type
        const hasDuplicate = prev.some(
          (t) => t.message === message && t.type === type,
        );
        if (hasDuplicate) {
          return prev;
        }

        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const newToast: ToastItem = { id, message, type, duration };

        // Limit to max 3 toasts at once so they don't cover the screen
        return [...prev.slice(-2), newToast];
      });
    },
    [],
  );

  const success = useCallback(
    (msg: string, dur?: number) => showToast(msg, "success", dur),
    [showToast],
  );
  const error = useCallback(
    (msg: string, dur?: number) => showToast(msg, "error", dur),
    [showToast],
  );
  const info = useCallback(
    (msg: string, dur?: number) => showToast(msg, "info", dur),
    [showToast],
  );

  const value = useMemo(
    () => ({ showToast, success, error, info }),
    [showToast, success, error, info],
  );

  return (
    <AdminToastContext.Provider value={value}>
      {children}

      {/* TOAST NOTIFICATION CONTAINER - Fixed at bottom-right */}
      <aside
        aria-live="polite"
        aria-label="Admin Notifications"
        className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2.5 sm:right-6 sm:bottom-6 sm:max-w-md"
      >
        {toasts.map((toast) => (
          <SingleToast key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </aside>
    </AdminToastContext.Provider>
  );
}

interface SingleToastProps {
  toast: ToastItem;
  onDismiss: () => void;
}

function SingleToast({ toast, onDismiss }: SingleToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  const iconMap = {
    success: (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-4 w-4" />
      </div>
    ),
    error: (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive">
        <AlertCircle className="h-4 w-4" />
      </div>
    ),
    info: (
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent">
        <Info className="h-4 w-4" />
      </div>
    ),
  };

  const borderMap = {
    success: "border-emerald-500/30",
    error: "border-destructive/30",
    info: "border-accent/30",
  };

  const progressBg = {
    success: "bg-emerald-500",
    error: "bg-destructive",
    info: "bg-accent",
  };

  return (
    <div
      role="status"
      className={`pointer-events-auto relative flex overflow-hidden items-start gap-3 rounded-2xl border ${borderMap[toast.type]} bg-card/95 p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4`}
    >
      {/* Icon Badge */}
      {iconMap[toast.type]}

      {/* Message Text */}
      <div className="flex-1 pt-0.5">
        <p className="text-xs font-semibold text-foreground sm:text-sm leading-snug">
          {toast.message}
        </p>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Close notification"
        className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Auto-dismiss subtle progress line */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${progressBg[toast.type]} opacity-70`}
        style={{
          width: "100%",
          animation: `adminToastProgress ${toast.duration}ms linear forwards`,
        }}
      />
    </div>
  );
}

export default AdminToastProvider;
