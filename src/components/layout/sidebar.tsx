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
  children?: SidebarItem[];
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
  
  // Hydration-detection
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => {
    setHydrated(true);
  }, []);
  
  // Enhanced state management with proper initialization
  const [collapsed, setCollapsed] = React.useState(() => {
    if (typeof window !== "undefined" && collapsible) {
      const savedState = localStorage.getItem("sidebar-collapsed");
      return savedState ? JSON.parse(savedState) : defaultCollapsed;
    }
    return defaultCollapsed;
  });
  
  // Only apply collapsed state if collapsible is true
  const isCollapsed = collapsible && collapsed;
  
  // Update localStorage when collapsed state changes
  React.useEffect(() => {
    if (typeof window !== "undefined" && collapsible) {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed));
    }
  }, [collapsed, collapsible]);
  
  // Track which parent items are expanded
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});

  // Toggle a parent item's expanded state
  const toggleItemExpanded = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Toggle collapsed state
  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((prevState: boolean) => !prevState);
  }, []);


  return (
    <aside
      data-testid="sidebar"
      data-collapsible={collapsible ? "true" : "false"}
      data-collapsed={isCollapsed ? "true" : "false"}
      role="navigation"
      aria-label="Main sidebar"
      className={cn(
        "h-full border-r border-border bg-background flex flex-col overflow-y-auto transition-all duration-300",
        isCollapsed ? "w-16 collapsed" : "w-64 expanded",
        className
      )}
      style={{
        transition: "width 0.3s ease-in-out"
      }}
    >
      {/* Brand header - Link to dashboard */}
      <div className="p-4 border-b">
        <Link href="/dashboard" className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-start")}>
          {brandLogo && <div className="mr-2">{brandLogo}</div>}
          {/* HYDRATION FIX: Always render full brand name on SSR; after hydration, allow abbreviation */}
          {(!isCollapsed || !hydrated) && (
            <span className="font-semibold text-lg">{brandName}</span>
          )}
          {isCollapsed && hydrated && !brandLogo && (
            <span className="font-bold text-xl">{brandName.charAt(0)}</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item) => {
            // Use the item's href as provided
            let href = item.href;
            if (item.href === "/settings") {
              href = "/settings";
            } else if (item.href) {
              href = item.href.startsWith("/") ? item.href : `/${item.href}`;
            }
              
            // Check if active based on current path
            const isActive = item.isActive ?? (
              href && (
                pathname === href || 
                (pathname?.startsWith(href) && href !== "/")
              )
            );
            
            // Check if this item has children and if it's expanded
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems[item.key];
            
            // Don't show children in collapsed mode
            const showChildren = !isCollapsed && hasChildren && isExpanded;
            
            return (
              <li key={item.key} data-testid={`sidebar-item-${item.key}`}>
                {href ? (
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
                      isCollapsed && "justify-center"
                    )}
                  >
                    {item.icon && (
                      <span className={cn("inline-flex", !isCollapsed && "mr-3")}>{item.icon}</span>
                    )}
                    {!isCollapsed && <span className="flex-1">{item.label}</span>}
                    {!isCollapsed && hasChildren && (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleItemExpanded(item.key);
                        }}
                        className="ml-auto"
                        aria-label={isExpanded ? `Collapse ${item.label}` : `Expand ${item.label}`}
                        aria-expanded={isExpanded}
                        aria-controls={`sidebar-children-${item.key}`}
                        tabIndex={0}
                        type="button"
                      >
                        {isExpanded ? 
                          <span className="text-xs">▼</span> : 
                          <span className="text-xs">▶</span>
                        }
                      </button>
                    )}
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      if (hasChildren) {
                        toggleItemExpanded(item.key);
                      } else if (item.onClick) {
                        item.onClick();
                      }
                    }}
                    type="button"
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm cursor-pointer transition-colors w-full",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
                      isCollapsed && "justify-center"
                    )}
                    aria-label={item.label}
                    aria-expanded={hasChildren ? isExpanded : undefined}
                    aria-controls={hasChildren ? `sidebar-children-${item.key}` : undefined}
                    tabIndex={0}
                  >
                    {item.icon && (
                      <span className={cn("inline-flex", !isCollapsed && "mr-3")}>{item.icon}</span>
                    )}
                    {!isCollapsed && <span className="flex-1">{item.label}</span>}
                    {!isCollapsed && hasChildren && (
                      <span className="ml-auto">
                        {isExpanded ? 
                          <span className="text-xs">▼</span> : 
                          <span className="text-xs">▶</span>
                        }
                      </span>
                    )}
                  </button>
                )}
                
                {/* Render children if expanded */}
                {showChildren && (
                  <ul className="mt-1 ml-4 space-y-1" id={`sidebar-children-${item.key}`}>
                    {item.children?.map(child => (
                      <li key={child.key} data-testid={`sidebar-item-${child.key}`}>
                        {child.href ? (
                          <Link
                            href={child.href.startsWith("/") ? child.href : `/${child.href}`}
                            className={cn(
                              "flex items-center px-3 py-1.5 rounded-md text-sm transition-colors",
                              (child.isActive ?? (pathname === child.href || pathname?.startsWith(child.href)))
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                            )}
                          >
                            {child.icon && (
                              <span className="mr-3 inline-flex">{child.icon}</span>
                            )}
                            <span>{child.label}</span>
                          </Link>
                        ) : (
                          <button
                            onClick={child.onClick}
                            type="button"
                            className={cn(
                              "flex items-center px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors w-full",
                              child.isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                            )}
                          >
                            {child.icon && (
                              <span className="mr-3 inline-flex">{child.icon}</span>
                            )}
                            <span>{child.label}</span>
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse control button with improved accessibility */}
      {collapsible && (
        <div className="p-3 border-t">
          <button
            onClick={toggleCollapsed}
            className="w-full flex items-center justify-center p-2 rounded-md bg-primary/10 hover:bg-primary/20 text-foreground hover:text-primary"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            aria-expanded={!collapsed}
            data-testid="sidebar-collapse-button"
            style={{ position: 'relative', zIndex: 10 }}
            type="button"
            tabIndex={0}
          >
            <span aria-hidden="true" className="text-lg font-bold">{collapsed ? "→" : "←"}</span>
            {!collapsed && <span className="ml-2 text-sm">Collapse</span>}
          </button>
        </div>
      )}
    </aside>
  );
}
