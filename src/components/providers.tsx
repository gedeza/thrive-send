'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState, useEffect } from "react";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { CalendarCacheProvider } from "@/context/CalendarCacheContext";
import { WelcomeFlowGlobal } from '@/components/onboarding/WelcomeFlowGlobal';
import { Toaster } from '@/components/ui/toaster'; // Add this line

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient, setQueryClient] = useState<QueryClient | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const client = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      });
      setQueryClient(client);
    } catch (err) {
      console.error('Error creating QueryClient:', err);
      setError(err instanceof Error ? err : new Error('Failed to create QueryClient'));
    }
  }, []);

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error initializing application: {error.message}
      </div>
    );
  }

  if (!queryClient) {
    return (
      <div className="p-4">
        Initializing application...
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <OnboardingProvider>
          <CalendarCacheProvider>
            <Toaster />
            {children}
            <WelcomeFlowGlobal />
          </CalendarCacheProvider>
        </OnboardingProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}