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
import { formatCurrency } from '@/lib/utils/currency';
import { useQuery } from '@tanstack/react-query';
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

// Revenue data fetching function
const fetchRevenueData = async (organizationId: string, timeRange: string) => {
  const response = await fetch(`/api/service-provider/revenue?organizationId=${organizationId}&timeRange=${timeRange}`);
  if (!response.ok) {
    throw new Error('Failed to fetch revenue data');
  }
  return response.json();
};

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
  showAll?: boolean;
  onClientClick?: (clientId: string, clientName: string) => void;
}

function ClientRevenueTable({ clients, showAll = false, onClientClick }: ClientRevenueTableProps) {
  const displayClients = showAll ? clients : clients.slice(0, 5);
  
  return (
    <div className="space-y-3">
      {displayClients.map((client) => (
        <div 
          key={client.clientId} 
          className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onClientClick?.(client.clientId, client.clientName)}
        >
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
      {!showAll && clients.length > 5 && (
        <div className="text-center text-sm text-muted-foreground py-2">
          Showing 5 of {clients.length} clients
        </div>
      )}
    </div>
  );
}

// Product revenue table component
interface ProductRevenueTableProps {
  products: RevenueByProduct[];
  showAll?: boolean;
  onProductClick?: (productId: string, productName: string) => void;
}

function ProductRevenueTable({ products, showAll = false, onProductClick }: ProductRevenueTableProps) {
  const displayProducts = showAll ? products : products.slice(0, 5);
  
  return (
    <div className="space-y-3">
      {displayProducts.map((product) => (
        <div 
          key={product.productId} 
          className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onProductClick?.(product.productId, product.productName)}
        >
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
              <span>{product.unitssold} units sold</span>
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
      {!showAll && products.length > 5 && (
        <div className="text-center text-sm text-muted-foreground py-2">
          Showing 5 of {products.length} products
        </div>
      )}
    </div>
  );
}

export default function ServiceProviderRevenueDashboard() {
  const [timeRange, setTimeRange] = useState('monthly');
  const [showAllClients, setShowAllClients] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const { state: { organizationId } } = useServiceProvider();

  // Fetch revenue data with React Query
  const { 
    data: revenueData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['service-provider-revenue', organizationId, timeRange, Math.floor(Date.now() / 30000)], // 30s refresh
    queryFn: () => fetchRevenueData(organizationId || 'demo-org', timeRange),
    enabled: !!organizationId,
    staleTime: 15 * 1000, // 15 seconds
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    refetchOnWindowFocus: true,
  });

  const handleRefresh = async () => {
    refetch();
  };

  const handleExport = () => {
    // TODO: Implement revenue report export
    console.log('Exporting revenue report...');
  };

  const handleViewAllClients = () => {
    setShowAllClients(!showAllClients);
    console.log('Toggle view all clients:', !showAllClients);
  };

  const handleViewAllProducts = () => {
    setShowAllProducts(!showAllProducts);
    console.log('Toggle view all products:', !showAllProducts);
  };

  const handleClientClick = (clientId: string, clientName: string) => {
    console.log('Navigate to client details:', { clientId, clientName });
    // TODO: Navigate to detailed client revenue page
    // router.push(`/service-provider/clients/${clientId}/revenue`);
  };

  const handleProductClick = (productId: string, productName: string) => {
    console.log('Navigate to product details:', { productId, productName });
    // TODO: Navigate to detailed product revenue page
    // router.push(`/service-provider/products/${productId}/revenue`);
  };

  // Calculate metrics based on time range
  const getCurrentRevenue = () => {
    if (!revenueData?.metrics) return 0;
    const metrics = revenueData.metrics;
    switch (timeRange) {
      case 'monthly': return metrics.monthlyRevenue;
      case 'quarterly': return metrics.quarterlyRevenue;
      case 'yearly': return metrics.yearlyRevenue;
      default: return metrics.totalRevenue;
    }
  };

  const getCurrentGrowth = () => {
    if (!revenueData?.metrics?.revenueGrowth) return 0;
    const growth = revenueData.metrics.revenueGrowth;
    switch (timeRange) {
      case 'monthly': return growth.monthly;
      case 'quarterly': return growth.quarterly;
      case 'yearly': return growth.yearly;
      default: return 0;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              Revenue Dashboard
            </h2>
            <div className="w-64 h-4 bg-gray-200 rounded animate-pulse mt-2" />
          </div>
          <div className="flex gap-2">
            <div className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
            <div className="w-24 h-10 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  // Error state
  if (error || !revenueData) {
    return (
      <Card className="p-8 text-center border-red-200">
        <div className="flex justify-center mb-4">
          <DollarSign className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-red-700">Revenue Data Unavailable</h3>
        <p className="text-muted-foreground mb-4">
          Unable to load revenue data. Please try refreshing or contact support.
        </p>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </Card>
    );
  }

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
            value={formatCurrency(revenueData.metrics.averageOrderValue)}
            change={12.5}
            period="vs last month"
            icon={<ShoppingCart className="h-6 w-6" />}
          />
          
          <RevenueCard
            title="Active Boosts"
            value={revenueData.metrics.activeBoosts}
            change={8.3}
            period="vs last month"
            icon={<Rocket className="h-6 w-6" />}
          />
          
          <RevenueCard
            title="Client Retention"
            value={`${revenueData.metrics.clientRetentionRate}%`}
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
                <Button variant="ghost" size="sm" onClick={handleViewAllClients}>
                  <Eye className="h-4 w-4 mr-2" />
                  {showAllClients ? 'Show Less' : 'View All'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClientRevenueTable 
                clients={revenueData.revenueByClient} 
                showAll={showAllClients} 
                onClientClick={handleClientClick}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Top Products by Revenue
                </div>
                <Button variant="ghost" size="sm" onClick={handleViewAllProducts}>
                  <Eye className="h-4 w-4 mr-2" />
                  {showAllProducts ? 'Show Less' : 'View All'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductRevenueTable 
                products={revenueData.revenueByProduct} 
                showAll={showAllProducts} 
                onProductClick={handleProductClick}
              />
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