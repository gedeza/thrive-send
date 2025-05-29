import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useState } from "react";

interface TransitionProps {
  children: ReactNode;
  show: boolean;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
  duration?: number;
  onEntered?: () => void;
  onExited?: () => void;
}

export function Transition({
  children,
  show,
  className,
  as: Component = "div",
  enter = "transition",
  enterFrom = "opacity-0",
  enterTo = "opacity-100",
  leave = "transition",
  leaveFrom = "opacity-100",
  leaveTo = "opacity-0",
  duration = 200,
  onEntered,
  onExited,
}: TransitionProps) {
  const [isVisible, setIsVisible] = useState(show);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        onEntered?.();
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsTransitioning(false);
        onExited?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onEntered, onExited]);

  if (!isVisible && !isTransitioning) {
    return null;
  }

  return (
    <Component
      className={cn(
        className,
        isTransitioning && (show ? enter : leave),
        isTransitioning && (show ? enterFrom : leaveFrom),
        !isTransitioning && (show ? enterTo : leaveTo)
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </Component>
  );
}

// Predefined transitions
export function FadeTransition({
  children,
  show,
  ...props
}: Omit<TransitionProps, "enter" | "enterFrom" | "enterTo" | "leave" | "leaveFrom" | "leaveTo">) {
  return (
    <Transition
      show={show}
      enter="transition-opacity"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      {...props}
    >
      {children}
    </Transition>
  );
}

export function SlideTransition({
  children,
  show,
  ...props
}: Omit<TransitionProps, "enter" | "enterFrom" | "enterTo" | "leave" | "leaveFrom" | "leaveTo">) {
  return (
    <Transition
      show={show}
      enter="transition-transform"
      enterFrom="translate-y-full"
      enterTo="translate-y-0"
      leave="transition-transform"
      leaveFrom="translate-y-0"
      leaveTo="translate-y-full"
      {...props}
    >
      {children}
    </Transition>
  );
}

export function ScaleTransition({
  children,
  show,
  ...props
}: Omit<TransitionProps, "enter" | "enterFrom" | "enterTo" | "leave" | "leaveFrom" | "leaveTo">) {
  return (
    <Transition
      show={show}
      enter="transition-transform"
      enterFrom="scale-95"
      enterTo="scale-100"
      leave="transition-transform"
      leaveFrom="scale-100"
      leaveTo="scale-95"
      {...props}
    >
      {children}
    </Transition>
  );
}

export function RotateTransition({
  children,
  show,
  ...props
}: Omit<TransitionProps, "enter" | "enterFrom" | "enterTo" | "leave" | "leaveFrom" | "leaveTo">) {
  return (
    <Transition
      show={show}
      enter="transition-transform"
      enterFrom="rotate-0"
      enterTo="rotate-180"
      leave="transition-transform"
      leaveFrom="rotate-180"
      leaveTo="rotate-0"
      {...props}
    >
      {children}
    </Transition>
  );
} 