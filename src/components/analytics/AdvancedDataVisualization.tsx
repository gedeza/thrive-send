'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Eye,
  MousePointer,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Share2,
  Heart,
  MessageCircle,
  Play,
  Pause,
  RotateCcw,
  Download,
  Settings,
  Maximize2,
  Minimize2,
  Filter,
  Layers,
  Grid3X3,
  Map,
  Gauge,
  Radar,
  Scatter,
  AreaChart,
  Workflow,
  TreePine,
  Network,
  Sparkles,
  Palette,
  Sliders,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays, subDays, startOfWeek, endOfWeek } from 'date-fns';

// Visualization Types
export interface ChartDataPoint {
  id: string;
  label: string;
  value: number;
  timestamp: Date;
  category?: string;
  metadata?: Record<string, any>;
}

export interface HeatmapDataPoint {
  x: number;
  y: number;
  value: number;
  label?: string;
  category?: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  value: number;
  category: string;
  x?: number;
  y?: number;
  connections: string[];
}

export interface TimeSeriesData {
  timestamp: Date;
  metrics: Record<string, number>;
  events?: Array<{
    type: string;
    description: string;
    impact?: number;
  }>;
}

export interface GeoDataPoint {
  latitude: number;
  longitude: number;
  value: number;
  label: string;
  country?: string;
  region?: string;
}

interface AdvancedDataVisualizationProps {
  className?: string;
  data?: any;
  chartType?: string;
  isInteractive?: boolean;
}

