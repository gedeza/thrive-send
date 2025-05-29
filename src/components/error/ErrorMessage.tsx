import { AlertCircle, AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ErrorVariant = "error" | "warning" | "info" | "critical";

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: ErrorVariant;
  className?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const variantStyles = {
  error: {
    container: "bg-destructive/10 border-destructive/20",
    icon: "text-destructive",
    title: "text-destructive",
    message: "text-destructive/90",
  },
  warning: {
    container: "bg-yellow-500/10 border-yellow-500/20",
    icon: "text-yellow-500",
    title: "text-yellow-500",
    message: "text-yellow-500/90",
  },
  info: {
    container: "bg-blue-500/10 border-blue-500/20",
    icon: "text-blue-500",
    title: "text-blue-500",
    message: "text-blue-500/90",
  },
  critical: {
    container: "bg-red-500/10 border-red-500/20",
    icon: "text-red-500",
    title: "text-red-500",
    message: "text-red-500/90",
  },
};

const variantIcons = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  critical: XCircle,
};

export function ErrorMessage({
  title,
  message,
  variant = "error",
  className,
  onRetry,
  onDismiss,
}: ErrorMessageProps) {
  const styles = variantStyles[variant];
  const Icon = variantIcons[variant];

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        styles.container,
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 flex-shrink-0", styles.icon)} />
        <div className="flex-1">
          {title && (
            <h3 className={cn("font-medium mb-1", styles.title)}>
              {title}
            </h3>
          )}
          <p className={cn("text-sm", styles.message)}>{message}</p>
        </div>
        <div className="flex gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 