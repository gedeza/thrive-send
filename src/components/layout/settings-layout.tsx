"use client"

import { ReactNode } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SettingsLayoutProps {
  children: ReactNode;
  tabs: {
    id: string;
    label: string;
    href: string;
  }[];
}

export function SettingsLayout({ children, tabs }: SettingsLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <Tabs
            value={pathname || undefined}
            onValueChange={(value) => router.push(value)}
            className="w-full"
            orientation="vertical"
          >
            <TabsList className="flex flex-col h-auto w-full">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.href}
                  className={cn(
                    "w-full justify-start px-3 py-2",
                    pathname === tab.href && "bg-muted"
                  )}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </aside>

        <div className="flex-1 lg:max-w-2xl">
          {children}
        </div>
      </div>
    </div>
  );
} 