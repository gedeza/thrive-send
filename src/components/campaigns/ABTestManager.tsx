'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { 
  Plus, 
  BarChart3, 
  Target, 
  Users, 
  TrendingUp, 
  Play, 
  Pause, 
  Trophy,
  AlertTriangle,
  Calendar,
  Percent
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';

interface ABTestVariant {
  id: string;
  name: string;
  description?: string;
  content: {
    subject?: string;
    title?: string;
    body?: string;
    cta?: string;
    images?: string[];
  };
  trafficAllocation: number;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr: number;
    conversionRate: number;
    cpc: number;
  };
  isControl: boolean;
}

interface ABTest {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate?: string;
  campaignId: string;
  variants: ABTestVariant[];
  results?: {
    winner?: string;
    confidence: number;
    significance: number;
    summary: string;
  };
  configuration: {
    testDuration: number; // days
    minimumSampleSize: number;
    confidenceLevel: number;
    primaryMetric: 'clicks' | 'conversions' | 'revenue' | 'ctr';
    autoSelectWinner: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface ABTestManagerProps {
  campaignId: string;
  campaignName: string;
  onTestCreated?: (test: ABTest) => void;
}

export function ABTestManager({ campaignId, campaignName, onTestCreated }: ABTestManagerProps) {
  const { userId } = useAuth();
  const [tests, setTests] = useState<ABTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchABTests();
  }, [campaignId]);

