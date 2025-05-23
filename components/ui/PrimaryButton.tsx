import React from 'react';
import { cn } from '@/lib/utils';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive';
  children: React.ReactNode;
}

export function PrimaryButton({
  className,
  variant = 'default',
  children,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
        {
          'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
          'border border-input hover:bg-accent hover:text-accent-foreground': variant === 'outline',
          'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
        },
        'h-10 py-2 px-4',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}