import React from "react";
import { theme } from "@/lib/theme";

type AlertIntent = "info" | "success" | "warning" | "error";

const intentColors = {
  info: {
    border: "var(--primary-500)",
    background: "var(--primary-50)",
    color: "var(--primary-700)"
  },
  success: {
    border: "var(--secondary-500)",
    background: "var(--secondary-50)",
    color: "var(--secondary-700)"
  },
  warning: {
    border: "var(--accent-500)",
    background: "var(--accent-50)",
    color: "var(--accent-700)"
  },
  error: {
    border: "var(--accent-500)",
    background: "var(--accent-50)",
    color: "var(--accent-700)"
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