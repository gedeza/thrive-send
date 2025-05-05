import React from "react";

/**
 * SuccessCard - A card for displaying success messages/info, fully using the project's secondary color shades.
 */
export const SuccessCard: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div
    className={[
      "bg-secondary-50 border border-secondary-200 p-4 rounded-md",
      "dark:bg-secondary-900 dark:border-secondary-700",
      className,
    ].join(" ")}
  >
    <div className="text-secondary-700 dark:text-secondary-200">{children}</div>
  </div>
);

/**
 * WarningBadge - A small badge for highlighting warnings or notifications, using the accent color.
 */
export const WarningBadge: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <span
    className={[
      "bg-accent-500 text-custom-white px-2 py-1 rounded-full text-xs font-semibold",
      "dark:bg-accent-400",
      className,
    ].join(" ")}
  >
    {children}
  </span>
);