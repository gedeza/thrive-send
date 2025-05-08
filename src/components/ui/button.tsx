import React from "react";
import { theme } from "@/lib/theme";

type ButtonVariant = "primary" | "secondary" | "text";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  asChild?: boolean;
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
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", disabled, children, asChild, ...props }, ref) => {
  // Robust token lookup
  const token = theme.button[variant] || theme.button.primary;
  // Optional: developer warning for wrong variant
  if (!theme.button[variant]) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Button variant "${variant}" does not exist in theme.button. Defaulting to "primary".`);
    }
  }
  const sizeToken = sizeMap[size];

  const baseStyle: React.CSSProperties = {
    background: disabled ? token.disabledBackground : token.background,
    color: disabled ? token.disabledColor : token.color,
    border: `1px solid ${disabled && token.disabledBorder ? token.disabledBorder : token.border}`,
    cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 600,
    ...sizeToken,
    boxShadow: theme.shadow.sm,
    transition: theme.transition.DEFAULT,
    outline: "none",
    opacity: disabled ? 0.7 : 1,
  };

  // Simple JS hover/focus (for demo or if no CSS-in-JS)
  const [hover, setHover] = React.useState(false);
  const appliedStyle = {
    ...baseStyle,
    background: hover && !disabled && token.hoverBackground ? token.hoverBackground : baseStyle.background,
    color: hover && !disabled && token.hoverColor ? token.hoverColor : baseStyle.color,
    border: hover && !disabled && token.hoverBorder ? `1px solid ${token.hoverBorder}` : baseStyle.border,
  };

  // Remove asChild prop before passing to native element
  const { asChild: _drop, ...passProps } = props;

  return (
    <button
      ref={ref}
      type="button"
      style={appliedStyle}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...passProps}
    >
      {children}
    </button>
  );
});

export default Button;
