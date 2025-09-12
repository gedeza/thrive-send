"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Users, Globe, Facebook, Twitter, Instagram, Linkedin, Mail, User, RefreshCcw, TrendingUp, Building2, Activity, CheckCircle2, Search, Grid, List, Filter, MoreHorizontal, Edit, Eye, MapPin, Trash2 } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useServiceProvider, type ClientSummary } from '@/context/ServiceProviderContext';
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";
import { getDisplayableId } from '@/lib/enhanced-models';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientsErrorBoundary } from "@/components/clients/ClientsErrorBoundary";
import { ClientSkeletonGrid, MetricSkeletonCard } from "@/components/clients/ClientSkeletonGrid";
import { ClientPerformanceRankings } from "@/components/clients/ClientPerformanceRankings";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types
type ClientType = "MUNICIPALITY" | "BUSINESS" | "STARTUP" | "INDIVIDUAL" | "NONPROFIT";
type ClientStatus = "active" | "inactive";
type SocialAccount = {
  id: string;
  platform: "FACEBOOK" | "TWITTER" | "INSTAGRAM" | "LINKEDIN";
  handle: string;
};
type Project = {
  id: string;
  name: string;
  status: "ACTIVE" | "PLANNED" | "COMPLETED";
};
interface ClientAccount {
  id: string;
  displayId?: string | null; // User-friendly display ID
  name: string;
  organizationId: string; // Service provider org ID
  email: string;
  type: ClientType;
  status: ClientStatus;
  industry: string;
  website?: string;
  logoUrl?: string;
  createdAt: string;
  
  // Service provider specific fields
  performanceScore: number; // 0-100
  assignedTeamMembers?: TeamMemberAssignment[];
  primaryManager?: string;
  monthlyBudget?: number;
  lastActivity: string;
  
  // Legacy fields for compatibility
  socialAccounts: SocialAccount[];
  projects: Project[];
}

interface TeamMemberAssignment {
  userId: string;
  userName: string;
  role: 'manager' | 'creator' | 'reviewer' | 'analyst';
  permissions: string[];
  assignedAt: string;
}

interface ServiceProviderClientStats {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  clientGrowth: number;
  averagePerformanceScore: number;
  topPerformingClients: ClientAccount[];
  clientsByType: Record<string, number>;
  clientsByStatus: Record<string, number>;
  projects: {
    total: number;
    active: number;
    completed: number;
    completionRate: number;
  };
}

// Badge coloring for client types
const typeBadge = {
  MUNICIPALITY: "bg-warning/10 text-warning",
  BUSINESS: "bg-primary/10 text-primary",
  STARTUP: "bg-primary/10 text-primary",
  INDIVIDUAL: "bg-muted/10 text-muted-foreground",
  NONPROFIT: "bg-success/10 text-success"
} as const;

// Icon mapping for social platforms
const platformIconMap: Record<string, JSX.Element> = {
  FACEBOOK: <Facebook className="h-3 w-3" />,
  TWITTER: <Twitter className="h-3 w-3" />,
  INSTAGRAM: <Instagram className="h-3 w-3" />,
  LINKEDIN: <Linkedin className="h-3 w-3" />
};

function getInitials(name: string) {
  const words = name.split(" ");
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function formatDate(dateString?: string) {
  if (!dateString) return "—";
  try {
    // Use a fixed locale for consistent SSR/CSR output!
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateString;
  }
}

// Metric card component
interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  change?: number;
  isLoading?: boolean;
  trend?: 'up' | 'down' | 'neutral';
}

