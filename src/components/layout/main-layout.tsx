"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar, SidebarItem } from "./sidebar";
import { Header, HeaderProps } from "./header";
import { ensureSidebarItems, defaultSidebarItems } from "./sidebar.defaults"; // Import canonical defaults

export interface MainLayoutProps {
  children: React.ReactNode;
  headerProps?: HeaderProps;
  sidebarItems?: SidebarItem[];
  /**
   * Controls whether to show the sidebar.
   * You may set this to false to explicitly disable it on certain pages.
   */
  showSidebar?: boolean;
}

/**
 * MainLayout provides consistent layout structure for pages.
 * The sidebar is always rendered unless explicitly disabled by prop or on authentication pages.
 */
export function MainLayout({ 
  children, 
  headerProps = {},
  sidebarItems,
  showSidebar = true
}: MainLayoutProps) {
  const pathname = usePathname();

  // Exclude authentication pages from having the layout/sidebar
  const isAuthPage = pathname?.startsWith("/auth");

  if (isAuthPage) {
    return <>{children}</>;
  }

  // Use all default sidebar items if none provided, otherwise ensure critical ones
  const resolvedSidebarItems = sidebarItems ? ensureSidebarItems(sidebarItems) : defaultSidebarItems;
  
  // Debug: log to console when MainLayout renders
  // eslint-disable-next-line no-console
  console.log('[MainLayout] Rendering with sidebar items:', resolvedSidebarItems);

  return (
    <div className="flex h-screen overflow-hidden">
      {showSidebar && (
        <Sidebar 
          items={resolvedSidebarItems}
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
