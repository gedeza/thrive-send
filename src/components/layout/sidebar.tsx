"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface SidebarProps {
  items?: SidebarItem[];
  className?: string;
  brandName?: string;
  brandLogo?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function Sidebar({ 
  items = [], 
  className,
  brandName = "ThriveSend",
  brandLogo,
  collapsible = false,
  defaultCollapsed = false
}: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  // Only apply collapsed state if collapsible is true
  const isCollapsed = collapsible && collapsed;

  return (
    <aside
      data-testid="sidebar"
      className={cn(
        "h-full border-r border-border bg-background flex flex-col overflow-y-auto transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Brand header */}
      <div className="p-4 border-b">
        <Link href="/" className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-start")}>
          {brandLogo && <div className="mr-2">{brandLogo}</div>}
          {!isCollapsed && <span className="font-semibold text-lg">{brandName}</span>}
          {isCollapsed && !brandLogo && <span className="font-bold text-xl">{brandName.charAt(0)}</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = item.isActive ?? (item.href && pathname === item.href);
            
            return (
              <li key={item.key} data-testid={`sidebar-item-${item.key}`}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      isCollapsed && "justify-center"
                    )}
                  >
                    {item.icon && (
                      <span className={cn("inline-flex", !isCollapsed && "mr-3")}>{item.icon}</span>
                    )}
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                ) : (
                  <div
                    onClick={item.onClick}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm cursor-pointer transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      isCollapsed && "justify-center"
                    )}
                  >
                    {item.icon && (
                      <span className={cn("inline-flex", !isCollapsed && "mr-3")}>{item.icon}</span>
                    )}
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse control button (if collapsible) */}
      {collapsible && (
        <div className="p-3 border-t">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-md hover:bg-accent text-muted-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            data-testid="sidebar-collapse-button"
          >
            <span aria-hidden="true">{collapsed ? "→" : "←"}</span>
          </button>
        </div>
      )}
    </aside>
  );
}