function MetricCard({ title, value, description, icon, change, isLoading, trend = 'neutral' }: MetricCardProps) {
  // Get styles based on title for color-coded theming - Enhanced Minimalist
  const getStyles = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('total') || lowerTitle.includes('clients')) {
      return {
        cardBorder: 'card-enhanced border-l-2 border-primary/20 bg-card',
        iconBg: 'p-3 bg-primary/10 rounded-lg border border-primary/20',
        iconColor: 'h-6 w-6 text-primary',
        numberColor: 'text-2xl font-bold text-primary tracking-tight',
        changeColor: 'bg-primary/10 text-primary border border-primary/20',
        category: 'Client Growth'
      };
    } else if (lowerTitle.includes('active') || lowerTitle.includes('activity')) {
      return {
        cardBorder: 'card-enhanced border-l-2 border-success/20 bg-card',
        iconBg: 'p-3 bg-success/10 rounded-lg border border-success/20',
        iconColor: 'h-6 w-6 text-success',
        numberColor: 'text-2xl font-bold text-success tracking-tight',
        changeColor: 'bg-success/10 text-success border border-success/20',
        category: 'Activity Status'
      };
    } else if (lowerTitle.includes('performance') || lowerTitle.includes('score')) {
      return {
        cardBorder: 'card-enhanced border-l-2 border-success/20 bg-card',
        iconBg: 'p-3 bg-success/10 rounded-lg border border-success/20',
        iconColor: 'h-6 w-6 text-success',
        numberColor: 'text-2xl font-bold text-success tracking-tight',
        changeColor: 'bg-success/10 text-success border border-success/20',
        category: 'Performance Metrics'
      };
    } else if (lowerTitle.includes('top') || lowerTitle.includes('performer')) {
      return {
        cardBorder: 'card-enhanced border-l-2 border-success/20 bg-card',
        iconBg: 'p-3 bg-success/10 rounded-lg border border-success/20',
        iconColor: 'h-6 w-6 text-success',
        numberColor: 'text-2xl font-bold text-success tracking-tight',
        changeColor: 'bg-success/10 text-success border border-success/20',
        category: 'Recognition'
      };
    } else {
      return {
        cardBorder: 'card-enhanced border-l-2 border-muted/40 bg-card',
        iconBg: 'p-3 bg-muted/10 rounded-lg border border-muted/20',
        iconColor: 'h-6 w-6 text-muted-foreground',
        numberColor: 'text-2xl font-bold text-muted-foreground tracking-tight',
        changeColor: 'bg-muted/10 text-muted-foreground border border-muted/20',
        category: 'General Metrics'
      };
    }
  };

  const styles = getStyles(title);

  if (isLoading) {
    return (
      <Card className={`hover:shadow-professional transition-shadow duration-200 ${styles.cardBorder}`}>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-10 w-24 rounded" />
              </div>
              <Skeleton className="h-14 w-14 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-32 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`hover:shadow-professional transition-shadow duration-200 ${styles.cardBorder}`}>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {styles.category}
                </span>
              </div>
              <h3 className="text-sm font-medium text-foreground">{title}</h3>
            </div>
            <div className={styles.iconBg}>
              <div className={styles.iconColor}>
                {icon}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className={styles.numberColor}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {description && (
              <p className="text-sm text-muted-foreground font-medium">{description}</p>
            )}
          </div>
          
          {change !== undefined && (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${styles.changeColor}`}>
              {change >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <div className="h-3 w-3 rotate-180">
                  <TrendingUp className="h-3 w-3" />
                </div>
              )}
              <span>{change >= 0 ? '+' : ''}{change}%</span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ClientsPageContent() {
  const [clients, setClients] = useState<ClientAccount[]>([]);
  const [stats, setStats] = useState<ServiceProviderClientStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [performanceFilter, setPerformanceFilter] = useState<string>('all');
  const { state: { organizationId, currentUser }, switchClient } = useServiceProvider();
  const router = useRouter();
  const { toast } = useToast();

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!organizationId) {
        throw new Error("No service provider organization");
      }

      const res = await fetch(`/api/service-provider/clients?organizationId=${organizationId}`);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Server responded with status: ${res.status}`);
      }
      
      const data = await res.json();
      // Handle different API response formats
      if (Array.isArray(data)) {
        // Direct array format (current)
        setClients(data);
      } else if (data.data && Array.isArray(data.data)) {
        // Paginated API response format
        setClients(data.data);
      } else if (data.clients && Array.isArray(data.clients)) {
        // Metadata format
        setClients(data.clients);
        // Demo mode handling without logging
      } else {
        console.error("Unexpected API response format:", data);
        setClients([]);
      }
    } catch (err: any) {
      console.error("Failed to load clients:", err);
      setError(err.message || "Unable to load client data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    
    try {
      if (!organizationId) {
        return;
      }

      const res = await fetch(`/api/service-provider/clients/metrics?organizationId=${organizationId}`);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Server responded with status: ${res.status}`);
      }
      
      const data = await res.json();
      // Handle standardized API response format
      if (data.data && typeof data.data === 'object') {
        setStats(data.data);
      } else if (typeof data === 'object' && data.totalClients !== undefined) {
        // Fallback for legacy direct data format
        setStats(data);
      } else {
        console.error("Unexpected stats API response format:", data);
        setStats(null);
      }
    } catch (err: any) {
      console.error("Failed to load client statistics:", err);
      setStatsError(err.message || "Unable to load client statistics. Please try again later.");
    } finally {
      setStatsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (organizationId) {
      fetchClients();
      fetchStats();
    }
  }, [organizationId, fetchClients, fetchStats]);

  const handleRefresh = useCallback(() => {
    fetchClients();
    fetchStats();
  }, [fetchClients, fetchStats]);

  // Enhanced filtering with multiple criteria
  const filteredClients = useMemo(() => {
    let filtered = clients;

    // Text search
    const term = search.trim().toLowerCase();
    if (term) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.industry?.toLowerCase().includes(term) ||
        client.displayId?.toLowerCase().includes(term) ||
        client.id.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(client => client.type === typeFilter);
    }

    // Industry filter
    if (industryFilter !== 'all') {
      filtered = filtered.filter(client => client.industry === industryFilter);
    }

    // Performance filter
    if (performanceFilter !== 'all') {
      filtered = filtered.filter(client => {
        if (!client.performanceScore) return false;
        switch (performanceFilter) {
          case 'excellent': return client.performanceScore >= 90;
          case 'good': return client.performanceScore >= 70 && client.performanceScore < 90;
          case 'needs-attention': return client.performanceScore < 70;
          default: return true;
        }
      });
    }

    return filtered;
  }, [search, clients, statusFilter, typeFilter, industryFilter, performanceFilter]);

  // Get unique industries for filter dropdown
  const uniqueIndustries = useMemo(() => {
    const industries = clients
      .map(client => client.industry)
      .filter(Boolean)
      .filter((industry, index, arr) => arr.indexOf(industry) === index);
    return industries;
  }, [clients]);

  // Delete client handler
  const handleDeleteClient = async (clientId: string, clientName: string) => {
    try {
      if (!organizationId) {
        throw new Error('No organization ID');
      }

      const response = await fetch(`/api/service-provider/clients/${clientId}?organizationId=${organizationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete client');
      }
      
      toast({
        title: "Success",
        description: `Client "${clientName}" has been deleted successfully.`
      });
      
      // Refresh the client list
      await fetchClients();
    } catch (_error) {
      console.error("", _error);
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-4 space-y-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Client Management
            </h1>
          </div>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Build and manage strong client relationships. Track engagement, monitor projects, and grow your business partnerships.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 mb-8">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button asChild>
              <Link href="/clients/new">
                <Plus className="mr-2 h-4 w-4" />
                New Client
              </Link>
            </Button>
          </div>
        </div>

      {/* Metrics Overview */}
      {/* Service Provider Client Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Clients"
          value={stats?.totalClients || 0}
          description="Managed client accounts"
          icon={<Users className="h-6 w-6" />}
          change={stats?.clientGrowth}
          isLoading={statsLoading}
        />
        
        <MetricCard
          title="Active Clients"
          value={stats?.activeClients || 0}
          description="Currently active accounts"
          icon={<Activity className="h-6 w-6 text-primary" />}
          isLoading={statsLoading}
        />
        
        <MetricCard
          title="Avg Performance"
          value={`${stats?.averagePerformanceScore || 0}%`}
          description="Client performance average"
          icon={<TrendingUp className="h-6 w-6 text-success" />}
          isLoading={statsLoading}
        />
        
        <MetricCard
          title="Top Performer"
          value={stats?.topPerformingClients?.[0]?.name || 'N/A'}
          description="Highest scoring client"
          icon={<CheckCircle2 className="h-6 w-6 text-warning" />}
          isLoading={statsLoading}
        />
      </div>

      {/* Client Performance Rankings */}
      {!loading && !error && filteredClients.length > 0 && (
        <div className="mb-8">
          <ClientPerformanceRankings 
            clients={filteredClients}
            onClientSelect={async (clientId) => {
              try {
                // Find the client data
                const selectedClient = filteredClients.find(c => c.id === clientId);
                if (selectedClient) {
                  // Convert to ClientSummary format for ServiceProviderContext
                  const clientSummary: ClientSummary = {
                    id: selectedClient.id,
                    name: selectedClient.name,
                    type: selectedClient.type,
                    status: selectedClient.status === 'active' ? 'ACTIVE' : 'INACTIVE',
                    logoUrl: selectedClient.logoUrl || undefined,
                    performanceScore: selectedClient.performanceScore,
                    activeCampaigns: selectedClient.projects?.length || 0,
                    engagementRate: selectedClient.performanceScore / 20, // Convert score to engagement rate
                    monthlyBudget: selectedClient.monthlyBudget,
                    lastActivity: new Date(selectedClient.lastActivity),
                  };
                  
                  // Switch client context and navigate to dashboard
                  await switchClient(clientSummary);
                  router.push('/dashboard');
                }
              } catch (_error) {
                console.error("", _error);
              }
            }}
            isLoading={loading}
          />
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-muted/30 p-4 rounded-lg space-y-4">
        {/* Mobile-first: Search and Primary Action */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search clients, IDs, emails..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
          </div>
        </div>
        
        {/* Secondary Controls */}
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] sm:w-[140px] bg-background">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px] sm:w-[140px] bg-background">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="MUNICIPALITY">Municipality</SelectItem>
                <SelectItem value="BUSINESS">Business</SelectItem>
                <SelectItem value="STARTUP">Startup</SelectItem>
                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                <SelectItem value="NONPROFIT">Nonprofit</SelectItem>
              </SelectContent>
            </Select>
            
            {uniqueIndustries.length > 0 && (
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-[130px] sm:w-[140px] bg-background">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {uniqueIndustries.map(industry => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
              <SelectTrigger className="w-[140px] sm:w-[150px] bg-background">
                <SelectValue placeholder="Performance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Performance</SelectItem>
                <SelectItem value="excellent">Excellent (90%+)</SelectItem>
                <SelectItem value="good">Good (70-89%)</SelectItem>
                <SelectItem value="needs-attention">Needs Attention (&lt;70%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-muted rounded-md p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-2 sm:px-3"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Grid View</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-2 sm:px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>List View</TooltipContent>
              </Tooltip>
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleRefresh} 
                  disabled={loading}
                  className="shrink-0"
                >
                  <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh Clients</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <ClientSkeletonGrid count={6} viewMode={viewMode} />
      )}

      {/* Error State */}
      {error && (
        <Card className="card-enhanced border-l-2 border-destructive/20 bg-card">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <RefreshCcw className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Failed to load clients</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
              {loading ? 'Retrying...' : 'Try Again'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && filteredClients.length === 0 && (
        <Card className="card-enhanced border-l-2 border-muted/40 bg-card border-dashed">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-muted/10 rounded-lg border border-muted/20">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">No clients found</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              {clients.length === 0 
                ? "Get started by adding your first client to begin managing relationships and tracking performance."
                : "No clients match your current search criteria. Try adjusting your filters or search terms."
              }
            </p>
            {clients.length === 0 ? (
              <Button asChild>
                <Link href="/clients/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Client
                </Link>
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button variant="outline" onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setIndustryFilter('all');
                  setPerformanceFilter('all');
                }}>
                  Clear Filters
                </Button>
                <Button asChild>
                  <Link href="/clients/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Client
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Client Cards/List */}
      {!loading && !error && filteredClients.length > 0 && (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "space-y-2"
        )}>
          {filteredClients.map((client) => (
            <ClientCard 
              key={client.id} 
              client={client} 
              viewMode={viewMode} 
              onDelete={handleDeleteClient}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ClientsPage() {
  return (
    <TooltipProvider>
      <ClientsErrorBoundary>
        <ClientsPageContent />
      </ClientsErrorBoundary>
    </TooltipProvider>
  );
}

// Client Card Component
interface ClientCardProps {
  client: ClientAccount;
  viewMode: 'grid' | 'list';
  onDelete: (clientId: string, clientName: string) => Promise<void>;
}

function ClientCard({ client, viewMode, onDelete }: ClientCardProps) {
  if (viewMode === 'list') {
    return (
      <Card className={cn(
        "card-enhanced hover:shadow-professional transition-shadow duration-200 bg-card border-l-2",
        client.status === 'active' 
          ? 'border-success/20' 
          : 'border-muted/40'
      )}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex-shrink-0">
                {client.logoUrl ? (
                  <img
                    src={client.logoUrl}
                    alt={`Logo for ${client.name}`}
                    className="w-10 h-10 rounded-full object-cover border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary border font-semibold text-sm">
                    {getInitials(client.name)}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="mb-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Link 
                      href={`/clients/${client.id}`} 
                      className="font-medium hover:text-primary transition-colors block truncate"
                      title={client.name}
                    >
                      {client.name}
                    </Link>
                    {client.displayId && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5 font-mono text-muted-foreground">
                        {client.displayId}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <Badge className={cn("text-xs px-1.5 py-0.5 whitespace-nowrap", typeBadge[client.type as keyof typeof typeBadge] || 'bg-muted text-muted-foreground')}>
                      {client.type}
                    </Badge>
                    <Badge 
                      variant={client.status === 'active' ? 'default' : 'secondary'}
                      className={cn("text-xs px-1.5 py-0.5 whitespace-nowrap", client.status === 'active' ? 'bg-success/10 text-success' : '')}
                    >
                      {client.status}
                    </Badge>
                    {client.performanceScore && (
                      <Badge className={cn(
                        "text-xs px-1.5 py-0.5 whitespace-nowrap",
                        client.performanceScore >= 90 ? 'bg-success/10 text-success' :
                        client.performanceScore >= 70 ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      )}>
                        {client.performanceScore}% score
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 truncate">
                    <Mail className="h-3 w-3" />
                    {client.email}
                  </span>
                  {client.industry && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {client.industry}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    {client.projects?.length || 0} projects
                  </span>
                  {client.monthlyBudget && (
                    <span className="flex items-center gap-1">
                      💰 ${client.monthlyBudget.toLocaleString()}/mo
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {client.socialAccounts && client.socialAccounts.length > 0 && (
                <div className="flex items-center gap-1">
                  {client.socialAccounts.slice(0, 3).map(account => (
                    <a
                      key={account.id}
                      href={getSocialUrl(account)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {platformIconMap[account.platform]}
                    </a>
                  ))}
                  {client.socialAccounts.length > 3 && (
                    <span className="text-xs text-muted-foreground ml-1">
                      +{client.socialAccounts.length - 3}
                    </span>
                  )}
                </div>
              )}
              
              {client.website && (
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/clients/${client.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/clients/${client.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Client
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Client
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Client</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{client.name}"? This action cannot be undone and will remove all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(client.id, client.name)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
    <Card className={cn(
      "card-enhanced hover:shadow-professional transition-shadow duration-200 group bg-card border-l-2",
      client.status === 'active' 
        ? 'border-success/20' 
        : 'border-muted/40'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1 min-w-0 mr-2">
            {client.logoUrl ? (
              <img
                src={client.logoUrl}
                alt={`Logo for ${client.name}`}
                className="w-10 h-10 rounded-full object-cover border flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 text-primary border font-semibold text-sm flex-shrink-0">
                {getInitials(client.name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link 
                  href={`/clients/${client.id}`} 
                  className="font-medium hover:text-primary transition-colors block truncate"
                  title={client.name}
                >
                  {client.name}
                </Link>
                {client.displayId && (
                  <Badge variant="outline" className="text-xs px-1 py-0 font-mono text-muted-foreground">
                    {client.displayId}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate" title={client.email}>{client.email}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/clients/${client.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/clients/${client.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Client
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Client
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Client</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{client.name}"? This action cannot be undone and will remove all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(client.id, client.name)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-1 flex-wrap">
            <Badge className={cn("text-xs px-1.5 py-0.5 whitespace-nowrap", typeBadge[client.type as keyof typeof typeBadge] || 'bg-muted text-muted-foreground')}>
              {client.type}
            </Badge>
            <Badge 
              variant={client.status === 'active' ? 'default' : 'secondary'}
              className={cn("text-xs px-1.5 py-0.5 whitespace-nowrap", client.status === 'active' ? 'bg-success/10 text-success' : '')}
            >
              {client.status}
            </Badge>
            {client.performanceScore && (
              <Badge className={cn(
                "text-xs px-1.5 py-0.5 whitespace-nowrap",
                client.performanceScore >= 90 ? 'bg-success/10 text-success' :
                client.performanceScore >= 70 ? 'bg-warning/10 text-warning' :
                'bg-destructive/10 text-destructive'
              )}>
                {client.performanceScore}% score
              </Badge>
            )}
          </div>
          
          {client.industry && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{client.industry}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Activity className="h-3 w-3" />
            <span>{client.projects?.length || 0} projects</span>
          </div>

          {client.monthlyBudget && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              💰 <span>${client.monthlyBudget.toLocaleString()}/mo</span>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground">
              {formatDate(client.createdAt)}
            </span>
            <div className="flex items-center gap-1">
              {client.socialAccounts && client.socialAccounts.length > 0 && (
                client.socialAccounts.slice(0, 3).map(account => (
                  <a
                    key={account.id}
                    href={getSocialUrl(account)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {platformIconMap[account.platform]}
                  </a>
                ))
              )}
              {client.website && (
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Globe className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function for social URLs
function getSocialUrl(account: SocialAccount): string {
  switch (account.platform) {
    case "FACEBOOK":
      return `https://facebook.com/${account.handle.replace(/^@|^\/+/, "")}`;
    case "TWITTER":
      return `https://twitter.com/${account.handle.replace(/^@/, "")}`;
    case "INSTAGRAM":
      return `https://instagram.com/${account.handle.replace(/^@/, "")}`;
    case "LINKEDIN":
      return `https://linkedin.com${account.handle.startsWith("/") ? "" : "/"}${account.handle}`;
    default:
      return "#";
  }
}
