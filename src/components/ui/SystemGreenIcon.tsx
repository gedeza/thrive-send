import React from "react";

type SystemGreenIconProps = {
  /** Icon component (Lucide, MUI, or generic React SVG) */
  as: React.ElementType;
  /** Additional className for sizing or stacking */
  className?: string;
  /** Additional props are forwarded */
  [key: string]: any;
};

// Tweak these to match your design system as needed:
const GREEN_CLASSES = "text-green-600 dark:text-green-400";
const MUI_GREEN = "#16A34A";

/**
 * Wrapper for Lucide/MUI icons to ensure consistent green appearance.
 * Pass as: <SystemGreenIcon as={Home} ... />
 * 
 * Handles both 'className' (SVG/Lucide) and 'sx' (MUI).
 */
export function SystemGreenIcon({
  as: Icon,
  className = "",
  ...props
}: SystemGreenIconProps) {
  // Heuristic: If 'sx' already passed, extend it with green fallback for color.
  // MUI Icon expects 'sx' or 'color'; SVG expects className.
  const muiSX = props.sx
    ? { ...props.sx, color: MUI_GREEN }
    : { color: MUI_GREEN };

  // Preference: If 'className' prop is accepted, apply green classes too.
  // If MUI (sx), pass that only.
  // If both, do both.
  if (Icon?.muiName || /^([A-Z][a-z]+)*Icon$/.test(Icon?.displayName || "")) {
    // Looks like an MUI icon
    return <Icon {...props} sx={muiSX} />;
  }
  // Default: Lucide or regular icon
  return <Icon className={`${GREEN_CLASSES} ${className}`.trim()} {...props} />;
}

export default SystemGreenIcon;