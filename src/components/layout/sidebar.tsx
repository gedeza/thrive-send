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
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  
  // Track which parent items are expanded
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});

  // Toggle a parent item's expanded state
  const toggleItemExpanded = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Debug: log and marker
  // eslint-disable-next-line no-console
  console.log('[Sidebar] Rendering with items:', items);
  // Visual marker
  React.useEffect(() => {
    // Add marker to DOM when Sidebar is rendered
    const el = document.createElement('div');
    el.textContent = 'Sidebar Active';
    el.style.position = 'fixed';
    el.style.top = '0px';
    el.style.left = '100px';
    el.style.background = '#0ff';
    el.style.color = '#333';
    el.style.zIndex = '10001';
    el.style.padding = '2px';
    el.style.fontSize = '11px';
    document.body.appendChild(el);
    return () => { document.body.removeChild(el); };
  }, []);

  // Only apply collapsed state if collapsible is true
  const isCollapsed = collapsible && collapsed;

  return (
    <aside
      data-testid="sidebar"
      className={cn(
        "h-full border-r border-border bg-background flex flex-col overflow-y-auto transition-all duration-300",
        isCollapsed ? "w-16 collapsed" : "w-64 expanded",
        className
      )}
    >
      {/* Brand header - Link to dashboard */}
      <div className="p-4 border-b">
        <Link href="/dashboard" className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-start")}>
          {brandLogo && <div className="mr-2">{brandLogo}</div>}
          {!isCollapsed && <span className="font-semibold text-lg">{brandName}</span>}
          {isCollapsed && !brandLogo && <span className="font-bold text-xl">{brandName.charAt(0)}</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item) => {
            // Special case for dashboard to ensure it points to /dashboard
            let href = item.href;
            if (item.key === 'dashboard') {
              // Always ensure dashboard points to /dashboard
              href = '/dashboard';
            } else if (item.href === "/settings") {
              href = "/settings";
            } else if (item.href) {
              href = item.href.startsWith("/") ? item.href : `/${item.href}`;
            }
              
            // Check if active based on current path
            const isActive = item.isActive ?? (
              href && (
                pathname === href || 
                (pathname?.startsWith(href) && href !== "/dashboard")
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
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
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
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      isCollapsed && "justify-center"
                    )}
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
                  <ul className="mt-1 ml-4 space-y-1">
                    {item.children?.map(child => (
                      <li key={child.key} data-testid={`sidebar-item-${child.key}`}>
                        {child.href ? (
                          <Link
                            href={child.href.startsWith("/") ? child.href : `/${child.href}`}
                            className={cn(
                              "flex items-center px-3 py-1.5 rounded-md text-sm transition-colors",
                              (child.isActive ?? (pathname === child.href || pathname?.startsWith(child.href)))
                                ? "bg-primary/10 text-primary font-medium"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
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
