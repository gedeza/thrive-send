'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  Pause,
  Square,
  Settings,
  Eye,
  MousePointer,
  DollarSign,
  Calendar,
  Download,
  Share,
  Plus,
  Filter,
  MoreHorizontal,
  Crown,
  Trophy,
  Percent,
  Activity,
  LineChart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays, differenceInDays } from 'date-fns';

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  trafficAllocation: number;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    clickThroughRate: number;
    conversionRate: number;
    revenuePerVisitor: number;
    bounceRate: number;
    avgSessionDuration: number;
  };
  significance: {
    isSignificant: boolean;
    confidenceLevel: number;
    pValue: number;
  };
  timeline: Array<{
    date: string;
    impressions: number;
    conversions: number;
    revenue: number;
  }>;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived';
  startDate: Date;
  endDate: Date | null;
  duration: number; // days
  variants: ABTestVariant[];
  hypothesis: string;
  successMetric: string;
  minimumDetectableEffect: number;
  statisticalPower: number;
  sampleSize: number;
  currentSampleSize: number;
  winner: string | null;
  tags: string[];
  createdBy: string;
  lastModified: Date;
}

interface ABTestingDashboardProps {
  className?: string;
}

// Mock data generator for A/B tests
const generateMockABTests = (): ABTest[] => {
  const tests: ABTest[] = [
    {
      id: 'test-1',
      name: 'Email Subject Line Optimization',
      description: 'Testing different subject line approaches for our newsletter campaign',
      status: 'running',
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endDate: addDays(new Date(), 9),
      duration: 14,
      hypothesis: 'Personalized subject lines will increase open rates by at least 15%',
      successMetric: 'Open Rate',
      minimumDetectableEffect: 15,
      statisticalPower: 80,
      sampleSize: 10000,
      currentSampleSize: 3500,
      winner: null,
      tags: ['Email', 'Subject Lines', 'Personalization'],
      createdBy: 'Marketing Team',
      lastModified: new Date(),
      variants: [
        {
          id: 'var-1a',
          name: 'Control (Original)',
          description: 'Standard newsletter subject line format',
          trafficAllocation: 50,
          metrics: {
            impressions: 1750,
            clicks: 280,
            conversions: 42,
            revenue: 3150,
            clickThroughRate: 16.0,
            conversionRate: 2.4,
            revenuePerVisitor: 1.8,
            bounceRate: 35.2,
            avgSessionDuration: 125
          },
          significance: {
            isSignificant: false,
            confidenceLevel: 87,
            pValue: 0.13
          },
          timeline: Array.from({ length: 5 }, (_, i) => ({
            date: format(addDays(new Date(), -4 + i), 'yyyy-MM-dd'),
            impressions: Math.floor(Math.random() * 400) + 300,
            conversions: Math.floor(Math.random() * 12) + 6,
            revenue: Math.floor(Math.random() * 800) + 500
          }))
        },
        {
          id: 'var-1b',
          name: 'Personalized',
          description: 'Subject line with recipient name and personalized content',
          trafficAllocation: 50,
          metrics: {
            impressions: 1750,
            clicks: 340,
            conversions: 58,
            revenue: 4350,
            clickThroughRate: 19.4,
            conversionRate: 3.3,
            revenuePerVisitor: 2.49,
            bounceRate: 28.7,
            avgSessionDuration: 142
          },
          significance: {
            isSignificant: true,
            confidenceLevel: 95,
            pValue: 0.02
          },
          timeline: Array.from({ length: 5 }, (_, i) => ({
            date: format(addDays(new Date(), -4 + i), 'yyyy-MM-dd'),
            impressions: Math.floor(Math.random() * 400) + 300,
            conversions: Math.floor(Math.random() * 15) + 8,
            revenue: Math.floor(Math.random() * 1000) + 700
          }))
        }
      ]
    },
    {
      id: 'test-2',
      name: 'Landing Page CTA Button Color',
      description: 'Testing button color impact on conversion rates',
      status: 'completed',
      startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      duration: 14,
      hypothesis: 'Orange CTA button will outperform blue by 10% in conversions',
      successMetric: 'Conversion Rate',
      minimumDetectableEffect: 10,
      statisticalPower: 80,
      sampleSize: 5000,
      currentSampleSize: 5000,
      winner: 'var-2b',
      tags: ['Landing Page', 'CTA', 'Conversion'],
      createdBy: 'UX Team',
      lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      variants: [
        {
          id: 'var-2a',
          name: 'Blue Button',
          description: 'Traditional blue CTA button',
          trafficAllocation: 50,
          metrics: {
            impressions: 2500,
            clicks: 375,
            conversions: 75,
            revenue: 9375,
            clickThroughRate: 15.0,
            conversionRate: 3.0,
            revenuePerVisitor: 3.75,
            bounceRate: 42.1,
            avgSessionDuration: 98
          },
          significance: {
            isSignificant: false,
            confidenceLevel: 68,
            pValue: 0.32
          },
          timeline: []
        },
        {
          id: 'var-2b',
          name: 'Orange Button',
          description: 'High-contrast orange CTA button',
          trafficAllocation: 50,
          metrics: {
            impressions: 2500,
            clicks: 425,
            conversions: 102,
            revenue: 12750,
            clickThroughRate: 17.0,
            conversionRate: 4.08,
            revenuePerVisitor: 5.1,
            bounceRate: 38.9,
            avgSessionDuration: 112
          },
          significance: {
            isSignificant: true,
            confidenceLevel: 99,
            pValue: 0.003
          },
          timeline: []
        }
      ]
    },
    {
      id: 'test-3',
      name: 'Social Media Ad Creative',
      description: 'Testing video vs image ads for product promotion',
      status: 'draft',
      startDate: addDays(new Date(), 2),
      endDate: addDays(new Date(), 16),
      duration: 14,
      hypothesis: 'Video ads will generate 25% more engagement than static images',
      successMetric: 'Engagement Rate',
      minimumDetectableEffect: 25,
      statisticalPower: 85,
      sampleSize: 15000,
      currentSampleSize: 0,
      winner: null,
      tags: ['Social Media', 'Video', 'Creative'],
      createdBy: 'Creative Team',
      lastModified: new Date(),
      variants: [
        {
          id: 'var-3a',
          name: 'Static Image',
          description: 'High-quality product image with text overlay',
          trafficAllocation: 50,
          metrics: {
            impressions: 0,
            clicks: 0,
            conversions: 0,
            revenue: 0,
            clickThroughRate: 0,
            conversionRate: 0,
            revenuePerVisitor: 0,
            bounceRate: 0,
            avgSessionDuration: 0
          },
          significance: {
            isSignificant: false,
            confidenceLevel: 0,
            pValue: 1
          },
          timeline: []
        },
        {
          id: 'var-3b',
          name: 'Video Ad',
          description: '15-second product demo video',
          trafficAllocation: 50,
          metrics: {
            impressions: 0,
            clicks: 0,
            conversions: 0,
            revenue: 0,
            clickThroughRate: 0,
            conversionRate: 0,
            revenuePerVisitor: 0,
            bounceRate: 0,
            avgSessionDuration: 0
          },
          significance: {
            isSignificant: false,
            confidenceLevel: 0,
            pValue: 1
          },
          timeline: []
        }
      ]
    }
  ];

  return tests;
};

