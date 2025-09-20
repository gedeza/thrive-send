'use client';

import "./globals.css";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { ServiceProviderProvider } from "@/context/ServiceProviderContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { ClientLayout } from "@/components/layout/client-layout";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider>
          <ServiceProviderProvider>
            <OnboardingProvider>
              <ClientLayout>
                {children}
              </ClientLayout>
            </OnboardingProvider>
          </ServiceProviderProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
