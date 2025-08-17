"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart2, 
  Mail, 
  Smartphone, 
  Globe2, 
  PauseCircle, 
  Archive, 
  RefreshCcw, 
  AlertCircle, 
  Edit, 
  Eye,
  Target,
  TrendingUp,
  Users,
  Activity,
  Search,
  Grid,
  List,
  Filter,
  MoreHorizontal,
  Plus,
  Calendar,
  Clock,
  DollarSign,
  User
} from "lucide-react";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import DeleteCampaign from '@/components/Campaign/DeleteCampaign';

// Campaign type definition
type CampaignStatus = "Scheduled" | "Sent" | "Draft" | "Paused" | "Archived";
type CampaignChannel = "Email" | "SMS" | "Social" | "Push";

interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  sentDate: string | null;
  openRate: string | null;
  channel?: CampaignChannel;
  audience?: string;
  createdAt: string;
  clientName?: string | null;
  clientId?: string | null;
  organizationId?: string;
  organizationName?: string | null;
  projectId?: string | null;
  projectName?: string | null;
}

// Badge color map
const statusBadgeMap: Record<CampaignStatus, string> = {
  Scheduled: "bg-blue-100 text-blue-800",
  Sent: "bg-green-100 text-green-800",
  Draft: "bg-yellow-100 text-yellow-900",
  Paused: "bg-orange-100 text-orange-700",
  Archived: "bg-gray-100 text-gray-600"
};

const channelIcons: Record<CampaignChannel, JSX.Element> = {
  Email: <Mail className="h-4 w-4 inline-block" />,
  SMS: <Smartphone className="h-4 w-4 inline-block" />,
  Social: <Globe2 className="h-4 w-4 inline-block" />,
  Push: <PauseCircle className="h-4 w-4 inline-block" />,
};

