'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { 
  Plus, 
  BarChart3, 
  Target, 
  TrendingUp, 
  Filter,
  Search,
  Calendar,
  Settings,
  Eye,
  Edit,
  Trash2,
  PlayCircle,
  PauseCircle,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { ConversionFunnel } from '@/components/analytics/ConversionFunnel';
import { FunnelManager } from '@/components/analytics/FunnelManager';
import Link from 'next/link';

interface FunnelData {
  id: string;
  name: string;
  campaignId: string;
  campaignName: string;
  status: 'ACTIVE' | 'PAUSED' | 'DRAFT';
  totalStages: number;
  totalVisitors: number;
  totalConversions: number;
  conversionRate: number;
  revenue?: number;
  createdAt: string;
  lastUpdated: string;
  timeframe: string;
}

export default function FunnelsPage() {
  const { userId } = useAuth();
  const { organization } = useOrganization();
  const [funnels, setFunnels] = useState<FunnelData[]>([]);
  const [filteredFunnels, setFilteredFunnels] = useState<FunnelData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [selectedFunnel, setSelectedFunnel] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [stats, setStats] = useState({
    totalFunnels: 0,
    activeFunnels: 0,
    totalConversions: 0,
    avgConversionRate: 0
  });

  useEffect(() => {
    fetchFunnels();
  }, []);

  useEffect(() => {
    filterFunnels();
  }, [funnels, searchQuery, statusFilter, campaignFilter]);

  const fetchFunnels = async () => {
    try {
      setIsLoading(true);
      
      // Mock data - replace with actual API call
      const mockFunnels: FunnelData[] = [
        {
          id: '1',
          name: 'E-commerce Purchase Funnel',
          campaignId: '1',
          campaignName: 'Summer Sale Campaign',
          status: 'ACTIVE',
          totalStages: 5,
          totalVisitors: 10000,
          totalConversions: 850,
          conversionRate: 8.5,
          revenue: 127500,
          createdAt: '2024-01-15T10:00:00Z',
          lastUpdated: '2024-01-20T15:30:00Z',
          timeframe: '30d'
        },
        {
          id: '2',
          name: 'Newsletter Signup Funnel',
          campaignId: '2',
          campaignName: 'Content Marketing',
          status: 'ACTIVE',
          totalStages: 3,
          totalVisitors: 5200,
          totalConversions: 1456,
          conversionRate: 28.0,
          createdAt: '2024-01-12T08:00:00Z',
          lastUpdated: '2024-01-19T12:00:00Z',
          timeframe: '30d'
        },
        {
          id: '3',
          name: 'Product Demo Request',
          campaignId: '1',
          campaignName: 'Summer Sale Campaign',
          status: 'PAUSED',
          totalStages: 4,
          totalVisitors: 3400,
          totalConversions: 234,
          conversionRate: 6.9,
          createdAt: '2024-01-10T14:00:00Z',
          lastUpdated: '2024-01-18T16:45:00Z',
          timeframe: '30d'
        },
        {
          id: '4',
          name: 'Mobile App Download',
          campaignId: '3',
          campaignName: 'Mobile Launch',
          status: 'DRAFT',
          totalStages: 4,
          totalVisitors: 0,
          totalConversions: 0,
          conversionRate: 0,
          createdAt: '2024-01-22T09:00:00Z',
          lastUpdated: '2024-01-22T09:00:00Z',
          timeframe: '7d'
        }
      ];

      setFunnels(mockFunnels);
      
      // Calculate stats
      const totalConversions = mockFunnels.reduce((sum, funnel) => sum + funnel.totalConversions, 0);
      const activeFunnels = mockFunnels.filter(f => f.status === 'ACTIVE').length;
      const avgConversionRate = mockFunnels.reduce((sum, funnel) => 
        sum + funnel.conversionRate, 0
      ) / mockFunnels.length;

      setStats({
        totalFunnels: mockFunnels.length,
        activeFunnels,
        totalConversions,
        avgConversionRate
      });
      
    } catch (error) {
      console.error('Error fetching funnels:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch funnels',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterFunnels = () => {
    let filtered = funnels;

    if (searchQuery) {
      filtered = filtered.filter(funnel =>
        funnel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        funnel.campaignName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(funnel => funnel.status.toLowerCase() === statusFilter);
    }

    if (campaignFilter !== 'all') {
      filtered = filtered.filter(funnel => funnel.campaignId === campaignFilter);
    }

    setFilteredFunnels(filtered);
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      ACTIVE: { color: 'bg-green-500', variant: 'default', label: 'Active', icon: PlayCircle },
      PAUSED: { color: 'bg-yellow-500', variant: 'secondary', label: 'Paused', icon: PauseCircle },
      DRAFT: { color: 'bg-gray-500', variant: 'outline', label: 'Draft', icon: Edit }
    };
    return configs[status as keyof typeof configs] || configs.DRAFT;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleStatusChange = async (funnelId: string, newStatus: string) => {
    try {
      // Update funnel status via API
      console.log(`Updating funnel ${funnelId} status to ${newStatus}`);
      
      // Update local state
      setFunnels(prev => prev.map(funnel => 
        funnel.id === funnelId 
          ? { ...funnel, status: newStatus as any, lastUpdated: new Date().toISOString() }
          : funnel
      ));

      toast({
        title: 'Status Updated',
        description: `Funnel status changed to ${newStatus.toLowerCase()}`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update funnel status',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteFunnel = async (funnelId: string) => {
    try {
      // Delete funnel via API
      console.log(`Deleting funnel ${funnelId}`);
      
      // Update local state
      setFunnels(prev => prev.filter(funnel => funnel.id !== funnelId));

      toast({
        title: 'Funnel Deleted',
        description: 'Funnel has been permanently deleted',
      });
    } catch (error) {
      console.error('Error deleting funnel:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete funnel',
        variant: 'destructive'
      });
    }
  };

  if (showCreateForm) {
    return (
      <div className="container mx-auto px-6 py-8">
        <FunnelManager
          onSave={(funnelData) => {
            console.log('Saving funnel:', funnelData);
            setShowCreateForm(false);
            toast({
              title: 'Success',
              description: 'Funnel created successfully',
            });
            fetchFunnels(); // Refresh the list
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  if (selectedFunnel) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => setSelectedFunnel(null)}>
            ← Back to Funnels
          </Button>
        </div>
        <ConversionFunnel 
          campaignId={selectedFunnel}
          showControls={true}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Conversion Funnels</h1>
          <p className="text-muted-foreground">
            Track user journey and optimize conversion paths across campaigns
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Funnel
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Funnels</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFunnels}</div>
            <p className="text-xs text-muted-foreground">Across all campaigns</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Funnels</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeFunnels}</div>
            <p className="text-xs text-muted-foreground">Currently tracking</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgConversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across all funnels</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search funnels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={campaignFilter} onValueChange={setCampaignFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                <SelectItem value="1">Summer Sale Campaign</SelectItem>
                <SelectItem value="2">Content Marketing</SelectItem>
                <SelectItem value="3">Mobile Launch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Funnels List */}
      <div className="space-y-6">
        {filteredFunnels.length > 0 ? (
          filteredFunnels.map((funnel) => (
            <FunnelCard 
              key={funnel.id} 
              funnel={funnel} 
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteFunnel}
              onView={(id) => setSelectedFunnel(id)}
            />
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No funnels found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' || campaignFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : "Create your first conversion funnel to start tracking user journeys"
                }
              </p>
              {!searchQuery && statusFilter === 'all' && campaignFilter === 'all' && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Funnel
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function FunnelCard({ 
  funnel, 
  onStatusChange, 
  onDelete, 
  onView 
}: { 
  funnel: FunnelData;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}) {
  const statusConfig = getStatusConfig(funnel.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{funnel.name}</h3>
              <Badge variant={statusConfig.variant as any} className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Campaign: {funnel.campaignName}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>{funnel.totalStages} stages</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(funnel.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Updated {formatDate(funnel.lastUpdated)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onView(funnel.id)}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Select onValueChange={(value) => onStatusChange(funnel.id, value)}>
              <SelectTrigger className="w-24">
                <Settings className="h-4 w-4" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Activate</SelectItem>
                <SelectItem value="PAUSED">Pause</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDelete(funnel.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {funnel.totalVisitors.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total Visitors</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {funnel.totalConversions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Conversions</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {funnel.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Conversion Rate</p>
          </div>
          {funnel.revenue && (
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {formatCurrency(funnel.revenue)}
              </div>
              <p className="text-xs text-muted-foreground">Revenue</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusConfig(status: string) {
  const configs = {
    ACTIVE: { color: 'bg-green-500', variant: 'default', label: 'Active', icon: PlayCircle },
    PAUSED: { color: 'bg-yellow-500', variant: 'secondary', label: 'Paused', icon: PauseCircle },
    DRAFT: { color: 'bg-gray-500', variant: 'outline', label: 'Draft', icon: Edit }
  };
  return configs[status as keyof typeof configs] || configs.DRAFT;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}