'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Target,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Filter,
  Eye,
  Zap,
  Crown,
  Rocket,
  Award,
  LineChart
} from 'lucide-react';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Types for revenue dashboard
interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  quarterlyRevenue: number;
  yearlyRevenue: number;
  revenueGrowth: {
    monthly: number;
    quarterly: number;
    yearly: number;
  };
  averageOrderValue: number;
  totalOrders: number;
  activeBoosts: number;
  clientRetentionRate: number;
}

interface RevenueByClient {
  clientId: string;
  clientName: string;
  clientType: string;
  totalSpent: number;
  monthlySpent: number;
  ordersCount: number;
  lastPurchase: string;
  averageROI: number;
  status: 'high-value' | 'growing' | 'stable' | 'at-risk';
}

interface RevenueByProduct {
  productId: string;
  productName: string;
  category: string;
  totalSales: number;
  unitssold: number;
  averagePrice: number;
  profitMargin: number;
  popularity: 'bestseller' | 'hot' | 'trending' | 'new';
}

interface RevenueTimeline {
  date: string;
  revenue: number;
  orders: number;
  newClients: number;
  averageOrderValue: number;
}

// Demo revenue data
const demoRevenueMetrics: RevenueMetrics = {
  totalRevenue: 47650,
  monthlyRevenue: 8940,
  quarterlyRevenue: 23580,
  yearlyRevenue: 47650,
  revenueGrowth: {
    monthly: 15.3,
    quarterly: 28.7,
    yearly: 145.2
  },
  averageOrderValue: 387,
  totalOrders: 123,
  activeBoosts: 34,
  clientRetentionRate: 94.2
};

const demoRevenueByClient: RevenueByClient[] = [
  {
    clientId: 'demo-client-1',
    clientName: 'City of Springfield',
    clientType: 'Municipality',
    totalSpent: 12450,
    monthlySpent: 2100,
    ordersCount: 18,
    lastPurchase: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    averageROI: 340,
    status: 'high-value'
  },
  {
    clientId: 'demo-client-2',
    clientName: 'Regional Health District',
    clientType: 'Government',
    totalSpent: 8920,
    monthlySpent: 1580,
    ordersCount: 12,
    lastPurchase: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    averageROI: 275,
    status: 'growing'
  },
  {
    clientId: 'demo-client-3',
    clientName: 'TechFlow Innovations',
    clientType: 'Startup',
    totalSpent: 6780,
    monthlySpent: 890,
    ordersCount: 15,
    lastPurchase: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    averageROI: 485,
    status: 'stable'
  },
  {
    clientId: 'demo-client-4',
    clientName: 'Metro Business Council',
    clientType: 'Business',
    totalSpent: 4200,
    monthlySpent: 320,
    ordersCount: 8,
    lastPurchase: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    averageROI: 180,
    status: 'at-risk'
  }
];

const demoRevenueByProduct: RevenueByProduct[] = [
  {
    productId: 'boost-1',
    productName: 'Municipal Engagement Pro',
    category: 'Government',
    totalSales: 15670,
    unitsold: 52,
    averagePrice: 301,
    profitMargin: 68,
    popularity: 'bestseller'
  },
  {
    productId: 'boost-2',
    productName: 'Business Growth Accelerator',
    category: 'Business',
    totalSales: 12340,
    unitsold: 27,
    averagePrice: 457,
    profitMargin: 72,
    popularity: 'hot'
  },
  {
    productId: 'boost-3',
    productName: 'Startup Viral Launch',
    category: 'Startup',
    totalSales: 8950,
    unitsold: 45,
    averagePrice: 199,
    profitMargin: 45,
    popularity: 'trending'
  }
];

// Utility functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

