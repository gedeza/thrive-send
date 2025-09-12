'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import { 
  Users, 
  Share, 
  Target, 
  TrendingUp, 
  Settings, 
  Plus,
  ArrowLeft,
  Copy,
  Link2,
  BarChart3,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface SharedSegment {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  size: number;
  createdAt: string;
  lastUpdated: number;
  usageCount: number;
  audiences: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  segments: Array<{
    id: string;
    name: string;
    size: number;
    audienceId: string;
    audienceName: string;
  }>;
  performance: {
    totalReach: number;
    avgEngagementRate: number;
    conversionRate: number;
    efficiency: string;
  };
}

async function fetchSharedSegments(organizationId: string): Promise<SharedSegment[]> {
  const response = await fetch(`/api/service-provider/audiences/shared-segments?organizationId=${organizationId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch shared segments: ${response.status}`);
  }
  
  return response.json();
}

export default function SharedSegmentsPage() {
  const { state: { organizationId } } = useServiceProvider();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [efficiencyFilter, setEfficiencyFilter] = useState('all');

  const {
    data: sharedSegments = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['shared-segments', organizationId],
    queryFn: () => fetchSharedSegments(organizationId!),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  });

  // Filter shared segments
  const filteredSegments = sharedSegments.filter(segment => {
    const matchesSearch = !searchQuery || 
      segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      segment.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || segment.type.toLowerCase() === typeFilter;
    const matchesEfficiency = efficiencyFilter === 'all' || 
      segment.performance.efficiency.toLowerCase() === efficiencyFilter;

    return matchesSearch && matchesType && matchesEfficiency;
  });

  // Calculate stats
  const stats = {
    totalSharedSegments: sharedSegments.length,
    totalReach: sharedSegments.reduce((sum, s) => sum + s.performance.totalReach, 0),
    avgUsageCount: sharedSegments.length > 0 
      ? sharedSegments.reduce((sum, s) => sum + s.usageCount, 0) / sharedSegments.length 
      : 0,
    highEfficiencyCount: sharedSegments.filter(s => s.performance.efficiency === 'High').length,
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'CUSTOM': 'text-primary bg-primary/10',
      'BEHAVIORAL': 'text-success bg-success/10',
      'DEMOGRAPHIC': 'text-accent bg-accent/10',
      'GEOGRAPHIC': 'text-warning bg-warning/10',
    };
    return colors[type as keyof typeof colors] || 'text-muted-foreground bg-muted/10';
  };

  const getEfficiencyColor = (efficiency: string) => {
    const colors = {
      'High': 'text-success bg-success/10',
      'Medium': 'text-warning bg-warning/10',
      'Low': 'text-destructive bg-destructive/10',
    };
    return colors[efficiency as keyof typeof colors] || 'text-muted-foreground bg-muted/10';
  };

  if (!organizationId) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="text-center">
          <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Organization Context Missing</h3>
            <p className="text-muted-foreground">
              Unable to load organization context. Please refresh the page or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/audiences">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Audiences
          </Button>
        </Link>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">Shared Segments</h1>
          <p className="text-muted-foreground">
            Manage audience segments shared across multiple campaigns and audiences
          </p>
        </div>

        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Shared Segment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-primary bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Shared Segments
                  </span>
                  <h3 className="text-sm font-medium text-foreground">Segment Library</h3>
                </div>
                <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl shadow-sm">
                  <Share className="h-7 w-7 text-primary" />
                </div>
              </div>
              <div className="pt-2">
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mb-2" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">{stats.totalSharedSegments}</div>
                )}
                <p className="text-xs text-muted-foreground">Across all audiences</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-success bg-gradient-to-r from-success/5 to-transparent">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Total Reach
                  </span>
                  <h3 className="text-sm font-medium text-foreground">Combined Contacts</h3>
                </div>
                <div className="p-4 bg-gradient-to-br from-success/5 to-success/10 rounded-xl shadow-sm">
                  <Users className="h-7 w-7 text-success" />
                </div>
              </div>
              <div className="pt-2">
                {isLoading ? (
                  <Skeleton className="h-8 w-20 mb-2" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">{stats.totalReach.toLocaleString()}</div>
                )}
                <p className="text-xs text-muted-foreground">Combined contacts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-accent bg-gradient-to-r from-accent/5 to-transparent">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Avg. Usage
                  </span>
                  <h3 className="text-sm font-medium text-foreground">Segment Reuse</h3>
                </div>
                <div className="p-4 bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl shadow-sm">
                  <Link2 className="h-7 w-7 text-accent" />
                </div>
              </div>
              <div className="pt-2">
                {isLoading ? (
                  <Skeleton className="h-8 w-12 mb-2" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">{stats.avgUsageCount.toFixed(1)}</div>
                )}
                <p className="text-xs text-muted-foreground">Audiences per segment</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-warning bg-gradient-to-r from-warning/5 to-transparent">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    High Efficiency
                  </span>
                  <h3 className="text-sm font-medium text-foreground">Top Performers</h3>
                </div>
                <div className="p-4 bg-gradient-to-br from-warning/5 to-warning/10 rounded-xl shadow-sm">
                  <TrendingUp className="h-7 w-7 text-warning" />
                </div>
              </div>
              <div className="pt-2">
                {isLoading ? (
                  <Skeleton className="h-8 w-12 mb-2" />
                ) : (
                  <div className="text-2xl font-bold text-foreground">{stats.highEfficiencyCount}</div>
                )}
                <p className="text-xs text-muted-foreground">High performing segments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 hover:shadow-lg transition-all duration-300 border bg-gradient-to-r from-card to-card/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search shared segments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="demographic">Demographic</SelectItem>
                <SelectItem value="geographic">Geographic</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={efficiencyFilter} onValueChange={setEfficiencyFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by efficiency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Efficiency</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-96" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-6 text-center">
            <div className="flex justify-center mb-3">
              <div className="p-2 bg-destructive/10 rounded-full">
                <Share className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Failed to load shared segments</h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Shared Segments List */}
      {!isLoading && !error && (
        <div className="space-y-6">
          {filteredSegments.length > 0 ? (
            filteredSegments.map((segment) => (
              <SharedSegmentCard key={segment.id} segment={segment} />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Share className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No shared segments found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || typeFilter !== 'all' || efficiencyFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : sharedSegments.length === 0
                      ? "Create your first shared segment to reuse targeting across audiences"
                      : "No segments match your current search criteria"
                  }
                </p>
                {!searchQuery && typeFilter === 'all' && efficiencyFilter === 'all' && sharedSegments.length === 0 && (
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Shared Segment
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function SharedSegmentCard({ segment }: { segment: SharedSegment }) {
  const typeColor = getTypeColor(segment.type);
  const efficiencyColor = getEfficiencyColor(segment.performance.efficiency);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border bg-gradient-to-r from-card to-card/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{segment.name}</h3>
              <Badge variant="outline" className={typeColor}>
                {segment.type}
              </Badge>
              <Badge variant="outline" className={efficiencyColor}>
                {segment.performance.efficiency} Efficiency
              </Badge>
            </div>
            {segment.description && (
              <p className="text-sm text-muted-foreground">{segment.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{segment.performance.totalReach.toLocaleString()} total reach</span>
              </div>
              <div className="flex items-center gap-1">
                <Link2 className="h-4 w-4" />
                <span>Used in {segment.usageCount} audiences</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Updated {formatDate(segment.lastUpdated)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-1" />
              Duplicate
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-1" />
              Analytics
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">
              {segment.performance.avgEngagementRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Avg. Engagement</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-success">
              {segment.performance.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Conversion Rate</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-accent">
              {segment.usageCount}
            </div>
            <p className="text-xs text-muted-foreground">Audiences</p>
          </div>
        </div>

        {/* Audiences Using This Segment */}
        <div className="space-y-3">
          <h4 className="font-medium">Used in Audiences ({segment.audiences.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {segment.audiences.slice(0, 4).map((audience) => (
              <div key={audience.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex-1">
                  <div className="font-medium text-sm">{audience.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {segment.segments.find(s => s.audienceId === audience.id)?.size.toLocaleString()} contacts
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {audience.type}
                </Badge>
              </div>
            ))}
            {segment.audiences.length > 4 && (
              <div className="text-sm text-muted-foreground text-center p-2">
                +{segment.audiences.length - 4} more audiences
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getTypeColor(type: string) {
  const colors = {
    'CUSTOM': 'text-primary bg-primary/10',
    'BEHAVIORAL': 'text-success bg-success/10',
    'DEMOGRAPHIC': 'text-accent bg-accent/10',
    'GEOGRAPHIC': 'text-warning bg-warning/10',
  };
  return colors[type as keyof typeof colors] || 'text-muted-foreground bg-muted/10';
}

function getEfficiencyColor(efficiency: string) {
  const colors = {
    'High': 'text-success bg-success/10',
    'Medium': 'text-warning bg-warning/10',
    'Low': 'text-destructive bg-destructive/10',
  };
  return colors[efficiency as keyof typeof colors] || 'text-muted-foreground bg-muted/10';
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}