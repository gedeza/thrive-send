'use client';

import React, { useState, useEffect } from 'react';
import { Users, BarChart3, DollarSign, TrendingUp, AlertCircle, Plus, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/Alert';
import { ClientSwitcher } from './ClientSwitcher';
import { CrossClientAnalytics } from './CrossClientAnalytics';
import { ServiceProviderHeader } from './ServiceProviderHeader';
import { QuickActions } from './QuickActions';
import { RecentActivity } from './RecentActivity';
import { ClientPerformanceRankings as DashboardClientRankings } from './ClientPerformanceRankings';
import { ClientPerformanceRankings } from '@/components/clients/ClientPerformanceRankings';
import { 
  useServiceProvider, 
  useServiceProviderMetrics, 
  useClientContext,
  type ServiceProviderMetrics,
  type ClientSummary 
} from '@/context/ServiceProviderContext';
import { useRouter } from 'next/navigation';

interface ServiceProviderDashboardProps {
  className?: string;
}

export function ServiceProviderDashboard({ className = '' }: ServiceProviderDashboardProps) {
  const { state, switchClient } = useServiceProvider();
  const { metrics, refreshMetrics, isLoading: metricsLoading } = useServiceProviderMetrics();
  const { currentClient, isClientView } = useClientContext();
  const [refreshing, setRefreshing] = useState(false);
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const router = useRouter();

  // Fetch clients data for integrated components
  useEffect(() => {
    const fetchClients = async () => {
      if (!state.organizationId) return;
      
      try {
        setClientsLoading(true);
        const res = await fetch(`/api/service-provider/clients?organizationId=${state.organizationId}`);
        if (res.ok) {
          const data = await res.json();
          setClients(Array.isArray(data) ? data : data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch clients for dashboard:', error);
      } finally {
        setClientsLoading(false);
      }
    };

    fetchClients();
  }, [state.organizationId]);

  // Auto-refresh metrics every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshMetrics();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshMetrics]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshMetrics();
    setRefreshing(false);
  };

  // Loading state
  if (state.isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className={`p-6 ${className}`}>
        <Alert intent="error">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>
              {state.error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                className="ml-2"
              >
                Retry
              </Button>
            </span>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Service Provider Header */}
      <ServiceProviderHeader
        organizationName={state.organizationName}
        currentUser={state.currentUser}
        selectedClient={currentClient}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Client Switcher */}
        <div className="mb-6">
          <ClientSwitcher
            onCreateClient={() => {
              router.push('/clients/new');
            }}
            onViewAllAnalytics={() => {
              // TODO: Navigate to dedicated analytics page
              console.log('View all analytics');
            }}
            onViewAllClients={() => {
              router.push('/clients');
            }}
          />
        </div>

        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isClientView && currentClient ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => switchClient(null)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    ← Back to Overview
                  </Button>
                  <span className="text-muted-foreground">•</span>
                  <span className="font-semibold">{currentClient.name}</span>
                </>
              ) : (
                <span className="font-semibold">Service Provider Overview</span>
              )}
            </div>
            
            {!isClientView && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/clients')}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Manage All Clients
              </Button>
            )}
          </div>
        </div>

        {/* Dashboard Content */}
        {isClientView && currentClient ? (
          <ClientSpecificDashboard client={currentClient} />
        ) : (
          <ServiceProviderOverview metrics={metrics} clients={clients} clientsLoading={clientsLoading} />
        )}
      </div>
    </div>
  );
}

// Service Provider Overview (All Clients)
function ServiceProviderOverview({ 
  metrics, 
  clients, 
  clientsLoading 
}: { 
  metrics: ServiceProviderMetrics | null;
  clients: any[];
  clientsLoading: boolean;
}) {
  const { switchClient } = useServiceProvider();
  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Clients"
          value={metrics?.totalClients || 0}
          icon={Users}
          description="Active client accounts"
          trend={metrics?.activeClients ? `${metrics.activeClients} active` : undefined}
          color="blue"
        />
        <MetricCard
          title="Active Campaigns"
          value={metrics?.activeCampaigns || 0}
          icon={BarChart3}
          description="Running campaigns"
          trend={metrics?.totalCampaigns ? `of ${metrics.totalCampaigns} total` : undefined}
          color="green"
        />
        <MetricCard
          title="Revenue"
          value={formatCurrency(metrics?.totalRevenue || 0)}
          icon={DollarSign}
          description="Total revenue"
          trend={metrics?.marketplaceRevenue ? `$${metrics.marketplaceRevenue.toLocaleString()} marketplace` : undefined}
          color="purple"
        />
        <MetricCard
          title="Team Utilization"
          value={`${metrics?.teamUtilization || 0}%`}
          icon={TrendingUp}
          description="Team efficiency"
          trend={metrics?.avgClientSatisfaction ? `${metrics.avgClientSatisfaction}/5 satisfaction` : undefined}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cross-Client Analytics */}
        <div className="lg:col-span-2 space-y-6">
          <CrossClientAnalytics />
          
          {/* Quick Actions */}
          <QuickActions />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enhanced Client Performance Rankings */}
          <ClientPerformanceRankings 
            clients={clients}
            onClientSelect={async (clientId) => {
              try {
                // Find the client data
                const selectedClient = clients.find(c => c.id === clientId);
                if (selectedClient) {
                  // Convert to ClientSummary format for ServiceProviderContext
                  const clientSummary: ClientSummary = {
                    id: selectedClient.id,
                    name: selectedClient.name,
                    type: selectedClient.type,
                    status: selectedClient.status === 'active' ? 'ACTIVE' : 'INACTIVE',
                    logoUrl: selectedClient.logoUrl || undefined,
                    performanceScore: selectedClient.performanceScore,
                    activeCampaigns: selectedClient.projects?.length || 0,
                    engagementRate: selectedClient.performanceScore / 20, // Convert score to engagement rate
                    monthlyBudget: selectedClient.monthlyBudget,
                    lastActivity: new Date(selectedClient.lastActivity),
                  };
                  
                  // Switch client context (this will automatically change the dashboard view)
                  await switchClient(clientSummary);
                }
              } catch (error) {
                console.error('Failed to switch client context:', error);
              }
            }}
            isLoading={clientsLoading}
          />
          
          {/* Recent Activity */}
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}

// Client-Specific Dashboard
function ClientSpecificDashboard({ client }: { client: any }) {
  return (
    <div className="space-y-6">
      {/* Client Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {client.logoUrl ? (
                  <img 
                    src={client.logoUrl} 
                    alt={client.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Users className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
                <p className="text-gray-500">{client.type} • {client.status}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Campaigns"
          value={client.activeCampaigns || 0}
          icon={BarChart3}
          description="Running campaigns"
          color="blue"
        />
        <MetricCard
          title="Engagement Rate"
          value={`${client.engagementRate?.toFixed(1) || 0}%`}
          icon={TrendingUp}
          description="Average engagement"
          color="green"
        />
        <MetricCard
          title="Performance Score"
          value={client.performanceScore?.toFixed(1) || 'N/A'}
          icon={Users}
          description="Overall performance"
          color="purple"
        />
        <MetricCard
          title="Monthly Budget"
          value={formatCurrency(client.monthlyBudget || 0)}
          icon={DollarSign}
          description="Allocated budget"
          color="orange"
        />
      </div>

      {/* Client-specific content would go here */}
      <Card>
        <CardHeader>
          <CardTitle>Client Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Client-specific analytics and content management will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = 'blue',
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  trend?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
            {trend && (
              <p className="text-xs text-gray-400 mt-1">{trend}</p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}