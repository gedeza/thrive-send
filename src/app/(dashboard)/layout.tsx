import { ReactNode } from "react";
import Link from "next/link";
import { Activity, BarChart, Calendar, Users, Settings } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // Navigation items for the sidebar
  const navItems = [
    { href: "/", label: "Dashboard", icon: <Activity size={16} /> },
    { href: "/analytics", label: "Analytics", icon: <BarChart size={16} /> },
    { href: "/calendar", label: "Calendar", icon: <Calendar size={16} /> },
    { href: "/clients", label: "Clients", icon: <Users size={16} /> },
    { href: "/settings", label: "Settings", icon: <Settings size={16} /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r bg-background">
        <div className="p-4 border-b">
          <Link href="/" className="text-xl font-bold">
            ThriveSend
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.label}>
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

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
