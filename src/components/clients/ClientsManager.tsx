'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  RefreshCcw,
  TrendingUp,
  Activity,
  Building2,
  CheckCircle2,
  Grid,
  List,
  MoreHorizontal,
  Edit,
  Eye,
  Globe,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
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

// Context and utilities
import { useServiceProvider, type ClientSummary } from '@/context/ServiceProviderContext';
import { cn } from '@/lib/utils';

// Sub-components
import { ClientsErrorBoundary } from './ClientsErrorBoundary';
import { ClientSkeletonGrid, MetricSkeletonCard } from './ClientSkeletonGrid';
import { ClientPerformanceRankings } from './ClientPerformanceRankings';

// Types
export interface ClientAccount {
  id: string;
  name: string;
  organizationId: string;
  email: string;
  type: 'MUNICIPALITY' | 'BUSINESS' | 'STARTUP' | 'INDIVIDUAL' | 'NONPROFIT';
  status: 'active' | 'inactive';
  industry: string;
  website?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
  
  // Service provider specific fields
  performanceScore: number;
  monthlyBudget?: number;
  lastActivity: string;
  assignedTeamMembers?: TeamMemberAssignment[];
  primaryManager?: string;
  
  // Related data
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

interface SocialAccount {
  id: string;
  platform: 'FACEBOOK' | 'TWITTER' | 'INSTAGRAM' | 'LINKEDIN';
  handle: string;
}

interface Project {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PLANNED' | 'COMPLETED';
}

export interface ClientsManagerMetrics {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  clientGrowth: number;
  averagePerformanceScore: number;
  topPerformingClients: ClientAccount[];
  clientsByType: Record<string, number>;
  clientsByStatus: Record<string, number>;
}

// Props interface
export interface ClientsManagerProps {
  /** Display mode - embedded shows condensed view, full shows complete interface */
  mode?: 'embedded' | 'full';
  /** Maximum number of clients to display in embedded mode */
  maxClients?: number;
  /** Show metrics cards */
  showMetrics?: boolean;
  /** Show performance rankings */
  showRankings?: boolean;
  /** Show search and filters */
  showFilters?: boolean;
  /** Custom header text */
  headerText?: string;
  /** Callback when client is selected */
  onClientSelect?: (client: ClientAccount) => void;
  /** Custom CSS classes */
  className?: string;
}

// Badge styling
const typeBadge = {
  MUNICIPALITY: "bg-yellow-100 text-yellow-800",
  BUSINESS: "bg-blue-100 text-blue-800",
  STARTUP: "bg-purple-100 text-purple-800",
  INDIVIDUAL: "bg-pink-100 text-pink-800",
  NONPROFIT: "bg-green-100 text-green-800"
} as const;

// Platform icons
const platformIconMap: Record<string, JSX.Element> = {
  FACEBOOK: <Facebook className="h-3 w-3" />,
  TWITTER: <Twitter className="h-3 w-3" />,
  INSTAGRAM: <Instagram className="h-3 w-3" />,
  LINKEDIN: <Linkedin className="h-3 w-3" />
};

// Helper functions
function getInitials(name: string): string {
  const words = name.split(" ");
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function formatDate(dateString?: string): string {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  } catch {
    return dateString;
  }
}

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

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  change?: number;
  isLoading?: boolean;
  compact?: boolean;
}

