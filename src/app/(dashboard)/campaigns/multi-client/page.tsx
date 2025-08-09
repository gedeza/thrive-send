"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Target, 
  Plus, 
  BarChart3,
  Activity,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Calendar,
  Clock,
  Mail,
  Globe2,
  Smartphone,
  Eye,
  Edit,
  MoreHorizontal
} from "lucide-react";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useServiceProvider } from '@/context/ServiceProviderContext';
import Link from "next/link";

// Types for multi-client campaigns
interface MultiClientCampaign {
  id: string;
  name: string;
  status: 'DRAFT' | 'ACTIVE' | 'SCHEDULED' | 'COMPLETED' | 'PAUSED';
  selectedClients: string[];
  clientNames: string[];
  channel: 'Email' | 'Social' | 'SMS' | 'Multi';
  audienceSize: number;
  scheduledDate?: Date;
  createdAt: Date;
  performance?: {
    sent: number;
    opened: number;
    clicked: number;
    openRate: number;
    clickRate: number;
  };
}

interface ClientOption {
  id: string;
  name: string;
  type: string;
  status: 'ACTIVE' | 'INACTIVE';
  audienceSize: number;
}

// Helper functions
function prettyDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "short", 
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getStatusColor(status: string) {
  const statusMap = {
    DRAFT: "bg-yellow-100 text-yellow-800",
    ACTIVE: "bg-green-100 text-green-800", 
    SCHEDULED: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-gray-100 text-gray-800",
    PAUSED: "bg-orange-100 text-orange-800"
  };
  return statusMap[status as keyof typeof statusMap] || "bg-gray-100 text-gray-800";
}

function getChannelIcon(channel: string) {
  const channelIcons = {
    Email: <Mail className="h-4 w-4" />,
    Social: <Globe2 className="h-4 w-4" />,
    SMS: <Smartphone className="h-4 w-4" />,
    Multi: <Target className="h-4 w-4" />
  };
  return channelIcons[channel as keyof typeof channelIcons] || <Mail className="h-4 w-4" />;
}

