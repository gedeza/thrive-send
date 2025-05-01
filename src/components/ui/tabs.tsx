"use client";

import * as React from "react";
import { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

// Context for tabs state
interface TabsContextValue {
  active: string;
  setActive: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within <Tabs>");
  }
  return context;
};

interface TabsRootProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const Tabs = {
  Root: ({ defaultValue, children, className }: TabsRootProps) => {
    const [active, setActive] = useState(defaultValue);
    
    return (
      <TabsContext.Provider value={{ active, setActive }}>
        <div className={cn("w-full", className)} data-testid="tabs-root">
          {children}
        </div>
      </TabsContext.Provider>
    );
  },
  
  List: ({ children, className }: TabsListProps) => {
    return (
      <div 
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
          className
        )}
        role="tablist"
        data-testid="tabs-list"
      >
        {children}
      </div>
    );
  },
  
  Trigger: ({ value, children, className, disabled = false }: TabsTriggerProps) => {
    const { active, setActive } = useTabs();
    const isSelected = active === value;
    
    return (
      <button
        type="button"
        role="tab"
        aria-selected={isSelected}
        aria-disabled={disabled}
        disabled={disabled}
        data-testid={`tab-${value}`}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          isSelected && "bg-background text-foreground shadow-sm",
          className
        )}
        onClick={() => !disabled && setActive(value)}
      >
        {children}
      </button>
    );
  },
  
  Content: ({ value, children, className }: TabsContentProps) => {
    const { active } = useTabs();
    
    if (active !== value) {
      return null;
    }
    
    return (
      <div
        role="tabpanel"
        data-testid={`tabpanel-${value}`}
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
      >
        {children}
      </div>
    );
  }
};

export { Tabs };
