"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ToastProps {
  /** The toast message to display */
  message: string;
  /** Optional title for the toast */
  title?: string;
  /** Controls whether the toast is shown */
  open: boolean;
  /** Callback when the toast is closed */
  onClose: () => void;
  /** The variant style of the toast */
  variant?: "default" | "destructive" | "success";
  /** How long the toast should remain visible (in ms) */
  duration?: number;
  /** Optional action component to display in the toast */
  action?: React.ReactNode;
  /** Optional additional className */
  className?: string;
}

export function Toast({
  message,
  title,
  open,
  onClose,
  variant = "default",
  duration = 5000,
  action,
  className,
}: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Allow for animation to complete
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  if (!open && !isVisible) return null;

  const variantClassNames = {
    default: "bg-background border-border text-foreground",
    destructive: "bg-destructive border-destructive text-destructive-foreground",
    success: "bg-green-50 border-green-200 text-green-800"
  };

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      <div
        className={cn(
          "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all duration-300",
          variantClassNames[variant],
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[-10px]",
          className
        )}
        role="alert"
      >
        <div className="flex-1">
          {title && <div className="text-sm font-semibold mb-1">{title}</div>}
          <div className="text-sm opacity-90">{message}</div>
        </div>
        {action && <div className="flex shrink-0">{action}</div>}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
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

// For backward compatibility
export type ToastActionElement = React.ReactElement<typeof ToastAction>;
