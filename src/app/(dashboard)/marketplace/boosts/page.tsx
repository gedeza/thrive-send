'use client';

import React, { useState } from 'react';
import { useAuth, useOrganization } from '@clerk/nextjs';
import { Plus, TrendingUp, Target, Clock, DollarSign, Eye, MousePointer, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

// Mock boost data
const mockBoosts = [
  {
    id: '1',
    type: 'FEATURED',
    status: 'ACTIVE',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-02-15T00:00:00Z',
    listing: {
      id: 'listing-1',
      title: 'Professional Email Template Pack',
      type: 'TEMPLATE',
      price: 29.99,
      currency: 'USD'
    },
    metrics: {
      impressions: 1245,
      clicks: 89,
      conversions: 12,
      spent: 78.50
    },
    metadata: {
      budget: 100,
      costPerClick: 0.89,
      estimatedReach: 1400
    }
  },
  {
    id: '2',
    type: 'PROMOTED',
    status: 'COMPLETED',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-01-14T00:00:00Z',
    listing: {
      id: 'listing-2',
      title: 'Social Media Content Calendar',
      type: 'CONTENT',
      price: 49.99,
      currency: 'USD'
    },
    metrics: {
      impressions: 2156,
      clicks: 145,
      conversions: 23,
      spent: 150.00
    },
    metadata: {
      budget: 150,
      costPerClick: 1.03,
      estimatedReach: 2300
    }
  }
];

const boostTypes = [
  {
    type: 'FEATURED',
    name: 'Featured',
    description: 'Highlight your listing at the top of search results',
    cost: '$0.50 per click',
    duration: '7-30 days',
    reach: 'High visibility',
    color: 'bg-blue-500'
  },
  {
    type: 'PROMOTED',
    name: 'Promoted',
    description: 'Show your listing in promoted sections',
    cost: '$0.75 per click',
    duration: '1-14 days',
    reach: 'Targeted audience',
    color: 'bg-green-500'
  },
  {
    type: 'PRIORITY',
    name: 'Priority',
    description: 'Higher ranking in category searches',
    cost: '$1.00 per click',
    duration: '3-21 days',
    reach: 'Category focused',
    color: 'bg-purple-500'
  },
  {
    type: 'SPONSORED',
    name: 'Sponsored',
    description: 'Premium placement across the platform',
    cost: '$1.25 per click',
    duration: '1-30 days',
    reach: 'Maximum exposure',
    color: 'bg-orange-500'
  }
];

export default function BoostMarketplacePage() {
  const { userId } = useAuth();
  const { organization } = useOrganization();
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredBoosts = mockBoosts.filter(boost => 
    filterStatus === 'all' || boost.status.toLowerCase() === filterStatus.toLowerCase()
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'expired': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getBoostTypeColor = (type: string) => {
    const boostType = boostTypes.find(bt => bt.type === type);
    return boostType?.color || 'bg-gray-500';
  };

  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    
    if (now <= start) return 0;
    if (now >= end) return 100;
    
    return Math.round(((now - start) / (end - start)) * 100);
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
          <h1 className="text-3xl font-bold mb-2">Boost Marketplace</h1>
          <p className="text-muted-foreground">
            Promote your listings to increase visibility and sales
          </p>
        </div>
        <Link href="/marketplace/boosts/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Boost
          </Button>
        </Link>
      </div>

      {/* Boost Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,401</div>
            <p className="text-xs text-muted-foreground">+23% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">35</div>
            <p className="text-xs text-muted-foreground">+32% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$228.50</div>
            <p className="text-xs text-muted-foreground">Budget remaining: $171.50</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="my-boosts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-boosts">My Boosts</TabsTrigger>
          <TabsTrigger value="boost-types">Boost Types</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="my-boosts" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Boost Cards */}
          <div className="space-y-6">
            {filteredBoosts.length > 0 ? (
              filteredBoosts.map((boost) => {
                const progress = calculateProgress(boost.startDate, boost.endDate);
                const ctr = boost.metrics.impressions > 0 
                  ? ((boost.metrics.clicks / boost.metrics.impressions) * 100).toFixed(2)
                  : '0.00';
                const conversionRate = boost.metrics.clicks > 0
                  ? ((boost.metrics.conversions / boost.metrics.clicks) * 100).toFixed(2)
                  : '0.00';

                return (
                  <Card key={boost.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getBoostTypeColor(boost.type)}`}></div>
                            <Badge variant="outline">{boost.type}</Badge>
                            <Badge className={getStatusColor(boost.status)}>
                              {boost.status}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{boost.listing.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(boost.startDate)} - {formatDate(boost.endDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">${boost.listing.price}</div>
                          <p className="text-sm text-muted-foreground">{boost.listing.type}</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      {/* Progress Bar */}
                      {boost.status === 'ACTIVE' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Campaign Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {boost.metrics.impressions.toLocaleString()}
                          </div>
                          <p className="text-xs text-muted-foreground">Impressions</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {boost.metrics.clicks}
                          </div>
                          <p className="text-xs text-muted-foreground">Clicks</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {boost.metrics.conversions}
                          </div>
                          <p className="text-xs text-muted-foreground">Conversions</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {ctr}%
                          </div>
                          <p className="text-xs text-muted-foreground">CTR</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {conversionRate}%
                          </div>
                          <p className="text-xs text-muted-foreground">Conv. Rate</p>
                        </div>
                      </div>

                      {/* Budget Info */}
                      <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Budget Spent</p>
                          <p className="text-xs text-muted-foreground">
                            ${boost.metrics.spent} of ${boost.metadata.budget}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Avg. CPC</p>
                          <p className="text-xs text-muted-foreground">
                            ${boost.metadata.costPerClick}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-2">
                        {boost.status === 'ACTIVE' && (
                          <Button variant="outline" size="sm">
                            Pause Boost
                          </Button>
                        )}
                        <Link href={`/marketplace/${boost.listing.id}`}>
                          <Button variant="outline" size="sm">
                            View Listing
                          </Button>
                        </Link>
                        <Button size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No boosts found</h3>
                  <p className="text-muted-foreground mb-4">
                    {filterStatus === 'all' 
                      ? "You haven't created any boosts yet."
                      : `No boosts with status "${filterStatus}".`
                    }
                  </p>
                  <Link href="/marketplace/boosts/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Boost
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="boost-types" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {boostTypes.map((boostType) => (
              <Card key={boostType.type} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${boostType.color}`}></div>
                    <CardTitle>{boostType.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{boostType.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Cost:</span>
                      <span className="text-sm">{boostType.cost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Duration:</span>
                      <span className="text-sm">{boostType.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Reach:</span>
                      <span className="text-sm">{boostType.reach}</span>
                    </div>
                  </div>
                  
                  <Link href={`/marketplace/boosts/create?type=${boostType.type}`}>
                    <Button className="w-full">
                      Create {boostType.name} Boost
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Boost Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Detailed analytics coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}