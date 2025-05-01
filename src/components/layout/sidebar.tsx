"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  BarChart2, 
  Calendar, 
  FileText, 
  Grid, 
  Home,
  MessageSquare, 
  Settings, 
  Users 
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  
  const navItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />
    },
    {
      title: "Analytics",
      href: "/dashboard/analytics",
      icon: <BarChart2 className="h-5 w-5" />
    },
    {
      title: "Calendar",
      href: "/dashboard/calendar",
      icon: <Calendar className="h-5 w-5" />
    },
    {
      title: "Content",
      href: "/dashboard/content",
      icon: <FileText className="h-5 w-5" />
    },
    {
      title: "Projects",
      href: "/dashboard/projects",
      icon: <Grid className="h-5 w-5" />
    },
    {
      title: "Creators",
      href: "/dashboard/creators",
      icon: <Users className="h-5 w-5" />
    },
    {
      title: "Messages",
      href: "/dashboard/messages",
      icon: <MessageSquare className="h-5 w-5" />
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />
    },
  ];

  return (
    <aside
      className={cn(
        "bg-card border-r border-border h-screen overflow-y-auto transition-all duration-300",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <div className="p-4">
        <div className={cn("flex items-center", isOpen ? "justify-start" : "justify-center")}>
          {isOpen ? (
            <h2 className="text-lg font-bold">ThriveSend</h2>
          ) : (
            <span className="font-bold text-xl">TS</span>
          )}
        </div>
      </div>
      
      <nav className="mt-4 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  pathname === item.href
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  !isOpen && "justify-center"
                )}
              >
                {item.icon}
                {isOpen && <span>{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}