export default function MultiClientCampaignsPage() {
  const { state } = useServiceProvider();
  
  // State
  const [campaigns, setCampaigns] = useState<MultiClientCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [availableClients, setAvailableClients] = useState<ClientOption[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');

  // Fetch campaigns and clients
  useEffect(() => {
    loadData();
  }, [state.organizationId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load available clients
      const clientsResponse = await fetch(`/api/service-provider/clients?organizationId=${state.organizationId}`);
      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        setAvailableClients(clientsData.map((client: any) => ({
          id: client.id,
          name: client.name,
          type: client.type || 'Business',
          status: client.status,
          audienceSize: Math.floor(Math.random() * 5000) + 500 // Demo audience size
        })));
      }
      
      // Load multi-client campaigns (demo data for now)
      setTimeout(() => {
        const demoCampaigns: MultiClientCampaign[] = [
          {
            id: 'mc-1',
            name: 'Holiday Season Promotion',
            status: 'ACTIVE',
            selectedClients: ['client-1', 'client-2', 'client-3'],
            clientNames: ['City of Springfield', 'TechStart Inc.', 'Local Coffee Co.'],
            channel: 'Multi',
            audienceSize: 12500,
            scheduledDate: new Date('2025-12-15'),
            createdAt: new Date('2025-11-20'),
            performance: {
              sent: 12500,
              opened: 8750,
              clicked: 1875,
              openRate: 70.0,
              clickRate: 15.0
            }
          },
          {
            id: 'mc-2', 
            name: 'Q1 Newsletter Campaign',
            status: 'SCHEDULED',
            selectedClients: ['client-1', 'client-2'],
            clientNames: ['City of Springfield', 'TechStart Inc.'],
            channel: 'Email',
            audienceSize: 8200,
            scheduledDate: new Date('2025-01-15'),
            createdAt: new Date('2025-01-05')
          },
          {
            id: 'mc-3',
            name: 'Cross-Client Social Media Push',
            status: 'COMPLETED',
            selectedClients: ['client-1', 'client-2', 'client-3'],
            clientNames: ['City of Springfield', 'TechStart Inc.', 'Local Coffee Co.'],
            channel: 'Social',
            audienceSize: 15000,
            createdAt: new Date('2024-12-01'),
            performance: {
              sent: 15000,
              opened: 12000,
              clicked: 3600,
              openRate: 80.0,
              clickRate: 24.0
            }
          }
        ];
        
        setCampaigns(demoCampaigns);
        setLoading(false);
      }, 800);
      
    } catch (err) {
      console.error('Failed to load multi-client campaign data:', err);
      setError('Failed to load campaign data');
      setLoading(false);
    }
  };

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    if (statusFilter !== 'all' && campaign.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (channelFilter !== 'all' && campaign.channel.toLowerCase() !== channelFilter.toLowerCase()) {
      return false;
    }
    if (clientFilter !== 'all' && !campaign.selectedClients.includes(clientFilter)) {
      return false;
    }
    return true;
  });

  // Calculate stats
  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE').length,
    scheduledCampaigns: campaigns.filter(c => c.status === 'SCHEDULED').length,
    totalAudienceReach: campaigns.reduce((sum, c) => sum + c.audienceSize, 0),
    averageOpenRate: campaigns
      .filter(c => c.performance)
      .reduce((sum, c) => sum + (c.performance?.openRate || 0), 0) / 
      Math.max(1, campaigns.filter(c => c.performance).length)
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Unable to load campaigns</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => loadData()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Multi-Client Campaigns</h1>
          </div>
          <p className="text-muted-foreground">
            Create and manage campaigns across multiple clients simultaneously
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => loadData()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Multi-Client Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Campaigns</p>
                <p className="text-2xl font-bold text-primary">{stats.totalCampaigns}</p>
                <p className="text-sm text-muted-foreground">All multi-client campaigns</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeCampaigns}</p>
                <p className="text-sm text-muted-foreground">Currently running</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reach</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalAudienceReach.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Combined audience size</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Open Rate</p>
                <p className="text-2xl font-bold text-orange-600">{stats.averageOpenRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Cross-client performance</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>

            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="multi">Multi-Channel</SelectItem>
              </SelectContent>
            </Select>

            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {availableClients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-muted rounded-full">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">No multi-client campaigns found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first multi-client campaign to reach multiple audiences simultaneously.
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Multi-Client Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map(campaign => (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {getChannelIcon(campaign.channel)}
                        <h3 className="text-lg font-semibold">{campaign.name}</h3>
                      </div>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Clients</p>
                        <p className="font-medium">{campaign.clientNames.length} clients</p>
                        <p className="text-xs text-muted-foreground">
                          {campaign.clientNames.slice(0, 2).join(', ')}
                          {campaign.clientNames.length > 2 && ` +${campaign.clientNames.length - 2} more`}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Audience Size</p>
                        <p className="font-medium">{campaign.audienceSize.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="font-medium">{prettyDate(campaign.createdAt)}</p>
                      </div>
                      {campaign.performance && (
                        <div>
                          <p className="text-sm text-muted-foreground">Performance</p>
                          <div className="flex gap-2">
                            <span className="text-sm font-medium text-green-600">
                              {campaign.performance.openRate.toFixed(1)}% open
                            </span>
                            <span className="text-sm font-medium text-blue-600">
                              {campaign.performance.clickRate.toFixed(1)}% click
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      {campaign.status === 'DRAFT' && (
                        <Button size="sm">
                          Launch Campaign
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Campaign Form - Placeholder for now */}
      {showCreateForm && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Create Multi-Client Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Multi-client campaign creation form will be implemented here.
              This will allow you to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-4">
              <li>Select multiple clients from your portfolio</li>
              <li>Create unified campaign content</li>
              <li>Schedule campaigns across all selected clients</li>
              <li>Track combined performance metrics</li>
            </ul>
            <div className="flex gap-2">
              <Button onClick={() => setShowCreateForm(false)}>
                Close
              </Button>
              <Button disabled>
                Create Campaign (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}