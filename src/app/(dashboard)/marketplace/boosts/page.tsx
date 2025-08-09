'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { Plus, TrendingUp, Target, Clock, DollarSign, Eye, MousePointer, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MARKETPLACE_TEXT, MARKETPLACE_COLORS, MARKETPLACE_CONSTANTS } from '@/constants/marketplace-text';
import { formatCurrency, getUserCurrency } from '@/lib/utils/currency';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';

// Types for boost data
interface BoostMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  spent: number;
}

interface BoostListing {
  id: string;
  title: string;
  type: string;
  price: number;
  currency: string;
}

interface BoostData {
  id: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  listing: BoostListing;
  metrics: BoostMetrics;
  metadata: {
    budget: number;
    costPerClick: number;
    estimatedReach: number;
  };
}

// API functions for boost data
const fetchBoostsData = async (organizationId: string): Promise<BoostData[]> => {
  try {
    const response = await fetch(`/api/marketplace/boosts?organizationId=${organizationId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch boosts data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching boosts:', error);
    throw error;
  }
};

const fetchBoostsMetrics = async (organizationId: string) => {
  try {
    const response = await fetch(`/api/marketplace/boosts/metrics?organizationId=${organizationId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch boost metrics');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching boost metrics:', error);
    throw error;
  }
};

const boostTypes = [
  {
    type: 'FEATURED',
    name: MARKETPLACE_CONSTANTS.BOOSTS.FEATURED_NAME,
    description: MARKETPLACE_CONSTANTS.BOOSTS.FEATURED_DESC,
    cost: MARKETPLACE_CONSTANTS.BOOSTS.FEATURED_COST,
    duration: MARKETPLACE_CONSTANTS.BOOSTS.FEATURED_DURATION,
    reach: MARKETPLACE_CONSTANTS.BOOSTS.FEATURED_REACH,
    color: 'bg-semantic-info'
  },
  {
    type: 'PROMOTED',
    name: MARKETPLACE_CONSTANTS.BOOSTS.PROMOTED_NAME,
    description: MARKETPLACE_CONSTANTS.BOOSTS.PROMOTED_DESC,
    cost: MARKETPLACE_CONSTANTS.BOOSTS.PROMOTED_COST,
    duration: MARKETPLACE_CONSTANTS.BOOSTS.PROMOTED_DURATION,
    reach: MARKETPLACE_CONSTANTS.BOOSTS.PROMOTED_REACH,
    color: 'bg-semantic-success'
  },
  {
    type: 'PRIORITY',
    name: MARKETPLACE_CONSTANTS.BOOSTS.PRIORITY_NAME,
    description: MARKETPLACE_CONSTANTS.BOOSTS.PRIORITY_DESC,
    cost: MARKETPLACE_CONSTANTS.BOOSTS.PRIORITY_COST,
    duration: MARKETPLACE_CONSTANTS.BOOSTS.PRIORITY_DURATION,
    reach: MARKETPLACE_CONSTANTS.BOOSTS.PRIORITY_REACH,
    color: 'bg-semantic-accent'
  },
  {
    type: 'SPONSORED',
    name: MARKETPLACE_CONSTANTS.BOOSTS.SPONSORED_NAME,
    description: MARKETPLACE_CONSTANTS.BOOSTS.SPONSORED_DESC,
    cost: MARKETPLACE_CONSTANTS.BOOSTS.SPONSORED_COST,
    duration: MARKETPLACE_CONSTANTS.BOOSTS.SPONSORED_DURATION,
    reach: MARKETPLACE_CONSTANTS.BOOSTS.SPONSORED_REACH,
    color: 'bg-semantic-warning'
  }
];

export default function BoostMarketplacePage() {
  const { userId } = useAuth();
  const { organization } = useOrganization();
  const { state: { organizationId } } = useServiceProvider();
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boosts, setBoosts] = useState<BoostData[]>([]);
  const [metrics, setMetrics] = useState({
    totalImpressions: 0,
    totalClicks: 0,
    totalConversions: 0,
    totalSpent: 0,
    budgetRemaining: 0
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filteredBoosts = boosts.filter(boost => 
    filterStatus === 'all' || boost.status.toLowerCase() === filterStatus.toLowerCase()
  );

  // Load boosts data on component mount
  useEffect(() => {
    const loadBoostsData = async () => {
      if (!organizationId) {
        setError('Organization ID is required. Please ensure you are part of an organization.');
        setLoading(false);
        return;
      }

      if (!userId) {
        setError('User authentication is required. Please sign in.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const [boostsData, metricsData] = await Promise.all([
          fetchBoostsData(organizationId),
          fetchBoostsMetrics(organizationId)
        ]);
        
        setBoosts(boostsData);
        setMetrics(metricsData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load boost data';
        setError(errorMessage);
        toast({
          title: 'Error Loading Boosts',
          description: 'Failed to load boost data. Please try again.',
          variant: 'destructive',
        });
        console.error('Boost data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBoostsData();
  }, [organizationId, userId, toast]);

  // Function to handle pause/resume boost
  const handlePauseBoost = async (boostId: string, currentStatus: string) => {
    if (!organizationId || !userId) {
      toast({
        title: 'Error',
        description: 'Authentication required. Please sign in.',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(boostId);
    try {
      const endpoint = currentStatus === 'ACTIVE' 
        ? `/api/marketplace/boosts/${boostId}/pause`
        : `/api/marketplace/boosts/${boostId}/pause`;
      
      const method = currentStatus === 'ACTIVE' ? 'POST' : 'PUT';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to ${currentStatus === 'ACTIVE' ? 'pause' : 'resume'} boost`);
      }

      const result = await response.json();
      
      // Update local state
      setBoosts(prevBoosts => 
        prevBoosts.map(boost => 
          boost.id === boostId 
            ? { ...boost, status: currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' }
            : boost
        )
      );

      toast({
        title: 'Success',
        description: result.message || `Boost ${currentStatus === 'ACTIVE' ? 'paused' : 'resumed'} successfully`,
      });
    } catch (error) {
      console.error('Pause/resume boost error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update boost status',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-semantic-success';
      case 'completed': return 'bg-semantic-info';
      case 'paused': return 'bg-semantic-warning';
      case 'expired': return 'bg-semantic-muted';
      default: return 'bg-semantic-muted';
    }
  };

  const getBoostTypeColor = (type: string) => {
    const boostType = boostTypes.find(bt => bt.type === type);
    return boostType?.color || 'bg-semantic-muted';
  };

  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    
    if (now <= start) return 0;
    if (now >= end) return 100;
    
    return Math.round(((now - start) / (end - start)) * 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{MARKETPLACE_CONSTANTS.BOOSTS.TITLE}</h1>
            <p className="text-muted-foreground">
              {MARKETPLACE_CONSTANTS.BOOSTS.SUBTITLE}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-semantic-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-8 bg-semantic-muted rounded animate-pulse" />
                  <div className="h-3 bg-semantic-muted rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{MARKETPLACE_CONSTANTS.BOOSTS.TITLE}</h1>
            <p className="text-muted-foreground">
              {MARKETPLACE_CONSTANTS.BOOSTS.SUBTITLE}
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-semantic-error mb-4">
              <TrendingUp className="h-12 w-12 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-medium mb-2">Error Loading Boosts</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8" role="main" aria-label="Boost marketplace page">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{MARKETPLACE_CONSTANTS.BOOSTS.TITLE}</h1>
          <p className="text-muted-foreground">
            {MARKETPLACE_CONSTANTS.BOOSTS.SUBTITLE}
          </p>
        </div>
        <Link href="/marketplace/boosts/create">
          <Button aria-label="Create new boost campaign">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            {MARKETPLACE_CONSTANTS.BOOSTS.CREATE_BOOST}
          </Button>
        </Link>
      </div>

      {/* Boost Performance Summary */}
      <section aria-labelledby="performance-summary" className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <h2 id="performance-summary" className="sr-only">Boost Performance Summary</h2>
        <Card role="img" aria-label="Total impressions metric">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{MARKETPLACE_CONSTANTS.BOOSTS.TOTAL_IMPRESSIONS}</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" aria-label={`${metrics.totalImpressions.toLocaleString()} total impressions`}>{metrics.totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{MARKETPLACE_CONSTANTS.BOOSTS.PERCENTAGE_CHANGE(23)}</p>
          </CardContent>
        </Card>
        
        <Card role="img" aria-label="Total clicks metric">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{MARKETPLACE_CONSTANTS.BOOSTS.TOTAL_CLICKS}</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" aria-label={`${metrics.totalClicks.toLocaleString()} total clicks`}>{metrics.totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{MARKETPLACE_CONSTANTS.BOOSTS.PERCENTAGE_CHANGE(18)}</p>
          </CardContent>
        </Card>
        
        <Card role="img" aria-label="Total conversions metric">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{MARKETPLACE_CONSTANTS.BOOSTS.CONVERSIONS}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" aria-label={`${metrics.totalConversions.toLocaleString()} total conversions`}>{metrics.totalConversions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{MARKETPLACE_CONSTANTS.BOOSTS.PERCENTAGE_CHANGE(32)}</p>
          </CardContent>
        </Card>
        
        <Card role="img" aria-label="Total spent and budget metric">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{MARKETPLACE_CONSTANTS.BOOSTS.TOTAL_SPENT}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" aria-label={`Total spent: ${formatCurrency(metrics.totalSpent, getUserCurrency())}`}>{formatCurrency(metrics.totalSpent, getUserCurrency())}</div>
            <p className="text-xs text-muted-foreground">{MARKETPLACE_CONSTANTS.BOOSTS.BUDGET_REMAINING}: {formatCurrency(metrics.budgetRemaining, getUserCurrency())}</p>
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="my-boosts" className="space-y-6" aria-label="Boost management sections">
        <TabsList role="tablist" aria-label="Boost management navigation">
          <TabsTrigger value="my-boosts" role="tab" aria-controls="my-boosts-panel">{MARKETPLACE_CONSTANTS.BOOSTS.MY_BOOSTS}</TabsTrigger>
          <TabsTrigger value="boost-types" role="tab" aria-controls="boost-types-panel">{MARKETPLACE_CONSTANTS.BOOSTS.BOOST_TYPES}</TabsTrigger>
          <TabsTrigger value="analytics" role="tab" aria-controls="analytics-panel">{MARKETPLACE_CONSTANTS.BOOSTS.ANALYTICS}</TabsTrigger>
        </TabsList>

        <TabsContent value="my-boosts" className="space-y-6" role="tabpanel" id="my-boosts-panel" aria-labelledby="my-boosts-tab">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4" role="search" aria-label="Filter boosts by status">
            <Select value={filterStatus} onValueChange={setFilterStatus} aria-label="Filter boosts by status">
              <SelectTrigger className="w-full md:w-48" aria-describedby="status-filter-help">
                <SelectValue placeholder={MARKETPLACE_CONSTANTS.BOOSTS.FILTER_BY_STATUS} />
              </SelectTrigger>
              <div id="status-filter-help" className="sr-only">Use this dropdown to filter your boosts by their current status</div>
              <SelectContent>
                <SelectItem value="all">{MARKETPLACE_CONSTANTS.BOOSTS.ALL_STATUS}</SelectItem>
                <SelectItem value="active">{MARKETPLACE_CONSTANTS.BOOSTS.ACTIVE_STATUS}</SelectItem>
                <SelectItem value="completed">{MARKETPLACE_CONSTANTS.BOOSTS.COMPLETED_STATUS}</SelectItem>
                <SelectItem value="paused">{MARKETPLACE_CONSTANTS.BOOSTS.PAUSED_STATUS}</SelectItem>
                <SelectItem value="expired">{MARKETPLACE_CONSTANTS.BOOSTS.EXPIRED_STATUS}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Boost Cards */}
          <div className="space-y-6" role="list" aria-label="Your boost campaigns">
            {filteredBoosts.length > 0 ? (
              filteredBoosts.map((boost) => {
                const progress = calculateProgress(boost.startDate, boost.endDate);
                const ctr = boost.metrics.impressions > 0 
                  ? ((boost.metrics.clicks / boost.metrics.impressions) * 100).toFixed(2)
                  : '0.00';
                const conversionRate = boost.metrics.clicks > 0
                  ? ((boost.metrics.conversions / boost.metrics.clicks) * 100).toFixed(2)
                  : '0.00';

                return (
                  <Card key={boost.id} role="listitem" aria-labelledby={`boost-title-${boost.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2" role="group" aria-label="Boost type and status indicators">
                            <div className={`w-3 h-3 rounded-full ${getBoostTypeColor(boost.type)}`} aria-label={`${boost.type} boost type indicator`}></div>
                            <Badge variant="outline" aria-label={`Boost type: ${boost.type}`}>{boost.type}</Badge>
                            <Badge className={getStatusColor(boost.status)} aria-label={`Status: ${boost.status}`}>
                              {boost.status}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg" id={`boost-title-${boost.id}`}>{boost.listing.title}</CardTitle>
                          <p className="text-sm text-muted-foreground" aria-label={`Campaign duration: ${formatDate(boost.startDate)} to ${formatDate(boost.endDate)}`}>
                            {formatDate(boost.startDate)} - {formatDate(boost.endDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold" aria-label={`Listing price: ${formatCurrency(boost.listing.price, boost.listing.currency || getUserCurrency())}`}>
                            {formatCurrency(boost.listing.price, boost.listing.currency || getUserCurrency())}
                          </div>
                          <p className="text-sm text-muted-foreground" aria-label={`Content type: ${boost.listing.type}`}>{boost.listing.type}</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Progress Bar */}
                      {boost.status === 'ACTIVE' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{MARKETPLACE_CONSTANTS.BOOSTS.CAMPAIGN_PROGRESS}</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4" role="group" aria-labelledby={`boost-metrics-${boost.id}`}>
                        <h3 id={`boost-metrics-${boost.id}`} className="sr-only">Performance Metrics for {boost.listing.title}</h3>
                        <div className="text-center" role="img" aria-label={`${boost.metrics.impressions.toLocaleString()} impressions`}>
                          <div className="text-2xl font-bold text-semantic-info">
                            {boost.metrics.impressions.toLocaleString()}
                          </div>
                          <p className="text-xs text-muted-foreground">{MARKETPLACE_CONSTANTS.BOOSTS.IMPRESSIONS_LABEL}</p>
                        </div>
                        
                        <div className="text-center" role="img" aria-label={`${boost.metrics.clicks} clicks`}>
                          <div className="text-2xl font-bold text-semantic-success">
                            {boost.metrics.clicks}
                          </div>
                          <p className="text-xs text-muted-foreground">{MARKETPLACE_CONSTANTS.BOOSTS.CLICKS_LABEL}</p>
                        </div>
                        
                        <div className="text-center" role="img" aria-label={`${boost.metrics.conversions} conversions`}>
                          <div className="text-2xl font-bold text-semantic-accent">
                            {boost.metrics.conversions}
                          </div>
                          <p className="text-xs text-muted-foreground">{MARKETPLACE_CONSTANTS.BOOSTS.CONVERSIONS_LABEL}</p>
                        </div>
                        
                        <div className="text-center" role="img" aria-label={`${ctr}% click-through rate`}>
                          <div className="text-2xl font-bold text-semantic-warning">
                            {ctr}%
                          </div>
                          <p className="text-xs text-muted-foreground">{MARKETPLACE_CONSTANTS.BOOSTS.CTR_LABEL}</p>
                        </div>
                        
                        <div className="text-center" role="img" aria-label={`${conversionRate}% conversion rate`}>
                          <div className="text-2xl font-bold text-semantic-error">
                            {conversionRate}%
                          </div>
                          <p className="text-xs text-muted-foreground">{MARKETPLACE_CONSTANTS.BOOSTS.CONV_RATE_LABEL}</p>
                        </div>
                      </div>

                      {/* Budget Info */}
                      <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{MARKETPLACE_CONSTANTS.BOOSTS.BUDGET_SPENT}</p>
                          <p className="text-xs text-muted-foreground" aria-label={`Budget: ${formatCurrency(boost.metrics.spent, boost.listing.currency || getUserCurrency())} spent of ${formatCurrency(boost.metadata.budget, boost.listing.currency || getUserCurrency())} total budget`}>
                            {formatCurrency(boost.metrics.spent, boost.listing.currency || getUserCurrency())} of {formatCurrency(boost.metadata.budget, boost.listing.currency || getUserCurrency())}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{MARKETPLACE_CONSTANTS.BOOSTS.AVG_CPC}</p>
                          <p className="text-xs text-muted-foreground" aria-label={`Average cost per click: ${formatCurrency(boost.metadata.costPerClick, boost.listing.currency || getUserCurrency())}`}>
                            {formatCurrency(boost.metadata.costPerClick, boost.listing.currency || getUserCurrency())}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-2" role="group" aria-label={`Actions for ${boost.listing.title}`}>
                        {(boost.status === 'ACTIVE' || boost.status === 'PAUSED') && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handlePauseBoost(boost.id, boost.status)}
                            disabled={actionLoading === boost.id}
                            aria-label={`${boost.status === 'ACTIVE' ? 'Pause' : 'Resume'} boost campaign for ${boost.listing.title}`}
                          >
                            {actionLoading === boost.id ? (
                              <div className="h-3 w-3 mr-2 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            ) : null}
                            {boost.status === 'ACTIVE' 
                              ? MARKETPLACE_CONSTANTS.BOOSTS.PAUSE_BOOST
                              : MARKETPLACE_CONSTANTS.BOOSTS.RESUME_BOOST
                            }
                          </Button>
                        )}
                        <Link href={`/marketplace/${boost.listing.id}`}>
                          <Button variant="outline" size="sm" aria-label={`View marketplace listing for ${boost.listing.title}`}>
                            {MARKETPLACE_CONSTANTS.BOOSTS.VIEW_LISTING}
                          </Button>
                        </Link>
                        <Button size="sm" aria-label={`View detailed analytics for ${boost.listing.title} boost campaign`}>
                          {MARKETPLACE_CONSTANTS.BOOSTS.VIEW_DETAILS}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">{MARKETPLACE_CONSTANTS.BOOSTS.NO_BOOSTS_FOUND}</h3>
                  <p className="text-muted-foreground mb-4">
                    {filterStatus === 'all' 
                      ? MARKETPLACE_CONSTANTS.BOOSTS.NO_BOOSTS_YET
                      : MARKETPLACE_CONSTANTS.BOOSTS.NO_BOOSTS_STATUS(filterStatus)
                    }
                  </p>
                  <Link href="/marketplace/boosts/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {MARKETPLACE_CONSTANTS.BOOSTS.CREATE_FIRST_BOOST}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="boost-types" className="space-y-6" role="tabpanel" id="boost-types-panel" aria-labelledby="boost-types-tab">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" role="list" aria-label="Available boost types">
            {boostTypes.map((boostType) => (
              <Card key={boostType.type} className="group hover:shadow-lg transition-shadow" role="listitem" aria-labelledby={`boost-type-${boostType.type}-title`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${boostType.color}`} aria-label={`${boostType.name} boost type indicator`}></div>
                    <CardTitle id={`boost-type-${boostType.type}-title`}>{boostType.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground" aria-describedby={`boost-type-${boostType.type}-title`}>{boostType.description}</p>
                  
                  <div className="space-y-2" role="list" aria-label={`${boostType.name} boost specifications`}>
                    <div className="flex justify-between" role="listitem">
                      <span className="text-sm font-medium">{MARKETPLACE_CONSTANTS.BOOSTS.COST_LABEL}</span>
                      <span className="text-sm" aria-label={`Cost: ${boostType.cost}`}>{boostType.cost}</span>
                    </div>
                    <div className="flex justify-between" role="listitem">
                      <span className="text-sm font-medium">{MARKETPLACE_CONSTANTS.BOOSTS.DURATION_LABEL}</span>
                      <span className="text-sm" aria-label={`Duration: ${boostType.duration}`}>{boostType.duration}</span>
                    </div>
                    <div className="flex justify-between" role="listitem">
                      <span className="text-sm font-medium">{MARKETPLACE_CONSTANTS.BOOSTS.REACH_LABEL}</span>
                      <span className="text-sm" aria-label={`Reach: ${boostType.reach}`}>{boostType.reach}</span>
                    </div>
                  </div>
                  
                  <Link href={`/marketplace/boosts/create?type=${boostType.type}`}>
                    <Button className="w-full" aria-label={`Create new ${boostType.name} boost campaign`}>
                      {MARKETPLACE_CONSTANTS.BOOSTS.CREATE_BOOST_TYPE(boostType.name)}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" role="tabpanel" id="analytics-panel" aria-labelledby="analytics-tab">
          <Card role="region" aria-labelledby="analytics-title">
            <CardHeader>
              <CardTitle id="analytics-title">{MARKETPLACE_CONSTANTS.BOOSTS.BOOST_ANALYTICS}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8" role="status" aria-live="polite">
                <p className="text-muted-foreground">{MARKETPLACE_CONSTANTS.BOOSTS.ANALYTICS_COMING_SOON}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}