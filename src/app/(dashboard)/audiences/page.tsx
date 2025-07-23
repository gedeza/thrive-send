'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { 
  Plus, 
  Users, 
  Target, 
  TrendingUp, 
  Filter,
  Search,
  Calendar,
  BarChart3,
  Settings,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface AudienceSegment {
  id: string;
  name: string;
  description?: string;
  type: 'DEMOGRAPHIC' | 'BEHAVIORAL' | 'CUSTOM' | 'LOOKALIKE';
  size: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PROCESSING';
  lastUpdated: string;
  conditions?: {
    demographics?: {
      ageRange?: string[];
      gender?: string[];
      location?: string[];
    };
    behavioral?: {
      engagement?: string;
      purchaseHistory?: string;
      activityLevel?: string;
    };
    custom?: {
      tags?: string[];
      customFields?: Record<string, any>;
    };
  };
  performance?: {
    engagementRate: number;
    conversionRate: number;
    avgOrderValue: number;
    churnRate: number;
  };
  growth?: {
    thisWeek: number;
    thisMonth: number;
  };
}

interface Audience {
  id: string;
  name: string;
  description?: string;
  type: 'CUSTOM' | 'IMPORTED' | 'DYNAMIC';
  status: 'ACTIVE' | 'INACTIVE' | 'PROCESSING';
  size: number;
  createdAt: string;
  lastUpdated?: string;
  source?: string;
  tags: string[];
  segments: AudienceSegment[];
  analytics?: {
    totalEngagement: number;
    avgEngagementRate: number;
    topPerformingSegment: string;
    growth: {
      daily: number;
      weekly: number;
      monthly: number;
    };
  };
}

