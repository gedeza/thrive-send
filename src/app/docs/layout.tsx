'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navigation = [
  {
    title: 'Getting Started',
    href: '/docs/getting-started',
    icon: '🚀'
  },
  {
    title: 'Campaign Management',
    href: '/docs/campaign-management',
    icon: '📢'
  },
  {
    title: 'Content Management',
    href: '/docs/content-management',
    icon: '📝'
  },
  {
    title: 'User Management',
    href: '/docs/user-management',
    icon: '👥'
  }
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 min-h-screen bg-white border-r border-gray-200 p-6">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900">Documentation</h2>
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
