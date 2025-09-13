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
import { useCurrency } from '@/hooks/useCurrency';
import { REVENUE_DASHBOARD_TEXT, SEMANTIC_COLORS } from '@/constants/dashboard-text';
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
import { SimpleRevenueChart } from './SimpleRevenueChart';

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
  return SEMANTIC_COLORS.CLIENT_STATUS[status as keyof typeof SEMANTIC_COLORS.CLIENT_STATUS] || 'bg-muted/50 text-muted-foreground';
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
  const { formatCurrency } = useCurrency();
  const getTrendColor = () => {
    if (change === undefined) return 'text-muted-foreground';
    return change >= 0 ? 'text-success' : 'text-destructive';
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
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-full">
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
  const { formatCurrency } = useCurrency();
  const displayClients = showAll ? clients : clients.slice(0, 5);
  
  return (
    <div className="space-y-3">
      {displayClients.map((client) => (
        <div 
          key={client.clientId} 
          className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onClientClick?.(client.clientId, client.clientName)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClientClick?.(client.clientId, client.clientName);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`View details for client ${client.clientName}`}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-semibold">{client.clientName}</h4>
              <Badge variant="outline" className="text-xs">
                {client.clientType}
              </Badge>
              <Badge className={cn("text-xs", getClientStatusColor(client.status))}>
                {REVENUE_DASHBOARD_TEXT.CLIENT_STATUS[client.status as keyof typeof REVENUE_DASHBOARD_TEXT.CLIENT_STATUS]}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{client.ordersCount} {REVENUE_DASHBOARD_TEXT.TABLES.ORDERS}</span>
              <span>{REVENUE_DASHBOARD_TEXT.TABLES.LAST_PURCHASE}: {formatDate(client.lastPurchase)}</span>
              <span>{REVENUE_DASHBOARD_TEXT.TABLES.ROI}: {client.averageROI}%</span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xl font-bold">{formatCurrency(client.totalSpent)}</p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(client.monthlySpent)}{REVENUE_DASHBOARD_TEXT.TIME_LABELS.PER_MONTH}
            </p>
          </div>
        </div>
      ))}
      {!showAll && clients.length > 5 && (
        <div className="text-center text-sm text-muted-foreground py-2">
          {REVENUE_DASHBOARD_TEXT.TABLES.SHOWING_COUNT(5, clients.length)} clients
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
  const { formatCurrency } = useCurrency();
  const displayProducts = showAll ? products : products.slice(0, 5);
  
  return (
    <div className="space-y-3">
      {displayProducts.map((product) => (
        <div 
          key={product.productId} 
          className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onProductClick?.(product.productId, product.productName)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onProductClick?.(product.productId, product.productName);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`View details for product ${product.productName}`}
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
              <span>{product.unitssold} {REVENUE_DASHBOARD_TEXT.TABLES.UNITS_SOLD}</span>
              <span>{REVENUE_DASHBOARD_TEXT.TABLES.AVERAGE_PRICE}: {formatCurrency(product.averagePrice)}</span>
              <span>{REVENUE_DASHBOARD_TEXT.TABLES.PROFIT_MARGIN}: {product.profitMargin}%</span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xl font-bold">{formatCurrency(product.totalSales)}</p>
            <p className="text-sm text-primary">
              +{formatCurrency(product.totalSales * (product.profitMargin / 100))} {REVENUE_DASHBOARD_TEXT.TABLES.PROFIT}
            </p>
          </div>
        </div>
      ))}
      {!showAll && products.length > 5 && (
        <div className="text-center text-sm text-muted-foreground py-2">
          {REVENUE_DASHBOARD_TEXT.TABLES.SHOWING_COUNT(5, products.length)} products
        </div>
      )}
    </div>
  );
}

export default function ServiceProviderRevenueDashboard() {
  const { formatCurrency } = useCurrency();
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
  };

  const handleViewAllClients = () => {
    setShowAllClients(!showAllClients);
  };

  const handleViewAllProducts = () => {
    setShowAllProducts(!showAllProducts);
  };

  const handleClientClick = (clientId: string, clientName: string) => {
    // TODO: Navigate to detailed client revenue page
    // router.push(`/service-provider/clients/${clientId}/revenue`);
  };

  const handleProductClick = (productId: string, productName: string) => {
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
            <div className="w-64 h-4 bg-primary/20 rounded animate-pulse mt-2" />
          </div>
          <div className="flex gap-2">
            <div className="w-32 h-10 bg-primary/20 rounded animate-pulse" />
            <div className="w-24 h-10 bg-primary/20 rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-primary/10 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-primary/10 rounded-lg animate-pulse" />
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
        <h3 className="text-lg font-semibold mb-2 text-red-700">{REVENUE_DASHBOARD_TEXT.ERRORS.DATA_UNAVAILABLE}</h3>
        <p className="text-muted-foreground mb-4">
          {REVENUE_DASHBOARD_TEXT.ERRORS.UNABLE_TO_LOAD}
        </p>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {REVENUE_DASHBOARD_TEXT.ACTIONS.REFRESH_DATA}
        </Button>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-8" role="main" aria-label={REVENUE_DASHBOARD_TEXT.TITLE}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-primary" />
              {REVENUE_DASHBOARD_TEXT.TITLE}
            </h2>
            <p className="text-muted-foreground mt-1">
              {REVENUE_DASHBOARD_TEXT.SUBTITLE}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40" aria-label="Select time range for revenue data">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">{REVENUE_DASHBOARD_TEXT.TIME_PERIODS.MONTHLY}</SelectItem>
                <SelectItem value="quarterly">{REVENUE_DASHBOARD_TEXT.TIME_PERIODS.QUARTERLY}</SelectItem>
                <SelectItem value="yearly">{REVENUE_DASHBOARD_TEXT.TIME_PERIODS.YEARLY}</SelectItem>
                <SelectItem value="all-time">{REVENUE_DASHBOARD_TEXT.TIME_PERIODS.ALL_TIME}</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={isLoading}
              aria-label={`${REVENUE_DASHBOARD_TEXT.ACTIONS.REFRESH} revenue data`}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} aria-hidden="true" />
              {REVENUE_DASHBOARD_TEXT.ACTIONS.REFRESH}
            </Button>
            
            <Button 
              onClick={handleExport}
              aria-label="Export revenue report data"
            >
              <Download className="h-4 w-4 mr-2" aria-hidden="true" />
              {REVENUE_DASHBOARD_TEXT.ACTIONS.EXPORT_REPORT}
            </Button>
          </div>
        </div>

        {/* Revenue Metrics */}
        <section aria-label="Revenue metrics overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" role="group" aria-label="Key revenue metrics">
          <RevenueCard
            title={`Revenue (${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)})`}
            value={getCurrentRevenue()}
            change={getCurrentGrowth()}
            period={`vs last ${timeRange.replace('-time', '').replace('ly', '')}`}
            icon={<DollarSign className="h-6 w-6" />}
            isLoading={isLoading}
          />
          
          <RevenueCard
            title={REVENUE_DASHBOARD_TEXT.METRICS.AVERAGE_ORDER_VALUE}
            value={formatCurrency(revenueData.metrics.averageOrderValue)}
            change={12.5}
            period={REVENUE_DASHBOARD_TEXT.TIME_LABELS.VS_LAST_MONTH}
            icon={<ShoppingCart className="h-6 w-6" />}
          />
          
          <RevenueCard
            title={REVENUE_DASHBOARD_TEXT.METRICS.ACTIVE_BOOSTS}
            value={revenueData.metrics.activeBoosts}
            change={8.3}
            period={REVENUE_DASHBOARD_TEXT.TIME_LABELS.VS_LAST_MONTH}
            icon={<Rocket className="h-6 w-6" />}
          />
          
          <RevenueCard
            title={REVENUE_DASHBOARD_TEXT.METRICS.CLIENT_RETENTION}
            value={`${revenueData.metrics.clientRetentionRate}%`}
            change={2.1}
            period={REVENUE_DASHBOARD_TEXT.TIME_LABELS.VS_LAST_QUARTER}
            icon={<Users className="h-6 w-6" />}
          />
          </div>
        </section>

        {/* Revenue Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                {REVENUE_DASHBOARD_TEXT.CHARTS.REVENUE_TRENDS}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleRevenueChart 
                data={revenueData.revenueTimeline} 
                title={REVENUE_DASHBOARD_TEXT.CHARTS.REVENUE_TRENDS}
                type="trend"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                {REVENUE_DASHBOARD_TEXT.CHARTS.REVENUE_BY_CATEGORY}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleRevenueChart 
                data={[]}
                title={REVENUE_DASHBOARD_TEXT.CHARTS.REVENUE_BY_CATEGORY}
                type="category"
              />
            </CardContent>
          </Card>
        </div>

        {/* Revenue Tables */}
        <section aria-label="Revenue data tables">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {REVENUE_DASHBOARD_TEXT.TABLES.TOP_CLIENTS}
                </div>
                <Button variant="ghost" size="sm" onClick={handleViewAllClients}>
                  <Eye className="h-4 w-4 mr-2" />
                  {showAllClients ? REVENUE_DASHBOARD_TEXT.TABLES.SHOW_LESS : REVENUE_DASHBOARD_TEXT.TABLES.VIEW_ALL}
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
                  {REVENUE_DASHBOARD_TEXT.TABLES.TOP_PRODUCTS}
                </div>
                <Button variant="ghost" size="sm" onClick={handleViewAllProducts}>
                  <Eye className="h-4 w-4 mr-2" />
                  {showAllProducts ? REVENUE_DASHBOARD_TEXT.TABLES.SHOW_LESS : REVENUE_DASHBOARD_TEXT.TABLES.VIEW_ALL}
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
        </section>

        {/* Quick Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {REVENUE_DASHBOARD_TEXT.INSIGHTS.HEADER}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={cn("text-center p-4 rounded-lg", SEMANTIC_COLORS.INSIGHTS.GROWING)}>
                <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                <h4 className="font-semibold">{REVENUE_DASHBOARD_TEXT.INSIGHTS.GROWING_SEGMENTS}</h4>
                <p className="text-sm mt-1">
                  {REVENUE_DASHBOARD_TEXT.INSIGHTS.GROWING_SEGMENTS_DESC}
                </p>
              </div>
              
              <div className={cn("text-center p-4 rounded-lg", SEMANTIC_COLORS.INSIGHTS.PERFORMING)}>
                <Target className="h-8 w-8 mx-auto mb-2" />
                <h4 className="font-semibold">{REVENUE_DASHBOARD_TEXT.INSIGHTS.BEST_PERFORMERS}</h4>
                <p className="text-sm mt-1">
                  {REVENUE_DASHBOARD_TEXT.INSIGHTS.BEST_PERFORMERS_DESC}
                </p>
              </div>
              
              <div className={cn("text-center p-4 rounded-lg", SEMANTIC_COLORS.INSIGHTS.HEALTH)}>
                <Users className="h-8 w-8 mx-auto mb-2" />
                <h4 className="font-semibold">{REVENUE_DASHBOARD_TEXT.INSIGHTS.CLIENT_HEALTH}</h4>
                <p className="text-sm mt-1">
                  {REVENUE_DASHBOARD_TEXT.INSIGHTS.CLIENT_HEALTH_DESC}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}