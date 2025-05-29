import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
  centered?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
};

const paddingClasses = {
  none: "",
  sm: "px-4 sm:px-6",
  md: "px-6 sm:px-8",
  lg: "px-8 sm:px-12",
};

export function ResponsiveContainer({
  children,
  className,
  as: Component = "div",
  maxWidth = "xl",
  padding = "md",
  centered = true,
}: ResponsiveContainerProps) {
  return (
    <Component
      className={cn(
        "w-full",
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        centered && "mx-auto",
        className
      )}
    >
      {children}
    </Component>
  );
}

// Predefined responsive sections
export function ResponsiveSection({
  children,
  className,
  ...props
}: ResponsiveContainerProps) {
  return (
    <ResponsiveContainer
      className={cn("py-8 sm:py-12", className)}
      {...props}
    >
      {children}
    </ResponsiveContainer>
  );
}

export function ResponsiveGrid({
  children,
  className,
  ...props
}: ResponsiveContainerProps) {
  return (
    <ResponsiveContainer
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6",
        className
      )}
      {...props}
    >
      {children}
    </ResponsiveContainer>
  );
}

export function ResponsiveFlex({
  children,
  className,
  ...props
}: ResponsiveContainerProps) {
  return (
    <ResponsiveContainer
      className={cn(
        "flex flex-col sm:flex-row gap-4 sm:gap-6",
        className
      )}
      {...props}
    >
      {children}
    </ResponsiveContainer>
  );
}

export function ResponsiveStack({
  children,
  className,
  ...props
}: ResponsiveContainerProps) {
  return (
    <ResponsiveContainer
      className={cn(
        "flex flex-col gap-4 sm:gap-6",
        className
      )}
      {...props}
    >
      {children}
    </ResponsiveContainer>
  );
} 