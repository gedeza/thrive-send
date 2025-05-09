"use client";

import * as React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { MainLayout } from "@/components/layout/main-layout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {/* MainLayout now manages sidebar, header, and main content */}
      <MainLayout>
        {children}
      </MainLayout>
    </ThemeProvider>
  );
}