// Advanced Heatmap Component
function InteractiveHeatmap({ data, className }: { data: HeatmapDataPoint[], className?: string }) {
  const [selectedCell, setSelectedCell] = useState<HeatmapDataPoint | null>(null);
  const [colorScale, setColorScale] = useState<'viridis' | 'plasma' | 'cool' | 'warm'>('viridis');
  
  // Generate heatmap data for engagement by hour and day
  const generateHeatmapData = (): HeatmapDataPoint[] => {
    const data: HeatmapDataPoint[] = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    days.forEach((day, dayIndex) => {
      hours.forEach((hour) => {
        // Simulate realistic engagement patterns
        let baseValue = Math.random() * 100;
        
        // Higher engagement during business hours
        if (hour >= 9 && hour <= 17) {
          baseValue *= 1.5;
        }
        
        // Higher engagement on weekdays
        if (dayIndex < 5) {
          baseValue *= 1.2;
        }
        
        // Peak engagement at lunch and evening
        if (hour === 12 || hour === 19) {
          baseValue *= 1.8;
        }
        
        data.push({
          x: hour,
          y: dayIndex,
          value: Math.round(baseValue),
          label: `${day} ${hour}:00`,
          category: 'engagement'
        });
      });
    });
    
    return data;
  };

  const heatmapData = useMemo(() => generateHeatmapData(), []);
  const maxValue = Math.max(...heatmapData.map(d => d.value));
  
  const getColorIntensity = (value: number) => {
    const intensity = value / maxValue;
    switch (colorScale) {
      case 'viridis':
        return `hsl(${240 - intensity * 60}, 70%, ${30 + intensity * 40}%)`;
      case 'plasma':
        return `hsl(${320 - intensity * 80}, 80%, ${25 + intensity * 50}%)`;
      case 'cool':
        return `hsl(${240}, ${50 + intensity * 50}%, ${70 - intensity * 40}%)`;
      case 'warm':
        return `hsl(${60 - intensity * 60}, ${70 + intensity * 30}%, ${50 + intensity * 30}%)`;
      default:
        return `hsl(${240 - intensity * 60}, 70%, ${30 + intensity * 40}%)`;
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Engagement Heatmap
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="color-scale" className="text-sm">Color:</Label>
            <Select value={colorScale} onValueChange={(value: unknown) => setColorScale(value)}>
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viridis">Viridis</SelectItem>
                <SelectItem value="plasma">Plasma</SelectItem>
                <SelectItem value="cool">Cool</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Heatmap Grid */}
          <div className="relative overflow-x-auto">
            <div className="grid grid-cols-25 gap-0.5 min-w-[600px]">
              {/* Hour labels */}
              <div className="col-span-1"></div>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="text-xs text-center text-muted-foreground p-1">
                  {i}
                </div>
              ))}
              
              {/* Day rows */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, dayIndex) => (
                <div key={day} className="contents">
                  <div className="text-xs text-right text-muted-foreground p-2 flex items-center justify-end">
                    {day}
                  </div>
                  {Array.from({ length: 24 }, (_, hour) => {
                    const dataPoint = heatmapData.find(d => d.x === hour && d.y === dayIndex);
                    if (!dataPoint) return null;
                    
                    return (
                      <div
                        key={`${day}-${hour}`}
                        className="w-6 h-6 rounded cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg border border-white/20"
                        style={{ backgroundColor: getColorIntensity(dataPoint.value) }}
                        onMouseEnter={() => setSelectedCell(dataPoint)}
                        onMouseLeave={() => setSelectedCell(null)}
                        title={`${dataPoint.label}: ${dataPoint.value}% engagement`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Low</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className="w-4 h-4"
                  style={{ backgroundColor: getColorIntensity((i + 1) * 10) }}
                />
              ))}
            </div>
            <span className="text-muted-foreground">High</span>
            {selectedCell && (
              <Badge variant="outline" className="ml-4">
                {selectedCell.label}: {selectedCell.value}%
              </Badge>
            )}
          </div>

          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">19:00</div>
              <div className="text-sm text-muted-foreground">Peak Hour</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">Wednesday</div>
              <div className="text-sm text-muted-foreground">Best Day</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">87%</div>
              <div className="text-sm text-muted-foreground">Peak Engagement</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Advanced Network Visualization
function NetworkVisualization({ className }: { className?: string }) {
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [layoutType, setLayoutType] = useState<'force' | 'circular' | 'hierarchical'>('force');
  
  const generateNetworkData = (): NetworkNode[] => {
    const categories = ['Content', 'Platform', 'Audience', 'Campaign'];
    const nodes: NetworkNode[] = [
      // Central nodes
      { id: 'blog-posts', label: 'Blog Posts', value: 85, category: 'Content', connections: ['facebook', 'twitter', 'organic-audience'] },
      { id: 'social-media', label: 'Social Media', value: 92, category: 'Content', connections: ['instagram', 'twitter', 'young-audience'] },
      { id: 'email-campaigns', label: 'Email Campaigns', value: 78, category: 'Content', connections: ['existing-customers', 'newsletter'] },
      
      // Platform nodes
      { id: 'facebook', label: 'Facebook', value: 76, category: 'Platform', connections: ['adult-audience', 'engagement-campaign'] },
      { id: 'instagram', label: 'Instagram', value: 88, category: 'Platform', connections: ['young-audience', 'visual-campaign'] },
      { id: 'twitter', label: 'Twitter', value: 71, category: 'Platform', connections: ['tech-audience', 'trending-campaign'] },
      { id: 'linkedin', label: 'LinkedIn', value: 82, category: 'Platform', connections: ['professional-audience', 'b2b-campaign'] },
      
      // Audience nodes
      { id: 'young-audience', label: '18-24 Age Group', value: 65, category: 'Audience', connections: ['instagram', 'social-media'] },
      { id: 'adult-audience', label: '25-44 Age Group', value: 89, category: 'Audience', connections: ['facebook', 'linkedin'] },
      { id: 'professional-audience', label: 'Professionals', value: 94, category: 'Audience', connections: ['linkedin', 'email-campaigns'] },
      { id: 'tech-audience', label: 'Tech Enthusiasts', value: 87, category: 'Audience', connections: ['twitter', 'blog-posts'] },
      
      // Campaign nodes
      { id: 'engagement-campaign', label: 'Engagement Drive', value: 83, category: 'Campaign', connections: ['facebook', 'instagram'] },
      { id: 'conversion-campaign', label: 'Conversion Focus', value: 91, category: 'Campaign', connections: ['email-campaigns', 'linkedin'] },
      { id: 'awareness-campaign', label: 'Brand Awareness', value: 79, category: 'Campaign', connections: ['twitter', 'blog-posts'] }
    ];
    
    return nodes;
  };

  const networkData = useMemo(() => generateNetworkData(), []);
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Content': return '#3b82f6';
      case 'Platform': return '#10b981';
      case 'Audience': return '#f59e0b';
      case 'Campaign': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getNodeSize = (value: number) => {
    return Math.max(20, (value / 100) * 40);
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Content Network Analysis
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={layoutType} onValueChange={(value: unknown) => setLayoutType(value)}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="force">Force Layout</SelectItem>
                <SelectItem value="circular">Circular</SelectItem>
                <SelectItem value="hierarchical">Hierarchical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Network Visualization Area */}
          <div className="relative w-full h-96 bg-muted/50 rounded-lg border-2 border-dashed border-primary/20 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Network className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Interactive Network Visualization</p>
              <p className="text-xs text-muted-foreground">
                Advanced D3.js network would be rendered here with dynamic force simulation
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Content', 'Platform', 'Audience', 'Campaign'].map(category => (
              <div key={category} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: getCategoryColor(category) }}
                />
                <span className="text-sm">{category}</span>
              </div>
            ))}
          </div>

          {/* Network Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{networkData.length}</div>
              <div className="text-sm text-muted-foreground">Total Nodes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {networkData.reduce((sum, node) => sum + node.connections.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(networkData.reduce((sum, node) => sum + node.value, 0) / networkData.length)}%
              </div>
              <div className="text-sm text-muted-foreground">Avg Performance</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Advanced Gauge Chart
function PerformanceGauge({ 
  title, 
  value, 
  target, 
  className 
}: { 
  title: string; 
  value: number; 
  target: number; 
  className?: string; 
}) {
  const percentage = Math.min((value / target) * 100, 100);
  const isOverTarget = value > target;
  
  const getColor = () => {
    if (percentage >= 90) return '#10b981'; // Green
    if (percentage >= 70) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <h3 className="font-semibold text-lg">{title}</h3>
          
          <div className="relative inline-block">
            <svg
              height={radius * 2}
              width={radius * 2}
              className="transform -rotate-90"
            >
              {/* Background circle */}
              <circle
                stroke="#e5e7eb"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              
              {/* Progress circle */}
              <circle
                stroke={getColor()}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-1000 ease-in-out"
              />
            </svg>
            
            {/* Value display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold" style={{ color: getColor() }}>
                {Math.round(percentage)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {value.toLocaleString()} / {target.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-current" style={{ color: getColor() }} />
              <span>Current</span>
            </div>
            {isOverTarget && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                Over Target
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Real-time Streaming Chart
function RealTimeStreamChart({ className }: { className?: string }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [dataPoints, setDataPoints] = useState<Array<{ time: Date; value: number }>>([]);
  const [speed, setSpeed] = useState(1000); // ms
  
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      const newPoint = {
        time: new Date(),
        value: Math.random() * 100 + Math.sin(Date.now() / 10000) * 20 + 50
      };
      
      setDataPoints(prev => {
        const updated = [...prev, newPoint];
        // Keep only last 20 points
        return updated.slice(-20);
      });
    }, speed);
    
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Engagement
            {isPlaying && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDataPoints([])}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart Area */}
          <div className="h-64 bg-muted/50 rounded-lg border-2 border-dashed border-primary/20 flex items-center justify-center relative overflow-hidden">
            {/* Simulated real-time line chart */}
            <div className="absolute inset-4">
              <svg className="w-full h-full">
                {dataPoints.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    points={dataPoints.map((point, index) => {
                      const x = (index / (dataPoints.length - 1)) * 100;
                      const y = 100 - (point.value / 100) * 100;
                      return `${x}%,${y}%`;
                    }).join(' ')}
                    className="transition-all duration-100"
                  />
                )}
                
                {/* Data points */}
                {dataPoints.map((point, index) => (
                  <circle
                    key={index}
                    cx={`${(index / Math.max(dataPoints.length - 1, 1)) * 100}%`}
                    cy={`${100 - (point.value / 100) * 100}%`}
                    r="3"
                    fill="#3b82f6"
                    className="transition-all duration-100"
                  />
                ))}
              </svg>
            </div>
            
            {dataPoints.length === 0 && (
              <div className="text-center text-muted-foreground">
                <LineChart className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Waiting for data...</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Speed:</Label>
                <Select value={speed.toString()} onValueChange={(value) => setSpeed(parseInt(value))}>
                  <SelectTrigger className="w-24 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500">Fast</SelectItem>
                    <SelectItem value="1000">Normal</SelectItem>
                    <SelectItem value="2000">Slow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span>Live Data</span>
              </div>
              {dataPoints.length > 0 && (
                <Badge variant="outline">
                  {Math.round(dataPoints[dataPoints.length - 1]?.value || 0)}% current
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Advanced Data Visualization Component
export function AdvancedDataVisualization({ 
  className,
  data,
  chartType = 'all',
  isInteractive = true
}: AdvancedDataVisualizationProps) {
  const [activeTab, setActiveTab] = useState<'heatmap' | 'network' | 'gauges' | 'realtime' | 'geographic'>('heatmap');
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Advanced Data Visualization</h1>
            <p className="text-muted-foreground">
              Interactive and specialized visualization components for deep data insights
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Configure
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Visualization Tabs */}
      <Tabs value={activeTab} onValueChange={(value: unknown) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="heatmap" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Heatmaps
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Networks
          </TabsTrigger>
          <TabsTrigger value="gauges" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Gauges
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-time
          </TabsTrigger>
          <TabsTrigger value="geographic" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Geographic
          </TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="space-y-6">
          <InteractiveHeatmap data={[]} />
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <NetworkVisualization />
        </TabsContent>

        <TabsContent value="gauges" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <PerformanceGauge 
              title="Engagement Rate" 
              value={87} 
              target={85} 
            />
            <PerformanceGauge 
              title="Conversion Rate" 
              value={4.2} 
              target={5.0} 
            />
            <PerformanceGauge 
              title="Revenue Target" 
              value={125000} 
              target={100000} 
            />
            <PerformanceGauge 
              title="User Satisfaction" 
              value={4.8} 
              target={4.5} 
            />
            <PerformanceGauge 
              title="Content Quality" 
              value={92} 
              target={90} 
            />
            <PerformanceGauge 
              title="Platform Growth" 
              value={156} 
              target={150} 
            />
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <RealTimeStreamChart />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Live Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">1,247</div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                    <div className="flex items-center justify-center gap-1 text-xs text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      +5.2%
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">98.7%</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                    <div className="flex items-center justify-center gap-1 text-xs text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Healthy
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">2.3s</div>
                    <div className="text-sm text-muted-foreground">Avg Load Time</div>
                    <div className="flex items-center justify-center gap-1 text-xs text-yellow-600">
                      <Clock className="h-3 w-3" />
                      Normal
                    </div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">847</div>
                    <div className="text-sm text-muted-foreground">Events/min</div>
                    <div className="flex items-center justify-center gap-1 text-xs text-blue-600">
                      <Activity className="h-3 w-3" />
                      Active
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5" />
                Geographic Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Map placeholder */}
                <div className="w-full h-96 bg-muted/50 rounded-lg border-2 border-dashed border-primary/20 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Map className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Interactive Geographic Map</p>
                    <p className="text-xs text-muted-foreground">
                      World map with data visualization would be rendered here
                    </p>
                  </div>
                </div>

                {/* Geographic Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">United States</div>
                    <div className="text-sm text-muted-foreground">45.2% of traffic</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">Canada</div>
                    <div className="text-sm text-muted-foreground">18.7% of traffic</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">United Kingdom</div>
                    <div className="text-sm text-muted-foreground">12.3% of traffic</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-xl font-bold text-yellow-600">Australia</div>
                    <div className="text-sm text-muted-foreground">8.9% of traffic</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}