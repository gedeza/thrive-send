import React from "react";
import { theme } from "@/lib/theme";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "text" | "accent" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "icon";

// Add the buttonVariants function that generates Tailwind classes
export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        text: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        sm: "h-9 px-3 rounded-md",
        md: "h-10 py-2 px-4",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, 
  VariantProps<typeof buttonVariants> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

// Utility to strip color* or text-* Tailwind classes from passed className (prevent override)
function sanitizeButtonClassName(className: string = "", enforceColor: string | undefined) {
  if (!enforceColor) return className;
  // Remove any Tailwind 'text-*' classes (quick-and-simple regex for common cases)
  const noTextColor = className.replace(/\btext-\w+\b/g, "").replace(/\s+/g, " ").trim();
  return noTextColor;
}

const sizeMap = {
  sm: {
    fontSize: "0.875rem",
    padding: "0.375rem 1rem",
    borderRadius: theme.border.radius.sm,
  },
  md: {
    fontSize: "1rem",
    padding: "0.5rem 1.25rem",
    borderRadius: theme.border.radius.md,
  },
  lg: {
    fontSize: "1.125rem",
    padding: "0.75rem 1.5rem",
    borderRadius: theme.border.radius.lg,
  },
  icon: {
    height: "2.5rem",
    width: "2.5rem",
    padding: "0.5rem",
    borderRadius: theme.border.radius.md,
  },
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", disabled, children, asChild, className, ...props }, ref) => {
    // For tailwind styled components (like calendar)
    if (className && (className.includes("bg-") || className.includes("hover:") || className.includes("focus:"))) {
      return (
        <button
          ref={ref}
          type="button"
          className={cn(buttonVariants({ variant, size }), className)}
          disabled={disabled}
          {...props}
        >
          {children}
        </button>
      );
    }
    
    const token = theme.button[variant] || theme.button.primary;
    if (!theme.button[variant]) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`Button variant "${variant}" does not exist in theme.button. Defaulting to "primary".`);
      }
    }
    const sizeToken = sizeMap[size];

    const enforceColor = (!disabled && (variant === "primary" || variant === "accent"))
      ? token.color : undefined;
    const enforceBg = (!disabled && (variant === "primary" || variant === "accent"))
      ? token.background : undefined;

    const baseStyle: React.CSSProperties = {
      background: disabled ? token.disabledBackground : enforceBg || token.background,
      color: disabled ? token.disabledColor : enforceColor || token.color,
      border: `1px solid ${disabled && token.disabledBorder ? token.disabledBorder : token.border}`,
      cursor: disabled ? "not-allowed" : "pointer",
      fontWeight: 600,
      ...sizeToken,
      boxShadow: theme.shadow.sm,
      transition: theme.transition.DEFAULT,
      outline: "none",
      opacity: disabled ? 0.7 : 1,
    };

    // Simple JS hover/focus
    const [hover, setHover] = React.useState(false);
    const appliedStyle = {
      ...baseStyle,
      background: hover && !disabled && token.hoverBackground ? token.hoverBackground : baseStyle.background,
      color: hover && !disabled && token.hoverColor ? token.hoverColor : baseStyle.color,
      border: hover && !disabled && token.hoverBorder ? `1px solid ${token.hoverBorder}` : baseStyle.border,
    };

    const cleanClassName = sanitizeButtonClassName(className, enforceColor);

    // Remove asChild prop before passing to native element
    const { asChild: _drop, ...passProps } = props;

    return (
      <button
        ref={ref}
        type="button"
        style={appliedStyle}
        disabled={disabled}
        className={cleanClassName}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        {...passProps}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
