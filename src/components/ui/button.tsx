"use client"

import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

/**
 * A minimal button component without external dependencies
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', asChild = false, children, ...props }, ref) => {
    // Basic styles based on variant
    const getVariantClass = () => {
      switch (variant) {
        case 'outline':
          return 'border border-gray-300 bg-transparent hover:bg-gray-100';
        case 'secondary':
          return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
        case 'destructive':
          return 'bg-red-500 text-white hover:bg-red-600';
        case 'ghost':
          return 'bg-transparent hover:bg-gray-100';
        case 'link':
          return 'bg-transparent text-blue-500 underline-offset-4 hover:underline';
        case 'default':
        default:
          return 'bg-blue-500 text-white hover:bg-blue-600';
      }
    };

    // Basic styles based on size
    const getSizeClass = () => {
      switch (size) {
        case 'sm':
          return 'h-9 rounded-md px-3 text-sm';
        case 'lg':
          return 'h-11 rounded-md px-8';
        case 'icon':
          return 'h-10 w-10 p-0';
        case 'default':
        default:
          return 'h-10 px-4 py-2';
      }
    };

    // Combine all classes
    const buttonClasses = `
      inline-flex items-center justify-center whitespace-nowrap
      rounded-md font-medium transition-colors
      focus-visible:outline-none focus-visible:ring-2
      focus-visible:ring-blue-500 focus-visible:ring-offset-2
      disabled:pointer-events-none disabled:opacity-50
      ${getVariantClass()}
      ${getSizeClass()}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        className: buttonClasses,
        ...props,
        ref,
      });
    }

    return (
      <button className={buttonClasses} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