export default function AudiencesPage() {
  const { userId } = useAuth();
  const { organization } = useOrganization();
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [filteredAudiences, setFilteredAudiences] = useState<Audience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [stats, setStats] = useState({
    totalAudiences: 0,
    totalContacts: 0,
    activeSegments: 0,
    avgEngagementRate: 0
  });

  useEffect(() => {
    fetchAudiences();
  }, []);

  useEffect(() => {
    filterAudiences();
  }, [audiences, searchQuery, statusFilter, typeFilter]);

  const fetchAudiences = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for demonstration - replace with actual API call
      const mockAudiences: Audience[] = [
        {
          id: '1',
          name: 'High-Value Customers',
          description: 'Customers with orders over $500 in the last 6 months',
          type: 'CUSTOM',
          status: 'ACTIVE',
          size: 2547,
          createdAt: '2024-01-15T10:00:00Z',
          lastUpdated: '2024-01-20T15:30:00Z',
          source: 'Custom Segmentation',
          tags: ['high-value', 'premium', 'loyal'],
          segments: [
            {
              id: 'seg1',
              name: 'Premium Buyers',
              type: 'BEHAVIORAL',
              size: 1234,
              status: 'ACTIVE',
              lastUpdated: '2024-01-20T15:30:00Z',
              conditions: {
                behavioral: {
                  purchaseHistory: 'high_value',
                  engagement: 'high'
                }
              },
              performance: {
                engagementRate: 78.5,
                conversionRate: 12.3,
                avgOrderValue: 750,
                churnRate: 5.2
              },
              growth: {
                thisWeek: 5.2,
                thisMonth: 18.7
              }
            },
            {
              id: 'seg2',
              name: 'Repeat Customers',
              type: 'BEHAVIORAL',
              size: 1313,
              status: 'ACTIVE',
              lastUpdated: '2024-01-19T12:00:00Z',
              conditions: {
                behavioral: {
                  purchaseHistory: 'repeat',
                  activityLevel: 'active'
                }
              },
              performance: {
                engagementRate: 65.8,
                conversionRate: 8.9,
                avgOrderValue: 420,
                churnRate: 8.1
              },
              growth: {
                thisWeek: 2.1,
                thisMonth: 12.4
              }
            }
          ],
          analytics: {
            totalEngagement: 89234,
            avgEngagementRate: 72.1,
            topPerformingSegment: 'Premium Buyers',
            growth: {
              daily: 1.2,
              weekly: 5.8,
              monthly: 15.6
            }
          }
        },
        {
          id: '2',
          name: 'Newsletter Subscribers',
          description: 'Active email subscribers from the last 3 months',
          type: 'IMPORTED',
          status: 'ACTIVE',
          size: 8945,
          createdAt: '2024-01-10T08:00:00Z',
          lastUpdated: '2024-01-21T09:15:00Z',
          source: 'Email Import',
          tags: ['newsletter', 'email', 'subscribers'],
          segments: [
            {
              id: 'seg3',
              name: 'Highly Engaged',
              type: 'BEHAVIORAL',
              size: 3456,
              status: 'ACTIVE',
              lastUpdated: '2024-01-21T09:15:00Z',
              conditions: {
                behavioral: {
                  engagement: 'high',
                  activityLevel: 'very_active'
                }
              },
              performance: {
                engagementRate: 85.2,
                conversionRate: 6.7,
                avgOrderValue: 280,
                churnRate: 3.1
              },
              growth: {
                thisWeek: 8.3,
                thisMonth: 22.1
              }
            }
          ],
          analytics: {
            totalEngagement: 156789,
            avgEngagementRate: 58.4,
            topPerformingSegment: 'Highly Engaged',
            growth: {
              daily: 2.8,
              weekly: 12.4,
              monthly: 28.9
            }
          }
        },
        {
          id: '3',
          name: 'Demographic: Millennials',
          description: 'Users aged 25-40 with high engagement rates',
          type: 'DYNAMIC',
          status: 'PROCESSING',
          size: 4521,
          createdAt: '2024-01-18T14:20:00Z',
          lastUpdated: '2024-01-21T10:45:00Z',
          source: 'Dynamic Segmentation',
          tags: ['millennials', 'demographic', 'age-based'],
          segments: [
            {
              id: 'seg4',
              name: 'Urban Millennials',
              type: 'DEMOGRAPHIC',
              size: 2890,
              status: 'ACTIVE',
              lastUpdated: '2024-01-21T10:45:00Z',
              conditions: {
                demographics: {
                  ageRange: ['25-35'],
                  location: ['urban', 'metro']
                }
              },
              performance: {
                engagementRate: 62.8,
                conversionRate: 9.4,
                avgOrderValue: 340,
                churnRate: 12.7
              },
              growth: {
                thisWeek: -1.2,
                thisMonth: 7.8
              }
            }
          ],
          analytics: {
            totalEngagement: 67543,
            avgEngagementRate: 62.8,
            topPerformingSegment: 'Urban Millennials',
            growth: {
              daily: 0.8,
              weekly: 3.2,
              monthly: 11.5
            }
          }
        }
      ];

      setAudiences(mockAudiences);
      
      // Calculate stats
      const totalContacts = mockAudiences.reduce((sum, audience) => sum + audience.size, 0);
      const totalSegments = mockAudiences.reduce((sum, audience) => sum + audience.segments.length, 0);
      const avgEngagement = mockAudiences.reduce((sum, audience) => 
        sum + (audience.analytics?.avgEngagementRate || 0), 0
      ) / mockAudiences.length;

      setStats({
        totalAudiences: mockAudiences.length,
        totalContacts,
        activeSegments: totalSegments,
        avgEngagementRate: avgEngagement
      });
      
    } catch (error) {
      console.error('Error fetching audiences:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch audiences',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterAudiences = () => {
    let filtered = audiences;

    if (searchQuery) {
      filtered = filtered.filter(audience =>
        audience.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        audience.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        audience.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(audience => audience.status.toLowerCase() === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(audience => audience.type.toLowerCase() === typeFilter);
    }

    setFilteredAudiences(filtered);
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      ACTIVE: { color: 'bg-green-500', variant: 'default', label: 'Active' },
      INACTIVE: { color: 'bg-gray-500', variant: 'secondary', label: 'Inactive' },
      PROCESSING: { color: 'bg-yellow-500', variant: 'warning', label: 'Processing' }
    };
    return configs[status as keyof typeof configs] || configs.ACTIVE;
  };

  const getTypeConfig = (type: string) => {
    const configs = {
      CUSTOM: { label: 'Custom', color: 'text-blue-600' },
      IMPORTED: { label: 'Imported', color: 'text-purple-600' },
      DYNAMIC: { label: 'Dynamic', color: 'text-green-600' }
    };
    return configs[type as keyof typeof configs] || configs.CUSTOM;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Audience Management</h1>
          <p className="text-muted-foreground">
            Manage audience segments, track engagement, and optimize targeting
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/audiences/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Audience
            </Button>
          </Link>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Import Contacts
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audiences</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAudiences}</div>
            <p className="text-xs text-muted-foreground">Across all segments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContacts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Segments</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSegments}</div>
            <p className="text-xs text-muted-foreground">Across all audiences</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgEngagementRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">+5.2% from last month</p>
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
                placeholder="Search audiences..."
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
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="imported">Imported</SelectItem>
                <SelectItem value="dynamic">Dynamic</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audiences List */}
      <div className="space-y-6">
        {filteredAudiences.length > 0 ? (
          filteredAudiences.map((audience) => (
            <AudienceCard key={audience.id} audience={audience} />
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No audiences found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : "Create your first audience to start targeting customers"
                }
              </p>
              {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
                <Link href="/audiences/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Audience
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function AudienceCard({ audience }: { audience: Audience }) {
  const statusConfig = getStatusConfig(audience.status);
  const typeConfig = getTypeConfig(audience.type);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{audience.name}</h3>
              <Badge variant={statusConfig.variant as any}>
                {statusConfig.label}
              </Badge>
              <Badge variant="outline" className={typeConfig.color}>
                {typeConfig.label}
              </Badge>
            </div>
            {audience.description && (
              <p className="text-sm text-muted-foreground">{audience.description}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{audience.size.toLocaleString()} contacts</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(audience.createdAt)}</span>
              </div>
              {audience.lastUpdated && (
                <div className="flex items-center gap-1">
                  <span>Updated {formatDate(audience.lastUpdated)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
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
        {/* Tags */}
        {audience.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {audience.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Performance Metrics */}
        {audience.analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {audience.analytics.avgEngagementRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Avg. Engagement</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                +{audience.analytics.growth.monthly.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Monthly Growth</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                {audience.segments.length}
              </div>
              <p className="text-xs text-muted-foreground">Segments</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {audience.analytics.totalEngagement.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total Engagement</p>
            </div>
          </div>
        )}

        {/* Segments Preview */}
        {audience.segments.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Segments ({audience.segments.length})</h4>
            <div className="space-y-2">
              {audience.segments.slice(0, 2).map((segment) => (
                <div key={segment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-sm">{segment.name}</h5>
                      <Badge variant="outline" className="text-xs">
                        {segment.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{segment.size.toLocaleString()} contacts</span>
                      {segment.performance && (
                        <>
                          <span>{segment.performance.engagementRate.toFixed(1)}% engagement</span>
                          <span>{segment.performance.conversionRate.toFixed(1)}% conversion</span>
                        </>
                      )}
                    </div>
                  </div>
                  {segment.growth && (
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        segment.growth.thisMonth > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {segment.growth.thisMonth > 0 ? '+' : ''}{segment.growth.thisMonth.toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">this month</p>
                    </div>
                  )}
                </div>
              ))}
              {audience.segments.length > 2 && (
                <p className="text-sm text-muted-foreground text-center">
                  +{audience.segments.length - 2} more segments
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getStatusConfig(status: string) {
  const configs = {
    ACTIVE: { color: 'bg-green-500', variant: 'default', label: 'Active' },
    INACTIVE: { color: 'bg-gray-500', variant: 'secondary', label: 'Inactive' },
    PROCESSING: { color: 'bg-yellow-500', variant: 'warning', label: 'Processing' }
  };
  return configs[status as keyof typeof configs] || configs.ACTIVE;
}

function getTypeConfig(type: string) {
  const configs = {
    CUSTOM: { label: 'Custom', color: 'text-blue-600' },
    IMPORTED: { label: 'Imported', color: 'text-purple-600' },
    DYNAMIC: { label: 'Dynamic', color: 'text-green-600' }
  };
  return configs[type as keyof typeof configs] || configs.CUSTOM;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}