"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { Icon, type IconName } from "@/components/ui/Icon";
import { cx } from "@/lib/utils";

type Toast = {
  id: number;
  message: string;
  tone: "info" | "success" | "error";
  icon?: IconName;
};

type ToastContextValue = {
  show: (message: string, options?: { tone?: Toast["tone"]; icon?: IconName }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_ICON: Record<Toast["tone"], IconName> = {
  info: "infoCircle",
  success: "checkmarkCircleFill",
  error: "warning",
};

const TONE_COLOR: Record<Toast["tone"], string> = {
  info: "var(--sys-blue)",
  success: "var(--sys-green)",
  error: "var(--sys-red)",
};

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback<ToastContextValue["show"]>((message, options) => {
    const id = nextId++;
    const toast: Toast = { id, message, tone: options?.tone ?? "info", icon: options?.icon };

    setToasts((current) => [...current.slice(-2), toast]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 2600);
  }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+var(--tabbar-height)+16px)] z-100 flex flex-col items-center gap-2 px-4 md:bottom-8"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cx(
              "animate-toast-in material-regular flex max-w-[92vw] items-center gap-2.5 rounded-full",
              "border border-separator py-2.5 pl-3 pr-4 shadow-3",
            )}
          >
            <span style={{ color: TONE_COLOR[toast.tone] }}>
              <Icon name={toast.icon ?? TONE_ICON[toast.tone]} size={19} strokeWidth={1.9} />
            </span>
            <span className="truncate text-subheadline font-medium text-label">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>.");
  return context;
}
