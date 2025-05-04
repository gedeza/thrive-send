import * as React from "react";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // percent value (0-100)
  max?: number;   // max value, default 100
  indicatorClassName?: string; // optional extra class for inner bar
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value = 0, max = 100, className = '', indicatorClassName = '', ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`relative h-2 w-full overflow-hidden rounded-full bg-muted ${className}`}
        {...props}
      >
        <div
          className={`h-full transition-all duration-300 bg-primary ${indicatorClassName}`}
          style={{ width: `${percentage}%` }}
          data-testid="progress-indicator"
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export default Progress;