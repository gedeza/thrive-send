"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { defaultSidebarItems } from '@/components/layout/sidebar.defaults';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-background border-border shadow-md"
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        fixed lg:relative
        inset-y-0 left-0
        z-40 lg:z-auto
        w-64 lg:w-auto
        transition-transform duration-300 ease-in-out
        lg:transition-none
      `}>
        <Sidebar 
          items={defaultSidebarItems}
          brandName="ThriveSend"
          collapsible={true}
          defaultCollapsed={false}
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden lg:ml-0">
        <main className="flex-1 overflow-y-auto bg-background p-3 sm:p-4 lg:p-6 pt-16 lg:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
} 