function getClientStatusColor(status: string): string {
  switch (status) {
    case 'high-value': return 'bg-green-100 text-green-800';
    case 'growing': return 'bg-blue-100 text-blue-800';
    case 'stable': return 'bg-yellow-100 text-yellow-800';
    case 'at-risk': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getPopularityIcon(popularity: string) {
  switch (popularity) {
    case 'bestseller': return <Crown className="h-4 w-4 text-yellow-500" />;
    case 'hot': return <Zap className="h-4 w-4 text-orange-500" />;
    case 'trending': return <TrendingUp className="h-4 w-4 text-blue-500" />;
    case 'new': return <Award className="h-4 w-4 text-green-500" />;
    default: return <Rocket className="h-4 w-4" />;
  }
}

// Revenue metric card component
interface RevenueCardProps {
  title: string;
  value: string | number;
  change?: number;
  period?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
}

function RevenueCard({ title, value, change, period, icon, trend = 'neutral', isLoading }: RevenueCardProps) {
  const getTrendColor = () => {
    if (change === undefined) return 'text-muted-foreground';
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getTrendIcon = () => {
    if (change === undefined) return null;
    return change >= 0 ? 
      <ArrowUpRight className="h-3 w-3" /> : 
      <ArrowDownRight className="h-3 w-3" />;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">
              {typeof value === 'number' ? formatCurrency(value) : value}
            </p>
            {change !== undefined && (
              <div className={cn("flex items-center text-sm mt-2", getTrendColor())}>
                {getTrendIcon()}
                <span className="ml-1">{formatPercentage(change)}</span>
                {period && <span className="text-muted-foreground ml-1">{period}</span>}
              </div>
            )}
          </div>
          <div className="p-3 bg-primary/10 rounded-full">
            <div className="h-6 w-6 text-primary">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Client revenue table component
interface ClientRevenueTableProps {
  clients: RevenueByClient[];
}

function ClientRevenueTable({ clients }: ClientRevenueTableProps) {
  return (
    <div className="space-y-3">
      {clients.map((client) => (
        <div key={client.clientId} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-semibold">{client.clientName}</h4>
              <Badge variant="outline" className="text-xs">
                {client.clientType}
              </Badge>
              <Badge className={cn("text-xs", getClientStatusColor(client.status))}>
                {client.status.replace('-', ' ')}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{client.ordersCount} orders</span>
              <span>Last: {formatDate(client.lastPurchase)}</span>
              <span>ROI: {client.averageROI}%</span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xl font-bold">{formatCurrency(client.totalSpent)}</p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(client.monthlySpent)}/month
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Product revenue table component
interface ProductRevenueTableProps {
  products: RevenueByProduct[];
}

function ProductRevenueTable({ products }: ProductRevenueTableProps) {
  return (
    <div className="space-y-3">
      {products.map((product) => (
        <div key={product.productId} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getPopularityIcon(product.popularity)}
              <h4 className="font-semibold">{product.productName}</h4>
              <Badge variant="outline" className="text-xs">
                {product.category}
              </Badge>
              <Badge variant="secondary" className="text-xs capitalize">
                {product.popularity}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{product.unitsold} units sold</span>
              <span>Avg: {formatCurrency(product.averagePrice)}</span>
              <span>Margin: {product.profitMargin}%</span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xl font-bold">{formatCurrency(product.totalSales)}</p>
            <p className="text-sm text-green-600">
              +{formatCurrency(product.totalSales * (product.profitMargin / 100))} profit
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ServiceProviderRevenueDashboard() {
  const [timeRange, setTimeRange] = useState('monthly');
  const [revenueMetrics] = useState<RevenueMetrics>(demoRevenueMetrics);
  const [clientRevenue] = useState<RevenueByClient[]>(demoRevenueByClient);
  const [productRevenue] = useState<RevenueByProduct[]>(demoRevenueByProduct);
  const [isLoading, setIsLoading] = useState(false);
  const { state: { organizationId } } = useServiceProvider();

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 1500);
  };

  const handleExport = () => {
    // TODO: Implement revenue report export
    console.log('Exporting revenue report...');
  };

  // Calculate metrics based on time range
  const getCurrentRevenue = () => {
    switch (timeRange) {
      case 'monthly': return revenueMetrics.monthlyRevenue;
      case 'quarterly': return revenueMetrics.quarterlyRevenue;
      case 'yearly': return revenueMetrics.yearlyRevenue;
      default: return revenueMetrics.totalRevenue;
    }
  };

  const getCurrentGrowth = () => {
    switch (timeRange) {
      case 'monthly': return revenueMetrics.revenueGrowth.monthly;
      case 'quarterly': return revenueMetrics.revenueGrowth.quarterly;
      case 'yearly': return revenueMetrics.revenueGrowth.yearly;
      default: return 0;
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              Revenue Dashboard
            </h2>
            <p className="text-muted-foreground mt-1">
              Track your marketplace revenue and client spending across all boost purchases
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
            
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Revenue Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <RevenueCard
            title={`Revenue (${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)})`}
            value={getCurrentRevenue()}
            change={getCurrentGrowth()}
            period={`vs last ${timeRange.replace('-time', '').replace('ly', '')}`}
            icon={<DollarSign className="h-6 w-6" />}
            isLoading={isLoading}
          />
          
          <RevenueCard
            title="Average Order Value"
            value={revenueMetrics.averageOrderValue}
            change={12.5}
            period="vs last month"
            icon={<ShoppingCart className="h-6 w-6" />}
          />
          
          <RevenueCard
            title="Active Boosts"
            value={revenueMetrics.activeBoosts}
            change={8.3}
            period="vs last month"
            icon={<Rocket className="h-6 w-6" />}
          />
          
          <RevenueCard
            title="Client Retention"
            value={`${revenueMetrics.clientRetentionRate}%`}
            change={2.1}
            period="vs last quarter"
            icon={<Users className="h-6 w-6" />}
          />
        </div>

        {/* Revenue Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Revenue Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Revenue trend chart would be displayed here</p>
                  <p className="text-sm">Integration with Chart.js or Recharts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Revenue by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Category breakdown chart would be displayed here</p>
                  <p className="text-sm">Government: 45% • Business: 35% • Startup: 20%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Clients by Revenue
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClientRevenueTable clients={clientRevenue} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Top Products by Revenue
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductRevenueTable products={productRevenue} />
            </CardContent>
          </Card>
        </div>

        {/* Quick Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Revenue Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-800">Growing Segments</h4>
                <p className="text-sm text-green-600 mt-1">
                  Municipal clients show 28% growth this quarter
                </p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-800">Best Performers</h4>
                <p className="text-sm text-blue-600 mt-1">
                  Premium boosts have 72% profit margin
                </p>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h4 className="font-semibold text-orange-800">Client Health</h4>
                <p className="text-sm text-orange-600 mt-1">
                  94.2% retention rate across all client types
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}