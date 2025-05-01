import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';

// Context for dropdown state management
type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DropdownMenuContext = createContext<DropdownMenuContextValue | undefined>(undefined);

const useDropdownMenuContext = () => {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('Dropdown Menu components must be used within a DropdownMenu.Root');
  }
  return context;
};

// Root component
interface RootProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Root = ({ open: controlledOpen, onOpenChange, children }: RootProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  
  const setOpen = (newOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };
  
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div data-testid="dropdown-root">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

// Trigger component
interface TriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Trigger = ({ children, className, ...props }: TriggerProps) => {
  const { open, setOpen } = useDropdownMenuContext();
  
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-haspopup="menu"
      data-testid="dropdown-trigger"
      className={cn('dropdown-trigger', className)}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
    </button>
  );
};

// Content component
interface ContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Content = ({ children, className, ...props }: ContentProps) => {
  const { open } = useDropdownMenuContext();
  
  if (!open) return null;
  
  return (
    <div
      role="menu"
      data-testid="dropdown-content"
      className={cn('dropdown-content', className)}
      {...props}
    >
      {children}
    </div>
  );
};

// Label component
interface LabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Label = ({ children, className, ...props }: LabelProps) => {
  return (
    <div
      data-testid="dropdown-label"
      className={cn('dropdown-label', className)}
      {...props}
    >
      {children}
    </div>
  );
};

// Item component
interface ItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Item = ({ children, className, ...props }: ItemProps) => {
  const { setOpen } = useDropdownMenuContext();
  
  return (
    <button
      type="button"
      role="menuitem"
      data-testid="dropdown-item"
      className={cn('dropdown-item', className)}
      onClick={(e) => {
        props.onClick?.(e);
        setOpen(false);
      }}
      {...props}
    >
      {children}
    </button>
  );
};

// Separator component
interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

const Separator = ({ className, ...props }: SeparatorProps) => {
  return (
    <div
      role="separator"
      data-testid="dropdown-separator"
      className={cn('dropdown-separator', className)}
      {...props}
    />
  );
};

// Export as a namespace-like object
export const DropdownMenu = {
  Root,
  Trigger,
  Content,
  Label,
  Item,
  Separator
};