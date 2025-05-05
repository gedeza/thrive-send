import React from 'react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, className = '', ...rest }) => (
  <button
    className={[
      // Base styles
      "px-4 py-2 rounded-md font-semibold transition-colors focus:outline-none",
      // Color scheme
      "bg-primary-500 hover:bg-primary-600 active:bg-primary-700",
      "text-custom-white",
      // Dark mode support (optional if using Tailwind dark utilities)
      "dark:bg-primary-400 dark:hover:bg-primary-500 dark:active:bg-primary-600",
      // Border (if needed for focus)
      "focus:ring-2 focus:ring-primary-400",
      className // Allow further customization
    ].join(" ")}
    {...rest}
  >
    {children}
  </button>
);

export default PrimaryButton;