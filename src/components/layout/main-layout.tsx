"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SidebarItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  isActive?: boolean;
}

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
}

export function MainLayout({ 
  children, 
  headerProps,
  sidebarItems = []
}: MainLayoutProps) {
  const pathname = usePathname();
  
  // Exclude authentication pages from having the dashboard layout
  const isAuthPage = pathname?.startsWith("/auth") || pathname === "/";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 border-r">
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center font-semibold text-lg">
            ThriveSend
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.key}>
                <Link 
                  href={item.href || `/${item.key}`} 
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                    item.isActive 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'hover:bg-muted'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64">
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