export function ABTestingDashboard({ className }: ABTestingDashboardProps) {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'results' | 'timeline' | 'settings'>('overview');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    setTests(generateMockABTests());
  }, []);

  useEffect(() => {
    if (tests.length > 0 && !selectedTest) {
      setSelectedTest(tests[0].id);
    }
  }, [tests, selectedTest]);

  const currentTest = tests.find(test => test.id === selectedTest);

  const filteredTests = useMemo(() => {
    if (statusFilter === 'all') return tests;
    return tests.filter(test => test.status === statusFilter);
  }, [tests, statusFilter]);

  const getStatusBadge = (status: ABTest['status']) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-700', icon: Clock },
      running: { color: 'bg-green-100 text-green-700', icon: Play },
      paused: { color: 'bg-yellow-100 text-yellow-700', icon: Pause },
      completed: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      archived: { color: 'bg-gray-100 text-gray-500', icon: Square }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={cn('flex items-center gap-1 text-xs', config.color)}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const calculateTestProgress = (test: ABTest) => {
    if (test.status === 'draft') return 0;
    if (test.status === 'completed') return 100;
    
    const totalDuration = test.duration;
    const daysPassed = differenceInDays(new Date(), test.startDate);
    return Math.min((daysPassed / totalDuration) * 100, 100);
  };

  const getWinningVariant = (test: ABTest) => {
    if (!test.winner) return null;
    return test.variants.find(v => v.id === test.winner);
  };

  const calculateLift = (control: ABTestVariant, variant: ABTestVariant, metric: keyof ABTestVariant['metrics']) => {
    const controlValue = control.metrics[metric];
    const variantValue = variant.metrics[metric];
    
    if (controlValue === 0) return 0;
    return ((variantValue - controlValue) / controlValue) * 100;
  };

  const renderTestOverview = () => {
    if (!currentTest) return null;

    const progress = calculateTestProgress(currentTest);
    const winningVariant = getWinningVariant(currentTest);

    return (
      <div className="space-y-6">
        {/* Test Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{currentTest.name}</h2>
              {getStatusBadge(currentTest.status)}
              {winningVariant && (
                <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Winner: {winningVariant.name}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{currentTest.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Created by {currentTest.createdBy}</span>
              <span>•</span>
              <span>{format(currentTest.startDate, 'MMM d, yyyy')}</span>
              {currentTest.endDate && (
                <>
                  <span>•</span>
                  <span>Ends {format(currentTest.endDate, 'MMM d, yyyy')}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Configure
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            {currentTest.status === 'running' && (
              <Button variant="outline" size="sm">
                <Pause className="mr-2 h-4 w-4" />
                Pause Test
              </Button>
            )}
          </div>
        </div>

        {/* Test Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Test Progress</h3>
                <span className="text-sm text-muted-foreground">
                  {currentTest.currentSampleSize.toLocaleString()} / {currentTest.sampleSize.toLocaleString()} participants
                </span>
              </div>
              <Progress value={(currentTest.currentSampleSize / currentTest.sampleSize) * 100} className="h-3" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <p className="font-medium">{currentTest.duration} days</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Time Progress:</span>
                  <p className="font-medium">{Math.round(progress)}%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Success Metric:</span>
                  <p className="font-medium">{currentTest.successMetric}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Min. Effect:</span>
                  <p className="font-medium">{currentTest.minimumDetectableEffect}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hypothesis */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Hypothesis</h3>
            <p className="text-muted-foreground">{currentTest.hypothesis}</p>
          </CardContent>
        </Card>

        {/* Variants Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          {currentTest.variants.map((variant, index) => {
            const isWinner = currentTest.winner === variant.id;
            const isControl = index === 0;
            
            return (
              <Card key={variant.id} className={cn(
                "relative",
                isWinner && "border-yellow-500 shadow-md",
                isControl && "border-blue-500"
              )}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{variant.name}</h4>
                        {isControl && (
                          <Badge variant="outline" className="text-xs">Control</Badge>
                        )}
                        {isWinner && (
                          <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                            <Trophy className="mr-1 h-3 w-3" />
                            Winner
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{variant.description}</p>
                    </div>
                    <Badge variant="outline">
                      {variant.trafficAllocation}% traffic
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Impressions:</span>
                      <p className="font-medium">{variant.metrics.impressions.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Conversions:</span>
                      <p className="font-medium">{variant.metrics.conversions.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CTR:</span>
                      <p className="font-medium">{variant.metrics.clickThroughRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Conv. Rate:</span>
                      <p className="font-medium">{variant.metrics.conversionRate.toFixed(1)}%</p>
                    </div>
                  </div>

                  {variant.significance.isSignificant && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">Statistically Significant</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        {variant.significance.confidenceLevel}% confidence level
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTestResults = () => {
    if (!currentTest || currentTest.variants.length < 2) return null;

    const [control, ...variants] = currentTest.variants;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Test Results</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <LineChart className="mr-2 h-4 w-4" />
              View Charts
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Results
            </Button>
          </div>
        </div>

        {/* Results Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-sm text-muted-foreground">
                    <th className="text-left p-4">Variant</th>
                    <th className="text-right p-4">Impressions</th>
                    <th className="text-right p-4">Clicks</th>
                    <th className="text-right p-4">CTR</th>
                    <th className="text-right p-4">Conversions</th>
                    <th className="text-right p-4">Conv. Rate</th>
                    <th className="text-right p-4">Revenue</th>
                    <th className="text-right p-4">RPV</th>
                    <th className="text-right p-4">Significance</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTest.variants.map((variant, index) => {
                    const isControl = index === 0;
                    const isWinner = currentTest.winner === variant.id;
                    
                    return (
                      <tr key={variant.id} className={cn(
                        "border-b",
                        isWinner && "bg-yellow-50",
                        isControl && "bg-blue-50"
                      )}>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{variant.name}</span>
                            {isControl && (
                              <Badge variant="outline" className="text-xs">Control</Badge>
                            )}
                            {isWinner && (
                              <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                                <Trophy className="mr-1 h-3 w-3" />
                                Winner
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="text-right p-4 font-medium">
                          {variant.metrics.impressions.toLocaleString()}
                        </td>
                        <td className="text-right p-4 font-medium">
                          {variant.metrics.clicks.toLocaleString()}
                        </td>
                        <td className="text-right p-4">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-medium">{variant.metrics.clickThroughRate.toFixed(1)}%</span>
                            {!isControl && (
                              <span className={cn(
                                "text-xs",
                                calculateLift(control, variant, 'clickThroughRate') > 0 ? 'text-green-600' : 'text-red-600'
                              )}>
                                ({calculateLift(control, variant, 'clickThroughRate') > 0 ? '+' : ''}
                                {calculateLift(control, variant, 'clickThroughRate').toFixed(1)}%)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-right p-4 font-medium">
                          {variant.metrics.conversions.toLocaleString()}
                        </td>
                        <td className="text-right p-4">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-medium">{variant.metrics.conversionRate.toFixed(1)}%</span>
                            {!isControl && (
                              <span className={cn(
                                "text-xs",
                                calculateLift(control, variant, 'conversionRate') > 0 ? 'text-green-600' : 'text-red-600'
                              )}>
                                ({calculateLift(control, variant, 'conversionRate') > 0 ? '+' : ''}
                                {calculateLift(control, variant, 'conversionRate').toFixed(1)}%)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-right p-4 font-medium">
                          ${variant.metrics.revenue.toLocaleString()}
                        </td>
                        <td className="text-right p-4">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-medium">${variant.metrics.revenuePerVisitor.toFixed(2)}</span>
                            {!isControl && (
                              <span className={cn(
                                "text-xs",
                                calculateLift(control, variant, 'revenuePerVisitor') > 0 ? 'text-green-600' : 'text-red-600'
                              )}>
                                ({calculateLift(control, variant, 'revenuePerVisitor') > 0 ? '+' : ''}
                                {calculateLift(control, variant, 'revenuePerVisitor').toFixed(1)}%)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-right p-4">
                          {variant.significance.isSignificant ? (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              {variant.significance.confidenceLevel}%
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              <Clock className="mr-1 h-3 w-3" />
                              {variant.significance.confidenceLevel}%
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Statistical Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="font-semibold">Test Power</h4>
              </div>
              <p className="text-2xl font-bold">{currentTest.statisticalPower}%</p>
              <p className="text-sm text-muted-foreground">Statistical power achieved</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Percent className="h-5 w-5 text-green-600" />
                </div>
                <h4 className="font-semibold">Sample Size</h4>
              </div>
              <p className="text-2xl font-bold">
                {Math.round((currentTest.currentSampleSize / currentTest.sampleSize) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">
                {currentTest.currentSampleSize.toLocaleString()} of {currentTest.sampleSize.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <h4 className="font-semibold">Confidence</h4>
              </div>
              <p className="text-2xl font-bold">
                {Math.max(...currentTest.variants.map(v => v.significance.confidenceLevel))}%
              </p>
              <p className="text-sm text-muted-foreground">Highest confidence level</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">A/B Testing Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and analyze your experiments to optimize performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tests</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Test
          </Button>
        </div>
      </div>

      {/* Test Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Play className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Running Tests</p>
                <p className="text-2xl font-bold">{tests.filter(t => t.status === 'running').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{tests.filter(t => t.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Winners Found</p>
                <p className="text-2xl font-bold">{tests.filter(t => t.winner).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Participants</p>
                <p className="text-2xl font-bold">
                  {tests.reduce((sum, test) => sum + test.currentSampleSize, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test List and Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Test List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {filteredTests.map((test) => (
                  <div
                    key={test.id}
                    className={cn(
                      'p-4 cursor-pointer hover:bg-muted/50 transition-colors border-l-4',
                      selectedTest === test.id ? 'bg-muted border-l-primary' : 'border-l-transparent'
                    )}
                    onClick={() => setSelectedTest(test.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{test.name}</h4>
                      {getStatusBadge(test.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {test.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{format(test.startDate, 'MMM d')}</span>
                      <span>{test.currentSampleSize.toLocaleString()} participants</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Details */}
        <div className="lg:col-span-2">
          {currentTest ? (
            <Card>
              <CardHeader>
                <Tabs value={activeTab} onValueChange={(value: unknown) => setActiveTab(value)}>
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="results">Results</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent>
                <TabsContent value="overview">
                  {renderTestOverview()}
                </TabsContent>
                <TabsContent value="results">
                  {renderTestResults()}
                </TabsContent>
                <TabsContent value="timeline">
                  <div className="text-center py-12 text-muted-foreground">
                    <LineChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Timeline view coming soon</p>
                  </div>
                </TabsContent>
                <TabsContent value="settings">
                  <div className="text-center py-12 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Test settings coming soon</p>
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a test to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}