'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import '@/lib/date-extensions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Activity,
  RefreshCw,
  AlertCircle,
  Eye,
  MousePointer,
  Target
} from 'lucide-react';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { useQuery } from '@tanstack/react-query';

// Enhanced interfaces from TDD
interface ServiceProviderMetrics {
  totalClients: number;
  activeClients: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalRevenue: number;
  marketplaceRevenue: number;
  teamUtilization: number;
  avgClientSatisfaction: number;
  
  // Enhanced metrics
  monthlyRecurringRevenue: number;
  averageClientValue: number;
  churnRate: number;
  growthRate: number;
}

interface ClientSummary {
  id: string;
  name: string;
  type: 'municipality' | 'business' | 'startup' | 'creator';
  status: 'ACTIVE' | 'INACTIVE' | 'LEAD' | 'ARCHIVED';
  logoUrl?: string;
  performanceScore: number;
  trendDirection: 'up' | 'down' | 'stable';
  activeCampaigns: number;
  engagementRate: number;
  monthlyBudget: number;
  lastActivity: Date;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  clientId?: string;
  clientName?: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'success' | 'error';
}

interface DashboardData {
  metrics: ServiceProviderMetrics;
  clientSummary: ClientSummary[];
  recentActivity: Activity[];
  performanceTrends: any[];
}

// Enhanced Dashboard Props
interface CleanServiceProviderDashboardProps {
  organizationId?: string;
  defaultView?: 'overview' | 'analytics' | 'revenue';
  realTimeUpdates?: boolean;
  progressiveLoading?: boolean;
}

// Loading skeleton component
const MetricCardSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-primary/20 rounded animate-pulse" />
          <div className="h-8 w-16 bg-primary/20 rounded animate-pulse" />
        </div>
        <div className="h-12 w-12 bg-primary/10 border border-primary/20 rounded-lg animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

