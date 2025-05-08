import React from "react";
import { theme } from "@/lib/theme";

type BadgeVariant = "primary" | "secondary" | "tertiary" | "muted" | "success" | "error";
interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: React.CSSProperties;
}

// Helper: get color with fallback if missing
function safeThemeColor(path: string, fallback: string): string {
  const parts = path.split(".");
  let ref: any = theme.colors;
  for (let k of parts) {
    if (!ref || !(k in ref)) return fallback;
    ref = ref[k];
  }
  return typeof ref === "string" ? ref : fallback;
}

const variantMap = {
  primary: {
    background: safeThemeColor("primary.DEFAULT", "#4F46E5"),
    color: "#fff"
  },
  secondary: {
    background: safeThemeColor("secondary.DEFAULT", "#10B981"),
    color: "#fff"
  },
  tertiary: {
    background: safeThemeColor("tertiary.DEFAULT", "#3B82F6"),
    color: "#fff"
  },
  muted: {
    background: safeThemeColor("muted.DEFAULT", "#F3F4F6"),
    color: "#374151"
  },
  success: {
    background: "#22c55e",
    color: "#fff"
  },
  error: {
    background: "#ef4444",
    color: "#fff"
  }
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  style,
}) => {
  const token = variantMap[variant] || variantMap.primary;
  // Warn if fallback is being used (development only)
  if (process.env.NODE_ENV !== "production") {
    if (
      (variant === "primary" && token.background === "#4F46E5") ||
      (variant === "secondary" && token.background === "#10B981") ||
      (variant === "tertiary" && token.background === "#3B82F6") ||
      (variant === "muted" && token.background === "#F3F4F6")
    ) {
      console.warn(`[Badge] Theme token missing or malformed for variant "${variant}". Used fallback color.`);
    }
  }
  return (
    <span style={{
      display: "inline-block",
      padding: "0.25em 0.75em",
      fontSize: "0.875em",
      fontWeight: 600,
      borderRadius: theme.border.radius.sm,
      background: token.background,
      color: token.color,
      ...style
    }}>
      {children}
    </span>
  );
};

export default Badge;
