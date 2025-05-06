"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

// Root select component with context
const SelectContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  options: SelectOption[];
  setOptions: React.Dispatch<React.SetStateAction<SelectOption[]>>;
  disabled?: boolean;
} | null>(null);

const useSelectContext = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a Select");
  }
  return context;
};

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

const Select = ({ value, onValueChange, children, disabled }: SelectProps) => {
  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<SelectOption[]>([]);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, options, setOptions, disabled }}>
      {children}
    </SelectContext.Provider>
  );
};

interface SelectTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: React.ReactNode;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen, disabled } = useSelectContext();

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
          className
        )}
        onClick={() => setOpen(!open)}
        disabled={disabled}
        aria-expanded={open}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

const SelectValue = ({ placeholder, className }: SelectValueProps) => {
  const { value, options } = useSelectContext();
  const selectedOption = options.find(option => option.value === value);
  
  return (
    <span className={cn("text-sm", className)}>
      {selectedOption ? selectedOption.label : placeholder}
    </span>
  );
};

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelectContext();
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleOutsideClick = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };

      if (open) {
        document.addEventListener('mousedown', handleOutsideClick);
      }

      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
      };
    }, [open, setOpen]);

    if (!open) return null;

    return (
      <div 
        ref={containerRef}
        className="relative z-50"
      >
        <div
          ref={ref}
          className={cn(
            "absolute mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2",
            className
          )}
          {...props}
        >
          <div className="p-1">{children}</div>
        </div>
      </div>
    );
  }
);
SelectContent.displayName = "SelectContent";

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, disabled, ...props }, ref) => {
    const { value: selectedValue, onValueChange, setOpen, setOptions } = useSelectContext();
    const isSelected = selectedValue === value;

    React.useEffect(() => {
      setOptions(prev => [
        ...prev.filter(option => option.value !== value),
        { value, label: children, disabled }
      ]);
      
      return () => {
        setOptions(prev => prev.filter(option => option.value !== value));
      };
    }, [value, children, disabled, setOptions]);

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          isSelected && "bg-accent text-accent-foreground",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={() => {
          if (!disabled) {
            onValueChange(value);
            setOpen(false);
          }
        }}
        data-disabled={disabled ? true : undefined}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && <Check className="h-4 w-4" />}
        </span>
        <span>{children}</span>
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

const SelectGroup = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div role="group" {...props}>
      {children}
    </div>
  );
};

const SelectLabel = React.forwardRef<
  HTMLLabelElement,
  React.HTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = "SelectLabel";

const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = "SelectSeparator";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
