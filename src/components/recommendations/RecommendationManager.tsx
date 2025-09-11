'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Search,
  Filter,
  RefreshCcw,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  Star,
  Target,
  ArrowRight,
  Settings,
  BarChart3,
  Zap,
  Network,
  Mail,
  Globe,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  MoreHorizontal
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Types and services
import {
  Newsletter,
  NewsletterRecommendation,
  RecommendationStatus,
  RecommendationType,
  RecommendationManagerProps,
  CreateRecommendationRequest,
  RecommendationNetworkMetrics,
  RecommendationMatch
} from '@/types/recommendation';
import { cn } from '@/lib/utils';

// Status badge styles
const statusBadge = {
  ACTIVE: "bg-green-100 text-green-800",
  PAUSED: "bg-yellow-100 text-yellow-800",
  ENDED: "bg-gray-100 text-gray-800",
  PENDING_APPROVAL: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800"
} as const;

const typeBadge = {
  MUTUAL: "bg-purple-100 text-purple-800",
  ONE_WAY: "bg-blue-100 text-blue-800",
  SPONSORED: "bg-orange-100 text-orange-800"
} as const;

// Helper functions
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function formatPercentage(value: number): string {
  return `${Math.round(value * 100) / 100}%`;
}

function formatNumber(value: number): string {
  return value.toLocaleString();
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  change?: number;
  isLoading?: boolean;
  compact?: boolean;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

function MetricCard({ title, value, description, icon, change, isLoading, compact = false, color = 'blue' }: MetricCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className={cn("p-6", compact && "p-4")}>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className={cn("p-6", compact && "p-4")}>
        <div className="flex items-center justify-between">
          <div>
            <p className={cn("text-sm font-medium text-muted-foreground", compact && "text-xs")}>
              {title}
            </p>
            <p className={cn("text-3xl font-bold", compact && "text-xl")}>
              {typeof value === 'number' ? formatNumber(value) : value}
            </p>
            {change !== undefined && (
              <div className={cn(
                "flex items-center text-xs font-medium mt-1",
                change >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                <TrendingUp className={cn(
                  "mr-1 h-3 w-3",
                  change < 0 && "rotate-180"
                )} />
                {change >= 0 ? '+' : ''}{change}%
              </div>
            )}
            {description && !compact && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={cn("p-3 bg-primary/10 rounded-full", compact && "p-2")}>
            <div className={cn("h-6 w-6", compact && "h-4 w-4", colorClasses[color])}>
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Newsletter Card Component
interface NewsletterCardProps {
  newsletter: Newsletter;
  onEdit?: (newsletter: Newsletter) => void;
  onCreateRecommendation?: (newsletter: Newsletter) => void;
  compact?: boolean;
}

function NewsletterCard({ newsletter, onEdit, onCreateRecommendation, compact = false }: NewsletterCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className={cn("p-4", compact && "p-3")}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate" title={newsletter.title}>
              {newsletter.title}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {newsletter.client?.name || newsletter.organizationId}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(newsletter)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Newsletter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateRecommendation?.(newsletter)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Recommendation
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Eye className="h-4 w-4 mr-2" />
                View Analytics
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          {/* Categories */}
          <div className="flex flex-wrap gap-1">
            {newsletter.categories.slice(0, compact ? 2 : 3).map((category) => (
              <Badge key={category} variant="secondary" className="text-xs">
                {category}
              </Badge>
            ))}
            {newsletter.categories.length > (compact ? 2 : 3) && (
              <Badge variant="secondary" className="text-xs">
                +{newsletter.categories.length - (compact ? 2 : 3)}
              </Badge>
            )}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {formatNumber(newsletter.subscriberCount)} subscribers
            </div>
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {formatPercentage(newsletter.averageOpenRate)} open rate
            </div>
          </div>

          {/* Recommendations count */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Network className="h-3 w-3" />
              <span>
                {newsletter.outgoingRecommendations?.length || 0} outgoing
              </span>
              <ArrowRight className="h-3 w-3" />
              <span>
                {newsletter.incomingRecommendations?.length || 0} incoming
              </span>
            </div>
            
            <Badge
              variant={newsletter.isActiveForRecommendations ? 'default' : 'secondary'}
              className="text-xs"
            >
              {newsletter.isActiveForRecommendations ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Recommendation Card Component
interface RecommendationCardProps {
  recommendation: NewsletterRecommendation;
  onStatusChange?: (recommendation: NewsletterRecommendation, status: RecommendationStatus) => void;
  onEdit?: (recommendation: NewsletterRecommendation) => void;
  onDelete?: (recommendation: NewsletterRecommendation) => void;
  compact?: boolean;
}

function RecommendationCard({ 
  recommendation, 
  onStatusChange, 
  onEdit, 
  onDelete, 
  compact = false 
}: RecommendationCardProps) {
  const averagePerformance = recommendation.performance?.length 
    ? recommendation.performance.reduce((sum, p) => sum + p.conversionRate, 0) / recommendation.performance.length
    : 0;

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className={cn("p-4", compact && "p-3")}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={cn("text-xs", statusBadge[recommendation.status])}>
                {recommendation.status}
              </Badge>
              <Badge className={cn("text-xs", typeBadge[recommendation.type])}>
                {recommendation.type}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium truncate">
                  {recommendation.fromNewsletter?.title}
                </span>
                <ArrowRight className="h-3 w-3 flex-shrink-0" />
                <span className="font-medium truncate">
                  {recommendation.toNewsletter?.title}
                </span>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Priority: {recommendation.priority}/10 • 
                Overlap: {formatPercentage(recommendation.targetAudienceOverlap)} • 
                Reach: {formatNumber(recommendation.estimatedReach)}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {recommendation.status === RecommendationStatus.ACTIVE && (
                <DropdownMenuItem 
                  onClick={() => onStatusChange?.(recommendation, RecommendationStatus.PAUSED)}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </DropdownMenuItem>
              )}
              {recommendation.status === RecommendationStatus.PAUSED && (
                <DropdownMenuItem 
                  onClick={() => onStatusChange?.(recommendation, RecommendationStatus.ACTIVE)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit?.(recommendation)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete?.(recommendation)}>
                <Trash2 className="h-4 w-4 mr-2" />
                End Recommendation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Performance metrics */}
        {!compact && recommendation.performance && recommendation.performance.length > 0 && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="font-medium">{formatPercentage(averagePerformance)}</div>
              <div className="text-muted-foreground">Conversion</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="font-medium">
                {formatNumber(recommendation.performance.reduce((sum, p) => sum + p.clicks, 0))}
              </div>
              <div className="text-muted-foreground">Clicks</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <div className="font-medium">
                {formatNumber(recommendation.performance.reduce((sum, p) => sum + p.conversions, 0))}
              </div>
              <div className="text-muted-foreground">Conversions</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t mt-3">
          <span className="text-xs text-muted-foreground">
            Created {formatDate(recommendation.createdAt)}
          </span>
          {recommendation.endDate && (
            <span className="text-xs text-muted-foreground">
              Ends {formatDate(recommendation.endDate)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Main RecommendationManager Component
export function RecommendationManager({
  organizationId,
  mode = 'full',
  showMetrics = true,
  showRecommendations = true,
  showMatches = true,
  maxRecommendations = 12,
  onRecommendationCreate,
  onRecommendationUpdate,
  className
}: RecommendationManagerProps) {
  // State
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [recommendations, setRecommendations] = useState<NewsletterRecommendation[]>([]);
  const [matches, setMatches] = useState<RecommendationMatch[]>([]);
  const [metrics, setMetrics] = useState<RecommendationNetworkMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);

  const router = useRouter();
  const isEmbedded = mode === 'embedded';

  // Data fetching
  const fetchData = useCallback(async () => {
    if (!organizationId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch newsletters
      const newslettersRes = await fetch(`/api/recommendations/newsletters?organizationId=${organizationId}`);
      if (newslettersRes.ok) {
        const newslettersData = await newslettersRes.json();
        setNewsletters(newslettersData.data || []);
      }

      // Fetch recommendations
      const recommendationsRes = await fetch(`/api/recommendations/manage?organizationId=${organizationId}`);
      if (recommendationsRes.ok) {
        const recommendationsData = await recommendationsRes.json();
        setRecommendations(recommendationsData.data || []);
      }

      // Fetch metrics if needed
      if (showMetrics && !metricsLoading) {
        setMetricsLoading(true);
        // Placeholder metrics - would come from actual API
        setMetrics({
          totalNewsletters: newsletters.length,
          activeRecommendations: recommendations.filter(r => r.status === RecommendationStatus.ACTIVE).length,
          totalConversions: 1250,
          averageConversionRate: 3.2,
          totalRevenue: 15600,
          networkReach: 45000,
          topPerformingRecommendations: [],
          monthlyGrowth: 12.5,
          qualityScore: 4.2
        });
        setMetricsLoading(false);
      }
    } catch (err: any) {
      console.error("Failed to load recommendation data:", err);
      setError(err.message || "Unable to load recommendation data");
    } finally {
      setLoading(false);
    }
  }, [organizationId, showMetrics, newsletters.length, recommendations.length, metricsLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtering
  const filteredRecommendations = useMemo(() => {
    let filtered = recommendations;

    // Text search
    const term = search.trim().toLowerCase();
    if (term) {
      filtered = filtered.filter(rec =>
        rec.fromNewsletter?.title.toLowerCase().includes(term) ||
        rec.toNewsletter?.title.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(rec => rec.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(rec => rec.type === typeFilter);
    }

    // Limit for embedded mode
    if (isEmbedded && maxRecommendations) {
      filtered = filtered.slice(0, maxRecommendations);
    }

    return filtered;
  }, [search, recommendations, statusFilter, typeFilter, isEmbedded, maxRecommendations]);

  // Handlers
  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateRecommendation = useCallback((newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
    setShowCreateDialog(true);
  }, []);

  const handleStatusChange = useCallback(async (
    recommendation: NewsletterRecommendation, 
    status: RecommendationStatus
  ) => {
    try {
      const res = await fetch(`/api/recommendations/manage?id=${recommendation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        const updatedRecommendation = await res.json();
        setRecommendations(prev => 
          prev.map(r => r.id === recommendation.id ? updatedRecommendation : r)
        );
        onRecommendationUpdate?.(updatedRecommendation);
      }
    } catch (_error) {
      console.error("", _error);
    }
  }, [onRecommendationUpdate]);

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {/* Header */}
        {!isEmbedded && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Network className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">Recommendation Network</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh} 
                disabled={loading}
              >
                <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Refresh
              </Button>
              <Button asChild size="sm">
                <div onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Recommendation
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Metrics */}
        {showMetrics && (
          <div className={cn(
            "grid gap-4",
            isEmbedded ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}>
            <MetricCard
              title="Active Recommendations"
              value={metrics?.activeRecommendations || 0}
              icon={<Zap className="h-6 w-6" />}
              isLoading={metricsLoading}
              compact={isEmbedded}
              color="blue"
            />
            <MetricCard
              title="Total Conversions"
              value={metrics?.totalConversions || 0}
              icon={<Target className="h-6 w-6" />}
              change={metrics?.monthlyGrowth}
              isLoading={metricsLoading}
              compact={isEmbedded}
              color="green"
            />
            <MetricCard
              title="Network Reach"
              value={metrics?.networkReach || 0}
              icon={<Users className="h-6 w-6" />}
              isLoading={metricsLoading}
              compact={isEmbedded}
              color="purple"
            />
            <MetricCard
              title="Quality Score"
              value={`${metrics?.qualityScore || 0}/5`}
              icon={<Star className="h-6 w-6" />}
              isLoading={metricsLoading}
              compact={isEmbedded}
              color="orange"
            />
          </div>
        )}

        {/* Search and Filters */}
        {showRecommendations && !isEmbedded && (
          <div className="bg-muted/30 p-4 rounded-lg space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search recommendations..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-background"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-background">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Pending</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px] bg-background">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="MUTUAL">Mutual</SelectItem>
                  <SelectItem value="ONE_WAY">One Way</SelectItem>
                  <SelectItem value="SPONSORED">Sponsored</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <div className="p-2 bg-destructive/10 rounded-full">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Failed to load recommendations</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button variant="outline" onClick={handleRefresh} disabled={loading}>
                <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !error && filteredRecommendations.length === 0 && showRecommendations && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-muted rounded-full">
                  <Network className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">No recommendations found</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                {recommendations.length === 0 
                  ? "Get started by creating your first newsletter recommendation."
                  : "No recommendations match your current filters."
                }
              </p>
              {!isEmbedded && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Recommendation
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recommendations Grid */}
        {!loading && !error && showRecommendations && filteredRecommendations.length > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRecommendations.map((recommendation) => (
                <RecommendationCard 
                  key={recommendation.id} 
                  recommendation={recommendation}
                  onStatusChange={handleStatusChange}
                  compact={isEmbedded}
                />
              ))}
            </div>
            
            {isEmbedded && recommendations.length > maxRecommendations && (
              <div className="text-center">
                <Button variant="outline" onClick={() => router.push('/recommendations')}>
                  View All Recommendations ({recommendations.length})
                </Button>
              </div>
            )}
          </>
        )}

        {/* Newsletters Section (for creating recommendations) */}
        {!isEmbedded && newsletters.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Newsletters</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {newsletters.slice(0, 6).map((newsletter) => (
                <NewsletterCard 
                  key={newsletter.id} 
                  newsletter={newsletter}
                  onCreateRecommendation={handleCreateRecommendation}
                />
              ))}
            </div>
          </div>
        )}

        {/* Create Recommendation Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Recommendation</DialogTitle>
              <DialogDescription>
                Set up a cross-promotion between newsletters to grow your audience.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="source-newsletter">From Newsletter</Label>
                <Select defaultValue={selectedNewsletter?.id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source newsletter" />
                  </SelectTrigger>
                  <SelectContent>
                    {newsletters.map((newsletter) => (
                      <SelectItem key={newsletter.id} value={newsletter.id}>
                        {newsletter.title} ({formatNumber(newsletter.subscriberCount)} subscribers)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target-newsletter">To Newsletter</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Search and select target newsletter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placeholder">Search results will appear here</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Recommendation Type</Label>
                  <Select defaultValue="ONE_WAY">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ONE_WAY">One Way</SelectItem>
                      <SelectItem value="MUTUAL">Mutual</SelectItem>
                      <SelectItem value="SPONSORED">Sponsored</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority (1-10)</Label>
                  <Select defaultValue="5">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(10)].map((_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea 
                  id="notes"
                  placeholder="Add any additional notes about this recommendation..."
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Handle create recommendation
                setShowCreateDialog(false);
              }}>
                Create Recommendation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

export default RecommendationManager;