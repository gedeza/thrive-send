"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar, SidebarItem } from "./sidebar";
import { Header, HeaderProps } from "./header";
import { LayoutDashboard, Calendar, BarChart, Users, Settings } from "lucide-react";

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
  headerProps = {},
  sidebarItems,
  // Default to true, but can be turned off when used within dashboard layout
  showSidebar = true
}: MainLayoutProps) {
  const pathname = usePathname();
  
  // Define default sidebar items
  const defaultSidebarItems: SidebarItem[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      href: '/'
    },
    {
      key: 'calendar',
      label: 'Calendar',
      icon: <Calendar size={20} />,
      href: '/calendar'
    },
    {
      key: 'analytics',
      label: 'Analytics',
      icon: <BarChart size={20} />,
      href: '/analytics'
    },
    {
      key: 'clients',
      label: 'Clients',
      icon: <Users size={20} />,
      href: '/clients'
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <Settings size={20} />,
      href: '/settings'
    }
  ];
  
  // Check if we're in a dashboard route
  // IMPORTANT: This prevents duplicate sidebars by not rendering the sidebar
  // when the component is used within pages that are already wrapped in the dashboard layout
  const isDashboardRoute = pathname === "/" || 
    pathname?.startsWith("/calendar") || 
    pathname?.startsWith("/analytics") ||
    pathname?.startsWith("/clients") ||
    pathname?.startsWith("/settings");
  
  // Exclude authentication pages from having the dashboard layout
  const isAuthPage = pathname?.startsWith("/auth");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 
        Conditional sidebar rendering:
        Only show sidebar if:
        1. showSidebar prop is true AND
        2. We're not in a dashboard route (which already has a sidebar from the App Router layout)
      */}
      {showSidebar && !isDashboardRoute && (
        <Sidebar 
          items={sidebarItems || defaultSidebarItems} 
          brandName="ThriveSend"
          collapsible
        />
      )}

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header {...headerProps} />
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
