import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useRef } from "react";
import { aria } from "@/lib/accessibility/accessibility";
import { useFocusTrap } from "@/lib/accessibility/accessibility";
import { FadeTransition } from "./transition";

interface AccessibleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnEsc?: boolean;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full",
};

export function AccessibleDialog({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = 'md',
  closeOnEsc = true,
  closeOnOverlayClick = true,
  showCloseButton = true,
  ariaLabel,
  ariaDescribedBy,
}: AccessibleDialogProps) {
  const dialogRef = useFocusTrap<HTMLDivElement>(isOpen);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!closeOnEsc) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  return (
    <FadeTransition show={isOpen}>
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={closeOnOverlayClick ? onClose : undefined}
        role="presentation"
      >
        <div
          ref={dialogRef}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] rounded-lg bg-background p-6 shadow-lg",
            sizeClasses[size],
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={ariaLabel ? undefined : "dialog-title"}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              id="dialog-title"
              className="text-lg font-semibold"
            >
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Close dialog"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </FadeTransition>
  );
} 