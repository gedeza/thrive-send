"use client";

import React from 'react';
import { usePathname } from "next/navigation";
import { Sidebar, SidebarItem } from "./sidebar";
import { Header, HeaderProps } from "./header";
import { cn } from '@/lib/utils';

export interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  headerProps?: HeaderProps;
  sidebarItems?: SidebarItem[];
  showSidebar?: boolean;
  collapsibleSidebar?: boolean;
  contentPadding?: string;
}

export function MainLayout({ 
  children, 
  className,
  headerProps = {},
  sidebarItems,
  showSidebar = true,
  collapsibleSidebar = true,
  contentPadding = "p-6"
}: MainLayoutProps) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up');
  const resolvedSidebarItems = sidebarItems || [];

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <div className="flex h-screen overflow-hidden">
        {showSidebar && !isAuthPage && (
          <Sidebar 
            items={resolvedSidebarItems}
            brandName="ThriveSend"
            collapsible={collapsibleSidebar}
            defaultCollapsed={false}
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
    </div>
  );
}
