import React from "react";
import { theme } from "@/lib/theme";

type AlertIntent = "info" | "success" | "warning" | "error";

const intentColors = {
  info: {
    border: "#3b82f6",
    background: "#eff6ff",
    color: "#1e40af"
  },
  success: {
    border: "#22c55e",
    background: "#f0fdf4",
    color: "#166534"
  },
  warning: {
    border: "#f59e0b",
    background: "#fefce8",
    color: "#78350f"
  },
  error: {
    border: "#ef4444",
    background: "#fef2f2",
    color: "#991b1b"
  }
};

interface AlertProps {
  children: React.ReactNode;
  intent?: AlertIntent;
  style?: React.CSSProperties;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  intent = "info",
  style,
}) => {
  const colors = intentColors[intent];
  return (
    <div style={{
      border: `1px solid ${colors.border}`,
      background: colors.background,
      color: colors.color,
      borderRadius: theme.border.radius.md,
      padding: "1em 1.5em",
      margin: "1em 0",
      fontSize: "1em",
      boxShadow: theme.shadow.sm,
      ...style
    }}>
      {children}
    </div>
  );
};

export default Alert;