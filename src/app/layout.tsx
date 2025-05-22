import '../../styles/global-fonts.css';
import "./globals.css";
import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from '@/components/providers';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { UserButton } from '@/components/ui/user-button';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'ThriveSend',
  description: 'Social media management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Roboto:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className={inter.className}>
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
                    <UserButton />
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
        </body>
      </html>
    </ClerkProvider>
  );
}
