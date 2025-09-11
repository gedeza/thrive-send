'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  Zap,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Settings,
  Sparkles,
  Activity,
  Eye,
  MousePointer,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Minus,
  Award,
  Lightbulb,
  Cpu,
  Database,
  ChevronRight,
  Info,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays, addWeeks, addMonths } from 'date-fns';

export interface PredictionModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'time_series' | 'anomaly_detection';
  description: string;
  accuracy: number;
  confidence: number;
  lastTrained: Date;
  features: string[];
  target: string;
  status: 'active' | 'training' | 'deprecated' | 'error';
}

export interface Prediction {
  id: string;
  modelId: string;
  metric: string;
  currentValue: number;
  predictedValue: number;
  change: number;
  changePercent: number;
  confidence: number;
  timeframe: '1d' | '7d' | '30d' | '90d';
  factors: Array<{
    name: string;
    impact: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  recommendation: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface AnomalyDetection {
  id: string;
  metric: string;
  timestamp: Date;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  possibleCauses: string[];
  recommendations: string[];
}

export interface ChurnPrediction {
  userId: string;
  userName: string;
  churnProbability: number;
  riskSegment: 'low' | 'medium' | 'high' | 'critical';
  lastActivity: Date;
  engagementScore: number;
  predictedChurnDate: Date;
  preventionActions: string[];
  customerValue: number;
}

interface PredictiveAnalyticsProps {
  className?: string;
}

// Mock data generators
const generateMockModels = (): PredictionModel[] => [
  {
    id: 'model-1',
    name: 'Engagement Predictor',
    type: 'regression',
    description: 'Predicts content engagement rates based on historical data and content features',
    accuracy: 87.3,
    confidence: 92.1,
    lastTrained: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    features: ['content_type', 'post_time', 'hashtags', 'media_count', 'historical_engagement'],
    target: 'engagement_rate',
    status: 'active'
  },
  {
    id: 'model-2',
    name: 'Conversion Forecaster',
    type: 'time_series',
    description: 'Forecasts conversion rates and revenue trends for upcoming periods',
    accuracy: 82.7,
    confidence: 88.4,
    lastTrained: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    features: ['seasonal_trends', 'campaign_budget', 'audience_size', 'market_conditions'],
    target: 'conversion_rate',
    status: 'active'
  },
  {
    id: 'model-3',
    name: 'Churn Risk Detector',
    type: 'classification',
    description: 'Identifies users at risk of churning based on engagement patterns',
    accuracy: 91.2,
    confidence: 94.6,
    lastTrained: new Date(),
    features: ['session_frequency', 'engagement_decline', 'support_tickets', 'feature_usage'],
    target: 'churn_risk',
    status: 'training'
  },
  {
    id: 'model-4',
    name: 'Anomaly Detector',
    type: 'anomaly_detection',
    description: 'Detects unusual patterns in analytics data that may indicate issues',
    accuracy: 95.1,
    confidence: 97.2,
    lastTrained: new Date(Date.now() - 6 * 60 * 60 * 1000),
    features: ['metric_patterns', 'seasonal_baselines', 'external_factors'],
    target: 'anomaly_score',
    status: 'active'
  }
];

const generateMockPredictions = (): Prediction[] => [
  {
    id: 'pred-1',
    modelId: 'model-1',
    metric: 'Engagement Rate',
    currentValue: 4.2,
    predictedValue: 5.1,
    change: 0.9,
    changePercent: 21.4,
    confidence: 87.3,
    timeframe: '7d',
    factors: [
      { name: 'Optimal posting time', impact: 35, trend: 'up' },
      { name: 'Content quality score', impact: 28, trend: 'up' },
      { name: 'Audience growth', impact: 22, trend: 'up' },
      { name: 'Competition activity', impact: -15, trend: 'down' }
    ],
    recommendation: 'Continue posting during peak hours (2-4 PM) and focus on video content for maximum engagement.',
    riskLevel: 'low'
  },
  {
    id: 'pred-2',
    modelId: 'model-2',
    metric: 'Conversion Rate',
    currentValue: 2.8,
    predictedValue: 2.3,
    change: -0.5,
    changePercent: -17.9,
    confidence: 82.7,
    timeframe: '30d',
    factors: [
      { name: 'Seasonal trends', impact: -45, trend: 'down' },
      { name: 'Ad spend efficiency', impact: 20, trend: 'up' },
      { name: 'Landing page changes', impact: 15, trend: 'up' },
      { name: 'Market saturation', impact: -20, trend: 'down' }
    ],
    recommendation: 'Increase ad spend by 25% and optimize landing pages to counteract seasonal decline.',
    riskLevel: 'medium'
  },
  {
    id: 'pred-3',
    modelId: 'model-1',
    metric: 'Click-Through Rate',
    currentValue: 3.6,
    predictedValue: 4.8,
    change: 1.2,
    changePercent: 33.3,
    confidence: 91.2,
    timeframe: '7d',
    factors: [
      { name: 'A/B test optimization', impact: 40, trend: 'up' },
      { name: 'Audience targeting', impact: 30, trend: 'up' },
      { name: 'Creative refresh', impact: 25, trend: 'up' },
      { name: 'Platform algorithm', impact: 5, trend: 'stable' }
    ],
    recommendation: 'Deploy winning A/B test variant across all campaigns immediately.',
    riskLevel: 'low'
  }
];

const generateMockAnomalies = (): AnomalyDetection[] => [
  {
    id: 'anom-1',
    metric: 'Page Views',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    expectedValue: 2500,
    actualValue: 1200,
    deviation: -52,
    severity: 'high',
    description: 'Significant drop in page views detected',
    possibleCauses: [
      'Server performance issues',
      'Social media platform algorithm change',
      'Competitor campaign launch'
    ],
    recommendations: [
      'Check server response times and database performance',
      'Review recent platform policy changes',
      'Increase social media posting frequency'
    ]
  },
  {
    id: 'anom-2',
    metric: 'Bounce Rate',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    expectedValue: 35,
    actualValue: 58,
    deviation: 65.7,
    severity: 'critical',
    description: 'Bounce rate spike beyond normal thresholds',
    possibleCauses: [
      'Landing page loading issues',
      'Mobile responsiveness problems',
      'Content-audience mismatch'
    ],
    recommendations: [
      'Audit mobile page performance immediately',
      'Review and update landing page content',
      'Check recent traffic source changes'
    ]
  }
];

const generateMockChurnPredictions = (): ChurnPrediction[] => [
  {
    userId: 'user-1',
    userName: 'Enterprise Client A',
    churnProbability: 78,
    riskSegment: 'high',
    lastActivity: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    engagementScore: 23,
    predictedChurnDate: addDays(new Date(), 15),
    preventionActions: [
      'Schedule executive check-in call',
      'Offer premium feature trial',
      'Provide dedicated account manager'
    ],
    customerValue: 15000
  },
  {
    userId: 'user-2',
    userName: 'Growth Startup B',
    churnProbability: 45,
    riskSegment: 'medium',
    lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    engagementScore: 67,
    predictedChurnDate: addDays(new Date(), 45),
    preventionActions: [
      'Send engagement survey',
      'Highlight unused features',
      'Offer training session'
    ],
    customerValue: 5000
  }
];

export function PredictiveAnalytics({ className }: PredictiveAnalyticsProps) {
  const [models] = useState<PredictionModel[]>(generateMockModels());
  const [predictions] = useState<Prediction[]>(generateMockPredictions());
  const [anomalies] = useState<AnomalyDetection[]>(generateMockAnomalies());
  const [churnPredictions] = useState<ChurnPrediction[]>(generateMockChurnPredictions());
  
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1d' | '7d' | '30d' | '90d'>('7d');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [confidenceThreshold, setConfidenceThreshold] = useState([80]);

  const filteredPredictions = useMemo(() => {
    return predictions.filter(pred => 
      (selectedTimeframe === 'all' || pred.timeframe === selectedTimeframe) &&
      (selectedModel === 'all' || pred.modelId === selectedModel) &&
      pred.confidence >= confidenceThreshold[0]
    );
  }, [predictions, selectedTimeframe, selectedModel, confidenceThreshold]);

  const getModelStatus = (status: PredictionModel['status']) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      training: { color: 'bg-blue-100 text-blue-700', icon: RefreshCw },
      deprecated: { color: 'bg-gray-100 text-gray-500', icon: Clock },
      error: { color: 'bg-red-100 text-red-700', icon: AlertTriangle }
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

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      low: 'bg-blue-100 text-blue-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700'
    };

    return (
      <Badge className={cn('text-xs', severityConfig[severity as keyof typeof severityConfig])}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </Badge>
    );
  };

