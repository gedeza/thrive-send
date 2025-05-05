import React from "react";

/**
 * GradientCard - A card with a subtle project-approved gradient background.
 */
export const GradientCard: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div
    className={[
      // Use your gradient color utility classes
      "bg-gradient-to-r from-primary-500 to-gradient-purple text-custom-white p-4 rounded-md shadow",
      "dark:from-primary-400 dark:to-gradient-purple", // adjust as needed for dark mode
      className,
    ].join(" ")}
  >
    {children}
  </div>
);

/**
 * ErrorBadge - A badge for error or danger status, using standard red and your accent for warning.
 * Note: This assumes you have a project-approved red, otherwise improves for accessibility.
 */
export const ErrorBadge: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <span
    className={[
      "bg-red-500 text-custom-white px-2 py-1 rounded-full text-xs font-semibold",
      "dark:bg-red-400",
      className,
    ].join(" ")}
  >
    {children}
  </span>
);

/*
 * Usage example:
 * 
 * <GradientCard>
 *   Welcome to ThriveSend!
 * </GradientCard>
 *
 * <ErrorBadge>
 *   Error
 * </ErrorBadge>
 */