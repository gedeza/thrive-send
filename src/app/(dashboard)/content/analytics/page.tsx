'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3, RefreshCw } from 'lucide-react';
import { ContentPerformanceDashboard } from '@/components/content/ContentPerformanceDashboard';
import { useBulkContentAnalytics } from '@/lib/hooks/useContentAnalytics';
import { listContent, ContentData } from '@/lib/api/content-service';
import { toast } from '@/components/ui/use-toast';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { useRealTimeAnalytics } from '@/lib/hooks/useRealTimeAnalytics';
import { RealTimeAnalyticsIndicator } from '@/components/content/RealTimeAnalyticsIndicator';
import Link from 'next/link';

type TimeframeType = '7d' | '30d' | '90d' | '1y';

export default function ContentAnalyticsPage() {
  const [timeframe, setTimeframe] = useState<TimeframeType>('30d');
  
  // 🚀 B2B2G SERVICE PROVIDER INTEGRATION
  const { 
    state: { organizationId, selectedClient } 
  } = useServiceProvider();

  // Fetch all content for analytics with service provider context
  const {
    data: contentData,
    isLoading: contentLoading,
    error: contentError,
    refetch: refetchContent
  } = useQuery({
    queryKey: ['service-provider-content', 'analytics', { 
      limit: 100, 
      organizationId: organizationId || 'demo-org',
      clientId: selectedClient?.id 
    }],
    queryFn: () => listContent({ 
      limit: 100, 
      sortBy: 'createdAt', 
      sortOrder: 'desc',
      organizationId: organizationId || 'demo-org',
      ...(selectedClient && { clientId: selectedClient.id })
    }),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });

  const content = contentData?.content || [];
  const contentIds = useMemo(() => 
    content.map((item: ContentData) => item.id!).filter(Boolean), 
    [content]
  );

  // Fetch analytics for all content
  const { analyticsMap, isLoading: analyticsLoading } = useBulkContentAnalytics(contentIds);

  // Real-time analytics updates
  const realtimeAnalytics = useRealTimeAnalytics({
    contentIds,
    enabled: true,
    interval: 30000, // Update every 30 seconds for analytics page
    simulateUpdates: true
  });

  // Merge real-time updates with analytics data
  const enhancedAnalyticsMap = useMemo(() => {
    const enhanced = { ...analyticsMap };
    if (realtimeAnalytics?.realtimeUpdates) {
      Object.entries(realtimeAnalytics.realtimeUpdates).forEach(([contentId, updates]) => {
        if (enhanced[contentId]) {
          enhanced[contentId] = { ...enhanced[contentId], ...updates };
        }
      });
    }
    return enhanced;
  }, [analyticsMap, realtimeAnalytics?.realtimeUpdates]);

  const isLoading = contentLoading || analyticsLoading;

  const handleRefresh = async () => {
    try {
      await refetchContent();
      toast({
        title: "Analytics Refreshed",
        description: "Latest analytics data has been loaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh analytics data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTimeframeChange = (newTimeframe: TimeframeType) => {
    setTimeframe(newTimeframe);
    // In a real implementation, this would trigger a new API call with date filters
    toast({
      title: "Timeframe Updated",
      description: `Now showing data for the last ${newTimeframe === '7d' ? '7 days' : newTimeframe === '30d' ? '30 days' : newTimeframe === '90d' ? '90 days' : 'year'}.`,
    });
  };

  if (contentError) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Failed to Load Analytics</h2>
            <p className="text-muted-foreground mb-4">
              There was an error loading your content analytics data.
            </p>
            <div className="flex items-center gap-2 justify-center">
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button asChild>
                <Link href="/content">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Content
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/content">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Content
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              {selectedClient ? `${selectedClient.name} Analytics` : 'Content Analytics'}
            </h1>
            <p className="text-muted-foreground">
              {selectedClient 
                ? `Deep insights into ${selectedClient.name}'s content performance and engagement`
                : 'Deep insights into your content performance and engagement across all clients'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RealTimeAnalyticsIndicator
            isConnected={realtimeAnalytics?.isConnected ?? false}
            lastUpdateTime={realtimeAnalytics?.lastUpdateTime}
            onRefresh={realtimeAnalytics?.refreshAnalytics}
            hasRecentUpdates={Object.keys(realtimeAnalytics?.realtimeUpdates || {}).length > 0}
            size="sm"
            showLastUpdate={true}
            showConnectionStatus={true}
          />
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <ContentPerformanceDashboard
        content={content}
        analyticsMap={enhancedAnalyticsMap}
        isLoading={isLoading}
        timeframe={timeframe}
        onTimeframeChange={handleTimeframeChange}
      />

      {/* Empty State */}
      {!isLoading && content.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-16 w-16 mx-auto mb-6 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Content to Analyze</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You need to create some content first before you can view analytics. 
              Start by creating your first piece of content.
            </p>
            <Button asChild>
              <Link href="/content/new">
                Create Your First Content
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Analytics Summary for No Data State */}
      {!isLoading && content.length > 0 && Object.keys(enhancedAnalyticsMap).length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="mx-auto max-w-md">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Analytics Data Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Analytics data will appear here once your content starts receiving views and engagement.
                </p>
                <p className="text-sm text-muted-foreground">
                  In development mode, mock analytics data may be generated automatically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}