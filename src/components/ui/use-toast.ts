"use client";

import { useState, useCallback, useEffect } from "react";

// Define toast types
export type ToastType = "default" | "destructive" | "success";

// Toast interface
export interface Toast {
  id: string;
  title?: string;
  description?: string;
  type: ToastType;
  duration?: number;
}

const TOAST_LIMIT = 5;
const DEFAULT_TOAST_DURATION = 5000; // 5 seconds

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Auto-dismiss toasts after their duration
  useEffect(() => {
    const timeouts = toasts.map(toast => {
      const duration = toast.duration || DEFAULT_TOAST_DURATION;
      return setTimeout(() => {
        dismiss(toast.id);
      }, duration);
    });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [toasts]);

  const toast = useCallback(
    ({ title, description, type = "default", duration = DEFAULT_TOAST_DURATION }: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { id, title, description, type, duration };
      
      setToasts(prevToasts => [newToast, ...prevToasts].slice(0, TOAST_LIMIT));
      
      return {
        id,
        dismiss: () => dismiss(id),
        update: (props: Partial<Omit<Toast, "id">>) => update(id, props),
      };
    },
    []
  );

  const update = useCallback((id: string, props: Partial<Omit<Toast, "id">>) => {
    setToasts(prevToasts => 
      prevToasts.map(toast => 
        toast.id === id ? { ...toast, ...props } : toast
      )
    );
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    toast,
    dismiss,
    dismissAll,
  };
}

// Create a singleton instance for the toast function
let toastFn: (props: Omit<Toast, "id">) => { 
  id: string; 
  dismiss: () => void; 
  update: (props: Partial<Omit<Toast, "id">>) => void 
};

// Initialize with a default implementation that works on both client and server
toastFn = ({ title, description, type = "default", duration = DEFAULT_TOAST_DURATION }) => {
  // Server-side or uninitialized client-side fallback
  if (typeof window === "undefined") {
    return {
      id: "server-toast",
      dismiss: () => {},
      update: () => {},
    };
  }
  
  console.warn("Toast function called before it was initialized by ToastProvider");
  return {
    id: "",
    dismiss: () => {},
    update: () => {},
  };
};

/**
 * Standalone toast function for use outside of components
 */
export function toast(props: Omit<Toast, "id">) {
  return toastFn(props);
}

/**
 * This function will be called by the ToastProvider to set the actual implementation
 */
export function setToastFunction(fn: typeof toastFn) {
  toastFn = fn;
}

// Add static methods to useToast for easier access
useToast.toast = toast;
