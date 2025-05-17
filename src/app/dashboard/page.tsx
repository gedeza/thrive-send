"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useOrganization, useUser } from '@clerk/nextjs';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { MainLayout } from '@/components/layout/main-layout';

export default function DashboardPage() {
  const { isLoaded, userId } = useAuth();
  const { isLoaded: isOrgLoaded, organization } = useOrganization();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded || !isOrgLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-muted-foreground">Please wait while we verify your authentication.</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Organization Required</h1>
          <p className="text-muted-foreground mb-4">Please select an organization to access the dashboard.</p>
          <button
            onClick={() => router.push('/organization')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Select Organization
          </button>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <DashboardNav />
        <DashboardOverview />
      </div>
    </MainLayout>
  );
} 