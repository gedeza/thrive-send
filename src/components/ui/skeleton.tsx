import { cn } from "@/lib/utils";

/**
 * Used to show a placeholder while content is loading
 */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
  height?: string | number;
  width?: string | number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  animation = 'pulse',
  height,
  width,
  ...props
}: SkeletonProps) {
  const baseStyles = "bg-muted relative overflow-hidden";
  
  const variantStyles = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-md",
  };

  const animationStyles = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  };

  const style = {
    height: height,
    width: width,
  };

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={style}
      {...props}
    />
  );
}

// Predefined skeleton components for common use cases
export function SkeletonText({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      variant="text"
      className={cn("h-4 w-full", className)}
      {...props}
    />
  );
}

export function SkeletonTitle({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      variant="text"
      className={cn("h-6 w-3/4", className)}
      {...props}
    />
  );
}

export function SkeletonAvatar({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      variant="circular"
      className={cn("h-10 w-10", className)}
      {...props}
    />
  );
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton
      variant="rectangular"
      className={cn("h-32 w-full", className)}
      {...props}
    />
  );
}

export function SkeletonTable({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      <SkeletonTitle />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonText key={i} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <SkeletonAvatar />
          <div className="space-y-2 flex-1">
            <SkeletonTitle className="w-1/2" />
            <SkeletonText className="w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      <SkeletonTitle className="w-1/3" />
      <div className="h-[200px] w-full">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="flex justify-between">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonText key={i} className="w-16" />
        ))}
      </div>
    </div>
  );
}