  const fetchABTests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/campaigns/${campaignId}/ab-tests`);
      if (response.ok) {
        const data = await response.json();
        setTests(data.tests || []);
      }
    } catch (_error) {
      // Error fetching A/B tests - handle silently
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      DRAFT: { color: 'bg-gray-500', variant: 'secondary', label: 'Draft' },
      RUNNING: { color: 'bg-green-500', variant: 'default', label: 'Running' },
      PAUSED: { color: 'bg-yellow-500', variant: 'warning', label: 'Paused' },
      COMPLETED: { color: 'bg-blue-500', variant: 'success', label: 'Completed' },
      CANCELLED: { color: 'bg-red-500', variant: 'destructive', label: 'Cancelled' }
    };
    return configs[status as keyof typeof configs] || configs.DRAFT;
  };

  const calculateTotalMetrics = (variants: ABTestVariant[]) => {
    return variants.reduce((total, variant) => ({
      impressions: total.impressions + variant.metrics.impressions,
      clicks: total.clicks + variant.metrics.clicks,
      conversions: total.conversions + variant.metrics.conversions,
      revenue: total.revenue + variant.metrics.revenue
    }), { impressions: 0, clicks: 0, conversions: 0, revenue: 0 });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleStartTest = async (testId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/ab-tests/${testId}/start`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'A/B test started successfully'
        });
        fetchABTests();
      } else {
        throw new Error('Failed to start test');
      }
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to start A/B test',
        variant: 'destructive'
      });
    }
  };

  const handlePauseTest = async (testId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/ab-tests/${testId}/pause`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'A/B test paused successfully'
        });
        fetchABTests();
      } else {
        throw new Error('Failed to pause test');
      }
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to pause A/B test',
        variant: 'destructive'
      });
    }
  };

  const runningTests = tests.filter(test => test.status === 'RUNNING');
  const completedTests = tests.filter(test => test.status === 'COMPLETED');
  const draftTests = tests.filter(test => test.status === 'DRAFT');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">A/B Testing</h2>
          <p className="text-muted-foreground">
            Test variations to optimize {campaignName} performance
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create A/B Test
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
            <Play className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runningTests.length}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tests</CardTitle>
            <Trophy className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTests.length}</div>
            <p className="text-xs text-muted-foreground">With results</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Lift</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+24.5%</div>
            <p className="text-xs text-muted-foreground">Over control</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tested</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.2K</div>
            <p className="text-xs text-muted-foreground">Users tested</p>
          </CardContent>
        </Card>
      </div>

      {/* Tests Tabs */}
      <Tabs defaultValue="running" className="space-y-6">
        <TabsList>
          <TabsTrigger value="running">Running ({runningTests.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTests.length})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({draftTests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="running" className="space-y-4">
          {runningTests.length > 0 ? (
            runningTests.map((test) => (
              <ABTestCard 
                key={test.id} 
                test={test} 
                onPause={() => handlePauseTest(test.id)}
              />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No running tests</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedTests.length > 0 ? (
            completedTests.map((test) => (
              <ABTestCard key={test.id} test={test} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No completed tests</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="draft" className="space-y-4">
          {draftTests.length > 0 ? (
            draftTests.map((test) => (
              <ABTestCard 
                key={test.id} 
                test={test} 
                onStart={() => handleStartTest(test.id)}
              />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-4">No draft tests</p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Test
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ABTestCard({ 
  test, 
  onStart, 
  onPause 
}: { 
  test: ABTest; 
  onStart?: () => void; 
  onPause?: () => void;
}) {
  const statusConfig = getStatusConfig(test.status);
  const totalMetrics = calculateTotalMetrics(test.variants);
  const controlVariant = test.variants.find(v => v.isControl);
  const testVariants = test.variants.filter(v => !v.isControl);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{test.name}</h3>
              <Badge variant={statusConfig.variant as any}>
                {statusConfig.label}
              </Badge>
            </div>
            {test.description && (
              <p className="text-sm text-muted-foreground">{test.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Started {formatDate(test.startDate)}</span>
              </div>
              {test.endDate && (
                <div className="flex items-center gap-1">
                  <span>Ends {formatDate(test.endDate)}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>Primary: {test.configuration.primaryMetric}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {test.status === 'DRAFT' && onStart && (
              <Button size="sm" onClick={onStart}>
                <Play className="h-4 w-4 mr-1" />
                Start
              </Button>
            )}
            {test.status === 'RUNNING' && onPause && (
              <Button variant="outline" size="sm" onClick={onPause}>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </Button>
            )}
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Performance */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {totalMetrics.impressions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Impressions</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {totalMetrics.clicks.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Clicks</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totalMetrics.conversions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Conversions</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              ${totalMetrics.revenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </div>
        </div>

        {/* Variants Performance */}
        <div className="space-y-4">
          <h4 className="font-medium">Variant Performance</h4>
          
          {/* Control Variant */}
          {controlVariant && (
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h5 className="font-medium">{controlVariant.name}</h5>
                  <Badge variant="outline">Control</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {controlVariant.trafficAllocation}% traffic
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium">{controlVariant.metrics.ctr.toFixed(2)}%</div>
                  <div className="text-muted-foreground">CTR</div>
                </div>
                <div>
                  <div className="font-medium">{controlVariant.metrics.conversionRate.toFixed(2)}%</div>
                  <div className="text-muted-foreground">Conv. Rate</div>
                </div>
                <div>
                  <div className="font-medium">${controlVariant.metrics.cpc.toFixed(2)}</div>
                  <div className="text-muted-foreground">CPC</div>
                </div>
                <div>
                  <div className="font-medium">${controlVariant.metrics.revenue.toLocaleString()}</div>
                  <div className="text-muted-foreground">Revenue</div>
                </div>
              </div>
            </div>
          )}

          {/* Test Variants */}
          {testVariants.map((variant) => {
            const lift = controlVariant ? 
              ((variant.metrics.conversionRate - controlVariant.metrics.conversionRate) / controlVariant.metrics.conversionRate * 100).toFixed(1) 
              : '0.0';
            const isWinning = parseFloat(lift) > 0;

            return (
              <div key={variant.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium">{variant.name}</h5>
                    {isWinning && (
                      <Badge variant="default" className="bg-green-500">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{lift}%
                      </Badge>
                    )}
                    {!isWinning && parseFloat(lift) < 0 && (
                      <Badge variant="destructive">
                        {lift}%
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {variant.trafficAllocation}% traffic
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="font-medium">{variant.metrics.ctr.toFixed(2)}%</div>
                    <div className="text-muted-foreground">CTR</div>
                  </div>
                  <div>
                    <div className="font-medium">{variant.metrics.conversionRate.toFixed(2)}%</div>
                    <div className="text-muted-foreground">Conv. Rate</div>
                  </div>
                  <div>
                    <div className="font-medium">${variant.metrics.cpc.toFixed(2)}</div>
                    <div className="text-muted-foreground">CPC</div>
                  </div>
                  <div>
                    <div className="font-medium">${variant.metrics.revenue.toLocaleString()}</div>
                    <div className="text-muted-foreground">Revenue</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Test Results */}
        {test.results && (
          <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-green-900 dark:text-green-100">Test Results</h4>
            </div>
            <p className="text-sm text-green-800 dark:text-green-200 mb-2">
              {test.results.summary}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="font-medium">Confidence:</span> {test.results.confidence}%
              </div>
              <div>
                <span className="font-medium">Significance:</span> {test.results.significance}%
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getStatusConfig(status: string) {
  const configs = {
    DRAFT: { color: 'bg-gray-500', variant: 'secondary', label: 'Draft' },
    RUNNING: { color: 'bg-green-500', variant: 'default', label: 'Running' },
    PAUSED: { color: 'bg-yellow-500', variant: 'warning', label: 'Paused' },
    COMPLETED: { color: 'bg-blue-500', variant: 'success', label: 'Completed' },
    CANCELLED: { color: 'bg-red-500', variant: 'destructive', label: 'Cancelled' }
  };
  return configs[status as keyof typeof configs] || configs.DRAFT;
}

function calculateTotalMetrics(variants: ABTestVariant[]) {
  return variants.reduce((total, variant) => ({
    impressions: total.impressions + variant.metrics.impressions,
    clicks: total.clicks + variant.metrics.clicks,
    conversions: total.conversions + variant.metrics.conversions,
    revenue: total.revenue + variant.metrics.revenue
  }), { impressions: 0, clicks: 0, conversions: 0, revenue: 0 });
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}