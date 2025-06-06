"use client";

import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from "@/components/ui/toaster";
import { Providers } from '@/components/providers';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { CustomUserButton } from '@/components/ui/user-button';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <Providers>
        <div className="min-h-screen bg-background flex flex-col">
          {/* Global Header */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16 flex items-center">
            <div className="container flex items-center justify-between h-16">
              <a className="flex items-center space-x-2" href="/">
                <span className="font-bold text-xl">ThriveSend</span>
              </a>
              <div className="flex items-center space-x-4">
                <NotificationCenter />
                <CustomUserButton />
              </div>
            </div>
          </header>
          {/* Main content below header */}
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </div>
        <Toaster />
      </Providers>
    </ClerkProvider>
  );
} 