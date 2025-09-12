'use client';

import React from 'react';
import { CleanServiceProviderDashboard } from '@/components/dashboard/CleanServiceProviderDashboard';
import { CleanClientSwitcher } from '@/components/dashboard/CleanClientSwitcher';
import { ServiceProviderProvider } from '@/context/ServiceProviderContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Create a query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

export default function TestCleanDashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ServiceProviderProvider>
        <div className="min-h-screen bg-muted/50">
          <div className="container mx-auto py-8 space-y-8">
            {/* Test Page Header */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  🧪 Clean Dashboard Components Test
                </CardTitle>
                <p className="text-center text-muted-foreground">
                  Testing the rebuilt dashboard components based on Enhanced TDD
                </p>
              </CardHeader>
            </Card>

            {/* Client Switcher Test Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Client Switcher Component Test</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Testing the enhanced client switcher with search, stats, and quick actions
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-w-md">
                  <CleanClientSwitcher
                    showCreateClient={true}
                    showQuickActions={true}
                    searchEnabled={true}
                    showClientStats={true}
                    onCreateClient={() => console.log('Create client clicked')}
                    onViewAllAnalytics={() => console.log('View all analytics clicked')}
                    onViewAllClients={() => console.log('View all clients clicked')}
                  />
                </div>
                
                <div className="text-sm text-success bg-success/10 p-3 rounded-lg">
                  ✅ Features to test:
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Client selection and switching</li>
                    <li>Search functionality</li>
                    <li>Client statistics display</li>
                    <li>Quick action buttons</li>
                    <li>All clients overview option</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Service Provider Dashboard Test Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service Provider Dashboard Test</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Testing the complete dashboard with enhanced metrics, tabs, and progressive loading
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-primary bg-primary/10 p-3 rounded-lg mb-6">
                  ℹ️ Dashboard features to test:
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Enhanced metrics cards with trend indicators</li>
                    <li>Quick actions section</li>
                    <li>Client performance rankings</li>
                    <li>Recent activity feed</li>
                    <li>Tabbed interface (Overview, Analytics, Revenue)</li>
                    <li>Real-time updates and refresh functionality</li>
                    <li>Progressive loading with skeleton states</li>
                    <li>Error handling and recovery</li>
                  </ul>
                </div>
                
                {/* Dashboard Component */}
                <CleanServiceProviderDashboard
                  defaultView="overview"
                  realTimeUpdates={true}
                  progressiveLoading={true}
                />
              </CardContent>
            </Card>

            {/* Test Results Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Results & Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-success/10 rounded-lg">
                    <h4 className="font-semibold text-success">✅ Working Features</h4>
                    <ul className="mt-2 text-sm text-success space-y-1">
                      <li>• Component rendering</li>
                      <li>• TypeScript types</li>
                      <li>• Basic interactions</li>
                      <li>• Responsive design</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-warning/10 rounded-lg">
                    <h4 className="font-semibold text-warning">⚠️ Needs Testing</h4>
                    <ul className="mt-2 text-sm text-warning space-y-1">
                      <li>• API integration</li>
                      <li>• Real-time updates</li>
                      <li>• Error boundaries</li>
                      <li>• Performance metrics</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <h4 className="font-semibold text-primary">🚀 Next Steps</h4>
                    <ul className="mt-2 text-sm text-primary space-y-1">
                      <li>• Analytics components</li>
                      <li>• Integration testing</li>
                      <li>• E2E test coverage</li>
                      <li>• Production deployment</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Development Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Development Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold mb-2">Architecture Benefits:</h4>
                    <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                      <li>Clean separation of concerns following Enhanced TDD</li>
                      <li>TypeScript-first approach with comprehensive interfaces</li>
                      <li>Progressive enhancement and loading strategies</li>
                      <li>Comprehensive error handling with fallback states</li>
                      <li>Optimized data fetching with React Query</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Performance Optimizations:</h4>
                    <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                      <li>Skeleton loading states for better perceived performance</li>
                      <li>Intelligent caching with appropriate TTL strategies</li>
                      <li>Minimal re-renders with optimized React patterns</li>
                      <li>Lazy loading for non-critical components</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">User Experience Enhancements:</h4>
                    <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                      <li>Intuitive client switching with visual feedback</li>
                      <li>Real-time activity updates and notifications</li>
                      <li>Comprehensive search and filtering capabilities</li>
                      <li>Mobile-responsive design patterns</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ServiceProviderProvider>
    </QueryClientProvider>
  );
}