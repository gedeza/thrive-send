"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BarChart, Calendar, Users, Settings, Layers } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Updated navigation items with correct routes that match the file system
  const navItems = [
    { key: "dashboard", href: "/dashboard", label: "Dashboard", icon: <Activity size={16} /> },
    { key: "analytics", href: "/analytics", label: "Analytics", icon: <BarChart size={16} /> },
    { key: "calendar", href: "/calendar", label: "Calendar", icon: <Calendar size={16} /> },
    { key: "clients", href: "/clients", label: "Clients", icon: <Users size={16} /> },
    { key: "demo", href: "/demo", label: "Demo UI", icon: <Layers size={16} /> },
    { key: "settings", href: "/settings", label: "Settings", icon: <Settings size={16} /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r bg-background">
        <div className="p-4 border-b">
          <Link href="/dashboard" className="text-xl font-bold">
            ThriveSend
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Mobile header - Only visible on mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 border-b bg-background z-10">
        <div className="flex items-center justify-between p-4">
          <Link href="/dashboard" className="text-xl font-bold">
            ThriveSend
          </Link>
          <button className="p-1 rounded-md hover:bg-muted">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-0 md:pt-0">
        {/* Add padding-top on mobile for the fixed header */}
        <div className="md:pb-0 pb-16">
          {children}
        </div>
      </main>
    </div>
  );
}
