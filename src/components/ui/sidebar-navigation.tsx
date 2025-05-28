import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Calendar,
  FolderArchive,
  Mail,
  MessageSquare,
  PenSquare,
  Settings,
  Users,
  PlusCircle,
  FileText,
  Home,
  Layers,
  Library
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarNavigation({ className, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  const routes = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
      variant: "default"
    },
    {
      title: "Campaigns",
      href: "/campaigns",
      icon: <Mail className="h-5 w-5" />,
      variant: "default",
      submenu: [
        {
          title: "All Campaigns",
          href: "/campaigns",
        },
        {
          title: "Create Campaign",
          href: "/campaigns/new",
          icon: <PlusCircle className="h-4 w-4" />,
          highlight: true
        }
      ]
    },
    {
      title: "Content",
      href: "/content",
      icon: <FileText className="h-5 w-5" />,
      variant: "default",
      submenu: [
        {
          title: "All Content",
          href: "/content",
        },
        {
          title: "Content Library",
          href: "/content-library",
          icon: <Library className="h-4 w-4" />,
        },
        {
          title: "Create Content",
          href: "/content/new",
          icon: <PenSquare className="h-4 w-4" />,
          highlight: true
        }
      ]
    },
    {
      title: "Templates",
      href: "/templates",
      icon: <Layers className="h-5 w-5" />,
      variant: "default"
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      variant: "default"
    },
    {
      title: "Calendar",
      href: "/content/calendar",
      icon: <Calendar className="h-5 w-5" />,
      variant: "default"
    },
    {
      title: "Clients",
      href: "/clients",
      icon: <Users className="h-5 w-5" />,
      variant: "default"
    },
    {
      title: "Projects",
      href: "/projects",
      icon: <FolderArchive className="h-5 w-5" />,
      variant: "default",
      submenu: [
        {
          title: "All Projects",
          href: "/projects",
        },
        {
          title: "Create Project",
          href: "/projects/new",
          icon: <PlusCircle className="h-4 w-4" />,
          highlight: true
        }
      ]
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      variant: "default"
    },
    {
      title: "Demo",
      href: "/demo",
      icon: <MessageSquare className="h-5 w-5" />,
      variant: "default"
    }
  ];

  return (
    <div className={cn("pb-12", className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {routes.map((route) => (
              <div key={route.href}>
                <Link
                  href={route.href}
                  className={cn(
                    "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:bg-opacity-80 hover:text-accent-foreground",
                    pathname === route.href ? "bg-accent" : "transparent",
                    "transition-all"
                  )}
                >
                  {route.icon}
                  <span className="ml-3">{route.title}</span>
                </Link>
                
                {route.submenu && (
                  <div className="ml-6 mt-1 space-y-1">
                    {route.submenu.map((submenuItem) => (
                      <Link
                        key={submenuItem.href}
                        href={submenuItem.href}
                        className={cn(
                          "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                          pathname === submenuItem.href ? "bg-accent/50" : "transparent",
                          submenuItem.highlight ? "text-primary" : "text-muted-foreground",
                          "transition-all"
                        )}
                      >
                        {submenuItem.icon && <span className="mr-2">{submenuItem.icon}</span>}
                        <span>{submenuItem.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
