import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const router = useRouter();
  
  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
    },
    {
      label: 'Content',
      href: '/content',
    },
    {
      label: 'Analytics',
      href: '/analytics',
    },
    {
      label: 'Campaigns',
      href: '/campaigns',
    },
    {
      label: 'Subscribers',
      href: '/subscribers',
    },
    {
      label: 'Settings',
      href: '/settings',
    },
  ];
  
  return (
    <aside 
      className={cn(
        "flex h-screen w-64 flex-col border-r border-gray-200 bg-white",
        className
      )}
      data-testid="sidebar"
    >
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <Link href="/" className="text-xl font-bold">
          Thrive Send
        </Link>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-4 py-2 text-sm",
                    isActive 
                      ? "bg-blue-50 text-blue-600" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  {item.icon && <span className="mr-3">{item.icon}</span>}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="border-t border-gray-200 p-4">
        <div className="rounded-md bg-blue-50 p-4">
          <h4 className="text-sm font-medium text-blue-600">Need help?</h4>
          <p className="mt-1 text-xs text-blue-500">
            Check our documentation or contact support.
          </p>
          <Link
            href="/support"
            className="mt-2 block text-xs font-medium text-blue-600"
          >
            View Support Options
          </Link>
        </div>
      </div>
    </aside>
  );
};