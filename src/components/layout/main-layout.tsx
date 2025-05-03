"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarItem } from "./sidebar";

interface HeaderProps {
  user?: {
    name: string;
    avatarUrl?: string;
  };
  onSearch?: (query: string) => void;
}

export interface MainLayoutProps {
  children: React.ReactNode;
  headerProps?: HeaderProps;
  sidebarItems?: SidebarItem[];
  /**
   * Controls whether to show the sidebar.
   * Set to false when used within pages that already have a sidebar from App Router layouts.
   */
  showSidebar?: boolean;
}

/**
 * MainLayout provides consistent layout structure for pages.
 * It includes conditional sidebar rendering to prevent duplicate sidebars
 * when used within the dashboard layout which already has its own sidebar.
 */

export function MainLayout({ 
  children, 
  headerProps,
  sidebarItems = [],
  // Default to true, but can be turned off when used within dashboard layout
  showSidebar = true
}: MainLayoutProps) {
  const pathname = usePathname();
  
  // Check if we're in a dashboard route
  // IMPORTANT: This prevents duplicate sidebars by not rendering the sidebar
  // when the component is used within pages that are already wrapped in the dashboard layout
  const isDashboardRoute = pathname?.startsWith("/dashboard") || 
    pathname?.startsWith("/calendar") || 
    pathname?.startsWith("/analytics") ||
    pathname?.startsWith("/clients") ||
    pathname?.startsWith("/settings");
  
  // Exclude authentication pages from having the dashboard layout
  const isAuthPage = pathname?.startsWith("/auth") || pathname === "/";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* 
        Conditional sidebar rendering:
        Only show sidebar if:
        1. showSidebar prop is true AND
        2. We're not in a dashboard route (which already has a sidebar from the App Router layout)
      */}
      {showSidebar && !isDashboardRoute && (
        <div className="hidden md:block h-screen">
          <Sidebar 
            items={sidebarItems} 
            brandName="ThriveSend"
            className="h-full"
          />
        </div>
      )}

      {/* Main content */}
      <main className={`flex-1 ${!showSidebar || isDashboardRoute ? 'md:ml-0' : ''}`}>
        {/* Header */}
        {headerProps && (
          <header className="border-b p-4">
            <div className="flex items-center justify-between">
              {headerProps.onSearch && (
                <div className="relative w-full max-w-sm">
                  <input
                    type="search"
                    placeholder="Search..."
                    className="pl-8 w-full rounded-md border border-input bg-background px-3 py-2"
                    onChange={(e) => headerProps.onSearch?.(e.target.value)}
                  />
                </div>
              )}
              
              {headerProps.user && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{headerProps.user.name}</span>
                  {headerProps.user.avatarUrl && (
                    <div className="h-8 w-8 rounded-full overflow-hidden border">
                      <img 
                        src={headerProps.user.avatarUrl} 
                        alt={headerProps.user.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>
        )}
        
        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
