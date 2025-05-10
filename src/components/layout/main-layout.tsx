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
  /**
   * Controls whether the sidebar can be collapsed by the user.
   * @default true
   */
  collapsibleSidebar?: boolean;
  /**
   * Tailwind padding classes for main content (e.g., 'p-6', 'p-4'). Defaults to 'p-6'.
   */
  contentPadding?: string;
}

export default MainLayout;

/**
 * MainLayout provides consistent layout structure for pages.
 * The sidebar is always rendered unless explicitly disabled by prop or on authentication pages.
 * The header is always rendered (with props), providing cross-page consistency.
 * Page-level padding is controlled here. Do NOT set additional padding within pages for consistency.
 */
export function MainLayout({ 
  children, 
  headerProps = {},
  sidebarItems,
  showSidebar = true,
  collapsibleSidebar = true,
  contentPadding = "p-6"
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
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[MainLayout] Rendering with sidebar items:', resolvedSidebarItems);
    // eslint-disable-next-line no-console
    console.log('[MainLayout] Rendering with collapsibleSidebar:', collapsibleSidebar);
    // eslint-disable-next-line no-console
    console.log('[MainLayout] Using contentPadding:', contentPadding);
  }, [resolvedSidebarItems, collapsibleSidebar, contentPadding]);

  return (
    <div className="flex h-screen overflow-hidden">
      {showSidebar && (
        <Sidebar 
          items={resolvedSidebarItems}
          brandName="ThriveSend"
          collapsible={collapsibleSidebar}
          defaultCollapsed={false} // Start expanded by default
        />
      )}

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header {...headerProps} />
        
        {/* Page content */}
        <main className={`flex-1 overflow-y-auto bg-background ${contentPadding}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
