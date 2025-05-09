"use client";

import * as React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { UserButton } from "@/components/ui/user-button";
import { Search } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

// Canonical sidebar
import { Sidebar } from "@/components/layout/sidebar";
import { defaultSidebarItems } from "@/components/layout/sidebar.defaults";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
              <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
              <circle cx="12" cy="12" r="2" />
              <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
              <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
            </svg>
            <span>ThriveSend</span>
          </Link>
          
          {/* Search */}
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-background pl-8 md:w-[300px]"
            />
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            {/* Using our custom UserButton instead of Clerk's */}
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        
        {/* Unified, collapsible Sidebar layout */}
        <div className="flex-1 flex flex-row min-h-0">
          {/* Sidebar */}
          <aside
            className="h-full min-h-0 flex flex-col"
            style={{
              minWidth: 0,
              zIndex: 30,
            }}
          >
            <Sidebar
              items={defaultSidebarItems}
              brandName="ThriveSend"
              collapsible={true}
              defaultCollapsed={false}
            />
          </aside>
          
          {/* Main content */}
          <main className="flex-1 flex w-full flex-col overflow-hidden p-4 md:py-8 md:px-8">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