  const getChurnRiskColor = (risk: string) => {
    const riskColors = {
      low: 'border-green-500 bg-green-50',
      medium: 'border-yellow-500 bg-yellow-50',
      high: 'border-orange-500 bg-orange-50',
      critical: 'border-red-500 bg-red-50'
    };
    return riskColors[risk as keyof typeof riskColors];
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Predictive Analytics</h1>
            <p className="text-muted-foreground">
              AI-powered insights and forecasting for smarter decision making
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTimeframe} onValueChange={(value: unknown) => setSelectedTimeframe(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">1 Day</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </Button>
        </div>
      </div>

      {/* Model Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        {models.map((model) => (
          <Card key={model.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold text-sm">{model.name}</h4>
                </div>
                {getModelStatus(model.status)}
              </div>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {model.description}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Accuracy:</span>
                  <span className="font-medium">{model.accuracy}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="font-medium">{model.confidence}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Last Trained:</span>
                  <span className="font-medium">
                    {format(model.lastTrained, 'MMM d')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="predictions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Anomalies
          </TabsTrigger>
          <TabsTrigger value="churn" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Churn Risk
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Model:</label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Models</SelectItem>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Min. Confidence:</label>
                  <div className="w-32">
                    <Slider
                      value={confidenceThreshold}
                      onValueChange={setConfidenceThreshold}
                      max={100}
                      min={50}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12">
                    {confidenceThreshold[0]}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Predictions Grid */}
          <div className="grid gap-6">
            {filteredPredictions.map((prediction) => (
              <Card key={prediction.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Prediction Summary */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">{prediction.metric}</h4>
                        <Badge className="bg-purple-100 text-purple-700">
                          {prediction.timeframe} forecast
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Current:</span>
                          <span className="font-medium text-lg">
                            {prediction.currentValue.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Predicted:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-lg">
                              {prediction.predictedValue.toFixed(1)}%
                            </span>
                            {getChangeIcon(prediction.change)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Change:</span>
                          <span className={cn('font-medium', getChangeColor(prediction.change))}>
                            {prediction.change > 0 ? '+' : ''}{prediction.changePercent.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Confidence:</span>
                          <span className="font-medium">{prediction.confidence}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Contributing Factors */}
                    <div className="space-y-4">
                      <h5 className="font-semibold">Contributing Factors</h5>
                      <div className="space-y-2">
                        {prediction.factors.map((factor, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                'h-2 w-2 rounded-full',
                                factor.trend === 'up' ? 'bg-green-500' :
                                factor.trend === 'down' ? 'bg-red-500' : 'bg-gray-500'
                              )} />
                              <span className="text-sm">{factor.name}</span>
                            </div>
                            <span className={cn(
                              'text-sm font-medium',
                              factor.impact > 0 ? 'text-green-600' : 'text-red-600'
                            )}>
                              {factor.impact > 0 ? '+' : ''}{factor.impact}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className="space-y-4">
                      <h5 className="font-semibold">AI Recommendation</h5>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                          <p className="text-sm text-blue-800">
                            {prediction.recommendation}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Risk Level:</span>
                        {getSeverityBadge(prediction.riskLevel)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <div className="space-y-4">
            {anomalies.map((anomaly) => (
              <Card key={anomaly.id} className="border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">{anomaly.metric}</h4>
                        {getSeverityBadge(anomaly.severity)}
                      </div>
                      
                      <p className="text-muted-foreground">{anomaly.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Expected:</span>
                          <p className="font-medium">{anomaly.expectedValue.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Actual:</span>
                          <p className="font-medium">{anomaly.actualValue.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Deviation:</span>
                          <p className={cn(
                            'font-medium',
                            anomaly.deviation < 0 ? 'text-red-600' : 'text-green-600'
                          )}>
                            {anomaly.deviation}%
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Detected:</span>
                          <p className="font-medium">
                            {format(anomaly.timestamp, 'MMM d, HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h5 className="font-semibold mb-2">Possible Causes</h5>
                        <ul className="space-y-1">
                          {anomaly.possibleCauses.map((cause, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                              <ChevronRight className="h-3 w-3" />
                              {cause}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-semibold mb-2">Recommendations</h5>
                        <ul className="space-y-1">
                          {anomaly.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-blue-600 flex items-center gap-2">
                              <CheckCircle className="h-3 w-3" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="churn" className="space-y-6">
          <div className="grid gap-4">
            {churnPredictions.map((churn) => (
              <Card key={churn.userId} className={cn('border-l-4', getChurnRiskColor(churn.riskSegment))}>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{churn.userName}</h4>
                        {getSeverityBadge(churn.riskSegment)}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Churn Risk:</span>
                          <span className="font-medium">{churn.churnProbability}%</span>
                        </div>
                        <Progress value={churn.churnProbability} className="h-2" />
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Engagement:</span>
                          <span className="font-medium">{churn.engagementScore}/100</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Customer Value:</span>
                          <span className="font-medium">${churn.customerValue.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Last Activity:</span>
                          <span className="font-medium">
                            {format(churn.lastActivity, 'MMM d')}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Predicted Churn:</span>
                          <span className="font-medium text-red-600">
                            {format(churn.predictedChurnDate, 'MMM d')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <h5 className="font-semibold">Recommended Prevention Actions</h5>
                      <div className="grid gap-3">
                        {churn.preventionActions.map((action, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Target className="h-4 w-4 text-blue-600" />
                              <span className="text-sm">{action}</span>
                            </div>
                            <Button variant="outline" size="sm">
                              Execute
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Top Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800">High Conversion Opportunity</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Video content shows 67% higher engagement. Recommended to increase video production by 40%.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Optimal Timing Identified</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Posts between 2-4 PM show 85% higher engagement. Schedule more content in this window.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-800">Audience Saturation Risk</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        Current audience showing declining engagement. Consider expanding to new demographics.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-600" />
                  Data Quality Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Data Completeness</span>
                    <span className="font-medium">94.2%</span>
                  </div>
                  <Progress value={94.2} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Model Accuracy</span>
                    <span className="font-medium">89.1%</span>
                  </div>
                  <Progress value={89.1} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Prediction Confidence</span>
                    <span className="font-medium">91.7%</span>
                  </div>
                  <Progress value={91.7} className="h-2" />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span>Models retrained every 24 hours with latest data</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}