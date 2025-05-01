"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

interface SidebarProps {
  items?: SidebarItem[];
  className?: string;
}

export function Sidebar({ items = [], className }: SidebarProps) {
  return (
    <aside
      data-testid="sidebar"
      className={cn(
        "w-64 h-full border-r border-border bg-background flex flex-col overflow-y-auto",
        className
      )}
    >
      <nav className="flex-1 py-4">
        {items.map((item) => (
          <div
            key={item.key}
            data-testid={`sidebar-item-${item.key}`}
            onClick={item.onClick}
            className={cn(
              "flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
              item.isActive && "bg-accent text-accent-foreground font-medium"
            )}
          >
            {item.icon && (
              <span className="mr-2">{item.icon}</span>
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
}