function MetricCard({ title, value, description, icon, change, isLoading, compact = false }: MetricCardProps) {
  if (isLoading) {
    return <MetricSkeletonCard />;
  }

  return (
    <Card className={cn("hover:shadow-md transition-shadow", compact && "p-2")}>
      <CardContent className={cn("p-6", compact && "p-4")}>
        <div className="flex items-center justify-between">
          <div>
            <p className={cn("text-sm font-medium text-muted-foreground", compact && "text-xs")}>
              {title}
            </p>
            <p className={cn("text-3xl font-bold", compact && "text-xl")}>
              {typeof value === 'number' ? value.toLocaleString() : value}
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
            <div className={cn("h-6 w-6 text-primary", compact && "h-4 w-4")}>
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Client Card Component
interface ClientCardProps {
  client: ClientAccount;
  viewMode: 'grid' | 'list';
  onClientSelect?: (client: ClientAccount) => void;
  compact?: boolean;
}

function ClientCard({ client, viewMode, onClientSelect, compact = false }: ClientCardProps) {
  const handleClientClick = useCallback(() => {
    if (onClientSelect) {
      onClientSelect(client);
    }
  }, [client, onClientSelect]);

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4" style={{ 
        borderLeftColor: client.status === 'active' ? '#22c55e' : '#6b7280' 
      }}>
        <CardContent className={cn("p-3", compact && "p-2")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="flex-shrink-0">
                {client.logoUrl ? (
                  <img
                    src={client.logoUrl}
                    alt={`Logo for ${client.name}`}
                    className={cn("rounded-full object-cover border", compact ? "w-8 h-8" : "w-10 h-10")}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className={cn(
                    "rounded-full flex items-center justify-center bg-primary/10 text-primary border font-semibold",
                    compact ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"
                  )}>
                    {getInitials(client.name)}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="mb-1">
                  <button
                    onClick={handleClientClick}
                    className="font-semibold hover:text-primary transition-colors block truncate text-left"
                    title={client.name}
                  >
                    {client.name}
                  </button>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <Badge className={cn(
                      "text-xs px-1.5 py-0.5 whitespace-nowrap", 
                      typeBadge[client.type] || 'bg-gray-100 text-gray-800'
                    )}>
                      {client.type}
                    </Badge>
                    <Badge 
                      variant={client.status === 'active' ? 'default' : 'secondary'}
                      className={cn(
                        "text-xs px-1.5 py-0.5 whitespace-nowrap", 
                        client.status === 'active' ? 'bg-green-100 text-green-800' : ''
                      )}
                    >
                      {client.status}
                    </Badge>
                    {client.performanceScore && (
                      <Badge className={cn(
                        "text-xs px-1.5 py-0.5 whitespace-nowrap",
                        client.performanceScore >= 90 ? 'bg-green-100 text-green-800' :
                        client.performanceScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      )}>
                        {client.performanceScore}% score
                      </Badge>
                    )}
                  </div>
                </div>
                
                {!compact && (
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
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!compact && client.socialAccounts && client.socialAccounts.length > 0 && (
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
              
              {!compact && client.website && (
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
                  <DropdownMenuItem onClick={handleClientClick}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
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
    <Card className="hover:shadow-lg transition-all duration-200 group border-l-4" style={{ 
      borderLeftColor: client.status === 'active' ? '#22c55e' : '#6b7280' 
    }}>
      <CardContent className={cn("p-4", compact && "p-3")}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1 min-w-0 mr-2">
            {client.logoUrl ? (
              <img
                src={client.logoUrl}
                alt={`Logo for ${client.name}`}
                className={cn("rounded-full object-cover border flex-shrink-0", compact ? "w-8 h-8" : "w-10 h-10")}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className={cn(
                "rounded-full flex items-center justify-center bg-primary/10 text-primary border font-semibold flex-shrink-0",
                compact ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"
              )}>
                {getInitials(client.name)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <button
                onClick={handleClientClick}
                className="font-semibold hover:text-primary transition-colors block truncate text-left"
                title={client.name}
              >
                {client.name}
              </button>
              <p className="text-xs text-muted-foreground truncate" title={client.email}>
                {client.email}
              </p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleClientClick}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
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
            <Badge className={cn(
              "text-xs px-1.5 py-0.5 whitespace-nowrap", 
              typeBadge[client.type] || 'bg-gray-100 text-gray-800'
            )}>
              {client.type}
            </Badge>
            <Badge 
              variant={client.status === 'active' ? 'default' : 'secondary'}
              className={cn(
                "text-xs px-1.5 py-0.5 whitespace-nowrap", 
                client.status === 'active' ? 'bg-green-100 text-green-800' : ''
              )}
            >
              {client.status}
            </Badge>
            {client.performanceScore && (
              <Badge className={cn(
                "text-xs px-1.5 py-0.5 whitespace-nowrap",
                client.performanceScore >= 90 ? 'bg-green-100 text-green-800' :
                client.performanceScore >= 70 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              )}>
                {client.performanceScore}% score
              </Badge>
            )}
          </div>
          
          {!compact && client.industry && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{client.industry}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Activity className="h-3 w-3" />
            <span>{client.projects?.length || 0} projects</span>
          </div>

          {!compact && client.monthlyBudget && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              💰 <span>${client.monthlyBudget.toLocaleString()}/mo</span>
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground">
              {formatDate(client.createdAt)}
            </span>
            {!compact && (
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
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main ClientsManager Component
export function ClientsManager({
  mode = 'full',
  maxClients = 12,
  showMetrics = true,
  showRankings = true,
  showFilters = true,
  headerText,
  onClientSelect,
  className
}: ClientsManagerProps) {
  // State
  const [clients, setClients] = useState<ClientAccount[]>([]);
  const [metrics, setMetrics] = useState<ClientsManagerMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [performanceFilter, setPerformanceFilter] = useState<string>('all');
  
  // Context
  const { state: { organizationId }, switchClient } = useServiceProvider();
  const router = useRouter();

  // Data fetching
  const fetchClients = useCallback(async () => {
    if (!organizationId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/service-provider/clients?organizationId=${organizationId}`);
      
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }
      
      const data = await res.json();
      const clientsData = Array.isArray(data) ? data : (data.data || data.clients || []);
      setClients(clientsData);
    } catch (err: any) {
      console.error("Failed to load clients:", err);
      setError(err.message || "Unable to load client data");
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const fetchMetrics = useCallback(async () => {
    if (!organizationId) return;
    
    setMetricsLoading(true);
    
    try {
      const res = await fetch(`/api/service-provider/clients/metrics?organizationId=${organizationId}`);
      
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.data || data);
      }
    } catch (err) {
      console.error("Failed to load client metrics:", err);
    } finally {
      setMetricsLoading(false);
    }
  }, [organizationId]);

  // Effects
  useEffect(() => {
    if (organizationId) {
      fetchClients();
      if (showMetrics) {
        fetchMetrics();
      }
    }
  }, [organizationId, fetchClients, fetchMetrics, showMetrics]);

  // Handlers
  const handleRefresh = useCallback(() => {
    fetchClients();
    if (showMetrics) {
      fetchMetrics();
    }
  }, [fetchClients, fetchMetrics, showMetrics]);

  const handleClientSelect = useCallback(async (client: ClientAccount) => {
    if (onClientSelect) {
      onClientSelect(client);
      return;
    }

    try {
      // Default behavior: switch client context and navigate
      const clientSummary: ClientSummary = {
        id: client.id,
        name: client.name,
        type: client.type,
        status: client.status === 'active' ? 'ACTIVE' : 'INACTIVE',
        logoUrl: client.logoUrl,
        performanceScore: client.performanceScore,
        activeCampaigns: client.projects?.length || 0,
        engagementRate: client.performanceScore / 20,
        monthlyBudget: client.monthlyBudget,
        lastActivity: new Date(client.lastActivity),
      };
      
      await switchClient(clientSummary);
      router.push('/dashboard');
    } catch (_error) {
      console.error("", _error);
    }
  }, [onClientSelect, switchClient, router]);

  // Filtering
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

    // Limit for embedded mode
    if (mode === 'embedded' && maxClients) {
      filtered = filtered.slice(0, maxClients);
    }

    return filtered;
  }, [search, clients, statusFilter, typeFilter, performanceFilter, mode, maxClients]);

  const isEmbedded = mode === 'embedded';
  const displayClients = filteredClients;

  return (
    <TooltipProvider>
      <ClientsErrorBoundary>
        <div className={cn("space-y-6", className)}>
          {/* Header */}
          {!isEmbedded && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">
                  {headerText || 'Client Management'}
                </h2>
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
                  <Link href="/clients/new">
                    <Plus className="mr-2 h-4 w-4" />
                    New Client
                  </Link>
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
                title="Total Clients"
                value={metrics?.totalClients || 0}
                icon={<Users className="h-6 w-6" />}
                change={metrics?.clientGrowth}
                isLoading={metricsLoading}
                compact={isEmbedded}
              />
              <MetricCard
                title="Active Clients"
                value={metrics?.activeClients || 0}
                icon={<Activity className="h-6 w-6" />}
                isLoading={metricsLoading}
                compact={isEmbedded}
              />
              <MetricCard
                title="Avg Performance"
                value={`${metrics?.averagePerformanceScore || 0}%`}
                icon={<TrendingUp className="h-6 w-6" />}
                isLoading={metricsLoading}
                compact={isEmbedded}
              />
              <MetricCard
                title="Top Performer"
                value={metrics?.topPerformingClients?.[0]?.name || 'N/A'}
                icon={<CheckCircle2 className="h-6 w-6" />}
                isLoading={metricsLoading}
                compact={isEmbedded}
              />
            </div>
          )}

          {/* Performance Rankings */}
          {showRankings && !loading && !error && displayClients.length > 0 && (
            <ClientPerformanceRankings 
              clients={displayClients}
              onClientSelect={handleClientSelect}
              isLoading={loading}
            />
          )}

          {/* Search and Filters */}
          {showFilters && !isEmbedded && (
            <div className="bg-muted/30 p-4 rounded-lg space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search clients..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 bg-background"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[130px] bg-background">
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
                    <SelectTrigger className="w-[130px] bg-background">
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
                  
                  <Select value={performanceFilter} onValueChange={setPerformanceFilter}>
                    <SelectTrigger className="w-[140px] bg-background">
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
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="px-2"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="px-2"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <ClientSkeletonGrid 
              count={isEmbedded ? 4 : 8} 
              viewMode={viewMode} 
            />
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
                >
                  <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                  {loading ? 'Retrying...' : 'Try Again'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !error && displayClients.length === 0 && (
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
                    ? "Get started by adding your first client."
                    : "No clients match your current filters."
                  }
                </p>
                {!isEmbedded && (
                  <Button asChild>
                    <Link href="/clients/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Client
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Client Cards */}
          {!loading && !error && displayClients.length > 0 && (
            <>
              <div className={cn(
                viewMode === 'grid' 
                  ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                  : "space-y-2"
              )}>
                {displayClients.map((client) => (
                  <ClientCard 
                    key={client.id} 
                    client={client} 
                    viewMode={viewMode}
                    onClientSelect={handleClientSelect}
                    compact={isEmbedded}
                  />
                ))}
              </div>
              
              {/* Show more link for embedded mode */}
              {isEmbedded && clients.length > maxClients && (
                <div className="text-center">
                  <Button variant="outline" asChild>
                    <Link href="/clients">
                      View All Clients ({clients.length})
                    </Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </ClientsErrorBoundary>
    </TooltipProvider>
  );
}

export default ClientsManager;