function prettyDate(d: string | null) {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// Helper function to map status to badge variant
function getStatusVariant(status: CampaignStatus): "default" | "secondary" | "destructive" | "outline" {
  const statusMap: Record<CampaignStatus, "default" | "secondary" | "destructive" | "outline"> = {
    'Draft': 'outline',
    'Scheduled': 'secondary',
    'Sent': 'default',
    'Paused': 'outline',
    'Archived': 'outline'
  };
  return statusMap[status];
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  
  // Search and filter states
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Helper function to map database status to UI status (with defensive fallback)
  function mapDatabaseStatusToUI(status: string): CampaignStatus {
    const statusMap: Record<string, CampaignStatus> = {
      'draft': 'Draft',
      'active': 'Scheduled',
      'completed': 'Sent',
      'paused': 'Paused',
      'archived': 'Archived'
    };
    
    if (status in statusMap) {
      return statusMap[status];
    } else {
      // Unknown status - defensive fallback
      return 'Draft'; // fallback to Draft
    }
  }

  // Helper function to validate channel
  function validateChannel(channel: string): CampaignChannel {
    const validChannels: CampaignChannel[] = ['Email', 'SMS', 'Social', 'Push'];
    return validChannels.includes(channel as CampaignChannel) 
      ? (channel as CampaignChannel) 
      : 'Email';
  }

  // Metric Card Component
  interface MetricCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ReactNode;
    change?: number;
    isLoading?: boolean;
  }

  function MetricCard({ title, value, description, icon, change, isLoading }: MetricCardProps) {
    // Color patterns matching project management page
    const getStyles = (title: string) => {
      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes('total') || lowerTitle.includes('campaigns')) {
        return {
          iconBg: 'p-3 bg-primary/10 rounded-full',
          iconColor: 'h-6 w-6 text-primary',
          numberColor: 'text-3xl font-bold text-primary'
        };
      } else if (lowerTitle.includes('active')) {
        return {
          iconBg: 'p-3 bg-blue-100 rounded-full',
          iconColor: 'h-6 w-6 text-blue-600',
          numberColor: 'text-3xl font-bold text-blue-600'
        };
      } else if (lowerTitle.includes('success') || lowerTitle.includes('rate')) {
        return {
          iconBg: 'p-3 bg-green-100 rounded-full',
          iconColor: 'h-6 w-6 text-green-600',
          numberColor: 'text-3xl font-bold text-green-600'
        };
      } else if (lowerTitle.includes('reach') || lowerTitle.includes('audience')) {
        return {
          iconBg: 'p-3 bg-orange-100 rounded-full',
          iconColor: 'h-6 w-6 text-orange-600',
          numberColor: 'text-3xl font-bold text-orange-600'
        };
      } else {
        return {
          iconBg: 'p-3 bg-primary/10 rounded-full',
          iconColor: 'h-6 w-6 text-primary',
          numberColor: 'text-3xl font-bold'
        };
      }
    };

    const styles = getStyles(title);

    if (isLoading) {
      return (
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className={styles.numberColor}>{typeof value === 'number' ? value.toLocaleString() : value}</p>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
              {change !== undefined && (
                <div className={`flex items-center text-xs ${
                  change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {change >= 0 ? '+' : ''}{change.toFixed(1)}% from last month
                </div>
              )}
            </div>
            <div className={styles.iconBg}>
              <div className={styles.iconColor}>
                {icon}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fetch campaign statistics with memoization
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/campaigns/stats", {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      // Failed to fetch campaign stats - silently handle
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch("/api/campaigns", {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        let errorMessage = `Server responded with status: ${res.status}`;
        
        try {
          const errorData = await res.json();
          
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
            if (errorData.details) {
              errorMessage += `: ${errorData.details}`;
            }
          }
        } catch (parseError) {
          // Failed to parse error response
        }
        
        throw new Error(errorMessage);
      }
      
      // Check if the response is valid JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API response is not valid JSON');
      }
      
      const data = await res.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from API');
      }
      
      // Transform the data to match the Campaign interface
      const transformedData: Campaign[] = data.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        status: mapDatabaseStatusToUI(campaign.status),
        sentDate: campaign.sentDate || null,
        openRate: campaign.openRate || null,
        channel: validateChannel(campaign.channel || 'Email'),
        audience: campaign.audience || 'All Users',
        createdAt: campaign.createdAt,
        clientName: campaign.client?.name || campaign.clientName || null,
        clientId: campaign.clientId || null,
        organizationId: campaign.organizationId,
        organizationName: campaign.organization?.name || null,
        projectId: campaign.projectId,
        projectName: campaign.project?.name || null
      }));
      
      setCampaigns(transformedData);
      setLoading(false);
    } catch (err: any) {
      const errorMessage = err.message || "Unable to load campaign data. Please try again later.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  // Handle refresh with memoization
  const handleRefresh = useCallback(() => {
    fetchCampaigns();
    fetchStats();
  }, [fetchStats]);

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns;
    
    // Search filter
    if (search.trim()) {
      const term = search.toLowerCase().trim();
      filtered = filtered.filter(campaign => 
        campaign.name.toLowerCase().includes(term) ||
        campaign.audience?.toLowerCase().includes(term) ||
        campaign.clientName?.toLowerCase().includes(term)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(campaign => 
        campaign.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Channel filter
    if (channelFilter !== 'all') {
      filtered = filtered.filter(campaign => 
        campaign.channel?.toLowerCase() === channelFilter.toLowerCase()
      );
    }
    
    return filtered;
  }, [search, campaigns, statusFilter, channelFilter]);

  useEffect(() => {
    fetchCampaigns();
    fetchStats();
  }, []);

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Target className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Campaigns
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Create and manage your marketing campaigns across all channels and platforms.
        </p>
      </div>

      <div className="flex items-center justify-end gap-2 mb-8">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || statsLoading}
          >
            <RefreshCcw className={cn("mr-2 h-4 w-4", (loading || statsLoading) && "animate-spin")} />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Campaign Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Campaigns"
          value={stats?.totalCampaigns || 0}
          description="All campaigns"
          icon={<Target className="h-5 w-5" />}
          change={stats?.campaignGrowth}
          isLoading={statsLoading}
        />
        <MetricCard
          title="Active Campaigns"
          value={stats?.activeCampaigns || 0}
          description={`${stats?.activePercentage || 0}% of total`}
          icon={<Activity className="h-5 w-5" />}
          isLoading={statsLoading}
        />
        <MetricCard
          title="Success Rate"
          value={`${stats?.successRate || 0}%`}
          description="Campaign completion"
          icon={<TrendingUp className="h-5 w-5" />}
          isLoading={statsLoading}
        />
        <MetricCard
          title="Estimated Reach"
          value={stats?.estimatedReach || 0}
          description="Total audience"
          icon={<Users className="h-5 w-5" />}
          isLoading={statsLoading}
        />
      </div>
      
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search campaigns by name, audience, or client..."
                className="flex-1 h-8"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-2 border-0 rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-2 border-0 rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Loading State */}
      {loading && (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "space-y-2"
        )}>
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-6" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Unable to load campaigns</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Empty State */}
      {!loading && !error && filteredCampaigns.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-muted rounded-full">
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              {campaigns.length === 0 
                ? "Get started by creating your first campaign to reach your audience."
                : "No campaigns match your current search criteria. Try adjusting your filters or search terms."
              }
            </p>
            {campaigns.length === 0 ? (
              <Button asChild>
                <Link href="/campaigns/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Campaign
                </Link>
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="outline" onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setChannelFilter('all');
                }}>
                  Clear Filters
                </Button>
                <Button asChild>
                  <Link href="/campaigns/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Campaign
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Campaign Cards/List */}
      {!loading && !error && filteredCampaigns.length > 0 && (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "space-y-2"
        )}>
          {filteredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
}

// Campaign Card Component
interface CampaignCardProps {
  campaign: Campaign;
  viewMode: 'grid' | 'list';
}

const CampaignCard = memo(function CampaignCard({ campaign, viewMode }: CampaignCardProps) {
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4" style={{ 
        borderLeftColor: campaign.status === 'Sent' ? '#22c55e' : 
                         campaign.status === 'Scheduled' ? '#3b82f6' :
                         campaign.status === 'Draft' ? '#f59e0b' :
                         campaign.status === 'Paused' ? '#f97316' : '#6b7280'
      }}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary border">
                  {channelIcons[campaign.channel || 'Email'] || <Mail className="h-4 w-4" />}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="mb-1">
                  <Link 
                    href={`/campaigns/analytics/${campaign.id}`} 
                    className="font-semibold hover:text-primary transition-colors block truncate"
                    title={campaign.name}
                  >
                    {campaign.name}
                  </Link>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <Badge variant={getStatusVariant(campaign.status)} className="text-xs px-1.5 py-0.5 whitespace-nowrap">
                      {campaign.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5 whitespace-nowrap">
                      {campaign.channel || 'Email'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 truncate">
                    <Users className="h-3 w-3" />
                    {campaign.audience || 'All Users'}
                  </span>
                  {campaign.clientName && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {campaign.clientName}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {prettyDate(campaign.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {campaign.openRate && (
                <span className="text-sm text-muted-foreground">
                  {campaign.openRate} open rate
                </span>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/campaigns/analytics/${campaign.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Analytics
                    </Link>
                  </DropdownMenuItem>
                  {campaign.status === 'Draft' && (
                    <DropdownMenuItem asChild>
                      <Link href={`/campaigns/edit/${campaign.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Campaign
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Grid view
  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-l-4" style={{ 
      borderLeftColor: campaign.status === 'Sent' ? '#22c55e' : 
                       campaign.status === 'Scheduled' ? '#3b82f6' :
                       campaign.status === 'Draft' ? '#f59e0b' :
                       campaign.status === 'Paused' ? '#f97316' : '#6b7280'
    }}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <Link 
                href={`/campaigns/analytics/${campaign.id}`}
                className="font-semibold text-sm hover:text-primary transition-colors block truncate group-hover:text-primary"
                title={campaign.name}
              >
                {campaign.name}
              </Link>
              <p className="text-xs text-muted-foreground mt-1">
                {campaign.audience || 'All Users'}
              </p>
            </div>
            <div className="flex-shrink-0 ml-2">
              {channelIcons[campaign.channel || 'Email'] || <Mail className="h-4 w-4 text-muted-foreground" />}
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={getStatusVariant(campaign.status)} className="text-xs">
              {campaign.status}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {campaign.channel || 'Email'}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {campaign.clientName && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span className="truncate">{campaign.clientName}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {prettyDate(campaign.sentDate || campaign.createdAt)}
              </span>
              {campaign.openRate && (
                <span>{campaign.openRate}</span>
              )}
            </div>
            
            <div className="flex items-center gap-1 pt-1">
              <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs">
                <Link href={`/campaigns/analytics/${campaign.id}`}>
                  <Eye className="h-3 w-3 mr-1" />
                  Analytics
                </Link>
              </Button>
              {campaign.status === 'Draft' && (
                <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs">
                  <Link href={`/campaigns/edit/${campaign.id}`}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

