import React from "react";

type IconSize = 'primary' | 'secondary' | 'small' | 'micro';
type IconType = 'primary' | 'secondary' | 'accent' | 'neutral' | 'muted';

type SystemGreenIconProps = {
  /** Icon component (Lucide, MUI, or generic React SVG) */
  as: React.ComponentType<any>;
  /** Icon type based on usage context */
  type?: IconType;
  /** Icon size variant */
  size?: IconSize;
  /** Additional className for custom styling */
  className?: string;
  /** Whether the icon is disabled */
  disabled?: boolean;
  /** Whether the icon is selected/active */
  selected?: boolean;
  /** Additional props are forwarded */
  [key: string]: any;
};

// Color classes based on type and theme
const colorClasses = {
  primary: {
    light: "text-primary-500",
    dark: "text-primary-400",
    hover: "hover:text-primary-400",
    active: "active:text-primary-600",
    disabled: "text-neutral-text-light opacity-50"
  },
  secondary: {
    light: "text-secondary-500",
    dark: "text-secondary-400",
    hover: "hover:text-secondary-400",
    active: "active:text-secondary-600",
    disabled: "text-neutral-text-light opacity-50"
  },
  accent: {
    light: "text-accent-500",
    dark: "text-accent-400",
    hover: "hover:text-accent-400",
    active: "active:text-accent-600",
    disabled: "text-neutral-text-light opacity-50"
  },
  neutral: {
    light: "text-neutral-text-light",
    dark: "text-neutral-text",
    hover: "hover:text-neutral-text",
    active: "active:text-neutral-text-dark",
    disabled: "text-neutral-text-light opacity-50"
  },
  muted: {
    light: "text-neutral-text-light opacity-50",
    dark: "text-neutral-text opacity-50",
    hover: "hover:text-neutral-text",
    active: "active:text-neutral-text-dark",
    disabled: "text-neutral-text-light opacity-30"
  }
};

// Size classes
const sizeClasses = {
  primary: "w-6 h-6",
  secondary: "w-5 h-5",
  small: "w-4 h-4",
  micro: "w-3.5 h-3.5"
};

/**
 * Enhanced SystemGreenIcon component that follows the new color guidelines.
 * Supports different types, sizes, and states (disabled, selected).
 * 
 * @example
 * // Primary navigation icon
 * <SystemGreenIcon as={Home} type="primary" size="primary" />
 * 
 * // Secondary metric icon
 * <SystemGreenIcon as={TrendingUp} type="secondary" size="secondary" />
 * 
 * // Small status icon
 * <SystemGreenIcon as={AlertTriangle} type="accent" size="small" />
 * 
 * // Micro info icon
 * <SystemGreenIcon as={Info} type="neutral" size="micro" />
 */
export function SystemGreenIcon({
  as: Icon,
  type = 'primary',
  size = 'primary',
  className = "",
  disabled = false,
  selected = false,
  ...props
}: SystemGreenIconProps) {
  // Get the appropriate color classes based on type and state
  const colorClass = colorClasses[type];
  const baseColor = colorClass.light; // Default to light mode
  const hoverColor = colorClass.hover;
  const activeColor = colorClass.active;
  const disabledColor = colorClass.disabled;
  
  // Get the size class
  const sizeClass = sizeClasses[size];

  // Build the final className string
  const finalClassName = [
    baseColor,
    !disabled && hoverColor,
    !disabled && activeColor,
    disabled && disabledColor,
    selected && colorClass.active,
    sizeClass,
    className
  ].filter(Boolean).join(" ");

  // MUI color mapping
  const muiColor = disabled 
    ? "var(--neutral-text-light)"
    : selected
    ? "var(--primary-600)"
    : type === 'primary'
    ? "var(--primary-500)"
    : type === 'secondary'
    ? "var(--secondary-500)"
    : type === 'accent'
    ? "var(--accent-500)"
    : "var(--neutral-text-light)";

  // Check if it's an MUI icon
  const isMuiIcon = 'sx' in props;

  if (isMuiIcon) {
    // MUI icon with enhanced styling
    return (
      <Icon 
        {...props} 
        sx={{ 
          ...props.sx,
          color: muiColor,
          opacity: disabled ? 0.5 : 1,
          transition: 'color 0.2s ease-in-out',
          '&:hover': !disabled && {
            color: `var(--${type}-400)`,
          },
          '&:active': !disabled && {
            color: `var(--${type}-600)`,
          }
        }} 
      />
    );
  }

  // Default: Lucide or regular icon with enhanced styling
  return (
    <Icon 
      className={finalClassName}
      {...props}
      style={{
        ...props.style,
        transition: 'color 0.2s ease-in-out'
      }}
    />
  );
}

export default SystemGreenIcon;