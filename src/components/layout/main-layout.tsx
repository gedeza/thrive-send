"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { cn } from "@/lib/utils";

interface Breadcrumb {
  label: string;
  href: string | null;
}

export interface MainLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email?: string;
    avatar?: string;
  };
  className?: string;
  pageClassName?: string;
  breadcrumbs?: Breadcrumb[];
  sidebarItems?: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
  }>;
  headerProps?: {
    title?: string;
    actions?: React.ReactNode;
  };
}

export function MainLayout({ 
  children, 
  user,
  className,
  pageClassName,
  breadcrumbs,
  sidebarItems,
  headerProps
}: MainLayoutProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Exclude authentication pages from having the dashboard layout
  const isAuthPage = pathname?.startsWith("/auth") || pathname === "/";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div 
      data-testid="main-layout-container" 
      className={cn("flex h-screen overflow-hidden bg-background", className)}
    >
      <Sidebar 
        isOpen={isSidebarOpen} 
        userDisplayName={user?.name}
        userAvatar={user?.avatar}
        items={sidebarItems}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          toggleSidebar={toggleSidebar}
          user={user}
          title={headerProps?.title}
          actions={headerProps?.actions}
        />
        
        {breadcrumbs && (
          <div className="flex p-4 text-sm">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="mx-2">/</span>}
                {item.href ? (
                  <a href={item.href}>{item.label}</a>
                ) : (
                  <span>{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        
        <main 
          data-testid="content-area"
          className={cn("flex-1 overflow-y-auto p-6", pageClassName)}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