// Enhanced Metric Card Component
const EnhancedMetricCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color 
}: {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'up' | 'down' | 'stable';
  icon: React.ComponentType<any>;
  color: string;
}) => {
  const getChangeColor = () => {
    if (changeType === 'up') return 'text-success';
    if (changeType === 'down') return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getChangeIcon = () => {
    if (changeType === 'up') return '↗';
    if (changeType === 'down') return '↘';
    return '→';
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold">{value}</p>
              {change !== undefined && (
                <div className={`flex items-center text-sm ${getChangeColor()}`}>
                  <span>{getChangeIcon()}</span>
                  <span className="ml-1">{Math.abs(change)}%</span>
                </div>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Quick Actions Component
const QuickActionsSection = () => {
  const quickActions = [
    {
      label: 'New Campaign',
      description: 'Create multi-client campaign',
      icon: BarChart3,
      color: 'bg-primary/10 text-primary',
      onClick: () => window.location.href = '/campaigns/new'
    },
    {
      label: 'Add Client',
      description: 'Onboard new client',
      icon: Users,
      color: 'bg-success/10 text-success',
      onClick: () => window.location.href = '/clients/new'
    },
    {
      label: 'View Analytics',
      description: 'Detailed performance analysis',
      icon: TrendingUp,
      color: 'bg-accent/10 text-accent',
      onClick: () => window.location.href = '/analytics?tab=service-provider'
    },
    {
      label: 'Generate Report',
      description: 'Cross-client performance report',
      icon: Activity,
      color: 'bg-[var(--color-chart-orange)]/10 text-[var(--color-chart-orange)]',
      onClick: () => window.location.href = '/reports'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={action.onClick}
              className="h-auto p-4 flex flex-col items-start space-y-2 hover:bg-muted/10"
            >
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${action.color}`}>
                <action.icon className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{action.label}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Recent Activity Component
const RecentActivitySection = ({ activities }: { activities: Activity[] }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'campaign_created': return <BarChart3 className="h-4 w-4" />;
      case 'content_published': return <Eye className="h-4 w-4" />;
      case 'client_added': return <Users className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'text-success bg-success/10';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'error': return 'text-destructive bg-destructive/10';
      default: return 'text-primary bg-primary/10';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getSeverityColor(activity.severity)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  {activity.clientName && (
                    <Badge variant="outline" className="text-xs">
                      {activity.clientName}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toRelativeTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Client Performance Rankings Component
const ClientRankingsSection = ({ clients }: { clients: ClientSummary[] }) => {
  const topClients = useMemo(() => {
    return [...clients]
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 5);
  }, [clients]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Performing Clients</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topClients.map((client, index) => (
            <div key={client.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted/20 text-xs font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-sm">{client.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {client.activeCampaigns} campaigns • {client.engagementRate.toFixed(1)}% engagement
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-success">
                  {client.performanceScore.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Main Dashboard Component
export function CleanServiceProviderDashboard({
  organizationId,
  defaultView = 'overview',
  realTimeUpdates = true,
  progressiveLoading = true
}: CleanServiceProviderDashboardProps) {
  const { 
    state: { organizationId: contextOrgId, availableClients, metrics: contextMetrics },
    refreshMetrics,
    refreshClients
  } = useServiceProvider();
  
  const [currentView, setCurrentView] = useState(defaultView);
  const effectiveOrgId = organizationId || contextOrgId;

  // Dashboard data query with enhanced caching
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch
  } = useQuery<DashboardData>({
    queryKey: ['service-provider-dashboard', effectiveOrgId],
    queryFn: async () => {
      const response = await fetch(`/api/service-provider/dashboard?organizationId=${effectiveOrgId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json();
    },
    enabled: !!effectiveOrgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });

  // Real-time updates effect
  useEffect(() => {
    if (!realTimeUpdates || !effectiveOrgId) return;

    const interval = setInterval(() => {
      refetch();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [realTimeUpdates, effectiveOrgId, refetch]);

  // Handle refresh action
  const handleRefresh = async () => {
    await Promise.all([
      refetch(),
      refreshMetrics(),
      refreshClients()
    ]);
  };

  // Error handling
  if (error) {
    return (
      <Card className="p-8 text-center border-red-200">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-red-700">Dashboard Unavailable</h3>
        <p className="text-muted-foreground mb-4">
          Unable to load dashboard data. Please try refreshing or contact support.
        </p>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Dashboard
        </Button>
      </Card>
    );
  }

  // Loading state with skeleton
  if (isLoading || !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Service Provider Dashboard</h2>
          <div className="flex gap-2">
            <div className="w-32 h-10 bg-primary/20 rounded animate-pulse" />
            <div className="w-24 h-10 bg-primary/20 rounded animate-pulse" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <MetricCardSkeleton key={i} />)}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-80 bg-primary/10 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Service Provider Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and manage your client portfolio
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* View Selector */}
      <Tabs value={currentView} onValueChange={setCurrentView}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <EnhancedMetricCard
              title="Total Clients"
              value={dashboardData.metrics.totalClients}
              change={5.2}
              changeType="up"
              icon={Users}
              color="bg-primary/10 border border-primary/20 text-primary"
            />
            <EnhancedMetricCard
              title="Active Campaigns"
              value={dashboardData.metrics.activeCampaigns}
              change={8.1}
              changeType="up"
              icon={BarChart3}
              color="bg-primary/10 border border-primary/20 text-primary"
            />
            <EnhancedMetricCard
              title="Total Revenue"
              value={`$${(dashboardData.metrics.totalRevenue / 1000).toFixed(1)}K`}
              change={12.3}
              changeType="up"
              icon={DollarSign}
              color="bg-primary/10 border border-primary/20 text-primary"
            />
            <EnhancedMetricCard
              title="Team Utilization"
              value={`${dashboardData.metrics.teamUtilization}%`}
              change={-2.1}
              changeType="down"
              icon={Activity}
              color="bg-primary/10 border border-primary/20 text-primary"
            />
          </div>

          {/* Dashboard Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <QuickActionsSection />
            <ClientRankingsSection clients={dashboardData.clientSummary} />
            <RecentActivitySection activities={dashboardData.recentActivity} />
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <BarChart3 className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground mb-4">
                Access comprehensive analytics with cross-client comparisons, performance insights, and detailed reporting
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => window.location.href = '/analytics?tab=service-provider'}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Open Analytics Dashboard
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/analytics?tab=overview'}
                  className="flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  View Overview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <DollarSign className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Revenue Dashboard</h3>
              <p className="text-muted-foreground mb-4">
                Comprehensive revenue tracking and marketplace insights
              </p>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/analytics?tab=revenue&view=service-provider'}
              >
                Open Revenue Dashboard
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CleanServiceProviderDashboard;