"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useOrganization, useUser } from '@clerk/nextjs';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { DashboardNav } from '@/components/dashboard/DashboardNav';
import { MainLayout } from '@/components/layout/main-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export default function DashboardPage() {
  const { isLoaded, userId } = useAuth();
  const { isLoaded: isOrgLoaded, organization } = useOrganization();
  const { user } = useUser();
  const router = useRouter();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
    }
  }, [isLoaded, userId, router]);

  // Simulate data loading - replace with actual data fetching
  useEffect(() => {
    const loadData = async () => {
      try {
        // Add your data fetching logic here
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
        setIsDataLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setIsDataLoading(false);
      }
    };

    if (isLoaded && isOrgLoaded && organization) {
      loadData();
    }
  }, [isLoaded, isOrgLoaded, organization, dateRange]);

  if (!isLoaded || !isOrgLoaded) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Loading...</h1>
            <p className="text-muted-foreground">Please wait while we verify your authentication.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!organization) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
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
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={dateRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange('7d')}
              aria-label="Last 7 days"
            >
              7D
            </Button>
            <Button
              variant={dateRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange('30d')}
              aria-label="Last 30 days"
            >
              30D
            </Button>
            <Button
              variant={dateRange === '90d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange('90d')}
              aria-label="Last 90 days"
            >
              90D
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              aria-label="Custom date range"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Custom
            </Button>
          </div>
        </div>
        <DashboardNav />
        {isDataLoading ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-[120px] rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-[300px] rounded-xl" />
              <Skeleton className="h-[300px] rounded-xl" />
            </div>
          </div>
        ) : (
          <DashboardOverview dateRange={dateRange} />
        )}
      </div>
    </MainLayout>
  );
} 