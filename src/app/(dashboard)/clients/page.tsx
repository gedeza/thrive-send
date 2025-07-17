"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Users, Globe, Facebook, Twitter, Instagram, Linkedin, Mail, User, RefreshCcw, TrendingUp, Building2, Activity, CheckCircle2, Search, Grid, List, Filter, MoreHorizontal, Edit, Eye, MapPin } from "lucide-react";
import { useOrganization } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
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
type Client = {
  id: string;
  name: string;
  email: string;
  type: ClientType;
  status: ClientStatus;
  industry: string;
  website?: string;
  logoUrl?: string;
  createdAt: string;
  socialAccounts: SocialAccount[];
  projects: Project[];
};

type ClientStats = {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  clientGrowth: number;
  activeClientPercentage: number;
  clientsByType: Record<string, number>;
  clientsByStatus: Record<string, number>;
  projects: {
    total: number;
    active: number;
    completed: number;
    completionRate: number;
  };
};

// Badge coloring for client types
const typeBadge = {
  MUNICIPALITY: "bg-yellow-100 text-yellow-800",
  BUSINESS: "bg-blue-100 text-blue-800",
  STARTUP: "bg-purple-100 text-purple-800",
  INDIVIDUAL: "bg-pink-100 text-pink-800",
  NONPROFIT: "bg-green-100 text-green-800"
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
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
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

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {change !== undefined && (
              <div className={cn(
                "flex items-center text-xs font-medium",
                change >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                <TrendingUp className={cn(
                  "mr-1 h-3 w-3",
                  change < 0 && "rotate-180"
                )} />
                {change >= 0 ? '+' : ''}{change}%
              </div>
            )}
          </div>
          <div className="text-primary p-2 bg-primary/10 rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ClientsPageContent() {
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const { organization } = useOrganization();

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!organization?.id) {
        throw new Error("No organization selected");
      }

      const res = await fetch(`/api/clients?organizationId=${organization.id}`);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Server responded with status: ${res.status}`);
      }
      
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load clients:", err);
      setError(err.message || "Unable to load client data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [organization?.id]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    
    try {
      if (!organization?.id) {
        return;
      }

      const res = await fetch(`/api/clients/stats?organizationId=${organization.id}`);
      
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }
      
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      console.error("Failed to load client statistics:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [organization?.id]);

  useEffect(() => {
    if (organization?.id) {
      fetchClients();
      fetchStats();
    }
  }, [organization?.id, fetchClients, fetchStats]);

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
        client.industry?.toLowerCase().includes(term)
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

    return filtered;
  }, [search, clients, statusFilter, typeFilter, industryFilter]);

  // Get unique industries for filter dropdown
  const uniqueIndustries = useMemo(() => {
    const industries = clients
      .map(client => client.industry)
      .filter(Boolean)
      .filter((industry, index, arr) => arr.indexOf(industry) === index);
    return industries;
  }, [clients]);

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">
            Manage your client relationships and track performance
          </p>
        </div>
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
          <Button asChild className="flex items-center gap-1">
            <Link href="/clients/new">
              <Plus className="h-4 w-4" />
              Add Client
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Clients"
          value={stats?.totalClients || 0}
          description="All client accounts"
          icon={<Users className="h-6 w-6" />}
          change={stats?.clientGrowth}
          isLoading={statsLoading}
        />
        <MetricCard
          title="Active Clients"
          value={stats?.activeClients || 0}
          description={`${stats?.activeClientPercentage || 0}% of total clients`}
          icon={<Activity className="h-6 w-6" />}
          isLoading={statsLoading}
        />
        <MetricCard
          title="Active Projects"
          value={stats?.projects?.active || 0}
          description={`${stats?.projects?.total || 0} total projects`}
          icon={<Building2 className="h-6 w-6" />}
          isLoading={statsLoading}
        />
        <MetricCard
          title="Completion Rate"
          value={`${stats?.projects?.completionRate || 0}%`}
          description="Project success rate"
          icon={<CheckCircle2 className="h-6 w-6" />}
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
                placeholder="Search clients by name, email, or industry..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-28 h-8 text-xs">
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
                  <SelectTrigger className="w-28 h-8 text-xs">
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
              
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none border-r h-8 px-2"
                >
                  <Grid className="h-3 w-3" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none h-8 px-2"
                >
                  <List className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <ClientSkeletonGrid count={6} viewMode={viewMode} />
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="p-2 bg-destructive/10 rounded-full">
                <RefreshCcw className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Failed to load clients</h3>
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
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-muted rounded-full">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">No clients found</h3>
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
            <ClientCard key={client.id} client={client} viewMode={viewMode} />
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
  client: Client;
  viewMode: 'grid' | 'list';
}

function ClientCard({ client, viewMode }: ClientCardProps) {
  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-sm transition-shadow">
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
                  <Link 
                    href={`/clients/${client.id}`} 
                    className="font-semibold hover:text-primary transition-colors block truncate"
                    title={client.name}
                  >
                    {client.name}
                  </Link>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <Badge className={cn("text-xs px-1.5 py-0.5 whitespace-nowrap", typeBadge[client.type as keyof typeof typeBadge] || 'bg-gray-100 text-gray-800')}>
                      {client.type}
                    </Badge>
                    <Badge 
                      variant={client.status === 'active' ? 'default' : 'secondary'}
                      className={cn("text-xs px-1.5 py-0.5 whitespace-nowrap", client.status === 'active' ? 'bg-green-100 text-green-800' : '')}
                    >
                      {client.status}
                    </Badge>
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
                    {client.projects?.length || 0}
                  </span>
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
    <Card className="hover:shadow-sm transition-shadow group">
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
              <Link 
                href={`/clients/${client.id}`} 
                className="font-semibold hover:text-primary transition-colors block truncate"
                title={client.name}
              >
                {client.name}
              </Link>
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-1 flex-wrap">
            <Badge className={cn("text-xs px-1.5 py-0.5 whitespace-nowrap", typeBadge[client.type as keyof typeof typeBadge] || 'bg-gray-100 text-gray-800')}>
              {client.type}
            </Badge>
            <Badge 
              variant={client.status === 'active' ? 'default' : 'secondary'}
              className={cn("text-xs px-1.5 py-0.5 whitespace-nowrap", client.status === 'active' ? 'bg-green-100 text-green-800' : '')}
            >
              {client.status}
            </Badge>
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
