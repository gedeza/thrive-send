"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = React.createContext<{
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, toast: Partial<Omit<Toast, "id">>) => void;
}>({
  toasts: [],
  addToast: () => "",
  removeToast: () => {},
  updateToast: () => {},
});

export type Toast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
  duration?: number;
  onClose?: () => void;
};

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 300;

type ToastContextProviderProps = {
  children: React.ReactNode;
};

export function ToastContextProvider({ children }: ToastContextProviderProps) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);

      setToasts((prevToasts) => {
        const newToasts = [
          { id, ...toast },
          ...prevToasts,
        ].slice(0, TOAST_LIMIT);
        
        return newToasts;
      });

      return id;
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const updateToast = React.useCallback(
    (id: string, toast: Partial<Omit<Toast, "id">>) => {
      setToasts((prevToasts) =>
        prevToasts.map((t) => (t.id === id ? { ...t, ...toast } : t))
      );
    },
    []
  );

  return (
    <ToastProvider.Provider
      value={{ toasts, addToast, removeToast, updateToast }}
    >
      {children}
      <ToastContainer />
    </ToastProvider.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastProvider);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const toast = React.useCallback(
    (props: Omit<Toast, "id">) => {
      const id = context.addToast(props);

      const dismiss = () => context.removeToast(id);

      // Auto dismiss
      if (props.duration !== Infinity) {
        setTimeout(dismiss, props.duration || 5000);
      }

      return {
        id,
        dismiss,
        update: (props: Partial<Omit<Toast, "id">>) =>
          context.updateToast(id, props),
      };
    },
    [context]
  );

  return {
    toast,
    dismiss: context.removeToast,
    toasts: context.toasts,
  };
}

const toastVariants = cva(
  "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "bg-background border-border text-foreground",
        destructive: "bg-destructive border-destructive text-destructive-foreground",
        success: "bg-green-50 border-green-200 text-green-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function ToastContainer() {
  const { toasts, removeToast } = React.useContext(ToastProvider);
  
  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onClose={() => {
            if (toast.onClose) {
              toast.onClose();
            }
            removeToast(toast.id);
          }}
        />
      ))}
    </div>
  );
}

interface ToastProps {
  toast: Toast;
  onClose: () => void;
  className?: string;
}

function Toast({ toast, onClose, className }: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  
  React.useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);

  return (
    <div
      className={cn(
        toastVariants({ variant: toast.variant }),
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[-10px]",
        "group duration-300",
        className
      )}
      role="alert"
    >
      <div className="flex-1">
        {toast.title && <div className="text-sm font-semibold mb-1">{toast.title}</div>}
        {toast.description && <div className="text-sm opacity-90">{toast.description}</div>}
      </div>
      {toast.action && <div className="flex shrink-0">{toast.action}</div>}
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, TOAST_REMOVE_DELAY);
        }}
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  );
}

export const ToastAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

export type ToastActionElement = React.ReactElement<typeof ToastAction>;
