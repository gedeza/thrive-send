"use client";

import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { defaultSidebarItems } from '@/components/layout/sidebar.defaults';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden"> {/* 4rem = 64px header height */}
      {/* Sidebar */}
      <Sidebar 
        items={defaultSidebarItems}
        brandName="ThriveSend"
        collapsible={true}
        defaultCollapsed={false}
      />
      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-background p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
